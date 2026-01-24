import numpy as np
import pandas as pd

def generate_wind_dataset(
    start_date,
    end_date,
    freq="15min",
    n_states=10,
    random_seed=42,
    output_path="/home/oai/share/synthetic_wind_supply_15min.csv",
):
    np.random.seed(random_seed)

    # timestamps
    ts = pd.date_range(start=start_date, end=end_date, freq=freq, inclusive="left")
    base = pd.DataFrame({"timestamp": ts})
    base["hour"] = base["timestamp"].dt.hour
    base["month"] = base["timestamp"].dt.month
    base["dayofweek"] = base["timestamp"].dt.dayofweek
    base["is_night"] = ((base["hour"] >= 20) | (base["hour"] < 6)).astype(int)

    # expand states
    states = pd.DataFrame({"state_code": np.arange(n_states, dtype=int)})
    df = base.merge(states, how="cross")

    df = df.sort_values(["state_code", "timestamp"]).reset_index(drop=True)

    # --- WIND SPEED (m/s) ---
    # month seasonal effect (monsoon months can be higher, but synthetic here)
    month = df["month"].values
    seasonal = 6.0 + 0.3 * (month - 6)  # synthetic seasonality (stronger effect)

    # state wind resource differences (some states windier)
    state_wind_bias = 2.5 - (df["state_code"].values / (n_states / 2.5))

    # diurnal pattern (wind sometimes stronger at night) - stronger effect
    h = df["hour"].values
    diurnal = 1.0 + 0.35 * np.cos((h - 2) / 24 * 2 * np.pi)

    # Add persistence: wind speed has autocorrelation (smooth changes)
    # We'll create a base pattern then add small noise
    wind_base = seasonal * diurnal + state_wind_bias
    # Reduced noise for more predictable patterns
    wind_speed = wind_base + np.random.normal(0, 0.6, len(df))
    wind_speed = np.clip(wind_speed, 0, 25)
    df["wind_speed"] = wind_speed

    # gusts slightly higher than speed
    df["wind_gust"] = np.clip(df["wind_speed"] + np.random.normal(1.5, 0.5, len(df)), 0, 35)

    # air pressure (hPa) - correlate with wind (low pressure = higher wind)
    df["air_pressure"] = 1013 - (df["wind_speed"] - 6) * 1.5 + np.random.normal(0, 3, len(df))

    # curtailment flag (optional)
    # more likely at high wind + low demand periods (night), but simplified
    curtail_prob = np.clip((df["wind_speed"] / 25) * 0.10, 0, 0.10)
    df["curtailment_flag"] = (np.random.rand(len(df)) < curtail_prob).astype(int)

    # --- WIND GENERATION (MW) ---
    # power curve behaviour: ~0 until cut-in, saturates at rated
    cut_in = 3.0
    rated = 12.0
    cut_out = 25.0

    # installed wind capacity by state (synthetic)
    installed_capacity = 1800 * (1.0 - df["state_code"].values / (n_states * 1.4))  # MW

    v = df["wind_speed"].values
    # normalized power curve
    p_norm = np.where(v < cut_in, 0,
              np.where(v >= cut_out, 0,
              np.where(v >= rated, 1,
              ((v - cut_in) / (rated - cut_in)) ** 3)))

    wind_gen = installed_capacity * p_norm

    # apply curtailment reduction
    wind_gen = wind_gen * np.where(df["curtailment_flag"].values == 1, 0.88, 1.0)

    # Reduced noise for more predictable output
    wind_gen = wind_gen + np.random.normal(0, 10, len(df))
    df["wind_generation"] = np.clip(wind_gen, 0, None)

    # --- LAGS + ROLLING (per state) ---
    df = df.sort_values(["state_code", "timestamp"]).reset_index(drop=True)

    def add_wind_lags_rolls(g):
        g["wind_lag_1"] = g["wind_generation"].shift(1)
        g["wind_lag_4"] = g["wind_generation"].shift(4)
        g["wind_lag_96"] = g["wind_generation"].shift(96)
        g["wind_lag_672"] = g["wind_generation"].shift(672)

        # IMPORTANT: Shift first to exclude current value and avoid data leakage!
        shifted = g["wind_generation"].shift(1)
        g["wind_roll_mean_1h"] = shifted.rolling(4, min_periods=1).mean()
        g["wind_roll_mean_3h"] = shifted.rolling(12, min_periods=1).mean()
        g["wind_roll_std_3h"] = shifted.rolling(12, min_periods=2).std()
        g["wind_roll_max_6h"] = shifted.rolling(24, min_periods=1).max()
        return g

    df = df.groupby("state_code", group_keys=False).apply(add_wind_lags_rolls)

    # drop NaNs created by lag/rolling warm-up
    df = df.dropna().reset_index(drop=True)

    # save
    df.to_csv(output_path, index=False)
    print("✅ Wind dataset saved at:", output_path)
    print(df.head())
    print("Rows:", len(df), "Columns:", len(df.columns))

    return df


if __name__ == "__main__":
    generate_wind_dataset(
        start_date="2025-12-18",
        end_date="2026-01-24",
        n_states=10,
        output_path="datasets/synthetic_wind_supply_15min.csv",
    )
