"use client";

import React, { useState, useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Network,
  Shield,
  AlertCircle,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Phone,
  Globe,
  FileText,
  Building,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Lock,
  ArrowRight
} from "lucide-react";

interface EntityDetails {
  id: string;
  label: string;
  subLabel?: string;
  type: "UPI" | "BANK" | "MOBILE" | "DOMAIN" | "COMPLAINT";
  riskScore: number;
  riskBand: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  financialLoss?: string;
  complaintCount?: number;
  provider?: string;
  location?: string;
  status?: string;
}

const RAW_ENTITIES_DATA: EntityDetails[] = [
  {
    id: "e-domain",
    label: "secure-verify-991.xyz",
    subLabel: "Phishing Gateway Server",
    type: "DOMAIN",
    riskScore: 96,
    riskBand: "CRITICAL",
    financialLoss: "₹24,50,000",
    complaintCount: 62,
    provider: "Cloudflare / Offshore Host",
    location: "Hosting Origin: IP 185.220.101.4",
    status: "TAKEDOWN REQUESTED"
  },
  {
    id: "e-upi1",
    label: "refund.fastpay882@ybl",
    subLabel: "Primary Mule UPI Handle",
    type: "UPI",
    riskScore: 94,
    riskBand: "CRITICAL",
    financialLoss: "₹16,50,000",
    complaintCount: 48,
    provider: "Yes Bank / PhonePe Gateway",
    location: "Terminal: New Delhi",
    status: "HIGH RISK SUSPECT"
  },
  {
    id: "e-upi2",
    label: "kyc.support99@icici",
    subLabel: "Secondary Impersonation Handle",
    type: "UPI",
    riskScore: 88,
    riskBand: "CRITICAL",
    financialLoss: "₹8,90,000",
    complaintCount: 22,
    provider: "ICICI Bank Gateway",
    location: "Terminal: Noida, UP",
    status: "UNDER MONITORING"
  },
  {
    id: "e-bank1",
    label: "SBI A/C: 3098XXXX8921",
    subLabel: "Layer 1 Cash-Out Account",
    type: "BANK",
    riskScore: 91,
    riskBand: "CRITICAL",
    financialLoss: "₹19,80,000",
    complaintCount: 31,
    provider: "State Bank of India",
    location: "Branch: Chandni Chowk, Delhi",
    status: "FREEZE INITIATED"
  },
  {
    id: "e-bank2",
    label: "HDFC A/C: 5010XXXX3342",
    subLabel: "Layer 2 Mule Account",
    type: "BANK",
    riskScore: 85,
    riskBand: "HIGH",
    financialLoss: "₹12,40,000",
    complaintCount: 19,
    provider: "HDFC Bank",
    location: "Branch: Bandra, Mumbai",
    status: "KYC RE-VERIFICATION REQUIRED"
  },
  {
    id: "e-mob1",
    label: "+91 9876543210",
    subLabel: "Active WhatsApp Calling Number",
    type: "MOBILE",
    riskScore: 92,
    riskBand: "CRITICAL",
    financialLoss: "₹13,50,000",
    complaintCount: 39,
    provider: "Bharti Airtel (Fake KYC)",
    location: "Tower Location: Alwar, Rajasthan",
    status: "BLOCKED TELECOM"
  },
  {
    id: "e-mob2",
    label: "+91 9123456789",
    subLabel: "Secondary Telegram Dispatcher",
    type: "MOBILE",
    riskScore: 82,
    riskBand: "HIGH",
    financialLoss: "₹7,20,000",
    complaintCount: 16,
    provider: "Reliance Jio",
    location: "Tower Location: Jamtara, Jharkhand",
    status: "IMEI TRACKING ACTIVE"
  },
  {
    id: "c-10042",
    label: "NCCP-2026-100042",
    subLabel: "Victim FIR (Delhi)",
    type: "COMPLAINT",
    riskScore: 89,
    riskBand: "CRITICAL",
    financialLoss: "₹2,10,000",
    provider: "Special Cell Cyber Command",
    location: "New Delhi, Delhi",
    status: "INVESTIGATION ACTIVE"
  },
  {
    id: "c-10098",
    label: "NCCP-2026-100098",
    subLabel: "Victim FIR (Mumbai)",
    type: "COMPLAINT",
    riskScore: 84,
    riskBand: "CRITICAL",
    financialLoss: "₹1,85,000",
    provider: "BKC Cyber Police",
    location: "Mumbai, Maharashtra",
    status: "EVIDENCE ATTACHED"
  },
  {
    id: "c-10145",
    label: "NCCP-2026-100145",
    subLabel: "Victim FIR (Chennai)",
    type: "COMPLAINT",
    riskScore: 78,
    riskBand: "HIGH",
    financialLoss: "₹1,45,000",
    provider: "Central Cyber Cell",
    location: "Chennai, Tamil Nadu",
    status: "MULE INTERCEPT DISPATCHED"
  }
];

const INITIAL_NODES: Node[] = [
  {
    id: "e-domain",
    type: "input",
    data: {
      label: "🌐 secure-verify-991.xyz\n(Risk 96 - Critical Phishing Domain)",
      raw: RAW_ENTITIES_DATA[0]
    },
    position: { x: 440, y: 30 },
    style: {
      background: "#FEF2F2",
      color: "#991B1B",
      border: "2px solid #DC2626",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(220, 38, 38, 0.18)",
      cursor: "pointer",
      width: 250
    }
  },
  {
    id: "e-upi1",
    data: {
      label: "⚡ refund.fastpay882@ybl\n(UPI Mule Handle • Risk 94)",
      raw: RAW_ENTITIES_DATA[1]
    },
    position: { x: 180, y: 150 },
    style: {
      background: "#F5F3FF",
      color: "#5B21B6",
      border: "2px solid #7C3AED",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.18)",
      cursor: "pointer",
      width: 230
    }
  },
  {
    id: "e-upi2",
    data: {
      label: "⚡ kyc.support99@icici\n(UPI Secondary • Risk 88)",
      raw: RAW_ENTITIES_DATA[2]
    },
    position: { x: 700, y: 150 },
    style: {
      background: "#F5F3FF",
      color: "#5B21B6",
      border: "2px solid #7C3AED",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.18)",
      cursor: "pointer",
      width: 220
    }
  },
  {
    id: "e-mob1",
    data: {
      label: "📱 +91 9876543210\n(Mule Telco • Risk 92)",
      raw: RAW_ENTITIES_DATA[5]
    },
    position: { x: 100, y: 280 },
    style: {
      background: "#FFFBEB",
      color: "#92400E",
      border: "2px solid #D97706",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(217, 119, 6, 0.18)",
      cursor: "pointer",
      width: 210
    }
  },
  {
    id: "e-mob2",
    data: {
      label: "📱 +91 9123456789\n(Telegram SIM • Risk 82)",
      raw: RAW_ENTITIES_DATA[6]
    },
    position: { x: 790, y: 280 },
    style: {
      background: "#FFFBEB",
      color: "#92400E",
      border: "2px solid #D97706",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(217, 119, 6, 0.18)",
      cursor: "pointer",
      width: 210
    }
  },
  {
    id: "e-bank1",
    data: {
      label: "🏦 SBI: 3098XXXX8921\n(Layer 1 Mule • Risk 91)",
      raw: RAW_ENTITIES_DATA[3]
    },
    position: { x: 360, y: 260 },
    style: {
      background: "#EFF6FF",
      color: "#1E40AF",
      border: "2px solid #2563EB",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.18)",
      cursor: "pointer",
      width: 200
    }
  },
  {
    id: "e-bank2",
    data: {
      label: "🏦 HDFC: 5010XXXX3342\n(Layer 2 Mule • Risk 85)",
      raw: RAW_ENTITIES_DATA[4]
    },
    position: { x: 570, y: 260 },
    style: {
      background: "#EFF6FF",
      color: "#1E40AF",
      border: "2px solid #2563EB",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "bold",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.18)",
      cursor: "pointer",
      width: 200
    }
  },
  {
    id: "c-10042",
    type: "output",
    data: {
      label: "🚨 Complaint #100042\n(Delhi • Loss: ₹2.1L)",
      raw: RAW_ENTITIES_DATA[7]
    },
    position: { x: 180, y: 420 },
    style: {
      background: "#FFFFFF",
      color: "#0F172A",
      border: "2px solid #005A9C",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 3px 10px rgba(0, 90, 156, 0.15)",
      cursor: "pointer",
      width: 200
    }
  },
  {
    id: "c-10098",
    type: "output",
    data: {
      label: "🚨 Complaint #100098\n(Mumbai • Loss: ₹1.85L)",
      raw: RAW_ENTITIES_DATA[8]
    },
    position: { x: 470, y: 430 },
    style: {
      background: "#FFFFFF",
      color: "#0F172A",
      border: "2px solid #005A9C",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 3px 10px rgba(0, 90, 156, 0.15)",
      cursor: "pointer",
      width: 200
    }
  },
  {
    id: "c-10145",
    type: "output",
    data: {
      label: "🚨 Complaint #100145\n(Chennai • Loss: ₹1.45L)",
      raw: RAW_ENTITIES_DATA[9]
    },
    position: { x: 740, y: 420 },
    style: {
      background: "#FFFFFF",
      color: "#0F172A",
      border: "2px solid #005A9C",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "11px",
      fontFamily: "monospace",
      boxShadow: "0 3px 10px rgba(0, 90, 156, 0.15)",
      cursor: "pointer",
      width: 200
    }
  }
];

const INITIAL_EDGES: Edge[] = [
  {
    id: "edge-dom-upi1",
    source: "e-domain",
    target: "e-upi1",
    label: "embeds payment QR",
    animated: true,
    style: { stroke: "#DC2626", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#DC2626" }
  },
  {
    id: "edge-dom-upi2",
    source: "e-domain",
    target: "e-upi2",
    label: "redirects collect",
    animated: true,
    style: { stroke: "#DC2626", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#DC2626" }
  },
  {
    id: "edge-mob1-upi1",
    source: "e-mob1",
    target: "e-upi1",
    label: "co-used VPA",
    animated: true,
    style: { stroke: "#7C3AED", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7C3AED" }
  },
  {
    id: "edge-mob2-upi2",
    source: "e-mob2",
    target: "e-upi2",
    label: "dispatches links",
    animated: true,
    style: { stroke: "#7C3AED", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7C3AED" }
  },
  {
    id: "edge-upi1-bank1",
    source: "e-upi1",
    target: "e-bank1",
    label: "mule settlement",
    animated: true,
    style: { stroke: "#2563EB", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#2563EB" }
  },
  {
    id: "edge-bank1-bank2",
    source: "e-bank1",
    target: "e-bank2",
    label: "RTGS layering",
    animated: true,
    style: { stroke: "#2563EB", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#2563EB" }
  },
  {
    id: "edge-upi2-bank2",
    source: "e-upi2",
    target: "e-bank2",
    label: "fast-payout sweep",
    animated: true,
    style: { stroke: "#2563EB", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#2563EB" }
  },
  {
    id: "edge-c1-upi1",
    source: "c-10042",
    target: "e-upi1",
    label: "paid ₹2.1L via UPI",
    animated: true,
    style: { stroke: "#005A9C", strokeWidth: 2 }
  },
  {
    id: "edge-c1-mob1",
    source: "c-10042",
    target: "e-mob1",
    label: "called by suspect",
    animated: false,
    style: { stroke: "#64748B", strokeWidth: 1.5, strokeDasharray: "4 4" }
  },
  {
    id: "edge-c2-dom",
    source: "c-10098",
    target: "e-domain",
    label: "phished via domain",
    animated: true,
    style: { stroke: "#DC2626", strokeWidth: 2 }
  },
  {
    id: "edge-c2-bank1",
    source: "c-10098",
    target: "e-bank1",
    label: "credited mule ₹1.85L",
    animated: true,
    style: { stroke: "#005A9C", strokeWidth: 2 }
  },
  {
    id: "edge-c3-upi2",
    source: "c-10145",
    target: "e-upi2",
    label: "QR scan ₹1.45L",
    animated: true,
    style: { stroke: "#005A9C", strokeWidth: 2 }
  }
];

const FILTER_TABS = [
  { id: "ALL", label: "ALL ENTITIES" },
  { id: "UPI", label: "UPI VPAS" },
  { id: "BANK", label: "MULE BANKS" },
  { id: "MOBILE", label: "MULE TELCOS" },
  { id: "DOMAIN", label: "DOMAINS" },
  { id: "COMPLAINT", label: "COMPLAINTS" }
];

export const EntityGraph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<EntityDetails | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  // Filter and search highlighting
  const displayNodes = useMemo(() => {
    return nodes.map((node) => {
      const raw = node.data?.raw as EntityDetails | undefined;
      if (!raw) return node;

      const matchesFilter = activeFilter === "ALL" || raw.type === activeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        raw.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        raw.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (raw.subLabel && raw.subLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (raw.location && raw.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const isHighlighted = matchesFilter && matchesSearch;
      const isSelected = selectedEntity?.id === raw.id;

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isHighlighted ? 1 : 0.25,
          borderWidth: isSelected ? "3px" : (node.style?.borderWidth || "2px"),
          boxShadow: isSelected
            ? "0 0 0 4px rgba(0, 90, 156, 0.35), 0 6px 20px rgba(0,0,0,0.15)"
            : isHighlighted
            ? (node.style?.boxShadow || "none")
            : "none"
        }
      };
    });
  }, [nodes, activeFilter, searchQuery, selectedEntity]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const raw = node.data?.raw as EntityDetails | undefined;
    if (raw) {
      setSelectedEntity(raw);
      setActionFeedback(null);
    }
  }, []);

  const handleAction = (actionType: string) => {
    if (!selectedEntity) return;
    if (actionType === "FREEZE") {
      setActionFeedback(`✅ Order Dispatched: Account ${selectedEntity.label} frozen under Section 91 CrPC.`);
    } else if (actionType === "TELCO") {
      setActionFeedback(`✅ Telecom Block Request filed with DoT for ${selectedEntity.label}.`);
    } else if (actionType === "TAKEDOWN") {
      setActionFeedback(`✅ Urgent Takedown Notice generated for CERT-In & registrar for ${selectedEntity.label}.`);
    } else {
      setActionFeedback(`✅ Action recorded for ${selectedEntity.label}.`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const toggleAnimation = () => {
    setIsAnimationActive((prev) => {
      const next = !prev;
      setEdges((eds) => eds.map((e) => ({ ...e, animated: next })));
      return next;
    });
  };

  const resetLayout = () => {
    setNodes(INITIAL_NODES);
    setSelectedEntity(null);
    setSearchQuery("");
    setActiveFilter("ALL");
  };

  return (
    <div
      className={`bg-white border border-slate-200 border-t-4 border-t-[#005A9C] rounded-xl p-4 shadow-sm flex flex-col font-sans transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-[999] shadow-2xl h-[calc(100vh-2rem)]" : "h-[540px]"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3 shrink-0">
        <div>
          <h3 className="text-xs font-extrabold text-[#005A9C] tracking-wider uppercase flex items-center space-x-2 font-mono">
            <Network className="w-4 h-4 text-[#005A9C]" />
            <span>INTERACTIVE 3D ENTITY RELATIONSHIP GRAPH</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">
            LIVE SYNDICATE TOPOLOGY • MULE NETWORKS • FINANCIAL LAYERING PATHS
          </p>
        </div>

        {/* Filter Pills & Interactive Actions */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <button
            onClick={toggleAnimation}
            title="Toggle Flow Animation"
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
              isAnimationActive
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <Zap className="w-3 h-3 text-amber-600" />
            <span>{isAnimationActive ? "PAUSE FLOW" : "PLAY FLOW"}</span>
          </button>

          <button
            onClick={resetLayout}
            title="Reset Network Layout"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse view" : "Expand full screen"}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Search & Quick Stats Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 shrink-0 font-mono">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entity, UPI, account, phone, FIR..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#005A9C] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[10px] w-full sm:w-auto justify-end">
          <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
            ENTITIES: 10 NODES
          </span>
          <span className="bg-blue-50 text-[#005A9C] font-bold px-2 py-0.5 rounded border border-blue-200">
            CORRELATIONS: 12 EDGES
          </span>
          <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
            TOTAL SYNDICATE LOSS: ₹47.3L
          </span>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.25, minZoom: 0.55, maxZoom: 1.25 }}
        >
          <Background color="#CBD5E1" gap={18} size={1} />
          <Controls className="bg-white border border-slate-200 shadow-sm rounded-lg" />
          <MiniMap
            nodeColor={(node) => {
              if (node.id.includes("domain")) return "#DC2626";
              if (node.id.includes("upi")) return "#7C3AED";
              if (node.id.includes("mob")) return "#D97706";
              if (node.id.includes("bank")) return "#2563EB";
              return "#005A9C";
            }}
            maskColor="rgba(241, 245, 249, 0.75)"
            className="border border-slate-200 rounded-lg overflow-hidden"
          />
        </ReactFlow>

        {/* Selected Entity Interactive Forensic Inspector Slide-In Card */}
        {selectedEntity && (
          <div className="absolute top-3 right-3 z-50 w-80 bg-white/95 border border-slate-200 rounded-xl p-4 shadow-2xl space-y-3 font-sans backdrop-blur-md animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="bg-red-600 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded">
                    {selectedEntity.type}
                  </span>
                  <span className="bg-red-50 text-red-700 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border border-red-200">
                    RISK: {selectedEntity.riskScore}/100
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-mono truncate max-w-[210px]" title={selectedEntity.label}>
                  {selectedEntity.label}
                </h4>
                {selectedEntity.subLabel && (
                  <p className="text-[10px] text-slate-500 font-sans">{selectedEntity.subLabel}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Entity Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">TOTAL DEFRAUDED</span>
                <span className="font-extrabold text-red-600">{selectedEntity.financialLoss || "₹2,10,000"}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">LINKED FIR CASES</span>
                <span className="font-extrabold text-[#005A9C]">{selectedEntity.complaintCount || 1} Reports</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block">AFFILIATED ENTITY / HOST</span>
                <span className="text-slate-800 font-bold">{selectedEntity.provider}</span>
              </div>
              {selectedEntity.location && (
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] text-slate-500 block">LOCATION / REGISTRATION</span>
                  <span className="text-slate-800 font-bold">{selectedEntity.location}</span>
                </div>
              )}
            </div>

            {actionFeedback && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-800 font-bold font-sans">
                {actionFeedback}
              </div>
            )}

            {/* Tactical Actions */}
            <div className="pt-1 space-y-1.5">
              <p className="text-[10px] text-slate-500 font-bold uppercase font-mono">DISPATCH IMMEDIATE INTERVENTION:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {selectedEntity.type === "BANK" || selectedEntity.type === "UPI" ? (
                  <button
                    onClick={() => handleAction("FREEZE")}
                    className="w-full bg-[#005A9C] hover:bg-[#00487D] text-white text-[10px] font-bold py-1.5 px-2 rounded-lg shadow-sm cursor-pointer font-mono flex items-center justify-center space-x-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>FREEZE VPA/AC</span>
                  </button>
                ) : selectedEntity.type === "MOBILE" ? (
                  <button
                    onClick={() => handleAction("TELCO")}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg shadow-sm cursor-pointer font-mono flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>BLOCK SIM</span>
                  </button>
                ) : selectedEntity.type === "DOMAIN" ? (
                  <button
                    onClick={() => handleAction("TAKEDOWN")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg shadow-sm cursor-pointer font-mono flex items-center justify-center space-x-1"
                  >
                    <Globe className="w-3 h-3" />
                    <span>TAKEDOWN</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction("FLAG")}
                    className="w-full bg-[#005A9C] hover:bg-[#00487D] text-white text-[10px] font-bold py-1.5 px-2 rounded-lg shadow-sm cursor-pointer font-mono"
                  >
                    CASE ACTION
                  </button>
                )}

                <button
                  onClick={() => handleAction("MONITOR")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-2 rounded-lg border border-slate-300 cursor-pointer font-mono"
                >
                  TRACK ENTITY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="mt-3 text-[10px] text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between font-mono shrink-0">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CLICK ANY NODE TO INSPECT FORENSIC EVIDENCE & EXECUTE TAKEDOWN / FREEZE ORDERS</span>
        </span>
        <span className="text-[#005A9C] font-bold">TOPOLOGY: MULTI-LAYER MULE CASH-OUT RING</span>
      </div>
    </div>
  );
};
