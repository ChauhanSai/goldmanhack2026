import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Direct', exposure: 4000 },
  { name: 'Suppliers', exposure: 3000 },
  { name: 'Competitors', exposure: 2000 },
  { name: 'Ecosystem', exposure: 2780 },
];

export default function PortfolioExposure() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Portfolio Exposure & Supply Chain</h1>
        <p className="page-subtitle">Understand your true market exposure beyond direct holdings.</p>
      </div>

      <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3>Your Exposure Breakdown</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Mapping direct holdings to their broader network.
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-color)' }} />
                <Bar dataKey="exposure" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Dependency Mapping</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Example: Owning Apple exposes you to TSMC, Foxconn, Samsung, and Microsoft.
          </p>
          <div className="dependency-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <strong>AAPL (Apple Inc.)</strong>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--primary-light)', color: 'white', borderRadius: '4px' }}>Supplier: TSM</span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--primary-light)', color: 'white', borderRadius: '4px' }}>Competitor: MSFT</span>
              </div>
            </div>
            
            <button className="btn-secondary" style={{ alignSelf: 'flex-start' }}>Sync Portfolio (Plaid)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
