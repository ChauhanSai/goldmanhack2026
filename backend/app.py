from flask import Flask, render_template, request, jsonify
import os
import json
import praw
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
            contents=f"Generate a financial or personal goal directed graph of nodes and edges for the following goal/prompt: '{prompt}'. Break down the goal into actionable steps. Make the graph visually pleasing with nodes distributed (x between 50 and 800, y between 50 and 600). Nodes should have short, actionable text.",
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
