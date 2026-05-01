from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, 
            template_folder='../frontend', 
            static_folder='../frontend', 
            static_url_path='')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/canvas')
def canvas():
    return render_template('canvas.html')

@app.route('/twin')
def twin():
    return render_template('twin.html')

# MOCK API ENDPOINTS
@app.route('/api/login', methods=['POST'])
def login():
    return jsonify({
        "status": "success",
        "user": "Guest User"
    })

@app.route('/api/portfolio')
def get_portfolio():
    # Mock data for supply chain / competitors exposure
    return jsonify({
        "status": "success",
        "data": {
            "apple": {
                "suppliers": ["TSMC", "Foxconn", "Qualcomm", "Broadcom", "Sony"],
                "competitors": ["Samsung", "Microsoft", "Google"],
                "ecosystem": ["App Economy", "Semiconductors", "Consumer Electronics"]
            }
        }
    })

@app.route('/api/canvas/prompt', methods=['POST'])
def canvas_prompt():
    data = request.json
    prompt = data.get('prompt', '').lower()
    
    nodes = []
    edges = []
    
    if "house" in prompt:
        nodes = [
            {"id": "goal1", "text": "Buy a House", "x": 400, "y": 150},
            {"id": "step1", "text": "Save Down Payment", "x": 100, "y": 150},
            {"id": "step2", "text": "Improve Credit", "x": 100, "y": 50}
        ]
        edges = [
            {"source": "step1", "target": "goal1"},
            {"source": "step2", "target": "goal1"}
        ]
    elif "retire" in prompt:
        nodes = [
            {"id": "goal1", "text": "Retire Early", "x": 400, "y": 150},
            {"id": "step1", "text": "Max 401k", "x": 100, "y": 250},
            {"id": "step2", "text": "Invest in S&P 500", "x": 100, "y": 50}
        ]
        edges = [
            {"source": "step1", "target": "goal1"},
            {"source": "step2", "target": "goal1"}
        ]
    else:
        nodes = [
            {"id": "goal1", "text": f"Goal: {prompt[:15]}...", "x": 300, "y": 100},
            {"id": "step1", "text": "Initial Step", "x": 100, "y": 100}
        ]
        edges = [
            {"source": "step1", "target": "goal1"}
        ]
        
    return jsonify({
        "status": "success",
        "nodes": nodes,
        "edges": edges
    })

@app.route('/api/bot/sentiment', methods=['POST'])
def bot_sentiment():
    data = request.json
    ticker = data.get('ticker', 'AAPL').upper()
    
    # Dynamic mock logic based on ticker length or specific tickers
    if ticker in ['TSLA', 'GME', 'AMC']:
        rec, conf, msg = "HOLD", 0.65, "High volatility detected. Institutional sentiment is mixed."
    elif ticker in ['META', 'NVDA', 'AAPL', 'MSFT']:
        rec, conf, msg = "BUY", 0.88, "Strong fundamentals. NLP sentiment from recent 10-Q is highly positive."
    elif ticker in ['INTC', 'PTON']:
        rec, conf, msg = "SELL", 0.72, "Negative sentiment in recent news cycle. Supply chain risks flagged."
    else:
        rec, conf, msg = "BUY", 0.75, f"General market sentiment for {ticker} leans positive."
        
    return jsonify({
        "status": "success",
        "recommendation": rec,
        "confidence": conf,
        "sentiment": msg
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
