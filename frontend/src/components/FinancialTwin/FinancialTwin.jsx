import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateData = (years) => {
  return Array.from({ length: years }, (_, i) => ({
    year: 2026 + i,
    current: Math.round(100000 * Math.pow(1.05, i)), // 5% growth
    rebalanced: Math.round(100000 * Math.pow(1.08, i)), // 8% growth
  }));
};

export default function FinancialTwin() {
  const [years, setYears] = useState(10);
  const data = generateData(years);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Your Financial Twin</h1>
        <p className="page-subtitle">Visualize the impact of rebalancing over time.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)' }}>Current You</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${data[data.length - 1].current.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ color: 'var(--primary)' }}>Rebalanced You</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${data[data.length - 1].rebalanced.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ height: '300px', marginBottom: '2rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip formatter={(val) => `$${val.toLocaleString()}`} cursor={{ stroke: 'var(--border-color)' }} />
              <Line type="monotone" dataKey="current" stroke="var(--text-secondary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rebalanced" stroke="var(--primary)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Time Horizon: {years} Years
          </label>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={years} 
            onChange={(e) => setYears(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--primary-light)', color: 'white', border: 'none' }}>
        <h3>Why the difference?</h3>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          By optimizing for ESG factors and reducing exposure to highly volatile supply chains, the rebalanced portfolio historically demonstrates higher risk-adjusted returns (alpha) while maintaining lower market sensitivity (beta). 
          <a href="#" style={{ color: 'white', textDecoration: 'underline', marginLeft: '0.5rem' }}>Learn more</a>
        </p>
      </div>
    </div>
  );
}
