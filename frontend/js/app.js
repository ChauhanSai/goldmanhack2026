// Shared JavaScript functionality

// Bread Bot Modal Logic
function initBreadBot() {
    const body = document.querySelector('body');

    // Inject the bot HTML into the page if it doesn't exist
    if (!document.getElementById('bread-bot-container')) {
        const botHTML = `
            <div id="bread-bot-container" style="position: fixed; bottom: 32px; right: 32px; z-index: 100;">
                <div class="relative flex flex-col items-end">
                    
                    <div id="bread-bot-modal" class="hidden mb-4 w-96 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-col" style="border-radius: 0;">
                        <div class="bg-[#196ad4] text-white p-4 border-b-4 border-black flex justify-between items-center">
                            <span class="font-['Epilogue'] font-black uppercase">Cash Cow</span>
                            <button id="bot-close" class="text-white hover:text-black font-bold text-2xl leading-none">&times;</button>
                        </div>
                        <div class="p-4 text-black">
                            <p class="font-['Work_Sans'] text-sm mb-4 font-semibold">Enter a stock ticker to get the latest NLP sentiment analysis based on news and reports.</p>
                            <input type="text" id="bot-ticker" placeholder="e.g. AAPL" class="w-full p-2 border-2 border-black mb-4 font-['Work_Sans'] rounded-none focus:outline-none focus:ring-0">
                            <button id="bot-analyze" class="w-full bg-black text-white border-2 border-black py-2 font-['Epilogue'] font-black uppercase hover:bg-[#196ad4] active:translate-x-1 active:translate-y-1 transition-all rounded-none">Analyze</button>
                            
                            <div id="bot-result" class="hidden mt-4 p-4 border-2 border-black font-['Work_Sans'] bg-stone-100 rounded-none"></div>
                        </div>
                    </div>

                    <button id="bot-toggle" class="w-20 h-20 bg-white border-4 border-black rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform cursor-pointer group" title="Ask Bread Bot">
                        <img alt="Voice Mascot" src="./cowIcons/HelpDeskCow.png" class="w-14 h-14 object-contain" />
                        <div class="absolute -top-16 right-0 bg-white border-2 border-black p-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            <p class="font-bold font-['Work_Sans'] text-black text-sm">"Need a hoof, boss?"</p>
                            <div class="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
                        </div>
                    </button>
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
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        toggle.style.display = 'none';
    });

    close.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        toggle.style.display = 'flex';
    });

    analyzeBtn.addEventListener('click', async () => {
        const ticker = tickerInput.value.toUpperCase();
        if (!ticker) return;

        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = '<p class="font-bold">Analyzing...</p>';

        try {
            const response = await fetch('/api/bot/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            });
            const data = await response.json();

            const maxSignals = Math.max(data.total_buy, data.total_sell, data.total_hold, 1);
            const buyH = (data.total_buy / maxSignals) * 100;
            const sellH = (data.total_sell / maxSignals) * 100;
            const holdH = (data.total_hold / maxSignals) * 100;

            const sentPct = Math.max(0, Math.min(100, data.overall_sentiment * 100));
            const profitability = 1 - data.profit_risk;

            function getRiskColor(risk) {
                if (risk < 0.4) return '#22c55e'; // green
                if (risk < 0.7) return '#facc15'; // yellow
                return '#ef4444'; // red
            }

            resultDiv.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-['Epilogue'] font-black text-xl" style="color: ${data.recommendation === 'BUY' ? '#22c55e' : (data.recommendation === 'SELL' ? '#ef4444' : '#facc15')}">${data.recommendation}</h3>
                    <span class="text-sm font-bold bg-black text-white px-2 py-1">${ticker}</span>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-sm font-bold mb-1">
                        <span>Sentiment Score</span>
                        <span>${data.overall_sentiment.toFixed(3)}/1.0</span>
                    </div>
                    <div class="w-full h-4 bg-white border-2 border-black rounded-none">
                        <div class="h-full bg-black border-r-2 border-black" style="width: ${sentPct}%"></div>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="text-sm font-bold mb-1">Signals</div>
                    <div class="flex items-end h-16 gap-2 border-b-2 border-black p-1">
                        <div class="w-1/3 bg-[#22c55e] border-2 border-black" style="height: ${buyH}%;"></div>
                        <div class="w-1/3 bg-[#ef4444] border-2 border-black" style="height: ${sellH}%;"></div>
                        <div class="w-1/3 bg-[#facc15] border-2 border-black" style="height: ${holdH}%;"></div>
                    </div>
                    <div class="flex text-xs text-gray-500 font-bold mt-1 text-center">
                        <div class="w-1/3">Buy (${data.total_buy})</div>
                        <div class="w-1/3">Sell (${data.total_sell})</div>
                        <div class="w-1/3">Hold (${data.total_hold})</div>
                    </div>
                </div>

                <div class="mb-4 border-t-2 border-black pt-3">
                    <div class="text-sm font-bold mb-1">Risks</div>
                    <div class="flex justify-around">
                        <div class="flex flex-col items-center">
                            <div class="w-16 h-16 rounded-full border-2 border-black mb-1" style="background: conic-gradient(#ffffff ${100 - data.base_risk * 100}%, ${getRiskColor(data.base_risk)} 0);"></div>
                            <span class="text-xs font-bold mt-1">Base Risk</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <div class="w-16 h-16 rounded-full border-2 border-black mb-1" style="background: conic-gradient(#ffffff ${100 - profitability * 100}%, ${getRiskColor(data.profit_risk)} 0);"></div>
                            <span class="text-xs font-bold mt-1">Profitability %</span>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <p class="text-sm font-bold bg-black text-white inline-block px-2 py-1">Confidence: ${(data.confidence * 100).toFixed(0)}%</p>
                </div>
            `;
        } catch (e) {
            resultDiv.innerHTML = '<p class="text-red-600 font-bold">Error analyzing ticker.</p>';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initBreadBot();
});
