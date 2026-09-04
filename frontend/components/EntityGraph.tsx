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
    { id: "e1", type: "input", data: { label: "UPI: refund.pay882@ybl\n(Risk 92 - Critical)" }, position: { x: 150, y: 50 }, style: { background: "#0D0D0F", color: "#8B5CF6", border: "1px solid #8B5CF6" } },
    { id: "e2", data: { label: "Mobile: +91 98XXXX3210\n(Risk 89)" }, position: { x: 400, y: 50 }, style: { background: "#0D0D0F", color: "#F59E0B", border: "1px solid #F59E0B" } },
    { id: "e3", data: { label: "Domain: secure-verify-991.xyz\n(Risk 95)" }, position: { x: 280, y: 180 }, style: { background: "#171719", color: "#FF304F", border: "1px solid #FF304F" } },
    { id: "c1", type: "output", data: { label: "Complaint: NCCP-2026-100042\n(Chennai, TN)" }, position: { x: 100, y: 300 }, style: { background: "#121214", color: "#F5F2EA", border: "1px solid #242428" } },
    { id: "c2", type: "output", data: { label: "Complaint: NCCP-2026-100098\n(Coimbatore, TN)" }, position: { x: 450, y: 300 }, style: { background: "#121214", color: "#F5F2EA", border: "1px solid #242428" } },
  ];

  const initialEdges = graphData?.edges || [
    { id: "e1-c1", source: "e1", target: "c1", label: "reported in", animated: true },
    { id: "e2-c2", source: "e2", target: "c2", label: "associated with", animated: true },
    { id: "e3-c1", source: "e3", target: "c1", label: "phishing host", animated: true },
    { id: "e3-c2", source: "e3", target: "c2", label: "phishing host", animated: true },
    { id: "e1-e2", source: "e1", target: "e2", label: "co-used indicator", animated: true },
  ];

  return (
    <div className="bg-[#0D0D0F] border border-[#242428] rounded-xl p-4 glass-obsidian-violet shadow-2xl flex flex-col h-[520px] font-mono">
      <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3 mb-3 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-[#F5F2EA] tracking-wider uppercase flex items-center space-x-2">
            <Network className="w-4 h-4 text-[#8B5CF6]" />
            <span>3D ENTITY RELATIONSHIP GRAPH</span>
          </h3>
          <p className="text-[10px] text-[#A6A19A]">
            CROSS-COMPLAINT IDENTIFIER CORRELATION & SYNDICATE TOPOLOGY
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="bg-[#121214] px-2.5 py-1 rounded text-[#8B5CF6] border border-[#242428]">
            NODES: {graphData?.summary?.total_nodes || 5}
          </span>
          <span className="bg-[#121214] px-2.5 py-1 rounded text-[#FF304F] border border-[#242428]">
            EDGES: {graphData?.summary?.total_edges || 5}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-[#242428] bg-[#090909]">
        <ReactFlow defaultNodes={initialNodes} defaultEdges={initialEdges} fitView>
          <Background color="#242428" gap={16} />
          <Controls />
          <MiniMap nodeColor="#8B5CF6" maskColor="rgba(9, 9, 9, 0.8)" />
        </ReactFlow>
      </div>

      <div className="mt-3 text-[10px] text-[#A6A19A] bg-[#090909] p-2 rounded border border-[#242428] flex items-center justify-between">
        <span>⚠️ Analytical correlation signal — NOT proof of criminal identity or guilt.</span>
        <span className="text-[#FF304F] font-bold">STATE: CORRELATED</span>
      </div>
    </div>
  );
};
