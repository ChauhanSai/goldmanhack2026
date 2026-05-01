import { useState } from 'react';
import { Mic, X, MessageSquare } from 'lucide-react';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {isOpen && (
        <div className="card" style={{ width: '300px', marginBottom: '1rem', position: 'relative' }}>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
          
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>WealthAI Assistant</h3>
          
          <div style={{ height: '150px', overflowY: 'auto', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <strong>AI:</strong> How can I help you understand your portfolio today?
            </div>
            {isListening && (
              <div style={{ color: 'var(--primary)', fontStyle: 'italic' }}>
                Listening...
              </div>
            )}
          </div>

          <button 
            className={`btn-primary ${isListening ? 'listening' : ''}`}
            onClick={() => setIsListening(!isListening)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: isListening ? '#ef4444' : 'var(--primary)' }}
          >
            <Mic size={16} />
            {isListening ? 'Stop' : 'Hold to Speak'}
          </button>
        </div>
      )}

      {!isOpen && (
        <button 
          className="btn-primary" 
          onClick={() => setIsOpen(true)}
          style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
