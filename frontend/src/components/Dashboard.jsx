import React, { useState, useEffect } from 'react';
import { runAllocation, runComparison, fetchConfig, updateConfig } from '../services/api';
import { Play, TrendingUp, CheckCircle, XCircle, Footprints, ShieldAlert, BarChart3, Sliders, Layers } from 'lucide-react';

export default function Dashboard({ onAllocationRun, allocationData, onSelectPath }) {
  const [comparison, setComparison] = useState(null);
  const [config, setConfig] = useState({ WEIGHT_WASTED_CAPACITY: 1.0, WEIGHT_WALKING_DISTANCE: 2.5 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComparisonAndConfig();
  }, []);

  const loadComparisonAndConfig = async () => {
    try {
      const [compRes, confRes] = await Promise.all([runComparison(), fetchConfig()]);
      setComparison(compRes);
      setConfig(confRes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunGreedy = async () => {
    setLoading(true);
    try {
      const res = await runAllocation();
      onAllocationRun(res);
      await loadComparisonAndConfig();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    await updateConfig(config);
    await handleRunGreedy();
  };

  const metrics = allocationData?.metrics || {
    total_requests: 40,
    allocated_count: 0,
    rejected_count: 0,
    preempted_count: 0,
    utilization_pct: 0,
    avg_walking_distance: 0,
    avg_wasted_capacity: 0
  };

  const greedyComp = comparison?.greedy || metrics;
  const fcfsComp = comparison?.baseline_fcfs || {
    utilization_pct: 0,
    avg_walking_distance: 0,
    avg_wasted_capacity: 0,
    allocated_count: 0,
    rejected_count: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Action */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 flex flex-wrap items-center justify-between gap-4 border-cyan-500/20">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-6 h-6" />
            </span>
            Graph & Greedy Allocation Engine
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            MaxHeap Priority Queue → Dijkstra Shortest Paths → Multi-Objective Greedy Allocator with Preemption
          </p>
        </div>

        <button
          onClick={handleRunGreedy}
          disabled={loading}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{loading ? 'Executing Engine...' : 'Run Greedy Allocation'}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Utilization Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{metrics.utilization_pct}%</div>
          <div className="text-xs text-emerald-400 font-medium">{metrics.allocated_count} / {metrics.total_requests} Requests Allocated</div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl"></div>
        </div>

        <div className="glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Avg Walking Dist</span>
            <Footprints className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{metrics.avg_walking_distance}m</div>
          <div className="text-xs text-slate-400">Dijkstra Shortest Path Distance</div>
        </div>

        <div className="glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Avg Wasted Cap</span>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{metrics.avg_wasted_capacity}</div>
          <div className="text-xs text-slate-400">Seats unused per allocation</div>
        </div>

        <div className="glass-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Preemptions & Waitlist</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{metrics.preempted_count} / {metrics.rejected_count}</div>
          <div className="text-xs text-amber-400/90">{metrics.preempted_count} Preempted | {metrics.rejected_count} Waitlisted</div>
        </div>
      </div>

      {/* Middle Grid: Comparison Mode & Config Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Baseline FCFS vs Greedy Comparison */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Comparison Strategy Mode (Greedy vs FCFS Baseline)
              </h3>
              <p className="text-xs text-slate-400">
                Custom MaxHeap Greedy vs Naive First-Come-First-Served Engine
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Greedy Card */}
            <div className="bg-cyan-950/20 border border-cyan-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="font-bold text-cyan-300 text-sm">Smart Greedy Engine</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">OPTIMIZED</span>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Utilization Rate:</span>
                  <strong className="text-cyan-400">{greedyComp.utilization_pct}%</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Allocated Reqs:</span>
                  <strong className="text-emerald-400">{greedyComp.allocated_count} / {greedyComp.total_requests}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>High-Priority Allocated:</span>
                  <strong className="text-emerald-400">{greedyComp.high_prio_allocated} / {greedyComp.total_high_prio}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Avg Walking Dist:</span>
                  <strong className="text-cyan-300">{greedyComp.avg_walking_distance}m</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Avg Wasted Cap:</span>
                  <strong className="text-slate-300">{greedyComp.avg_wasted_capacity}</strong>
                </div>
              </div>
            </div>

            {/* FCFS Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300 text-sm">Naive FCFS Baseline</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">NAIVE</span>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Utilization Rate:</span>
                  <strong className="text-slate-300">{fcfsComp.utilization_pct}%</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Allocated Reqs:</span>
                  <strong className="text-slate-300">{fcfsComp.allocated_count} / {fcfsComp.total_requests}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>High-Priority Allocated:</span>
                  <strong className="text-amber-400">{fcfsComp.high_prio_allocated} / {fcfsComp.total_high_prio}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg Walking Dist:</span>
                  <strong className="text-slate-300">{fcfsComp.avg_walking_distance}m</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg Wasted Cap:</span>
                  <strong className="text-slate-400">{fcfsComp.avg_wasted_capacity}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Greedy Cost Weights Config Panel */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Greedy Formula Weights
          </h3>
          <p className="text-xs text-slate-400">
            Tune objective weights for candidate cost calculation:
            <code className="block mt-1 font-mono text-cyan-300 bg-slate-950 p-2 rounded">
              Cost = w1*WastedCap + w2*Dist
            </code>
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Wasted Capacity Weight (w1): {config.WEIGHT_WASTED_CAPACITY}
              </label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={config.WEIGHT_WASTED_CAPACITY}
                onChange={(e) => setConfig({ ...config, WEIGHT_WASTED_CAPACITY: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Walking Distance Weight (w2): {config.WEIGHT_WALKING_DISTANCE}
              </label>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.5"
                value={config.WEIGHT_WALKING_DISTANCE}
                onChange={(e) => setConfig({ ...config, WEIGHT_WALKING_DISTANCE: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs border border-cyan-500/30 transition"
            >
              Apply Weights & Re-Run
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
