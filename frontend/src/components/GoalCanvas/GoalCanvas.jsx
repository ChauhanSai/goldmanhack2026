import { useState, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Current Portfolio ($100k)' }, type: 'input' },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'Buy a House ($50k)' } },
  { id: '3', position: { x: 400, y: 150 }, data: { label: 'Retirement ($1M)' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
];

export default function GoalCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [prompt, setPrompt] = useState('');

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!prompt) return;
    
    // Mocking an LLM response creating a new node
    const newNode = {
      id: (nodes.length + 1).toString(),
      position: { x: 250, y: 250 },
      data: { label: prompt },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, { id: `e1-${newNode.id}`, source: '1', target: newNode.id, animated: true }]);
    setPrompt('');
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">AI-Driven Goal Canvas</h1>
        <p className="page-subtitle">Map and manage your life milestones visually.</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'I want to save for a child's college in 15 years'" 
          style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
        />
        <button className="btn-primary" onClick={handlePromptSubmit}>Generate Goal</button>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', minHeight: '500px' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}
          fitView
        >
          <Background color="var(--border-color)" gap={16} />
          <MiniMap nodeColor="var(--primary-light)" maskColor="rgba(248, 250, 252, 0.7)" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
