import React, { useState } from 'react';
import { createRequest } from '../services/api';
import { Send, FilePlus, CheckCircle2 } from 'lucide-react';

export default function RequestForm({ nodes = [], onRequestSubmitted }) {
  const [formData, setFormData] = useState({
    requester: '',
    type: 'exam',
    required_capacity: 40,
    resource_type: 'classroom',
    location: 'MAIN_GATE',
    day: 'Monday',
    start_slot: 9,
    end_slot: 11
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createRequest(formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    onRequestSubmitted();
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel p-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-cyan-400" />
          Submit Resource Request
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Requests are pushed directly into the MaxHeap Priority Queue based on event priority score and submission order.
        </p>
      </div>

      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Request successfully submitted and inserted into MaxHeap pending queue!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Requester Name / Department</label>
          <input
            type="text"
            required
            placeholder="e.g. Prof. Alan Turing / Robotics Club"
            value={formData.requester}
            onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Priority Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="exam">Exam (Prio: 50)</option>
              <option value="regular_class">Regular Class (Prio: 40)</option>
              <option value="faculty_meeting">Faculty Meeting (Prio: 30)</option>
              <option value="event">Event (Prio: 20)</option>
              <option value="club_activity">Club Activity (Prio: 10)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Resource Category</label>
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="seminar_hall">Seminar Hall</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Required Capacity</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.required_capacity}
              onChange={(e) => setFormData({ ...formData, required_capacity: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Requester Location Node</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Day</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Start Hour (8-17)</label>
            <input
              type="number"
              min="8"
              max="17"
              value={formData.start_slot}
              onChange={(e) => setFormData({ ...formData, start_slot: parseInt(e.target.value) || 8 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">End Hour (9-18)</label>
            <input
              type="number"
              min="9"
              max="18"
              value={formData.end_slot}
              onChange={(e) => setFormData({ ...formData, end_slot: parseInt(e.target.value) || 9 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition mt-4"
        >
          <Send className="w-4 h-4" />
          <span>Enqueue Request into MaxHeap</span>
        </button>
      </form>
    </div>
  );
}
