"use client";

import React from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import { Network, AlertCircle, Shield } from "lucide-react";

interface GraphData {
  nodes: any[];
  edges: any[];
  summary: {
    total_nodes: number;
    total_edges: number;
    connected_components: number;
  };
}

export const EntityGraph: React.FC<{ graphData?: GraphData }> = ({ graphData }) => {
  const initialNodes = graphData?.nodes || [
    {
      id: "e1",
      type: "input",
      data: { label: "UPI: refund.pay882@ybl\n(Risk 92 - Critical)" },
      position: { x: 220, y: 60 },
      style: {
        background: "#FFFFFF",
        color: "#7C3AED",
        border: "2px solid #7C3AED",
        borderRadius: "8px",
        padding: "8px 12px",
        fontWeight: "bold",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(124, 58, 237, 0.12)"
      }
    },
    {
      id: "e2",
      data: { label: "Mobile: +91 98XXXX3210\n(Risk 89)" },
      position: { x: 620, y: 60 },
      style: {
        background: "#FFFFFF",
        color: "#D97706",
        border: "2px solid #D97706",
        borderRadius: "8px",
        padding: "8px 12px",
        fontWeight: "bold",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(217, 119, 6, 0.12)"
      }
    },
    {
      id: "e3",
      data: { label: "Domain: secure-verify-991.xyz\n(Risk 95)" },
      position: { x: 420, y: 200 },
      style: {
        background: "#FFFFFF",
        color: "#DC2626",
        border: "2px solid #DC2626",
        borderRadius: "8px",
        padding: "8px 12px",
        fontWeight: "bold",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(220, 38, 38, 0.12)"
      }
    },
    {
      id: "c1",
      type: "output",
      data: { label: "Complaint: NCCP-2026-100042\n(Chennai, TN)" },
      position: { x: 180, y: 350 },
      style: {
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1.5px solid #005A9C",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(0, 90, 156, 0.1)"
      }
    },
    {
      id: "c2",
      type: "output",
      data: { label: "Complaint: NCCP-2026-100098\n(Coimbatore, TN)" },
      position: { x: 660, y: 350 },
      style: {
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1.5px solid #005A9C",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(0, 90, 156, 0.1)"
      }
    },
  ];

  const initialEdges = graphData?.edges || [
    { id: "e1-c1", source: "e1", target: "c1", label: "reported in", animated: true },
    { id: "e2-c2", source: "e2", target: "c2", label: "associated with", animated: true },
    { id: "e3-c1", source: "e3", target: "c1", label: "phishing host", animated: true },
    { id: "e3-c2", source: "e3", target: "c2", label: "phishing host", animated: true },
    { id: "e1-e2", source: "e1", target: "e2", label: "co-used indicator", animated: true },
  ];

  return (
    <div className="bg-white border border-slate-200 border-t-4 border-t-[#005A9C] rounded-xl p-4 shadow-sm flex flex-col h-[460px] font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-[#005A9C] tracking-wider uppercase flex items-center space-x-2 font-mono">
            <Network className="w-4 h-4 text-[#005A9C]" />
            <span>3D ENTITY RELATIONSHIP GRAPH</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">
            CROSS-COMPLAINT IDENTIFIER CORRELATION & SYNDICATE TOPOLOGY
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="bg-purple-50 px-2.5 py-1 rounded text-purple-700 border border-purple-200 font-bold">
            NODES: {graphData?.summary?.total_nodes || 5}
          </span>
          <span className="bg-red-50 px-2.5 py-1 rounded text-red-700 border border-red-200 font-bold">
            EDGES: {graphData?.summary?.total_edges || 5}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
        <ReactFlow
          defaultNodes={initialNodes}
          defaultEdges={initialEdges}
          fitView
          fitViewOptions={{ padding: 0.35, minZoom: 0.6, maxZoom: 1.1 }}
        >
          <Background color="#E2E8F0" gap={16} />
          <Controls />
          <MiniMap nodeColor="#7C3AED" maskColor="rgba(248, 250, 252, 0.7)" />
        </ReactFlow>
      </div>

      <div className="mt-3 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between font-mono">
        <span>⚠️ Analytical correlation signal — NOT proof of criminal identity or guilt.</span>
        <span className="text-[#005A9C] font-bold">STATE: CORRELATED</span>
      </div>
    </div>
  );
};
