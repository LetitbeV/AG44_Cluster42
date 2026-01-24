"""
Time-Series Cross-Validation for DAM Model
===========================================
Implements proper expanding window cross-validation to get 
robust performance estimates without temporal leakage.

This addresses:
- Sample size disparity
- Regime volatility across different periods
- Stochastic flukes from single splits
"""

import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# Load and prepare data
# ============================================================
print("=" * 60)
print("TIME-SERIES CROSS-VALIDATION FOR DAM MODEL")
print("=" * 60)

# Load historical data for net_load calculation
demand_hist = pd.read_csv("datasets/synthetic_demand_dataset_15min.csv")
demand_hist["timestamp"] = pd.to_datetime(demand_hist["timestamp"])

solar_hist = pd.read_csv("datasets/synthetic_solar_supply_15min.csv")
solar_hist["timestamp"] = pd.to_datetime(solar_hist["timestamp"])

wind_hist = pd.read_csv("datasets/synthetic_wind_supply_15min.csv")
wind_hist["timestamp"] = pd.to_datetime(wind_hist["timestamp"])

# Merge and calculate net load
hist = demand_hist.merge(
    solar_hist[["timestamp", "state_code", "solar_generation"]], 
    on=["timestamp", "state_code"]
).merge(
    wind_hist[["timestamp", "state_code", "wind_generation"]], 
    on=["timestamp", "state_code"]
)

hist["net_load"] = hist["demand_actual"] - (hist["solar_generation"] + hist["wind_generation"])

hist_agg = hist.groupby("timestamp").agg({
    "net_load": "sum"
}).reset_index()

hist_agg["Date"] = pd.to_datetime(hist_agg["timestamp"].dt.date)
hist_agg["Time Block Num"] = (
    hist_agg["timestamp"].dt.hour * 4 
    + hist_agg["timestamp"].dt.minute // 15 + 1
)

# Load DAM data
dam = pd.read_excel("datasets/DAM_1month.xlsx")
dam["Date"] = pd.to_datetime(dam["Date"], format="%d-%m-%Y")
dam["Time Block Num"] = dam.groupby("Date").cumcount() + 1
dam = dam.rename(columns={
    "MCP (Rs/MWh) *": "mcp",
    "Final Scheduled Volume (MW)": "volume"
})

# Merge with net load
dam = dam.merge(
    hist_agg[["Date", "Time Block Num", "net_load"]],
    on=["Date", "Time Block Num"],
    how="inner"
)

# Sort and create lag features
dam = dam.sort_values(["Date", "Time Block Num"]).reset_index(drop=True)
dam["mcp_lag_96"] = dam["mcp"].shift(96)
dam["mcp_lag_672"] = dam["mcp"].shift(672)
dam = dam.dropna().reset_index(drop=True)

print(f"Dataset ready: {len(dam)} rows")
print(f"Date range: {dam['Date'].min().date()} to {dam['Date'].max().date()}")

# ============================================================
# Features
# ============================================================
FEATURES = [
    "net_load",
    "Hour",
    "Time Block Num",
    "volume",
    "mcp_lag_96",
    "mcp_lag_672"
]

X = dam[FEATURES]
y = dam["mcp"]

# ============================================================
# Expanding Window Cross-Validation
# ============================================================
print("\n" + "=" * 60)
print("EXPANDING WINDOW CROSS-VALIDATION")
print("=" * 60)

# Define fold sizes (each fold is ~1 day = 96 blocks)
n = len(dam)
min_train_size = int(n * 0.5)  # Start with 50% for training
fold_size = 96 * 2  # 2 days per fold
n_folds = (n - min_train_size) // fold_size

print(f"\nTotal samples: {n}")
print(f"Minimum training size: {min_train_size}")
print(f"Fold size: {fold_size} (2 days)")
print(f"Number of folds: {n_folds}")

results = []

for fold in range(n_folds):
    train_end = min_train_size + fold * fold_size
    test_start = train_end
    test_end = min(train_end + fold_size, n)
    
    if test_end <= test_start:
        break
    
    X_train = X.iloc[:train_end]
    y_train = y.iloc[:train_end]
    X_test = X.iloc[test_start:test_end]
    y_test = y.iloc[test_start:test_end]
    
    # Train model
    model = XGBRegressor(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0
    )
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    
    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    # Get date range for this fold
    fold_dates = dam.iloc[test_start:test_end]['Date']
    date_start = fold_dates.min().date()
    date_end = fold_dates.max().date()
    
    results.append({
        'fold': fold + 1,
        'train_size': len(X_train),
        'test_size': len(X_test),
        'date_start': date_start,
        'date_end': date_end,
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'test_mean': y_test.mean(),
        'test_std': y_test.std()
    })
    
    print(f"Fold {fold+1}: Train={len(X_train):>4}, Test={len(X_test):>3} | "
          f"{date_start} to {date_end} | MAE={mae:>7.2f}, R²={r2:.4f}")

results_df = pd.DataFrame(results)

# ============================================================
# Summary Statistics
# ============================================================
print("\n" + "=" * 60)
print("CROSS-VALIDATION SUMMARY")
print("=" * 60)

print(f"\n--- Aggregated Metrics (across {len(results_df)} folds) ---")
print(f"{'Metric':<10} {'Mean':>10} {'Std':>10} {'Min':>10} {'Max':>10}")
print("-" * 52)

for metric in ['mae', 'rmse', 'r2']:
    mean_val = results_df[metric].mean()
    std_val = results_df[metric].std()
    min_val = results_df[metric].min()
    max_val = results_df[metric].max()
    print(f"{metric.upper():<10} {mean_val:>10.2f} {std_val:>10.2f} {min_val:>10.2f} {max_val:>10.2f}")

# ============================================================
# Confidence Intervals
# ============================================================
print("\n--- 95% Confidence Intervals ---")
from scipy import stats

for metric in ['mae', 'rmse', 'r2']:
    values = results_df[metric].values
    mean = values.mean()
    sem = stats.sem(values)
    ci = stats.t.interval(0.95, len(values)-1, loc=mean, scale=sem)
    print(f"{metric.upper()}: {mean:.2f} [{ci[0]:.2f}, {ci[1]:.2f}]")

# ============================================================
# Regime Analysis
# ============================================================
print("\n" + "=" * 60)
print("REGIME ANALYSIS")
print("=" * 60)

# Correlate test volatility with model performance
results_df['cv'] = results_df['test_std'] / results_df['test_mean']
corr_cv_r2 = results_df['cv'].corr(results_df['r2'])
corr_cv_mae = results_df['cv'].corr(results_df['mae'])

print(f"\nCorrelation between Test Volatility (CV) and Performance:")
print(f"  CV vs R²:  {corr_cv_r2:>7.4f} {'(higher volatility → worse R²)' if corr_cv_r2 < 0 else ''}")
print(f"  CV vs MAE: {corr_cv_mae:>7.4f} {'(higher volatility → higher MAE)' if corr_cv_mae > 0 else ''}")

# Identify best and worst folds
best_fold = results_df.loc[results_df['r2'].idxmax()]
worst_fold = results_df.loc[results_df['r2'].idxmin()]

print(f"\n--- Best Performing Fold ---")
print(f"  Fold {int(best_fold['fold'])}: {best_fold['date_start']} to {best_fold['date_end']}")
print(f"  R²={best_fold['r2']:.4f}, MAE={best_fold['mae']:.2f}, CV={best_fold['cv']:.4f}")

print(f"\n--- Worst Performing Fold ---")
print(f"  Fold {int(worst_fold['fold'])}: {worst_fold['date_start']} to {worst_fold['date_end']}")
print(f"  R²={worst_fold['r2']:.4f}, MAE={worst_fold['mae']:.2f}, CV={worst_fold['cv']:.4f}")

# ============================================================
# Final Model Training
# ============================================================
print("\n" + "=" * 60)
print("FINAL MODEL (Full Training)")
print("=" * 60)

# Train on all data for production model
final_model = XGBRegressor(
    n_estimators=400,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbosity=0
)
final_model.fit(X, y)

joblib.dump(final_model, "model_dam_cv.pkl")
print(f"\n✅ Final model saved to model_dam_cv.pkl")

# Save CV results
results_df.to_csv("dam_cv_results.csv", index=False)
print(f"📁 CV results saved to dam_cv_results.csv")

# ============================================================
# Recommendations
# ============================================================
print("\n" + "=" * 60)
print("RECOMMENDATIONS")
print("=" * 60)

mean_r2 = results_df['r2'].mean()
std_r2 = results_df['r2'].std()

print(f"\nExpected R² in production: {mean_r2:.4f} ± {std_r2:.4f}")
print(f"Expected MAE in production: {results_df['mae'].mean():.2f} ± {results_df['mae'].std():.2f} Rs/MWh")

if std_r2 > 0.1:
    print("\n⚠️  High variance in R² across folds indicates regime sensitivity.")
    print("   Consider: ensemble methods, regime-aware features, or adaptive models.")
else:
    print("\n✅ Model shows consistent performance across different time periods.")

print("\n" + "=" * 60)
print("CROSS-VALIDATION COMPLETE")
print("=" * 60)
