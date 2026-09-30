import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

export default function CampusGraph({ nodes = [], edges = [], highlightedPath = [], darkMode = true }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !nodes.length) return;

    // Theme colors
    const labelColor = darkMode ? '#FFD54F' : '#1E293B';
    const labelBg = darkMode ? '#0B1B33' : '#F1F5F9';
    const edgeColor = darkMode ? '#7C8DB0' : '#64748B';
    const highlightEdgeColor = '#06b6d4';
    const highlightLabelBg = '#06b6d4';

    // Spatial layout coordinates for real-world campus layout logic
    const NODE_POSITIONS = {
      MAIN_GATE:      { x: 0,    y: 250 },  // Main entrance at bottom
      ADMIN_BLDG:     { x: -180, y: 120 },  // Left near entrance
      STUDENT_CENTER: { x: 180,  y: 120 },  // Right near entrance
      LIBRARY:        { x: -80,  y: 20  },  // Central left
      ENG_BLOCK_A:    { x: -280, y: -20 },  // West Academic block
      ENG_BLOCK_B:    { x: -250, y: -160},  // Northwest Academic block
      AUDITORIUM:     { x: 260,  y: 10  },  // East event zone
      SPORTS_COMPLEX: { x: 280,  y: -140},  // Northeast sports zone
      SCI_COMPLEX:    { x: -90,  y: -140},  // Central North science complex
      RESEARCH_PARK:  { x: -160, y: -260},  // Far North Research Park
      HOSTEL_SOUTH:   { x: 150,  y: -230},  // Southeast Hostels
      HOSTEL_NORTH:   { x: 0,    y: -280}   // Far North Hostels
    };

    const visNodes = nodes.map(n => {
      const isHighlighted = highlightedPath.includes(n.id);
      const pos = NODE_POSITIONS[n.id] || {};
      return {
        id: n.id,
        label: `${n.name}\n(${n.id})`,
        shape: 'dot',
        size: isHighlighted ? 24 : 16,
        x: pos.x,
        y: pos.y,
        color: {
          background: isHighlighted ? '#06b6d4' : (darkMode ? '#1e293b' : '#e2e8f0'),
          border: isHighlighted ? '#22d3ee' : (darkMode ? '#475569' : '#94a3b8'),
          highlight: { background: '#38bdf8', border: '#0284c7' }
        },
        font: {
          color: isHighlighted ? '#38bdf8' : (darkMode ? '#cbd5e1' : '#1e293b'),
          face: 'Inter',
          size: 12,
          multi: true
        }
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
          color: isHighlightedEdge ? highlightEdgeColor : edgeColor,
          highlight: '#38bdf8'
        },
        width: isHighlightedEdge ? 5 : 2,
        font: {
          color: isHighlightedEdge ? '#FFFFFF' : labelColor,
          size: 14,
          face: 'Inter',
          bold: '700',
          strokeWidth: 0,
          background: isHighlightedEdge ? highlightLabelBg : labelBg,
          vadjust: 0
        }
      });
    });

    const data = { nodes: visNodes, edges: visEdges };
    const options = {
      physics: {
        enabled: true,
        solver: 'barnesHut',
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 120,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.5
        }
      },
      interaction: { hover: true, tooltipDelay: 100 }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [nodes, edges, highlightedPath, darkMode]);

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
