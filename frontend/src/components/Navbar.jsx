import React from 'react';
import { Cpu, Network, Calendar, LayoutDashboard, FilePlus, Settings, Sun, Moon, RotateCcw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode, onReset }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard & Baseline', icon: LayoutDashboard },
    { id: 'stepper', label: 'Allocation Stepper', icon: Cpu },
    { id: 'graph', label: 'Campus Map (Graph)', icon: Network },
    { id: 'timetable', label: 'Timetable Grid', icon: Calendar },
    { id: 'request', label: 'Submit Request', icon: FilePlus },
    { id: 'admin', label: 'Admin & Graph Editor', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b rounded-none px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Smart Campus Allocator
            </h1>
            <p className="text-xs text-slate-400">Graph + MaxHeap + Dijkstra Greedy Allocator</p>
          </div>
        </div>

        <nav className="flex space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            title="Reset Data to Seed"
            className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/50 hover:bg-slate-800/50 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
