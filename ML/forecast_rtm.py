"""
RTM Price Forecasting
=====================
Predicts Real-Time Market prices for next few hours
Uses same approach as DAM but for shorter horizon
"""

import joblib
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import json
from datetime import datetime
from dispatch_optimizer import run_dispatch_optimization, group_consecutive_signals, get_price_stats

# ============================================================
# Load RTM Data
# ============================================================
print("Loading RTM data...")
rtm = pd.read_excel("datasets/RTM_Market Snapshot.xlsx", header=0)
rtm['Date'] = pd.to_datetime(rtm['Date'], format='%d-%m-%Y')
rtm = rtm.rename(columns={
    'MCP (Rs/MWh) *': 'mcp',
    'Final Scheduled Volume (MW)': 'volume',
    'Time Block': 'time_block'
})
rtm = rtm.sort_values(['Date', 'Hour', 'Session ID']).reset_index(drop=True)

print(f"RTM data: {len(rtm)} rows")
print(f"Date range: {rtm['Date'].min()} to {rtm['Date'].max()}")

# ============================================================
# Feature Engineering (similar to DAM)
# ============================================================
print("\nCreating features...")

# Time features
rtm['day_of_week'] = rtm['Date'].dt.dayofweek
rtm['is_weekend'] = rtm['day_of_week'].isin([5, 6]).astype(int)

# Create time block number (1-96 per day)
rtm['time_block_num'] = rtm.groupby('Date').cumcount() + 1

# Lag features (previous blocks)
rtm['mcp_lag1'] = rtm['mcp'].shift(1)
rtm['mcp_lag4'] = rtm['mcp'].shift(4)   # 1 hour ago
rtm['mcp_lag8'] = rtm['mcp'].shift(8)   # 2 hours ago
rtm['mcp_lag96'] = rtm['mcp'].shift(96) # Same time yesterday

# Rolling averages
rtm['mcp_roll_4'] = rtm['mcp'].rolling(4).mean()   # 1 hour rolling
rtm['mcp_roll_8'] = rtm['mcp'].rolling(8).mean()   # 2 hour rolling

# Volume features
rtm['volume_lag1'] = rtm['volume'].shift(1)

# Drop NaN rows
rtm_clean = rtm.dropna().reset_index(drop=True)
print(f"After cleaning: {len(rtm_clean)} rows")

# ============================================================
# Train RTM Model
# ============================================================
print("\nTraining RTM model...")

features = [
    'Hour', 'time_block_num', 'day_of_week', 'is_weekend',
    'mcp_lag1', 'mcp_lag4', 'mcp_lag8', 'mcp_lag96',
    'mcp_roll_4', 'mcp_roll_8', 'volume_lag1'
]

X = rtm_clean[features]
y = rtm_clean['mcp']

# Split: train on earlier data, test on recent
split_idx = int(len(X) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

print(f"Train: {len(X_train)}, Test: {len(X_test)}")

# Train XGBoost
model = XGBRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\n=== RTM MODEL RESULTS ===")
print(f"MAE:  ₹{mae:.2f}/MWh")
print(f"R²:   {r2:.4f}")

# Save model
joblib.dump(model, 'model_rtm.pkl')
print("✅ RTM model saved to model_rtm.pkl")

# ============================================================
# Forecast for Target Date
# ============================================================
target_date = "2026-01-24"
print(f"\n=== Forecasting RTM for {target_date} ===")

# Get actual RTM prices for target date (for comparison)
target_data = rtm[rtm['Date'] == pd.to_datetime(target_date)].copy()

if len(target_data) == 0:
    print(f"No data for {target_date}, using last available date")
    target_date = rtm['Date'].max().strftime('%Y-%m-%d')
    target_data = rtm[rtm['Date'] == pd.to_datetime(target_date)].copy()

print(f"Found {len(target_data)} blocks for {target_date}")

# Get actual prices
actual_prices = target_data['mcp'].values

# For prediction, we need lag features from previous day
# Use the trained model to predict
target_data_clean = target_data.dropna(subset=features)
if len(target_data_clean) > 0:
    X_target = target_data_clean[features]
    predicted_prices = model.predict(X_target)
else:
    # If no clean data, use test predictions
    predicted_prices = y_pred[:96] if len(y_pred) >= 96 else y_pred

# Ensure we have 96 values
n_blocks = min(96, len(actual_prices), len(predicted_prices))

# ============================================================
# Generate RTM JSON Output
# ============================================================
print("\nGenerating RTM JSON files...")

# Price forecast
rtm_prices = []
for i in range(n_blocks):
    hour = i // 4
    minute = (i % 4) * 15
    rtm_prices.append({
        'timestamp': f"{target_date} {hour:02d}:{minute:02d}:00",
        'predicted_price': round(float(predicted_prices[i]), 2),
        'actual_price': round(float(actual_prices[i]), 2) if i < len(actual_prices) else None
    })

# Run dispatch optimization on RTM prices
dispatch_pred = run_dispatch_optimization(list(predicted_prices[:n_blocks]))
dispatch_actual = run_dispatch_optimization(list(actual_prices[:n_blocks]))

# Calculate accuracy
errors = np.abs(predicted_prices[:n_blocks] - actual_prices[:n_blocks])
mape = np.mean(errors / actual_prices[:n_blocks]) * 100
discount_factor = max(0.5, 1 - (mape / 100) - 0.05)
conservative_profit = dispatch_pred['profit']['total_revenue'] * discount_factor

# Summary
summary = {
    'forecast_date': target_date,
    'market': 'RTM',
    'generated_at': datetime.now().isoformat(),
    'prediction_accuracy': {
        'mape_percent': round(mape, 2),
        'confidence_factor': round(discount_factor, 2)
    },
    'profit_estimates': {
        'optimistic': round(dispatch_pred['profit']['total_revenue'], 2),
        'conservative': round(conservative_profit, 2),
        'actual': round(dispatch_actual['profit']['total_revenue'], 2)
    }
}

# Save RTM webapp data
rtm_webapp_data = {
    'forecast_date': target_date,
    'market': 'RTM',
    'generated_at': datetime.now().isoformat(),
    'price_forecast': rtm_prices,
    'buy_signals': dispatch_pred['buy_signals'],
    'sell_signals': dispatch_pred['sell_signals'],
    'summary': summary
}

with open('rtm_webapp_data.json', 'w') as f:
    json.dump(rtm_webapp_data, f, indent=2)
print("✅ Saved rtm_webapp_data.json")

# Save RTM trading signals
rtm_trading_signals = {
    'forecast_date': target_date,
    'market': 'RTM',
    'buy_signals': dispatch_pred['buy_signals'],
    'sell_signals': dispatch_pred['sell_signals'],
    'buy_windows': group_consecutive_signals(dispatch_pred['buy_signals']),
    'sell_windows': group_consecutive_signals(dispatch_pred['sell_signals']),
    'thresholds': dispatch_pred['thresholds']
}

with open('rtm_trading_signals.json', 'w') as f:
    json.dump(rtm_trading_signals, f, indent=2)
print("✅ Saved rtm_trading_signals.json")

# Save RTM price forecast
rtm_price_forecast = {
    'forecast_date': target_date,
    'market': 'RTM',
    'prices': rtm_prices
}

with open('rtm_price_forecast.json', 'w') as f:
    json.dump(rtm_price_forecast, f, indent=2)
print("✅ Saved rtm_price_forecast.json")

# Print summary
print(f"\n=== RTM Summary for {target_date} ===")
pred_stats = get_price_stats(predicted_prices[:n_blocks])
actual_stats = get_price_stats(actual_prices[:n_blocks])
print(f"Predicted: Min ₹{pred_stats['min']}, Max ₹{pred_stats['max']}, Avg ₹{pred_stats['mean']}")
print(f"Actual:    Min ₹{actual_stats['min']}, Max ₹{actual_stats['max']}, Avg ₹{actual_stats['mean']}")
print(f"MAPE: {mape:.2f}%")
print(f"\nProfit Estimates:")
print(f"  Optimistic:   ₹{summary['profit_estimates']['optimistic']:,.0f}")
print(f"  Conservative: ₹{summary['profit_estimates']['conservative']:,.0f}")
print(f"  Actual:       ₹{summary['profit_estimates']['actual']:,.0f}")
