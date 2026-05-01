import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import PortfolioExposure from './components/PortfolioExposure/PortfolioExposure';
import NLPSentiment from './components/NLPSentiment/NLPSentiment';
import FinancialTwin from './components/FinancialTwin/FinancialTwin';
import GoalCanvas from './components/GoalCanvas/GoalCanvas';
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PortfolioExposure />} />
          <Route path="/sentiment" element={<NLPSentiment />} />
          <Route path="/twin" element={<FinancialTwin />} />
          <Route path="/goals" element={<GoalCanvas />} />
        </Routes>
      </main>
      <VoiceAssistant />
    </div>
  );
}

export default App;
