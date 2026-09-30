import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

export default function CampusGraph({ nodes = [], edges = [], highlightedPath = [] }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !nodes.length) return;

    const visNodes = nodes.map(n => {
      const isHighlighted = highlightedPath.includes(n.id);
      return {
        id: n.id,
        label: `${n.name}\n(${n.id})`,
        shape: 'dot',
        size: isHighlighted ? 24 : 16,
        color: {
          background: isHighlighted ? '#06b6d4' : '#1e293b',
          border: isHighlighted ? '#22d3ee' : '#475569',
          highlight: { background: '#38bdf8', border: '#0284c7' }
        },
        font: { color: isHighlighted ? '#38bdf8' : '#cbd5e1', face: 'Inter', size: 12, multi: true }
      };
    });

    const visEdges = [];
    edges.forEach((e, idx) => {
      let isHighlightedEdge = false;
      if (highlightedPath.length > 1) {
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const u = highlightedPath[i];
          const v = highlightedPath[i + 1];
          if ((e.u === u && e.v === v) || (e.u === v && e.v === u)) {
            isHighlightedEdge = true;
            break;
          }
        }
      }

      visEdges.push({
        id: `e-${idx}`,
        from: e.u,
        to: e.v,
        label: `${e.weight}m`,
        color: {
          color: isHighlightedEdge ? '#06b6d4' : '#334155',
          highlight: '#38bdf8'
        },
        width: isHighlightedEdge ? 4 : 1.5,
        font: { color: isHighlightedEdge ? '#22d3ee' : '#64748b', size: 11, align: 'top' }
      });
    });

    const data = { nodes: visNodes, edges: visEdges };
    const options = {
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08
        }
      },
      interaction: { hover: true, tooltipDelay: 100 }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [nodes, edges, highlightedPath]);

  return (
    <div className="glass-panel p-4 h-[600px] flex flex-col relative">
      <div className="flex items-center justify-between mb-3 px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Campus Weighted Graph Map
          </h2>
          <p className="text-xs text-slate-400">Undirected weighted edges representing walking distances in meters</p>
        </div>
        {highlightedPath.length > 0 && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono">
            <span>Dijkstra Path:</span>
            <strong>{highlightedPath.join(' → ')}</strong>
          </div>
        )}
      </div>
      <div ref={containerRef} className="flex-1 w-full h-full rounded-lg bg-slate-950/50 border border-slate-800/80" />
    </div>
  );
}
