"""
DAM Model Validation & Leakage Audit
=====================================
This script audits the DAM price forecasting model for:
1. Temporal Data Leakage (Look-ahead Bias)
2. Regime Volatility & Distribution Shift
3. Chronological Misalignment
4. Sample Size Disparity

Run this BEFORE trusting your model's R² scores.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# ============================================================
# Load and prepare data (same as forecast_dam.py)
# ============================================================
print("=" * 60)
print("DAM MODEL VALIDATION & LEAKAGE AUDIT")
print("=" * 60)

dam = pd.read_excel('datasets/DAM_1month.xlsx')
dam['Date'] = pd.to_datetime(dam['Date'], format='%d-%m-%Y')
dam = dam.rename(columns={'MCP (Rs/MWh) *': 'mcp', 'Final Scheduled Volume (MW)': 'volume'})
dam['Time Block Num'] = dam.groupby('Date').cumcount() + 1

# Sort chronologically
dam = dam.sort_values(['Date', 'Time Block Num']).reset_index(drop=True)

# Create lag features
dam['mcp_lag_96'] = dam['mcp'].shift(96)    # Same time yesterday
dam['mcp_lag_672'] = dam['mcp'].shift(672)  # Same time last week
dam_clean = dam.dropna().reset_index(drop=True)

# ============================================================
# 1. TEMPORAL SPLIT ANALYSIS
# ============================================================
print("\n" + "=" * 60)
print("1. TEMPORAL SPLIT ANALYSIS")
print("=" * 60)

n = len(dam_clean)
train_end = int(n * 0.7)
val_end = int(n * 0.85)

train = dam_clean.iloc[:train_end]
val = dam_clean.iloc[train_end:val_end]
test = dam_clean.iloc[val_end:]

print(f"\nFull dataset: {dam['Date'].min().date()} to {dam['Date'].max().date()}")
print(f"After lag features: {len(dam_clean)} rows (lost {len(dam) - len(dam_clean)} to NaN)")

print(f"\n--- Split Sizes ---")
print(f"Train: {len(train):>5} rows ({len(train)/n*100:.1f}%) | {train['Date'].min().date()} to {train['Date'].max().date()}")
print(f"Val:   {len(val):>5} rows ({len(val)/n*100:.1f}%) | {val['Date'].min().date()} to {val['Date'].max().date()}")
print(f"Test:  {len(test):>5} rows ({len(test)/n*100:.1f}%) | {test['Date'].min().date()} to {test['Date'].max().date()}")

# Check for chronological ordering
train_max = train['Date'].max()
val_min = val['Date'].min()
val_max = val['Date'].max()
test_min = test['Date'].min()

print(f"\n--- Chronological Integrity Check ---")
if train_max <= val_min and val_max <= test_min:
    print("✅ PASS: Splits are strictly chronological (no future leakage)")
else:
    print("❌ FAIL: Splits overlap! Temporal leakage detected!")
    print(f"   Train ends: {train_max}, Val starts: {val_min}")
    print(f"   Val ends: {val_max}, Test starts: {test_min}")

# ============================================================
# 2. DISTRIBUTION SHIFT ANALYSIS
# ============================================================
print("\n" + "=" * 60)
print("2. DISTRIBUTION SHIFT ANALYSIS (Regime Volatility)")
print("=" * 60)

print(f"\n--- Price Statistics by Split ---")
print(f"{'Split':<8} {'Mean':>10} {'Std':>10} {'Min':>10} {'Max':>10} {'CV':>8}")
print("-" * 58)
for name, df in [('Train', train), ('Val', val), ('Test', test)]:
    mean = df['mcp'].mean()
    std = df['mcp'].std()
    cv = std / mean
    print(f"{name:<8} {mean:>10.2f} {std:>10.2f} {df['mcp'].min():>10.2f} {df['mcp'].max():>10.2f} {cv:>8.4f}")

# Kolmogorov-Smirnov test for distribution similarity
print(f"\n--- Distribution Similarity (KS Test) ---")
ks_train_val = stats.ks_2samp(train['mcp'], val['mcp'])
ks_train_test = stats.ks_2samp(train['mcp'], test['mcp'])
ks_val_test = stats.ks_2samp(val['mcp'], test['mcp'])

print(f"Train vs Val:  KS={ks_train_val.statistic:.4f}, p={ks_train_val.pvalue:.4f}", 
      "⚠️  DIFFERENT" if ks_train_val.pvalue < 0.05 else "✅ Similar")
print(f"Train vs Test: KS={ks_train_test.statistic:.4f}, p={ks_train_test.pvalue:.4f}",
      "⚠️  DIFFERENT" if ks_train_test.pvalue < 0.05 else "✅ Similar")
print(f"Val vs Test:   KS={ks_val_test.statistic:.4f}, p={ks_val_test.pvalue:.4f}",
      "⚠️  DIFFERENT" if ks_val_test.pvalue < 0.05 else "✅ Similar")

# ============================================================
# 3. EXTREME EVENTS ANALYSIS
# ============================================================
print("\n" + "=" * 60)
print("3. EXTREME EVENTS ANALYSIS")
print("=" * 60)

overall_mean = dam_clean['mcp'].mean()
overall_std = dam_clean['mcp'].std()
threshold_high = overall_mean + 2 * overall_std
threshold_low = overall_mean - 2 * overall_std

print(f"\nPrice range (overall): {dam_clean['mcp'].min():.2f} - {dam_clean['mcp'].max():.2f} Rs/MWh")
print(f"Extreme threshold (±2σ): < {threshold_low:.2f} or > {threshold_high:.2f} Rs/MWh")

print(f"\n--- Extreme Events Count ---")
for name, df in [('Train', train), ('Val', val), ('Test', test)]:
    extremes = ((df['mcp'] > threshold_high) | (df['mcp'] < threshold_low)).sum()
    pct = extremes / len(df) * 100
    print(f"{name}: {extremes:>4} extreme events ({pct:.2f}%)")

# ============================================================
# 4. LAG FEATURE LEAKAGE CHECK
# ============================================================
print("\n" + "=" * 60)
print("4. LAG FEATURE LEAKAGE CHECK")
print("=" * 60)

# Check if lag features are properly shifted
print("\n--- Lag Feature Integrity ---")

# Sample check: mcp_lag_96 should equal mcp from 96 rows earlier
sample_idx = 1000
if sample_idx < len(dam_clean):
    actual_lag = dam_clean.iloc[sample_idx]['mcp_lag_96']
    expected_lag = dam_clean.iloc[sample_idx - 96]['mcp'] if sample_idx >= 96 else np.nan
    
    if np.isclose(actual_lag, expected_lag):
        print(f"✅ mcp_lag_96 correctly computed (verified at index {sample_idx})")
    else:
        print(f"❌ mcp_lag_96 INCORRECT! Expected {expected_lag:.2f}, got {actual_lag:.2f}")

# Check lag_672 (weekly)
if sample_idx >= 672:
    actual_lag = dam_clean.iloc[sample_idx]['mcp_lag_672']
    expected_lag = dam_clean.iloc[sample_idx - 672]['mcp']
    
    if np.isclose(actual_lag, expected_lag):
        print(f"✅ mcp_lag_672 correctly computed (verified at index {sample_idx})")
    else:
        print(f"❌ mcp_lag_672 INCORRECT! Expected {expected_lag:.2f}, got {actual_lag:.2f}")

# ============================================================
# 5. FEATURE CORRELATION WITH TARGET
# ============================================================
print("\n" + "=" * 60)
print("5. FEATURE CORRELATION ANALYSIS")
print("=" * 60)

features = ['mcp_lag_96', 'mcp_lag_672', 'volume', 'Hour']
print(f"\n--- Correlation with MCP ---")
for feat in features:
    if feat in dam_clean.columns:
        corr = dam_clean['mcp'].corr(dam_clean[feat])
        print(f"{feat:<15}: {corr:>7.4f}")

# Check if lag features are suspiciously high (potential leakage indicator)
lag_96_corr = dam_clean['mcp'].corr(dam_clean['mcp_lag_96'])
if lag_96_corr > 0.95:
    print(f"\n⚠️  WARNING: mcp_lag_96 correlation ({lag_96_corr:.4f}) is very high!")
    print("   This could indicate near-constant prices or potential leakage.")

# ============================================================
# 6. AUTOCORRELATION ANALYSIS
# ============================================================
print("\n" + "=" * 60)
print("6. AUTOCORRELATION ANALYSIS")
print("=" * 60)

print(f"\n--- MCP Autocorrelation ---")
for lag in [1, 4, 24, 96, 672]:
    if len(dam_clean) > lag:
        acf = dam_clean['mcp'].autocorr(lag)
        print(f"Lag {lag:>4} ({lag*15:>5} min / {lag//96:>2}d {(lag%96)//4:>2}h): {acf:.4f}")

# ============================================================
# 7. RECOMMENDATIONS
# ============================================================
print("\n" + "=" * 60)
print("7. RECOMMENDATIONS")
print("=" * 60)

issues_found = []

# Check for distribution shift
if ks_val_test.pvalue < 0.05:
    issues_found.append("Distribution shift between Val and Test sets")

# Check for extreme imbalance
val_extremes = ((val['mcp'] > threshold_high) | (val['mcp'] < threshold_low)).sum()
test_extremes = ((test['mcp'] > threshold_high) | (test['mcp'] < threshold_low)).sum()
if abs(val_extremes - test_extremes) > 10:
    issues_found.append(f"Extreme event imbalance: Val has {val_extremes}, Test has {test_extremes}")

# Check CV difference
val_cv = val['mcp'].std() / val['mcp'].mean()
test_cv = test['mcp'].std() / test['mcp'].mean()
if abs(val_cv - test_cv) > 0.1:
    issues_found.append(f"Volatility mismatch: Val CV={val_cv:.4f}, Test CV={test_cv:.4f}")

if issues_found:
    print("\n⚠️  ISSUES DETECTED:")
    for i, issue in enumerate(issues_found, 1):
        print(f"   {i}. {issue}")
    print("\n📋 SUGGESTED ACTIONS:")
    print("   - Use Time-Series Cross-Validation (expanding window)")
    print("   - Report confidence intervals, not just point R²")
    print("   - Test on multiple rolling windows")
else:
    print("\n✅ No major issues detected. Model validation looks reasonable.")

print("\n" + "=" * 60)
print("AUDIT COMPLETE")
print("=" * 60)
