import numpy as np
import pandas as pd

# ============================================================
# Synthetic 15-min Electricity Demand Dataset Generator
# Features included (as requested):
# state_code (label encoded by population rank)
# hour, month, is_weekend, is_holiday, day_type
# temp_current, temp_max_today, temp_min_today, humidity, is_cold
# demand_lag_1, demand_lag_4, demand_lag_96, demand_lag_672
# demand_roll_mean_1h, demand_roll_mean_3h, demand_roll_std_3h, demand_roll_max_6h
# Target: demand_actual (MW)
# ============================================================

def generate_synthetic_demand_dataset(
    start_date="2025-01-01",
    end_date="2025-02-01",
    freq="15min",
    n_states=10,
    cold_threshold=15.0,
    random_seed=42,
    output_path="/home/oai/share/synthetic_demand_dataset_15min.csv",
):
    np.random.seed(random_seed)

    # 15-min timestamps
    ts = pd.date_range(start=start_date, end=end_date, freq=freq, inclusive="left")
    base = pd.DataFrame({"timestamp": ts})
    base["hour"] = base["timestamp"].dt.hour
    base["month"] = base["timestamp"].dt.month
    base["dayofweek"] = base["timestamp"].dt.dayofweek
    base["is_weekend"] = (base["dayofweek"] >= 5).astype(int)

    # Simple synthetic holiday logic (random days)
    # You can replace this with your own holiday calendar.
    unique_days = pd.to_datetime(base["timestamp"].dt.date.unique())
    holiday_days = np.random.choice(unique_days, size=max(2, len(unique_days)//12), replace=False)
    holiday_set = set(pd.to_datetime(holiday_days))

    base["is_holiday"] = base["timestamp"].dt.floor("D").isin(holiday_set).astype(int)

    # day_type: weekday / weekend / holiday
    def day_type(row):
        if row["is_holiday"] == 1:
            return "holiday"
        elif row["is_weekend"] == 1:
            return "weekend"
        else:
            return "weekday"

    base["day_type"] = base.apply(day_type, axis=1)

    # Expand into multiple states
    # state_code is label-encoded by population rank (0=highest population)
    states = pd.DataFrame({"state_code": np.arange(n_states, dtype=int)})
    df = base.merge(states, how="cross")

    # -------------------------
    # WEATHER GENERATION
    # -------------------------
    # Make day-level weather: temp_min_today, temp_max_today, humidity
    # Add seasonal effect: summer months warmer, winter cooler (simple).
    day_index = pd.to_datetime(df["timestamp"].dt.floor("D"))
    df["date"] = day_index

    unique_state_days = df[["state_code", "date"]].drop_duplicates().reset_index(drop=True)

    # State bias: bigger states -> slightly higher base temp & demand (pure synthetic)
    state_temp_bias = (np.linspace(1.5, -1.5, n_states))  # state_code 0 hotter, last cooler
    state_demand_bias = (np.linspace(1.0, 0.6, n_states)) # state_code 0 higher demand

    # Seasonal temperature baseline by month (India-like simplified)
    month_baseline = {1: 20, 2: 23, 3: 28, 4: 33, 5: 36, 6: 34, 7: 30, 8: 29, 9: 29, 10: 28, 11: 24, 12: 21}

    temp_min_list = []
    temp_max_list = []
    humidity_list = []

    for _, r in unique_state_days.iterrows():
        m = r["date"].month
        baseline = month_baseline.get(m, 28)

        # daily min/max with randomness
        t_max = baseline + np.random.normal(0, 2.2) + state_temp_bias[r["state_code"]]
        t_min = t_max - (6 + np.random.normal(0, 1.0))

        # humidity roughly inverse with temp (simple)
        hum = np.clip(70 - (t_max - 28) * 2 + np.random.normal(0, 8), 25, 95)

        temp_max_list.append(t_max)
        temp_min_list.append(t_min)
        humidity_list.append(hum)

    unique_state_days["temp_max_today"] = temp_max_list
    unique_state_days["temp_min_today"] = temp_min_list
    unique_state_days["humidity"] = humidity_list

    df = df.merge(unique_state_days, on=["state_code", "date"], how="left")

    # temp_current = daily curve between min and max
    # Create a smooth daily temperature profile peaking mid-afternoon
    hour = df["hour"].values
    t_min = df["temp_min_today"].values
    t_max = df["temp_max_today"].values

    # normalized temp curve: low at 5 AM, peak at 3 PM
    # shift cosine to peak at 15:00
    peak_hour = 15
    temp_curve = 0.5 * (1 + np.cos((hour - peak_hour) / 24 * 2 * np.pi))  # 1 at peak, 0 at opposite
    df["temp_current"] = t_min + (t_max - t_min) * temp_curve

    # is_cold based on temp_min_today
    df["is_cold"] = (df["temp_min_today"] < cold_threshold).astype(int)

    # -------------------------
    # DEMAND GENERATION
    # -------------------------
    # Demand = base + daily shape + weekend/holiday effect + temperature effect + noise + state scaling
    # Daily load curve: evening peak + smaller morning peak
    h = df["hour"].values

    # peaks
    morning_peak = np.exp(-0.5 * ((h - 9) / 2.5) ** 2)
    evening_peak = np.exp(-0.5 * ((h - 19) / 3.0) ** 2)
    night_valley = np.exp(-0.5 * ((h - 3) / 3.0) ** 2)

    # Base demand level per state (MW)
    # state 0 highest, last lowest
    state_scale = np.array([state_demand_bias[i] for i in df["state_code"].values])
    base_mw = 6000 * state_scale  # synthetic scale

    # calendar effects
    weekend_factor = np.where(df["is_weekend"].values == 1, -250, 0)
    holiday_factor = np.where(df["is_holiday"].values == 1, -400, 0)

    # temperature effect (cooling + heating)
    temp = df["temp_current"].values
    cooling = np.maximum(0, temp - 26) * 85   # AC load effect
    heating = np.maximum(0, 18 - temp) * 45   # cold load effect

    # shape contribution
    shape = (morning_peak * 400) + (evening_peak * 900) - (night_valley * 300)

    # final demand with noise
    noise = np.random.normal(0, 80, size=len(df))
    df["demand_actual"] = base_mw + shape + weekend_factor + holiday_factor + cooling + heating + noise

    # Keep demand positive
    df["demand_actual"] = np.clip(df["demand_actual"], 1000, None)

    # -------------------------
    # LAG FEATURES (per state)
    # -------------------------
    df = df.sort_values(["state_code", "timestamp"]).reset_index(drop=True)

    def add_lags(group):
        group["demand_lag_1"] = group["demand_actual"].shift(1)
        group["demand_lag_4"] = group["demand_actual"].shift(4)
        group["demand_lag_96"] = group["demand_actual"].shift(96)
        group["demand_lag_672"] = group["demand_actual"].shift(672)
        return group

    df = df.groupby("state_code", group_keys=False).apply(add_lags)

    # -------------------------
    # ROLLING FEATURES (per state)
    # windows: 1h=4 blocks, 3h=12 blocks, 6h=24 blocks
    # IMPORTANT: Use shift(1) before rolling to avoid data leakage!
    # We should only use past data, not include current timestep.
    # -------------------------
    def add_rolls(group):
        # Shift first to exclude current value, then apply rolling
        shifted = group["demand_actual"].shift(1)
        group["demand_roll_mean_1h"] = shifted.rolling(4, min_periods=1).mean()
        group["demand_roll_mean_3h"] = shifted.rolling(12, min_periods=1).mean()
        group["demand_roll_std_3h"] = shifted.rolling(12, min_periods=2).std()
        group["demand_roll_max_6h"] = shifted.rolling(24, min_periods=1).max()
        return group

    df = df.groupby("state_code", group_keys=False).apply(add_rolls)

    # Drop helper column
    df = df.drop(columns=["dayofweek", "date"])

    # Optional: remove rows with NaNs from lag/rolling warm-up
    df = df.dropna().reset_index(drop=True)

    # Save to CSV
    df.to_csv(output_path, index=False)
    return df, output_path


if __name__ == "__main__":
    df, path = generate_synthetic_demand_dataset(
        start_date="2025-12-18",
        end_date="2026-01-24",    # change as you want
        n_states=10,
        cold_threshold=15.0,
        random_seed=42,
        output_path="datasets/synthetic_demand_dataset_15min.csv",
    )

    print("✅ Dataset created!")
    print("📁 Saved at:", path)
    print("Rows:", len(df), "Columns:", len(df.columns))
    print(df.head(5))
