"""
DAM Price Inference - Predict prices for 25-01-2026
====================================================
Uses trained models to forecast:
1. Demand (15-min intervals)
2. Solar generation
3. Wind generation
4. DAM prices (96 time blocks)
"""

import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

print("=" * 60)
print("DAM PRICE INFERENCE - 25 January 2026")
print("=" * 60)

# ============================================================
# Load trained models
# ============================================================
print("\nLoading models...")
model_demand = joblib.load("model_demand.pkl")
model_solar = joblib.load("model_solar.pkl")
model_wind = joblib.load("model_wind.pkl")
model_dam = joblib.load("model_dam_cv.pkl")  # Use CV-trained model
print("✅ All models loaded")

# ============================================================
# Load historical data for lag features
# ============================================================
print("\nLoading historical data...")
demand_hist = pd.read_csv("datasets/synthetic_demand_dataset_15min.csv")
demand_hist["timestamp"] = pd.to_datetime(demand_hist["timestamp"])

solar_hist = pd.read_csv("datasets/synthetic_solar_supply_15min.csv")
solar_hist["timestamp"] = pd.to_datetime(solar_hist["timestamp"])

wind_hist = pd.read_csv("datasets/synthetic_wind_supply_15min.csv")
wind_hist["timestamp"] = pd.to_datetime(wind_hist["timestamp"])

dam_hist = pd.read_excel("datasets/DAM_1month.xlsx")
dam_hist["Date"] = pd.to_datetime(dam_hist["Date"], format="%d-%m-%Y")
dam_hist = dam_hist.rename(columns={
    "MCP (Rs/MWh) *": "mcp",
    "Final Scheduled Volume (MW)": "volume"
})
dam_hist["Time Block Num"] = dam_hist.groupby("Date").cumcount() + 1
dam_hist = dam_hist.sort_values(["Date", "Time Block Num"]).reset_index(drop=True)

print(f"✅ Historical data loaded")
print(f"   Demand: {len(demand_hist)} rows")
print(f"   Solar:  {len(solar_hist)} rows")
print(f"   Wind:   {len(wind_hist)} rows")
print(f"   DAM:    {len(dam_hist)} rows")

# ============================================================
# Create prediction DataFrame for 25-01-2026
# ============================================================
target_date = "2026-01-25"
target_dt = pd.to_datetime(target_date)

print(f"\n{'=' * 60}")
print(f"FORECASTING FOR: {target_date}")
print("=" * 60)

# Create 96 time blocks
predictions = pd.DataFrame({
    "Date": target_date,
    "Time_Block": range(1, 97),
    "Hour": [(b - 1) // 4 for b in range(1, 97)],
    "Minute": [((b - 1) % 4) * 15 for b in range(1, 97)],
})

# Create timestamp for each block
predictions["Timestamp"] = pd.to_datetime(target_date) + pd.to_timedelta(
    predictions["Hour"] * 60 + predictions["Minute"], unit='m'
)

# Time block labels (e.g., "00:00 - 00:15")
predictions["Time_Block_Label"] = predictions.apply(
    lambda r: f"{r['Hour']:02d}:{r['Minute']:02d} - {r['Hour']:02d}:{(r['Minute']+15)%60:02d}" 
    if r['Minute'] != 45 else f"{r['Hour']:02d}:45 - {(r['Hour']+1)%24:02d}:00", 
    axis=1
)

# ============================================================
# Forecast Demand
# ============================================================
print("\n1. Forecasting Demand...")

# Get last row for state_code=0
last_demand = demand_hist[demand_hist["state_code"] == 0].copy()
last_demand = last_demand.sort_values("timestamp").iloc[-1:].copy()

# Map day_type to numeric
day_type_map = {"weekday": 0, "weekend": 1, "holiday": 2}
if last_demand["day_type"].dtype == object:
    last_demand["day_type"] = last_demand["day_type"].map(day_type_map)

# Determine day type for target date (Sunday = weekend)
target_dayofweek = target_dt.dayofweek
is_weekend = 1 if target_dayofweek >= 5 else 0
day_type = 1 if is_weekend else 0  # 0=weekday, 1=weekend

demand_preds = []
for i in range(96):
    new_hour = (i // 4) % 24
    last_demand["hour"] = new_hour
    last_demand["is_weekend"] = is_weekend
    last_demand["day_type"] = day_type
    last_demand["month"] = target_dt.month
    
    X = last_demand[model_demand.feature_names_in_]
    y = model_demand.predict(X)[0]
    demand_preds.append(y)
    
    # Update lag features
    last_demand["demand_lag_1"] = last_demand["demand_actual"].values[0]
    last_demand["demand_actual"] = y

predictions["Demand_Forecast_MW"] = demand_preds
print(f"   ✅ Demand: Avg={np.mean(demand_preds):.1f} MW, Peak={max(demand_preds):.1f} MW")

# ============================================================
# Forecast Solar
# ============================================================
print("\n2. Forecasting Solar Generation...")

last_solar = solar_hist[solar_hist["state_code"] == 0].copy()
last_solar = last_solar.sort_values("timestamp").iloc[-1:].copy()

solar_preds = []
for i in range(96):
    new_hour = (i // 4) % 24
    last_solar["hour"] = new_hour
    last_solar["month"] = target_dt.month
    
    # Update irradiance based on hour (daylight model)
    if 6 <= new_hour <= 18:
        daylight = np.sin((new_hour - 6) / 12 * np.pi)
        # Add some realistic cloud variation
        cloud_var = 0.2 + 0.1 * np.sin(i / 96 * 2 * np.pi)
        last_solar["cloud_cover"] = np.clip(cloud_var, 0, 1)
        last_solar["irradiance"] = 900 * daylight * (1 - 0.5 * cloud_var)
    else:
        last_solar["irradiance"] = 0
        last_solar["cloud_cover"] = 0
    
    X = last_solar[model_solar.feature_names_in_]
    y = model_solar.predict(X)[0]
    solar_preds.append(max(0, y))
    
    # Update lag features
    last_solar["solar_lag_1"] = last_solar["solar_generation"].values[0]
    last_solar["solar_generation"] = max(0, y)

predictions["Solar_Forecast_MW"] = solar_preds
print(f"   ✅ Solar: Avg={np.mean(solar_preds):.1f} MW, Peak={max(solar_preds):.1f} MW")

# ============================================================
# Forecast Wind
# ============================================================
print("\n3. Forecasting Wind Generation...")

last_wind = wind_hist[wind_hist["state_code"] == 0].copy()
last_wind = last_wind.sort_values("timestamp").iloc[-1:].copy()

wind_preds = []
for i in range(96):
    new_hour = (i // 4) % 24
    last_wind["hour"] = new_hour
    last_wind["is_night"] = 1 if (new_hour >= 20 or new_hour < 6) else 0
    last_wind["month"] = target_dt.month
    last_wind["dayofweek"] = target_dayofweek
    
    X = last_wind[model_wind.feature_names_in_]
    y = model_wind.predict(X)[0]
    wind_preds.append(max(0, y))
    
    # Update lag features
    last_wind["wind_lag_1"] = last_wind["wind_generation"].values[0]
    last_wind["wind_generation"] = max(0, y)

predictions["Wind_Forecast_MW"] = wind_preds
print(f"   ✅ Wind: Avg={np.mean(wind_preds):.1f} MW, Peak={max(wind_preds):.1f} MW")

# ============================================================
# Calculate Net Load
# ============================================================
predictions["Generation_Forecast_MW"] = predictions["Solar_Forecast_MW"] + predictions["Wind_Forecast_MW"]
predictions["Net_Load_Forecast_MW"] = predictions["Demand_Forecast_MW"] - predictions["Generation_Forecast_MW"]

print(f"\n4. Net Load Calculated")
print(f"   ✅ Net Load: Avg={predictions['Net_Load_Forecast_MW'].mean():.1f} MW")

# ============================================================
# Prepare DAM Features
# ============================================================
print("\n5. Forecasting DAM Prices...")

# Get historical MCP for lag features
# mcp_lag_96: same time block yesterday (24-01-2026)
# mcp_lag_672: same time block 7 days ago (18-01-2026)

yesterday = target_dt - timedelta(days=1)
week_ago = target_dt - timedelta(days=7)

mcp_yesterday = dam_hist[dam_hist["Date"] == yesterday].sort_values("Time Block Num")["mcp"].values
mcp_week_ago = dam_hist[dam_hist["Date"] == week_ago].sort_values("Time Block Num")["mcp"].values

# Handle missing data
if len(mcp_yesterday) < 96:
    print(f"   ⚠️ Only {len(mcp_yesterday)} blocks for yesterday, using last available day")
    last_available = dam_hist["Date"].max()
    mcp_yesterday = dam_hist[dam_hist["Date"] == last_available].sort_values("Time Block Num")["mcp"].values

if len(mcp_week_ago) < 96:
    print(f"   ⚠️ Week ago data incomplete, using yesterday's data as fallback")
    mcp_week_ago = mcp_yesterday

# Get volume from yesterday (as estimate)
volume_yesterday = dam_hist[dam_hist["Date"] == dam_hist["Date"].max()].sort_values("Time Block Num")["volume"].values

predictions["mcp_lag_96"] = mcp_yesterday[:96] if len(mcp_yesterday) >= 96 else np.pad(mcp_yesterday, (0, 96-len(mcp_yesterday)), mode='edge')
predictions["mcp_lag_672"] = mcp_week_ago[:96] if len(mcp_week_ago) >= 96 else np.pad(mcp_week_ago, (0, 96-len(mcp_week_ago)), mode='edge')
predictions["volume"] = volume_yesterday[:96] if len(volume_yesterday) >= 96 else np.pad(volume_yesterday, (0, 96-len(volume_yesterday)), mode='edge')

# Prepare features for DAM model
predictions["net_load"] = predictions["Net_Load_Forecast_MW"]
predictions["Time Block Num"] = predictions["Time_Block"]

DAM_FEATURES = ["net_load", "Hour", "Time Block Num", "volume", "mcp_lag_96", "mcp_lag_672"]
X_dam = predictions[DAM_FEATURES]

# Predict DAM prices
predictions["DAM_Price_Forecast"] = model_dam.predict(X_dam)

print(f"   ✅ DAM Prices Forecasted")

# ============================================================
# Results Summary
# ============================================================
print("\n" + "=" * 60)
print("FORECAST SUMMARY - 25 January 2026")
print("=" * 60)

print(f"\n{'Metric':<25} {'Min':>10} {'Max':>10} {'Mean':>10}")
print("-" * 57)
print(f"{'Demand (MW)':<25} {predictions['Demand_Forecast_MW'].min():>10.1f} {predictions['Demand_Forecast_MW'].max():>10.1f} {predictions['Demand_Forecast_MW'].mean():>10.1f}")
print(f"{'Solar (MW)':<25} {predictions['Solar_Forecast_MW'].min():>10.1f} {predictions['Solar_Forecast_MW'].max():>10.1f} {predictions['Solar_Forecast_MW'].mean():>10.1f}")
print(f"{'Wind (MW)':<25} {predictions['Wind_Forecast_MW'].min():>10.1f} {predictions['Wind_Forecast_MW'].max():>10.1f} {predictions['Wind_Forecast_MW'].mean():>10.1f}")
print(f"{'Net Load (MW)':<25} {predictions['Net_Load_Forecast_MW'].min():>10.1f} {predictions['Net_Load_Forecast_MW'].max():>10.1f} {predictions['Net_Load_Forecast_MW'].mean():>10.1f}")
print(f"{'DAM Price (Rs/MWh)':<25} {predictions['DAM_Price_Forecast'].min():>10.2f} {predictions['DAM_Price_Forecast'].max():>10.2f} {predictions['DAM_Price_Forecast'].mean():>10.2f}")

# ============================================================
# Peak Hours Analysis
# ============================================================
print("\n" + "=" * 60)
print("PEAK HOURS ANALYSIS")
print("=" * 60)

# Find peak price hours
peak_price_idx = predictions["DAM_Price_Forecast"].nlargest(5).index
print("\n--- Top 5 Highest Price Time Blocks ---")
print(f"{'Time Block':<8} {'Time':<15} {'Price (Rs/MWh)':>15} {'Net Load (MW)':>15}")
print("-" * 55)
for idx in peak_price_idx:
    row = predictions.loc[idx]
    print(f"{int(row['Time_Block']):<8} {row['Time_Block_Label']:<15} {row['DAM_Price_Forecast']:>15.2f} {row['Net_Load_Forecast_MW']:>15.1f}")

# Find lowest price hours (solar peak)
low_price_idx = predictions["DAM_Price_Forecast"].nsmallest(5).index
print("\n--- Top 5 Lowest Price Time Blocks ---")
print(f"{'Time Block':<8} {'Time':<15} {'Price (Rs/MWh)':>15} {'Solar (MW)':>15}")
print("-" * 55)
for idx in low_price_idx:
    row = predictions.loc[idx]
    print(f"{int(row['Time_Block']):<8} {row['Time_Block_Label']:<15} {row['DAM_Price_Forecast']:>15.2f} {row['Solar_Forecast_MW']:>15.1f}")

# ============================================================
# Hourly Summary
# ============================================================
print("\n" + "=" * 60)
print("HOURLY PRICE SUMMARY")
print("=" * 60)

hourly = predictions.groupby("Hour").agg({
    "DAM_Price_Forecast": "mean",
    "Demand_Forecast_MW": "mean",
    "Net_Load_Forecast_MW": "mean"
}).round(2)

print(f"\n{'Hour':<6} {'Avg Price (Rs/MWh)':>18} {'Avg Demand (MW)':>16} {'Avg Net Load (MW)':>18}")
print("-" * 60)
for hour in range(24):
    row = hourly.loc[hour]
    print(f"{hour:02d}:00  {row['DAM_Price_Forecast']:>18.2f} {row['Demand_Forecast_MW']:>16.1f} {row['Net_Load_Forecast_MW']:>18.1f}")

# ============================================================
# Save Results
# ============================================================
output_cols = [
    "Date", "Time_Block", "Time_Block_Label", "Hour", "Minute",
    "Demand_Forecast_MW", "Solar_Forecast_MW", "Wind_Forecast_MW",
    "Generation_Forecast_MW", "Net_Load_Forecast_MW", "DAM_Price_Forecast"
]

output_file = f"dam_forecast_{target_date.replace('-', '')}.csv"
predictions[output_cols].to_csv(output_file, index=False)

print("\n" + "=" * 60)
print(f"📁 Forecast saved to: {output_file}")
print("=" * 60)

# ============================================================
# Quick Visualization (text-based)
# ============================================================
print("\n" + "=" * 60)
print("PRICE PROFILE (24-Hour)")
print("=" * 60)

hourly_prices = predictions.groupby("Hour")["DAM_Price_Forecast"].mean()
max_price = hourly_prices.max()

print("\nRs/MWh")
for hour in range(24):
    price = hourly_prices[hour]
    bar_len = int((price / max_price) * 40)
    bar = "█" * bar_len
    print(f"{hour:02d}:00 │{bar:<40}│ {price:.0f}")

print("\n✅ INFERENCE COMPLETE")
