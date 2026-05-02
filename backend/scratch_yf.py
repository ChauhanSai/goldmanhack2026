import yfinance as yf
stock = yf.Ticker('AAPL')
hist = stock.history(period="1mo")
print(hist['Close'].tolist())
print([d.strftime('%Y-%m-%d') for d in hist.index])
