import React, { useState } from 'react';
import { addResource, addEdge } from '../services/api';
import { Settings, Plus, Layers, Network } from 'lucide-react';

export default function AdminPanel({ nodes = [], resources = [], onDataUpdated }) {
  const [resForm, setResForm] = useState({
    id: '',
    name: '',
    type: 'classroom',
    capacity: 50,
    building: nodes[0]?.id || 'MAIN_GATE'
  });

  const [edgeForm, setEdgeForm] = useState({
    u: nodes[0]?.id || 'MAIN_GATE',
    v: nodes[1]?.id || 'ADMIN_BLDG',
    weight: 100
  });

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resForm.id || !resForm.name) return;
    await addResource(resForm);
    setResForm({ ...resForm, id: '', name: '' });
    onDataUpdated();
  };

  const handleAddEdge = async (e) => {
    e.preventDefault();
    await addEdge(edgeForm);
    onDataUpdated();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Resource Card */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-5 h-5 text-cyan-400" />
          Add / Update Resource
        </h3>

        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Resource ID</label>
            <input
              type="text"
              required
              placeholder="e.g. RES_CR_999"
              value={resForm.id}
              onChange={(e) => setResForm({ ...resForm, id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Resource Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Innovation Lab 3"
              value={resForm.name}
              onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Type</label>
              <select
                value={resForm.type}
                onChange={(e) => setResForm({ ...resForm, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="seminar_hall">Seminar Hall</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                value={resForm.capacity}
                onChange={(e) => setResForm({ ...resForm, capacity: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Building Location Node</label>
            <select
              value={resForm.building}
              onChange={(e) => setResForm({ ...resForm, building: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Resource
          </button>
        </form>
      </div>

      {/* Campus Graph Edge Editor */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Network className="w-5 h-5 text-cyan-400" />
          Add / Update Campus Edge (Pathway)
        </h3>

        <form onSubmit={handleAddEdge} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">From Node (u)</label>
              <select
                value={edgeForm.u}
                onChange={(e) => setEdgeForm({ ...edgeForm, u: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">To Node (v)</label>
              <select
                value={edgeForm.v}
                onChange={(e) => setEdgeForm({ ...edgeForm, v: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Walking Distance (meters)</label>
            <input
              type="number"
              min="1"
              max="5000"
              value={edgeForm.weight}
              onChange={(e) => setEdgeForm({ ...edgeForm, weight: parseFloat(e.target.value) || 1 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Pathway Edge
          </button>
        </form>
      </div>
    </div>
  );
}
