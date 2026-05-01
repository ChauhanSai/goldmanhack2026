// Shared JavaScript functionality

// Bread Bot Modal Logic
function initBreadBot() {
    const body = document.querySelector('body');
    
    // Inject the bot HTML into the page if it doesn't exist
    if (!document.getElementById('bread-bot-modal')) {
        const botHTML = `
            <button class="bot-toggle" id="bot-toggle" title="Ask Bread Bot">🍞</button>
            <div id="bread-bot-modal">
                <div class="bot-header">
                    <span>Bread Bot (Sentiment Analysis)</span>
                    <span class="close-btn" id="bot-close">&times;</span>
                </div>
                <div class="bot-body">
                    <p style="font-size: 0.9rem; margin-bottom: 1rem;">Enter a stock ticker to get the latest NLP sentiment analysis based on news and reports.</p>
                    <input type="text" id="bot-ticker" placeholder="e.g. AAPL">
                    <button class="btn" id="bot-analyze" style="width: 100%; padding: 0.5rem;">Analyze</button>
                    <div id="bot-result" style="margin-top: 1rem; padding: 1rem; border-radius: 8px; display: none; background: #f1f5f9;"></div>
                </div>
            </div>
        `;
        body.insertAdjacentHTML('beforeend', botHTML);
    }

    const toggle = document.getElementById('bot-toggle');
    const modal = document.getElementById('bread-bot-modal');
    const close = document.getElementById('bot-close');
    const analyzeBtn = document.getElementById('bot-analyze');
    const tickerInput = document.getElementById('bot-ticker');
    const resultDiv = document.getElementById('bot-result');

    toggle.addEventListener('click', () => {
        modal.style.display = 'flex';
        toggle.style.display = 'none';
    });

    close.addEventListener('click', () => {
        modal.style.display = 'none';
        toggle.style.display = 'flex';
    });

    analyzeBtn.addEventListener('click', async () => {
        const ticker = tickerInput.value.toUpperCase();
        if (!ticker) return;

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<p>Analyzing...</p>';

        try {
            const response = await fetch('/api/bot/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            });
            const data = await response.json();
            
            resultDiv.innerHTML = `
                <h3 style="color: ${data.recommendation === 'BUY' ? '#10b981' : '#ef4444'}">${data.recommendation}</h3>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">${data.sentiment}</p>
                <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.5rem;">Confidence: ${(data.confidence * 100).toFixed(0)}%</p>
            `;
        } catch (e) {
            resultDiv.innerHTML = '<p style="color: #ef4444;">Error analyzing ticker.</p>';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initBreadBot();
});
