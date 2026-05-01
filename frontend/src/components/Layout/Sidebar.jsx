import { NavLink } from 'react-router-dom';
import { Briefcase, Activity, Users, Map, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>WealthAI</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
          <Briefcase size={20} />
          <span>Portfolio Exposure</span>
        </NavLink>
        
        <NavLink to="/sentiment" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Activity size={20} />
          <span>NLP Sentiment</span>
        </NavLink>
        
        <NavLink to="/twin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Financial Twin</span>
        </NavLink>
        
        <NavLink to="/goals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Map size={20} />
          <span>Goal Canvas</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
