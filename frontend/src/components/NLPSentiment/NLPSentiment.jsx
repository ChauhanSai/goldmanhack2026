import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function NLPSentiment() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">NLP Sentiment & ESG Optimizer</h1>
        <p className="page-subtitle">Actionable stock insights driven by unstructured data and ESG metrics.</p>
      </div>

      <div className="cards-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3>AAPL</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Apple Inc. • Tech</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sentiment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: '600' }}>
                <TrendingUp size={16} /> Bullish
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ESG Score</div>
              <div style={{ fontWeight: '600' }}>85/100</div>
            </div>
            <button className="btn-primary">Buy</button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3>TSLA</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tesla Inc. • Auto</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sentiment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontWeight: '600' }}>
                <TrendingDown size={16} /> Bearish
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ESG Score</div>
              <div style={{ fontWeight: '600' }}>62/100</div>
            </div>
            <button className="btn-secondary">Sell</button>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3>MSFT</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Microsoft Corp. • Tech</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sentiment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <Minus size={16} /> Neutral
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ESG Score</div>
              <div style={{ fontWeight: '600' }}>90/100</div>
            </div>
            <button className="btn-secondary">Hold</button>
          </div>
        </div>
      </div>
    </div>
  );
}
