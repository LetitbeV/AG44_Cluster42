"""
Flask API for ShockMarket - Battery Dispatch Optimization
All GET endpoints - serves pre-computed data from JSON files
"""

from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ============================================================
# Load pre-computed data from JSON files
# ============================================================
def load_json(filename):
    filepath = os.path.join(os.path.dirname(__file__), filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None

# Load data once at startup
WEBAPP_DATA = load_json('webapp_data.json')
TRADING_SIGNALS = load_json('trading_signals.json')
PRICE_FORECAST = load_json('price_forecast.json')


# ============================================================
# API Routes - All GET (no client input needed)
# ============================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({
        "status": "healthy",
        "service": "ShockMarket ML API",
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/prices', methods=['GET'])
def get_prices():
    """
    Get forecasted prices for the day (96 time blocks)
    Simple: timestamp, predicted_price, actual_price
    """
    if not PRICE_FORECAST:
        return jsonify({"error": "Price data not available"}), 404
    
    # Simplified price data
    prices = [
        {
            "timestamp": p["timestamp"],
            "predicted_price": p["predicted_price"],
            "actual_price": p["actual_price"]
        }
        for p in PRICE_FORECAST.get("prices", [])
    ]
    
    return jsonify({
        "forecast_date": PRICE_FORECAST.get("forecast_date", ""),
        "count": len(prices),
        "prices": prices
    })


@app.route('/api/trading-signals', methods=['GET'])
def get_trading_signals():
    """
    Get buy/sell trading signals
    Returns timestamps when to BUY (charge) and SELL (discharge)
    """
    if not TRADING_SIGNALS:
        return jsonify({"error": "Trading signals not available"}), 404
    
    return jsonify({
        "forecast_date": TRADING_SIGNALS.get("forecast_date", ""),
        "buy_signals": TRADING_SIGNALS.get("buy_signals", []),
        "sell_signals": TRADING_SIGNALS.get("sell_signals", []),
        "buy_windows": TRADING_SIGNALS.get("buy_windows", []),
        "sell_windows": TRADING_SIGNALS.get("sell_windows", []),
        "thresholds": TRADING_SIGNALS.get("thresholds", {})
    })


@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """
    Get actionable trading recommendations
    Returns grouped time windows for buying and selling
    """
    if not TRADING_SIGNALS:
        return jsonify({"error": "Data not available"}), 404
    
    buy_signals = TRADING_SIGNALS.get("buy_signals", [])
    sell_signals = TRADING_SIGNALS.get("sell_signals", [])
    buy_windows = TRADING_SIGNALS.get("buy_windows", [])
    sell_windows = TRADING_SIGNALS.get("sell_windows", [])
    
    return jsonify({
        "forecast_date": TRADING_SIGNALS.get("forecast_date", ""),
        "buy_windows": buy_windows,
        "sell_windows": sell_windows,
        "best_buy_time": min(buy_signals, key=lambda x: x['price'])['time'] if buy_signals else None,
        "best_sell_time": max(sell_signals, key=lambda x: x['price'])['time'] if sell_signals else None,
        "thresholds": TRADING_SIGNALS.get("thresholds", {})
    })


@app.route('/api/profit', methods=['GET'])
def get_profit():
    """
    Get profit/revenue estimates
    - optimistic: Based on ML predictions (best case)
    - conservative: Adjusted for prediction error (~27% discount)
    - actual: What actually happened (for comparison)
    """
    if not WEBAPP_DATA:
        return jsonify({"error": "Data not available"}), 404
    
    summary = WEBAPP_DATA.get("summary", {})
    estimates = summary.get("profit_estimates", {})
    accuracy = summary.get("prediction_accuracy", {})
    
    return jsonify({
        "forecast_date": summary.get("forecast_date", ""),
        "profit_estimates": {
            "optimistic": estimates.get("optimistic", 0),
            "conservative": estimates.get("conservative", 0),
            "actual": estimates.get("actual", 0)
        },
        "prediction_accuracy": {
            "mape_percent": accuracy.get("mape_percent", 0),
            "confidence_factor": accuracy.get("confidence_factor", 0)
        }
    })


@app.route('/api/all', methods=['GET'])
def get_all_data():
    """
    Get everything in one call
    Complete data for the web app
    """
    if not WEBAPP_DATA:
        return jsonify({"error": "Data not available"}), 404
    
    return jsonify(WEBAPP_DATA)


if __name__ == '__main__':
    print("=" * 50)
    print("ShockMarket ML API Server")
    print("=" * 50)
    print("\nGET Endpoints (no input needed):")
    print("  /api/health          - Health check")
    print("  /api/prices          - Forecasted prices (96 blocks)")
    print("  /api/trading-signals - Buy/sell signals")
    print("  /api/recommendations - Grouped time windows")
    print("  /api/profit          - Revenue breakdown")
    print("  /api/all             - Everything in one call")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
