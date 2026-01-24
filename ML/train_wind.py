import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

df = pd.read_csv("datasets/synthetic_wind_supply_15min.csv")
df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df.sort_values(["state_code", "timestamp"]).reset_index(drop=True)

# Target: next timestep wind generation
df["wind_target"] = df.groupby("state_code")["wind_generation"].shift(-1)
df = df.dropna().reset_index(drop=True)

FEATURES_WIND = [
    'hour', 'month', 'dayofweek', 'is_night', 'state_code',
    'wind_speed', 'wind_gust', 'air_pressure', 'curtailment_flag',
    'wind_generation',
    'wind_lag_1', 'wind_lag_4', 'wind_lag_96', 'wind_lag_672',
    'wind_roll_mean_1h', 'wind_roll_mean_3h', 'wind_roll_std_3h', 'wind_roll_max_6h'
]

# ============================================================
# PROPER TEMPORAL SPLIT - Split by time, not by row index!
# This ensures train/val/test have same states but different time periods
# ============================================================
unique_times = df["timestamp"].sort_values().unique()
n_times = len(unique_times)
train_cutoff = unique_times[int(n_times * 0.7)]
val_cutoff = unique_times[int(n_times * 0.85)]

train_mask = df["timestamp"] < train_cutoff
val_mask = (df["timestamp"] >= train_cutoff) & (df["timestamp"] < val_cutoff)
test_mask = df["timestamp"] >= val_cutoff

X = df[FEATURES_WIND]
y = df["wind_target"]

X_train, y_train = X[train_mask], y[train_mask]
X_val, y_val = X[val_mask], y[val_mask]
X_test, y_test = X[test_mask], y[test_mask]

print(f"Train: {len(X_train)} rows, Val: {len(X_val)} rows, Test: {len(X_test)} rows")

model_wind = XGBRegressor(
    n_estimators=1000,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    early_stopping_rounds=50
)

model_wind.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False
)

val_preds = model_wind.predict(X_val)
val_mae = mean_absolute_error(y_val, val_preds)
val_r2 = r2_score(y_val, val_preds)

test_preds = model_wind.predict(X_test)
test_mae = mean_absolute_error(y_test, test_preds)
test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
test_r2 = r2_score(y_test, test_preds)

print(f"\n=== WIND MODEL RESULTS ===")
print(f"Validation MAE: {val_mae:.4f}")
print(f"Validation R2:  {val_r2:.4f}")
print(f"Test MAE:       {test_mae:.4f}")
print(f"Test RMSE:      {test_rmse:.4f}")
print(f"Test R2:        {test_r2:.4f}")

joblib.dump(model_wind, "model_wind.pkl")
print("\n✅ Model saved to model_wind.pkl")
