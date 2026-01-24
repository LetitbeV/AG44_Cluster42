"""
Flask API for ShockMarket - Battery Dispatch Optimization
Parallel endpoints for DAM and RTM markets
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

# DAM data
DAM_DATA = {
    "webapp": load_json('webapp_data.json'),
    "signals": load_json('trading_signals.json'),
    "prices": load_json('price_forecast.json')
}

# RTM data
RTM_DATA = {
    "webapp": load_json('rtm_webapp_data.json'),
    "signals": load_json('rtm_trading_signals.json'),
    "prices": load_json('rtm_price_forecast.json')
}


# ============================================================
# Helper functions
# ============================================================
def get_prices_response(data, market):
    """Format price response"""
    if not data:
        return None
    prices = [
        {
            "timestamp": p["timestamp"],
            "predicted_price": p["predicted_price"],
            "actual_price": p["actual_price"]
        }
        for p in data.get("prices", [])
    ]
    return {
        "market": market,
        "forecast_date": data.get("forecast_date", ""),
        "count": len(prices),
        "prices": prices
    }


def get_signals_response(data, market):
    """Format trading signals response"""
    if not data:
        return None
    return {
        "market": market,
        "forecast_date": data.get("forecast_date", ""),
        "buy_signals": data.get("buy_signals", []),
        "sell_signals": data.get("sell_signals", []),
        "buy_windows": data.get("buy_windows", []),
        "sell_windows": data.get("sell_windows", []),
        "thresholds": data.get("thresholds", {})
    }


def get_profit_response(data, market):
    """Format profit response"""
    if not data:
        return None
    summary = data.get("summary", {})
    estimates = summary.get("profit_estimates", {})
    accuracy = summary.get("prediction_accuracy", {})
    return {
        "market": market,
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
    }


# ============================================================
# Health Check
# ============================================================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "ShockMarket ML API",
        "markets": ["DAM", "RTM"],
        "timestamp": datetime.now().isoformat()
    })


# ============================================================
# DAM (Day-Ahead Market) Endpoints
# ============================================================
@app.route('/api/dam/prices', methods=['GET'])
def get_dam_prices():
    """DAM price forecast - 96 time blocks"""
    response = get_prices_response(DAM_DATA["prices"], "DAM")
    if not response:
        return jsonify({"error": "DAM price data not available"}), 404
    return jsonify(response)


@app.route('/api/dam/signals', methods=['GET'])
def get_dam_signals():
    """DAM buy/sell trading signals"""
    response = get_signals_response(DAM_DATA["signals"], "DAM")
    if not response:
        return jsonify({"error": "DAM signals not available"}), 404
    return jsonify(response)


@app.route('/api/dam/profit', methods=['GET'])
def get_dam_profit():
    """DAM profit estimates"""
    response = get_profit_response(DAM_DATA["webapp"], "DAM")
    if not response:
        return jsonify({"error": "DAM data not available"}), 404
    return jsonify(response)


@app.route('/api/dam/all', methods=['GET'])
def get_dam_all():
    """All DAM data"""
    if not DAM_DATA["webapp"]:
        return jsonify({"error": "DAM data not available"}), 404
    return jsonify({
        "market": "DAM",
        **DAM_DATA["webapp"]
    })


# ============================================================
# RTM (Real-Time Market) Endpoints
# ============================================================
@app.route('/api/rtm/prices', methods=['GET'])
def get_rtm_prices():
    """RTM price forecast - 96 time blocks"""
    response = get_prices_response(RTM_DATA["prices"], "RTM")
    if not response:
        return jsonify({"error": "RTM price data not available"}), 404
    return jsonify(response)


@app.route('/api/rtm/signals', methods=['GET'])
def get_rtm_signals():
    """RTM buy/sell trading signals"""
    response = get_signals_response(RTM_DATA["signals"], "RTM")
    if not response:
        return jsonify({"error": "RTM signals not available"}), 404
    return jsonify(response)


@app.route('/api/rtm/profit', methods=['GET'])
def get_rtm_profit():
    """RTM profit estimates"""
    response = get_profit_response(RTM_DATA["webapp"], "RTM")
    if not response:
        return jsonify({"error": "RTM data not available"}), 404
    return jsonify(response)


@app.route('/api/rtm/all', methods=['GET'])
def get_rtm_all():
    """All RTM data"""
    if not RTM_DATA["webapp"]:
        return jsonify({"error": "RTM data not available"}), 404
    return jsonify({
        "market": "RTM",
        **RTM_DATA["webapp"]
    })


# ============================================================
# Combined Endpoints
# ============================================================
@app.route('/api/compare', methods=['GET'])
def compare_markets():
    """Compare DAM vs RTM prices and profits"""
    dam_profit = get_profit_response(DAM_DATA["webapp"], "DAM")
    rtm_profit = get_profit_response(RTM_DATA["webapp"], "RTM")
    
    return jsonify({
        "forecast_date": dam_profit["forecast_date"] if dam_profit else "",
        "dam": dam_profit,
        "rtm": rtm_profit
    })


if __name__ == '__main__':
    print("=" * 50)
    print("ShockMarket ML API Server")
    print("=" * 50)
    print("\nDAM Endpoints:")
    print("  /api/dam/prices   - Price forecast (96 blocks)")
    print("  /api/dam/signals  - Buy/sell signals")
    print("  /api/dam/profit   - Profit estimates")
    print("  /api/dam/all      - All DAM data")
    print("\nRTM Endpoints:")
    print("  /api/rtm/prices   - Price forecast (96 blocks)")
    print("  /api/rtm/signals  - Buy/sell signals")
    print("  /api/rtm/profit   - Profit estimates")
    print("  /api/rtm/all      - All RTM data")
    print("\nOther:")
    print("  /api/health       - Health check")
    print("  /api/compare      - DAM vs RTM comparison")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
