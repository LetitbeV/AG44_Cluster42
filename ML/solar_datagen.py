import numpy as np
import pandas as pd

def generate_solar_dataset(
    start_date="2025-01-01",
    end_date="2025-02-01",
    freq="15min",
    n_states=10,
    random_seed=42,
    output_path="/home/oai/share/synthetic_solar_supply_15min.csv",
):
    np.random.seed(random_seed)

    # timestamps
    ts = pd.date_range(start=start_date, end=end_date, freq=freq, inclusive="left")
    base = pd.DataFrame({"timestamp": ts})
    base["hour"] = base["timestamp"].dt.hour
    base["month"] = base["timestamp"].dt.month

    # expand states
    states = pd.DataFrame({"state_code": np.arange(n_states, dtype=int)})
    df = base.merge(states, how="cross")

    df = df.sort_values(["state_code", "timestamp"]).reset_index(drop=True)

    # --- IRRADIANCE (synthetic GHI) ---
    # daylight curve: 0 at night, peak near 13:00
    h = df["hour"].values
    # smooth "sun" intensity from 6 to 18
    daylight = np.clip(np.sin((h - 6) / 12 * np.pi), 0, 1)

    # month factor (summer slightly higher)
    month = df["month"].values
    month_factor = 0.85 + 0.03 * (month - 1)  # increasing with month (synthetic)

    # state factor: some states have better solar resource
    state_factor = 1.15 - (df["state_code"].values / (n_states * 2))

    # cloud cover 0..1
    cloud_cover = np.clip(np.random.beta(2, 5, size=len(df)), 0, 1)
    df["cloud_cover"] = cloud_cover

    # irradiance (W/m²) approx 0..1000 scaled
    irradiance = 1000 * daylight * month_factor * state_factor * (1 - 0.75 * cloud_cover)
    irradiance = np.clip(irradiance + np.random.normal(0, 30, len(df)), 0, None)
    df["irradiance"] = irradiance

    # temperature (simplified)
    # day warmer, night cooler
    temp_base = 22 + 10 * daylight + (month - 1) * 0.8
    temp_current = temp_base + np.random.normal(0, 1.5, len(df))
    df["temp_current"] = temp_current

    # curtailment flag (optional)
    # more likely when irradiance high (midday)
    curtail_prob = np.clip((df["irradiance"] / 1000) * 0.15, 0, 0.15)
    df["curtailment_flag"] = (np.random.rand(len(df)) < curtail_prob).astype(int)

    # --- SOLAR GENERATION (MW) ---
    # solar output ~ proportional to irradiance, reduced by curtailment sometimes
    # higher-population states (lower state_code) have bigger installed solar (synthetic)
    installed_capacity = 1500 * (1.0 - df["state_code"].values / (n_states * 1.5))  # MW
    efficiency = 0.90 - 0.0015 * np.maximum(0, df["temp_current"].values - 25)  # temp derate
    efficiency = np.clip(efficiency, 0.75, 0.95)

    solar_gen = installed_capacity * (df["irradiance"].values / 1000) * efficiency
    # apply curtailment reduction
    solar_gen = solar_gen * np.where(df["curtailment_flag"].values == 1, 0.85, 1.0)
    # add noise
    solar_gen = solar_gen + np.random.normal(0, 25, len(df))
    df["solar_generation"] = np.clip(solar_gen, 0, None)

    # --- LAGS + ROLLING (per state) ---
    df = df.sort_values(["state_code", "timestamp"]).reset_index(drop=True)

    def add_solar_lags_rolls(g):
        g["solar_lag_1"] = g["solar_generation"].shift(1)
        g["solar_lag_4"] = g["solar_generation"].shift(4)
        g["solar_lag_96"] = g["solar_generation"].shift(96)
        g["solar_lag_672"] = g["solar_generation"].shift(672)

        # IMPORTANT: Shift first to exclude current value and avoid data leakage!
        shifted = g["solar_generation"].shift(1)
        g["solar_roll_mean_1h"] = shifted.rolling(4, min_periods=1).mean()
        g["solar_roll_mean_3h"] = shifted.rolling(12, min_periods=1).mean()
        g["solar_roll_std_3h"] = shifted.rolling(12, min_periods=2).std()
        g["solar_roll_max_6h"] = shifted.rolling(24, min_periods=1).max()
        return g

    df = df.groupby("state_code", group_keys=False).apply(add_solar_lags_rolls)

    # drop NaNs created by lag/rolling warm-up
    df = df.dropna().reset_index(drop=True)

    # save
    df.to_csv(output_path, index=False)
    print("✅ Solar dataset saved at:", output_path)
    print(df.head())

    return df


if __name__ == "__main__":
    generate_solar_dataset(
        start_date="2025-12-18",
        end_date="2026-01-24",
        n_states=10,
        output_path="datasets/synthetic_solar_supply_15min.csv",
    )
