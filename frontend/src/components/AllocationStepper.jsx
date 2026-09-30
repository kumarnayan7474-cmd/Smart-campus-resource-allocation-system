import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Compass, ShieldAlert, Cpu } from 'lucide-react';

export default function AllocationStepper({ stepLogs = [], onHighlightPath, onNavigateToGraph, config = {} }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!stepLogs || stepLogs.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <Cpu className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-100 mb-2">No Allocation Logs Available</h3>
        <p className="text-slate-400 text-sm">Click "Run Greedy Allocation" to view step-by-step heap extraction and Dijkstra evaluations.</p>
      </div>
    );
  }

  const currentStep = stepLogs[currentStepIdx] || stepLogs[0];
  const w1 = config.WEIGHT_WASTED_CAPACITY || 1.0;
  const w2 = config.WEIGHT_WALKING_DISTANCE || 2.5;

  const handleStepChange = (idx) => {
    setCurrentStepIdx(idx);
    const step = stepLogs[idx];
    if (step && step.candidates_evaluated && onHighlightPath) {
      const chosen = step.candidates_evaluated.find(c => c.resource_id === step.chosen_resource);
      if (chosen && chosen.path) {
        onHighlightPath(chosen.path);
      } else {
        onHighlightPath([]);
      }
    }
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'ALLOCATED':
        return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> ALLOCATED</span>;
      case 'PREEMPTED':
        return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> PREEMPTED</span>;
      case 'WAITLISTED':
        return <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> WAITLISTED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Step {currentStepIdx + 1} of {stepLogs.length}</span>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            Request: {currentStep.request_id} — {currentStep.requester}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            disabled={currentStepIdx === 0}
            onClick={() => handleStepChange(currentStepIdx - 1)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono text-slate-400">
            {currentStepIdx + 1} / {stepLogs.length}
          </span>
          <button
            disabled={currentStepIdx === stepLogs.length - 1}
            onClick={() => handleStepChange(currentStepIdx + 1)}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Step Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request details */}
        <div className="glass-panel p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>MaxHeap Extracted Request</span>
            <span className="text-cyan-400 font-mono text-[11px] font-semibold lowercase">
              Batch {currentStep.batch_id ?? 0} | heap size {currentStep.heap_size_before_extract ?? 0}
            </span>
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Priority Score:</span>
            <span className="text-cyan-400 font-mono font-bold text-lg">{currentStep.priority_score}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Type:</span>
            <span className="capitalize font-semibold text-slate-200">{currentStep.request_type?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Resource Required:</span>
            <span className="capitalize text-slate-200">{currentStep.resource_type} (Cap: {currentStep.required_capacity})</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Requester Location:</span>
            <span className="font-mono text-cyan-300">{currentStep.location}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Time Slot:</span>
            <span className="font-mono text-slate-300">{currentStep.day} @ {currentStep.start_slot}:00-{currentStep.end_slot}:00</span>
          </div>
        </div>

        {/* Greedy Decision & Cost Formula */}
        <div className="glass-panel p-5 space-y-3 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Greedy Engine Decision
              </h4>
              {getDecisionBadge(currentStep.decision)}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {currentStep.reason}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Formula: Cost = ({w1} × WastedCap) + ({w2} × WalkingDist)</span>
            <span>Target: Minimize Cost</span>
          </div>
        </div>
      </div>

      {/* Candidate Evaluation Matrix */}
      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          Candidate Evaluation Matrix (Dijkstra Shortest Paths & Cost Breakdown)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">Building</th>
                <th className="py-2.5 px-3">Cap (Wasted)</th>
                <th className="py-2.5 px-3">Dijkstra Dist</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Cost Breakdown</th>
                <th className="py-2.5 px-3">Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentStep.candidates_evaluated?.map((cand) => {
                const isChosen = cand.resource_id === currentStep.chosen_resource;
                return (
                  <tr
                    key={cand.resource_id}
                    className={`transition-colors ${
                      isChosen ? 'bg-cyan-500/10 font-medium' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{cand.resource_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{cand.resource_id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-xs">{cand.building}</td>
                    <td className="py-3 px-3">
                      <span className="text-slate-200">{cand.capacity}</span>
                      <span className="text-xs text-slate-500 ml-1">({cand.wasted_capacity} wasted)</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400">{cand.walking_distance}m</td>
                    <td className="py-3 px-3">
                      {cand.is_free ? (
                        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Free</span>
                      ) : (
                        <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">Occupied</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">
                      <div className="text-slate-300">
                        Total: <strong className={isChosen ? "text-cyan-300 text-sm" : "text-slate-200"}>{cand.cost}</strong>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        ({w1}×{cand.wasted_capacity}) + ({w2}×{cand.walking_distance})
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onNavigateToGraph ? onNavigateToGraph(cand.path) : onHighlightPath && onHighlightPath(cand.path)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                      >
                        View on Map <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
