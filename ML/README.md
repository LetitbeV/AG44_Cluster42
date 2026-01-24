# Shock - Energy Forecasting Models

Synthetic dataset generation and XGBoost models for electricity demand, solar, wind power, and DAM price forecasting at 15-minute intervals.

## Project Structure

```
Shock/
├── datasets/
│   ├── synthetic_demand_dataset_15min.csv
│   ├── synthetic_solar_supply_15min.csv
│   ├── synthetic_wind_supply_15min.csv
│   └── DAM_1month.xlsx
├── demand_dataset_script.py    # Generate demand dataset
├── solar_datagen.py            # Generate solar dataset
├── wind_datagen.py             # Generate wind dataset
├── train_demand.py             # Train demand forecasting model
├── train_solar.py              # Train solar forecasting model
├── train_wind.py               # Train wind forecasting model
├── forecast_dam.py             # Train DAM price model
├── cross_validate_dam.py       # Time-series CV for DAM model
├── audit_dam_model.py          # Validate DAM model for leakage
├── inference_dam.py            # Predict next day prices (96 blocks)
├── model_demand.pkl            # Trained demand model
├── model_solar.pkl             # Trained solar model
├── model_wind.pkl              # Trained wind model
└── model_dam_cv.pkl            # Trained DAM price model
```

## Model Performance

| Model | Validation R² | Test R² | Test MAE | Test RMSE |
|-------|--------------|---------|----------|-----------|
| **Demand** | 0.9837 | 0.9839 | 79.42 MW | 103.34 MW |
| **Solar** | 0.9323 | 0.9284 | 45.46 MW | 69.90 MW |
| **Wind** | 0.7582 | 0.7529 | 31.14 MW | 52.73 MW |
| **DAM Price** | 0.82 ± 0.09 (CV) | - | 554.50 Rs/MWh | 938.73 Rs/MWh |

### Why Wind R² is Lower?

Wind power is inherently harder to predict than solar or demand:

| Metric | Wind | Solar | Demand |
|--------|------|-------|--------|
| **Coefficient of Variation** | 1.725 | 1.337 | 0.164 |
| **Autocorrelation (lag-1)** | 0.943 | 0.938 | 0.987 |

- **Solar** follows a smooth, predictable daily curve (sunrise → peak → sunset)
- **Demand** follows regular human behavior patterns (work hours, meals, sleep)
- **Wind** is driven by chaotic atmospheric dynamics - pressure systems, fronts, local terrain effects

Wind has **10x higher variability** than demand and lower temporal autocorrelation, making it fundamentally harder to predict. An R² of 0.75 is realistic and aligns with real-world wind forecasting performance (typically 0.6-0.8).

## Dataset Features

### Demand Dataset
- **Temporal**: hour, month, is_weekend, is_holiday, day_type
- **Weather**: temp_current, temp_max_today, temp_min_today, humidity, is_cold
- **Lag features**: demand_lag_1, demand_lag_4, demand_lag_96, demand_lag_672
- **Rolling features**: demand_roll_mean_1h, demand_roll_mean_3h, demand_roll_std_3h, demand_roll_max_6h
- **Target**: demand_actual (MW)

### Solar Dataset
- **Temporal**: hour, month, state_code
- **Weather**: cloud_cover, irradiance, temp_current
- **Grid**: curtailment_flag
- **Lag features**: solar_lag_1, solar_lag_4, solar_lag_96, solar_lag_672
- **Rolling features**: solar_roll_mean_1h, solar_roll_mean_3h, solar_roll_std_3h, solar_roll_max_6h
- **Target**: solar_generation (MW)

### Wind Dataset
- **Temporal**: hour, month, dayofweek, is_night, state_code
- **Weather**: wind_speed, wind_gust, air_pressure
- **Grid**: curtailment_flag
- **Lag features**: wind_lag_1, wind_lag_4, wind_lag_96, wind_lag_672
- **Rolling features**: wind_roll_mean_1h, wind_roll_mean_3h, wind_roll_std_3h, wind_roll_max_6h
- **Target**: wind_generation (MW)

## Usage

### 1. Generate Datasets

```bash
python demand_dataset_script.py
python solar_datagen.py
python wind_datagen.py
```

### 2. Train Models

```bash
python train_demand.py
python train_solar.py
python train_wind.py
python forecast_dam.py          # Train DAM price model
python cross_validate_dam.py    # Run time-series CV (optional)
```

### 3. Run Inference (Next Day Forecast)

```bash
python inference_dam.py
```

This outputs 96 time blocks (15-min intervals) with:
- Demand, Solar, Wind forecasts
- Net Load calculation
- DAM Price forecast (Rs/MWh)

### 4. Load and Use Trained Models

```python
import joblib
import pandas as pd

# Load models
model_demand = joblib.load("model_demand.pkl")
model_solar = joblib.load("model_solar.pkl")
model_wind = joblib.load("model_wind.pkl")

# Predict (provide features as DataFrame)
demand_pred = model_demand.predict(X_demand_features)
solar_pred = model_solar.predict(X_solar_features)
wind_pred = model_wind.predict(X_wind_features)
```

## Key Implementation Details

### Data Leakage Prevention
Rolling features are calculated using `.shift(1)` before applying rolling windows to ensure only **past data** is used:

```python
shifted = df["demand_actual"].shift(1)
df["demand_roll_mean_1h"] = shifted.rolling(4, min_periods=1).mean()
```

### Proper Temporal Split
Data is split by **timestamp** (not row index) to ensure all states appear in train/val/test with different time periods:

```python
unique_times = df["timestamp"].sort_values().unique()
train_cutoff = unique_times[int(len(unique_times) * 0.7)]
val_cutoff = unique_times[int(len(unique_times) * 0.85)]

train_mask = df["timestamp"] < train_cutoff
val_mask = (df["timestamp"] >= train_cutoff) & (df["timestamp"] < val_cutoff)
test_mask = df["timestamp"] >= val_cutoff
```

## Requirements

- Python 3.8+
- pandas
- numpy
- xgboost
- scikit-learn
- joblib
- openpyxl (for reading Excel files)
- scipy (for cross-validation statistics)
