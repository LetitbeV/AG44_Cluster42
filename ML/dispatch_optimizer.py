"""
Battery Dispatch Optimization Module
Reusable functions for battery arbitrage vs ancillary services optimization
"""

import numpy as np

# ============================================================
# Default Battery Configuration
# ============================================================
DEFAULT_BATTERY_CONFIG = {
    "capacity_MWh": 100.0,
    "max_charge_power_MW": 25.0,
    "max_discharge_power_MW": 25.0,
    "charging_efficiency": 0.95,
    "discharging_efficiency": 0.95,
    "reserve_fraction": 0.20,
    "ancillary_rate_per_MW_hour": 150,
    "initial_soc_MWh": 50.0,
    "time_block_hours": 0.25  # 15 minutes
}


def run_dispatch_optimization(prices, timestamps=None, config=None):
    """
    Run battery dispatch optimization on given prices
    
    Args:
        prices: list/array of price values (Rs/MWh)
        timestamps: optional list of timestamp strings (e.g., ["00:00", "00:15", ...])
        config: optional battery configuration dict (uses DEFAULT_BATTERY_CONFIG if None)
    
    Returns:
        dict with:
            - buy_signals: list of charge points
            - sell_signals: list of discharge points
            - profit: revenue breakdown
            - thresholds: price thresholds used
    """
    if config is None:
        config = DEFAULT_BATTERY_CONFIG
    
    prices = np.array(prices)
    n = len(prices)
    
    # Battery parameters
    E_max = config["capacity_MWh"]
    P_ch_max = config["max_charge_power_MW"]
    P_dis_max = config["max_discharge_power_MW"]
    eta_ch = config["charging_efficiency"]
    eta_dis = config["discharging_efficiency"]
    reserve_frac = config["reserve_fraction"]
    reserve_price = config["ancillary_rate_per_MW_hour"]
    dt = config["time_block_hours"]
    SoC0 = config["initial_soc_MWh"]
    
    # Calculate thresholds
    low_threshold = np.percentile(prices, 30)
    high_threshold = np.percentile(prices, 70)
    avg_low = prices[prices <= low_threshold].mean() if np.any(prices <= low_threshold) else prices.mean()
    avg_high = prices[prices >= high_threshold].mean() if np.any(prices >= high_threshold) else prices.mean()
    
    # Reserve calculations
    E_reserve = reserve_frac * E_max
    P_reserve = reserve_frac * min(P_ch_max, P_dis_max)
    ancillary_revenue_per_block = P_reserve * reserve_price * dt
    
    # Generate timestamps if not provided
    if timestamps is None:
        timestamps = [f"{i*15//60:02d}:{i*15%60:02d}" for i in range(n)]
    
    # Storage arrays
    SoC = np.zeros(n + 1)
    SoC[0] = SoC0
    
    charge_MWh = np.zeros(n)
    discharge_MWh = np.zeros(n)
    action = ["IDLE"] * n
    arbitrage_profit = np.zeros(n)
    ancillary_revenue = np.zeros(n)
    
    # Run dispatch simulation
    for t in range(n):
        p = prices[t]
        soc_min = E_reserve
        soc_max = E_max - E_reserve
        SoC[t] = np.clip(SoC[t], soc_min, soc_max)
        
        max_charge_possible = min(P_ch_max * dt, soc_max - SoC[t])
        max_dis_possible = min(P_dis_max * dt, SoC[t] - soc_min)
        
        if p >= high_threshold and max_dis_possible > 0:
            profit_per_MWh = max(p - avg_low, 0)
            arb_value = profit_per_MWh * max_dis_possible
            
            if arb_value > ancillary_revenue_per_block:
                E_dis = max_dis_possible
                discharge_MWh[t] = E_dis
                SoC[t + 1] = SoC[t] - (E_dis / eta_dis)
                arbitrage_profit[t] = E_dis * p
                action[t] = "DISCHARGE"
            else:
                SoC[t + 1] = SoC[t]
                ancillary_revenue[t] = ancillary_revenue_per_block
                action[t] = "ANCILLARY"
        
        elif p <= low_threshold and max_charge_possible > 0:
            if avg_high > p * 1.05:
                E_ch = max_charge_possible
                charge_MWh[t] = E_ch
                SoC[t + 1] = SoC[t] + (E_ch * eta_ch)
                arbitrage_profit[t] = -E_ch * p
                action[t] = "CHARGE"
            else:
                SoC[t + 1] = SoC[t]
                ancillary_revenue[t] = ancillary_revenue_per_block
                action[t] = "ANCILLARY"
        else:
            SoC[t + 1] = SoC[t]
            ancillary_revenue[t] = ancillary_revenue_per_block
            action[t] = "ANCILLARY"
        
        SoC[t + 1] = np.clip(SoC[t + 1], soc_min, soc_max)
    
    # Build results
    buy_signals = []
    sell_signals = []
    
    for t in range(n):
        time_label = timestamps[t]
        
        if action[t] == "CHARGE":
            buy_signals.append({
                "time_block": t + 1,
                "time": time_label,
                "price": round(float(prices[t]), 2),
                "energy_MWh": round(float(charge_MWh[t]), 2),
                "action": "BUY"
            })
        elif action[t] == "DISCHARGE":
            sell_signals.append({
                "time_block": t + 1,
                "time": time_label,
                "price": round(float(prices[t]), 2),
                "energy_MWh": round(float(discharge_MWh[t]), 2),
                "action": "SELL"
            })
    
    # Calculate totals
    total_arbitrage = float(arbitrage_profit.sum())
    total_ancillary = float(ancillary_revenue.sum())
    total_revenue = total_arbitrage + total_ancillary
    total_charged = float(charge_MWh.sum())
    total_discharged = float(discharge_MWh.sum())
    
    action_counts = {a: action.count(a) for a in set(action)}
    
    return {
        "buy_signals": buy_signals,
        "sell_signals": sell_signals,
        "profit": {
            "arbitrage_profit": round(total_arbitrage, 2),
            "ancillary_revenue": round(total_ancillary, 2),
            "total_revenue": round(total_revenue, 2),
            "arbitrage_share_percent": round(total_arbitrage / total_revenue * 100, 1) if total_revenue > 0 else 0,
            "ancillary_share_percent": round(total_ancillary / total_revenue * 100, 1) if total_revenue > 0 else 0,
            "total_energy_bought_MWh": round(total_charged, 2),
            "total_energy_sold_MWh": round(total_discharged, 2),
            "buy_count": len(buy_signals),
            "sell_count": len(sell_signals),
            "ancillary_count": action_counts.get("ANCILLARY", 0)
        },
        "thresholds": {
            "low_threshold": round(float(low_threshold), 2),
            "high_threshold": round(float(high_threshold), 2),
            "avg_buy_price": round(float(avg_low), 2),
            "avg_sell_price": round(float(avg_high), 2),
            "price_spread": round(float(avg_high - avg_low), 2)
        }
    }


def group_consecutive_signals(signals):
    """
    Group consecutive trading signals into windows
    
    Args:
        signals: list of buy or sell signals
    
    Returns:
        list of grouped windows
    """
    if not signals:
        return []
    
    windows = []
    current = [signals[0]]
    
    for i in range(1, len(signals)):
        if signals[i]['time_block'] - signals[i-1]['time_block'] <= 2:
            current.append(signals[i])
        else:
            windows.append(current)
            current = [signals[i]]
    windows.append(current)
    
    return [
        {
            "start_time": w[0]['time'],
            "end_time": w[-1]['time'],
            "avg_price": round(sum(s['price'] for s in w) / len(w), 2),
            "total_energy_MWh": round(sum(s['energy_MWh'] for s in w), 2),
            "num_blocks": len(w)
        }
        for w in windows
    ]


def get_price_stats(prices):
    """
    Calculate price statistics
    
    Args:
        prices: list/array of prices
    
    Returns:
        dict with price statistics
    """
    prices_arr = np.array(prices)
    return {
        "min": round(float(prices_arr.min()), 2),
        "max": round(float(prices_arr.max()), 2),
        "mean": round(float(prices_arr.mean()), 2),
        "median": round(float(np.median(prices_arr)), 2),
        "std": round(float(prices_arr.std()), 2),
        "variation_ratio": round(float(prices_arr.max() / prices_arr.min()), 2)
    }


def compare_prices(real_prices, forecasted_prices):
    """
    Compare real vs forecasted prices
    
    Args:
        real_prices: list of actual prices
        forecasted_prices: list of predicted prices
    
    Returns:
        dict with comparison metrics
    """
    if len(real_prices) != len(forecasted_prices):
        return None
    
    real = np.array(real_prices)
    forecast = np.array(forecasted_prices)
    errors = real - forecast
    
    return {
        "mae": round(float(np.mean(np.abs(errors))), 2),
        "mape": round(float(np.mean(np.abs(errors / real)) * 100), 2),
        "rmse": round(float(np.sqrt(np.mean(errors**2))), 2)
    }
