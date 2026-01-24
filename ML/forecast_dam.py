import joblib
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score

# ============================================================
# Load trained models
# ============================================================
model_demand = joblib.load("model_demand.pkl")
model_solar = joblib.load("model_solar.pkl")
model_wind = joblib.load("model_wind.pkl")

# ============================================================
# Helper: Create next day time blocks
# ============================================================
def make_next_day_blocks(date):
    rows = []
    for b in range(1, 97):
        rows.append({
            "Date": date,
            "Time Block": b,
            "Hour": (b - 1) // 4
        })
    return pd.DataFrame(rows)

next_day = "2026-01-24"
future = make_next_day_blocks(next_day)

# ============================================================
# Load historical data
# ============================================================
demand_hist = pd.read_csv("datasets/synthetic_demand_dataset_15min.csv")
demand_hist["timestamp"] = pd.to_datetime(demand_hist["timestamp"])

solar_hist = pd.read_csv("datasets/synthetic_solar_supply_15min.csv")
solar_hist["timestamp"] = pd.to_datetime(solar_hist["timestamp"])

wind_hist = pd.read_csv("datasets/synthetic_wind_supply_15min.csv")
wind_hist["timestamp"] = pd.to_datetime(wind_hist["timestamp"])

# ============================================================
# Forecast Demand (rolling 96 steps)
# ============================================================
print("Forecasting demand...")

# Get last row for state_code=0 (or average across states)
last_demand = demand_hist[demand_hist["state_code"] == 0].iloc[-1:].copy()

# Map day_type to numeric
day_type_map = {"weekday": 0, "weekend": 1, "holiday": 2}
if last_demand["day_type"].dtype == object:
    last_demand["day_type"] = last_demand["day_type"].map(day_type_map)

demand_preds = []
for i in range(96):
    # Update hour for the forecast step
    new_hour = (i // 4) % 24
    last_demand["hour"] = new_hour
    
    X = last_demand[model_demand.feature_names_in_]
    y = model_demand.predict(X)[0]
    demand_preds.append(y)
    
    # Update lag features for next iteration
    last_demand["demand_lag_1"] = last_demand["demand_actual"].values[0]
    last_demand["demand_actual"] = y

future["demand_forecast"] = demand_preds

# ============================================================
# Forecast Solar (rolling 96 steps)
# ============================================================
print("Forecasting solar...")

last_solar = solar_hist[solar_hist["state_code"] == 0].iloc[-1:].copy()

solar_preds = []
for i in range(96):
    new_hour = (i // 4) % 24
    last_solar["hour"] = new_hour
    
    # Update irradiance based on hour (simple daylight model)
    if 6 <= new_hour <= 18:
        daylight = np.sin((new_hour - 6) / 12 * np.pi)
        last_solar["irradiance"] = 800 * daylight * (1 - 0.3 * last_solar["cloud_cover"].values[0])
    else:
        last_solar["irradiance"] = 0
    
    X = last_solar[model_solar.feature_names_in_]
    y = model_solar.predict(X)[0]
    solar_preds.append(max(0, y))  # Ensure non-negative
    
    # Update lag features
    last_solar["solar_lag_1"] = last_solar["solar_generation"].values[0]
    last_solar["solar_generation"] = max(0, y)

future["solar_forecast"] = solar_preds

# ============================================================
# Forecast Wind (rolling 96 steps)
# ============================================================
print("Forecasting wind...")

last_wind = wind_hist[wind_hist["state_code"] == 0].iloc[-1:].copy()

wind_preds = []
for i in range(96):
    new_hour = (i // 4) % 24
    last_wind["hour"] = new_hour
    last_wind["is_night"] = 1 if (new_hour >= 20 or new_hour < 6) else 0
    
    X = last_wind[model_wind.feature_names_in_]
    y = model_wind.predict(X)[0]
    wind_preds.append(max(0, y))
    
    # Update lag features
    last_wind["wind_lag_1"] = last_wind["wind_generation"].values[0]
    last_wind["wind_generation"] = max(0, y)

future["wind_forecast"] = wind_preds

# ============================================================
# Calculate net load
# ============================================================
future["generation_forecast"] = future["solar_forecast"] + future["wind_forecast"]
future["net_load_forecast"] = future["demand_forecast"] - future["generation_forecast"]

print("\nNext day forecasts summary:")
print(f"  Demand:     {future['demand_forecast'].mean():.1f} MW (avg)")
print(f"  Solar:      {future['solar_forecast'].mean():.1f} MW (avg)")
print(f"  Wind:       {future['wind_forecast'].mean():.1f} MW (avg)")
print(f"  Net Load:   {future['net_load_forecast'].mean():.1f} MW (avg)")

# ============================================================
# Load DAM data
# ============================================================
dam = pd.read_excel("datasets/DAM_1month.xlsx")

# Parse date properly
dam["Date"] = pd.to_datetime(dam["Date"], format="%d-%m-%Y")

# Extract time block number from string like "00:00 - 00:15"
dam["Time Block Num"] = dam.groupby("Date").cumcount() + 1

# Rename columns
dam = dam.rename(columns={
    "MCP (Rs/MWh) *": "mcp",
    "Final Scheduled Volume (MW)": "volume"
})

# ============================================================
# Build historical net load from synthetic data
# ============================================================
# Merge all historical data
hist = demand_hist.merge(
    solar_hist[["timestamp", "state_code", "solar_generation"]], 
    on=["timestamp", "state_code"]
).merge(
    wind_hist[["timestamp", "state_code", "wind_generation"]], 
    on=["timestamp", "state_code"]
)

# Calculate net load
hist["net_load"] = (
    hist["demand_actual"] 
    - (hist["solar_generation"] + hist["wind_generation"])
)

# Aggregate across states (sum or mean)
hist_agg = hist.groupby("timestamp").agg({
    "net_load": "sum",
    "demand_actual": "sum",
    "solar_generation": "sum",
    "wind_generation": "sum"
}).reset_index()

hist_agg["Date"] = hist_agg["timestamp"].dt.date
hist_agg["Date"] = pd.to_datetime(hist_agg["Date"])
hist_agg["Time Block Num"] = (
    hist_agg["timestamp"].dt.hour * 4 
    + hist_agg["timestamp"].dt.minute // 15 + 1
)

# Merge DAM with historical net load
dam = dam.merge(
    hist_agg[["Date", "Time Block Num", "net_load"]],
    on=["Date", "Time Block Num"],
    how="inner"
)

print(f"\nDAM data after merge: {len(dam)} rows")

# ============================================================
# Create lag features for MCP
# ============================================================
dam = dam.sort_values(["Date", "Time Block Num"]).reset_index(drop=True)
dam["mcp_lag_96"] = dam["mcp"].shift(96)    # Same time yesterday
dam["mcp_lag_672"] = dam["mcp"].shift(672)  # Same time last week
dam = dam.dropna().reset_index(drop=True)

print(f"DAM data after lag features: {len(dam)} rows")

# ============================================================
# Train DAM price model
# ============================================================
FEATURES_DAM = [
    "net_load",
    "Hour",
    "Time Block Num",
    "volume",
    "mcp_lag_96",
    "mcp_lag_672"
]

X = dam[FEATURES_DAM]
y = dam["mcp"]

# Temporal split: 70% train, 15% val, 15% test
n = len(dam)
train_end = int(n * 0.7)
val_end = int(n * 0.85)

X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

print(f"\nTraining DAM model: {len(X_train)} train, {len(X_val)} val, {len(X_test)} test")

dam_model = XGBRegressor(
    n_estimators=1000,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    early_stopping_rounds=50
)

dam_model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False
)

# Validation metrics
val_pred = dam_model.predict(X_val)
val_mae = mean_absolute_error(y_val, val_pred)
val_r2 = r2_score(y_val, val_pred)

# Test metrics
test_pred = dam_model.predict(X_test)
test_mae = mean_absolute_error(y_test, test_pred)
test_rmse = np.sqrt(((y_test - test_pred) ** 2).mean())
test_r2 = r2_score(y_test, test_pred)

print(f"\n=== DAM MODEL RESULTS ===")
print(f"Validation MAE: {val_mae:.2f} Rs/MWh")
print(f"Validation R²:  {val_r2:.4f}")
print(f"Test MAE:       {test_mae:.2f} Rs/MWh")
print(f"Test RMSE:      {test_rmse:.2f} Rs/MWh")
print(f"Test R²:        {test_r2:.4f}")

# Save DAM model
joblib.dump(dam_model, "model_dam.pkl")
print("\n✅ DAM model saved to model_dam.pkl")

# ============================================================
# Forecast next day DAM prices
# ============================================================
# Get last day's data for lag features
last_day = dam.tail(96)

future["volume"] = last_day["volume"].values
future["mcp_lag_96"] = last_day["mcp"].values

# For weekly lag, get data from 7 days ago (576 blocks back from end)
if len(dam) >= 672:
    future["mcp_lag_672"] = dam.iloc[-672:-576]["mcp"].values
else:
    # If not enough data, use same as daily lag
    future["mcp_lag_672"] = future["mcp_lag_96"]

# Rename for prediction
future["net_load"] = future["net_load_forecast"]
future["Time Block Num"] = future["Time Block"]

X_future = future[FEATURES_DAM]
future["DAM_price_forecast"] = dam_model.predict(X_future)

# ============================================================
# Save results
# ============================================================
output_cols = [
    "Date", "Time Block", "Hour",
    "demand_forecast", "solar_forecast", "wind_forecast",
    "generation_forecast", "net_load_forecast", 
    "DAM_price_forecast"
]

future[output_cols].to_csv("dam_price_forecast_next_day.csv", index=False)

print(f"\n📁 Saved dam_price_forecast_next_day.csv")
print(f"\nDAM Price Forecast for {next_day}:")
print(f"  Min:  {future['DAM_price_forecast'].min():.2f} Rs/MWh")
print(f"  Max:  {future['DAM_price_forecast'].max():.2f} Rs/MWh")
print(f"  Mean: {future['DAM_price_forecast'].mean():.2f} Rs/MWh")
