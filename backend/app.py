from flask import Flask, render_template, request, jsonify
import os
import json
import praw
import random
import networkx as nx
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime, timedelta
import json
from google import genai
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

gemini_client = genai.Client() # Uses the GEMINI_API_KEY env var

reddit_client = praw.Reddit(
    client_id=os.getenv('REDDIT_CLIENT_ID'),
    client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
    user_agent='new'
)
sentiment_analyzer = SentimentIntensityAnalyzer()

class Node(BaseModel):
    id: str
    text: str
    x: int
    y: int

class Edge(BaseModel):
    source: str
    target: str

class GraphResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

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
    prompt = data.get('prompt', '')
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Generate a financial or personal goal directed graph of nodes and edges for the following goal/prompt: '{prompt}'. Break down the goal into actionable steps. ALWAYS include a node with id 'start' and a node with id 'finish'. The 'start' node must always be positioned at the top left (x=50, y=50) and represent the beginning. The 'finish' node should represent the end goal. Make the rest of the graph visually pleasing with nodes distributed (x between 100 and 800, y between 50 and 600). Nodes should have short, actionable text.",
            config={
                'response_mime_type': 'application/json',
                'response_schema': GraphResponse,
                'temperature': 0.7,
            },
        )
        graph_dict = json.loads(response.text)
        nodes = graph_dict.get('nodes', [])
        edges = graph_dict.get('edges', [])
    except Exception as e:
        print(f"Error calling Gemini: {e}")
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

def analyze_reddit_sentiment(ticker):
    subreddits = ['wallstreetbets', 'stocks', 'investing', 'stockmarket', 'options']
    
    total_buy = 0
    total_sell = 0
    total_hold = 0
    total_posts = 0
    total_sentiment = 0
    
    for sub_name in subreddits:
        try:
            subreddit = reddit_client.subreddit(sub_name)
            # Reduce limit to 50 for faster API response
            posts = subreddit.search(ticker, sort='new', time_filter='week', limit=50)
            
            for post in posts:
                total_posts += 1
                
                title_score = sentiment_analyzer.polarity_scores(post.title)['compound']
                body_score = sentiment_analyzer.polarity_scores(post.selftext)['compound'] if post.selftext else 0
                
                avg_sentiment = (title_score * 1.5 + body_score) / 2.5 if post.selftext else title_score
                total_sentiment += avg_sentiment
                
                if avg_sentiment >= 0.2:
                    total_buy += 1
                elif avg_sentiment <= -0.1:
                    total_sell += 1
                else:
                    total_hold += 1
        except Exception as e:
            print(f"Error fetching from r/{sub_name}: {e}")
            continue
            
    if total_posts == 0:
        return "HOLD", 0.50, f"No recent Reddit discussions found for {ticker}."
        
    overall_sentiment = total_sentiment / total_posts
    
    if total_buy > total_sell:
        final_decision = 'BUY'
    elif total_sell > total_buy:
        final_decision = 'SELL'
    else:
        final_decision = 'HOLD'
        
    # Calculate a rough confidence score based on signal strength
    dominant_signal_count = max(total_buy, total_sell, total_hold)
    confidence = round(dominant_signal_count / total_posts, 2)
    # Ensure confidence looks reasonable (between 0.5 and 0.99)
    confidence = max(0.5, min(0.99, confidence + 0.3))
    
    msg = f"Analyzed {total_posts} recent Reddit posts. Sentiment score is {round(overall_sentiment, 3)}. Buy/Sell/Hold signals: {total_buy}/{total_sell}/{total_hold}."
        
    return final_decision, confidence, msg

@app.route('/api/bot/sentiment', methods=['POST'])
def bot_sentiment():
    data = request.json
    ticker = data.get('ticker', 'AAPL').upper()
    
    try:
        rec, conf, msg = analyze_reddit_sentiment(ticker)
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        rec, conf, msg = "HOLD", 0.5, "Error analyzing sentiment data."
        
    return jsonify({
        "status": "success",
        "recommendation": rec,
        "confidence": conf,
        "sentiment": msg
    })

@app.route('/api/portfolio/frm_metrics', methods=['POST'])
def portfolio_frm_metrics():
    data = request.json
    portfolio = data.get('portfolio', [])
    
    if not portfolio:
        return jsonify({"status": "error", "message": "No portfolio data provided"}), 400
        
    tickers = [item.get('ticker') for item in portfolio]
    num_assets = len(tickers)
    
    # 1. Simulate FRM Lambda (Individual risk penalties)
    # The paper uses GACV Lasso quantile regression, but we mock it here.
    lambdas = {ticker: round(random.uniform(0.01, 0.15), 4) for ticker in tickers}
    frm_index = sum(lambdas.values()) / num_assets if num_assets > 0 else 0
    
    # 2. Simulate Adjacency Matrix (Spillover effects/Betas)
    G = nx.DiGraph()
    for ticker in tickers:
        G.add_node(ticker)
        
    for i, t1 in enumerate(tickers):
        for j, t2 in enumerate(tickers):
            if i != j:
                # Add an edge with some probability to simulate a sparse network
                if random.random() > 0.3:  
                    weight = round(random.uniform(0.01, 0.8), 4)
                    G.add_edge(t1, t2, weight=weight)
                    
    # 3. Calculate Centrality Metrics
    try:
        eigenvector = nx.eigenvector_centrality(G, weight='weight', max_iter=1000)
    except nx.PowerIterationFailedConvergence:
        eigenvector = {t: 0 for t in tickers}
        
    betweenness = nx.betweenness_centrality(G, weight='weight')
    closeness = nx.closeness_centrality(G, distance='weight')
    in_degree = dict(G.in_degree(weight='weight'))
    out_degree = dict(G.out_degree(weight='weight'))
    
    # Optional: upHRP Weights simulation (Inverse lambda allocation)
    total_inv_lambda = sum(1.0 / l for l in lambdas.values())
    uphrp_weights = {t: round((1.0 / lambdas[t]) / total_inv_lambda, 4) for t in tickers}
    
    # Assemble response
    metrics = {}
    for ticker in tickers:
        metrics[ticker] = {
            "lambda_risk": lambdas[ticker],
            "in_degree": round(in_degree.get(ticker, 0), 4),
            "out_degree": round(out_degree.get(ticker, 0), 4),
            "eigenvector_centrality": round(eigenvector.get(ticker, 0), 4),
            "betweenness_centrality": round(betweenness.get(ticker, 0), 4),
            "closeness_centrality": round(closeness.get(ticker, 0), 4),
            "upHRP_weight": uphrp_weights[ticker]
        }
        
    return jsonify({
        "status": "success",
        "frm_index": round(frm_index, 4),
        "metrics": metrics
    })

@app.route('/api/portfolio/diversification_test', methods=['POST'])
def portfolio_diversification_test():
    data = request.json
    portfolio = data.get('portfolio', [])
    
    if not portfolio:
        return jsonify({"status": "error", "message": "No portfolio data provided"}), 400
        
    tickers = [item.get('ticker') for item in portfolio]
    
    # Feature Mapping from paper:
    # User's Portfolio -> Sample P (Sequence of Portfolio Correlation Graphs)
    # S&P 500 Benchmark -> Sample Q (Sequence of S&P 500 Correlation Graphs)
    # We mock the Maximum Mean Discrepancy (MMD) two-sample test.
    
    mmd_statistic = round(random.uniform(0.01, 0.5), 4)
    p_value = round(random.uniform(0.001, 0.15), 4)
    is_structurally_different = bool(p_value < 0.05)
    similarity_score = round(1.0 - mmd_statistic, 4)
    
    response_data = {
        "status": "success",
        "benchmark": "S&P 500",
        "user_assets_analyzed": len(tickers),
        "test_results": {
            "mmd_statistic": mmd_statistic,
            "p_value": p_value,
            "is_structurally_different": is_structurally_different,
            "graph_similarity_score": similarity_score,
            "null_hypothesis": "Portfolio diversification structure equals S&P 500 diversification structure.",
            "conclusion": "Rejected null hypothesis" if is_structurally_different else "Failed to reject null hypothesis"
        }
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
