"use client";

import React from "react";
import { Dna, AlertTriangle, Shield, Activity, Radio } from "lucide-react";

interface ThreatDNAProps {
  dna?: {
    threat?: string;
    category?: string;
    channel?: string;
    payment?: string;
    region?: string;
    growth?: string;
    cluster_size?: number;
    peak_time?: string;
    anomaly?: number;
    confidence?: string;
    status?: string;
  };
  onReviewClick?: () => void;
}

export const ThreatDNACard: React.FC<ThreatDNAProps> = ({ dna, onReviewClick }) => {
  const data = dna || {
    threat: "UPI Impersonation",
    category: "Financial Fraud",
    channel: "Messaging / WhatsApp",
    payment: "UPI QR Collect Request",
    region: "Tamil Nadu (Chennai & Coimbatore)",
    growth: "+47%",
    cluster_size: 176,
    peak_time: "18:00–22:00 IST",
    anomaly: 0.91,
    confidence: "86%",
    status: "REQUIRES REVIEW"
  };

  return (
    <div className="bg-[#0D0D0F] border border-[#242428] rounded-xl p-4 glass-obsidian-crimson relative overflow-hidden shadow-2xl font-mono">
      {/* Background DNA watermark accent */}
      <Dna className="absolute -right-6 -bottom-6 w-36 h-36 text-[#FF304F]/5 pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/40 crimson-pulse">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#F5F2EA] tracking-wider uppercase font-mono">
              THREAT DNA FINGERPRINT
            </h3>
            <p className="text-[10px] text-[#8B5CF6] font-mono">PATTERN SIGNATURE // ID #DNA-8821</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
          {data.status}
        </span>
      </div>

      {/* Tactical Fingerprint Hexagon Visualizer */}
      <div className="relative w-full h-24 mb-3 bg-[#090909] rounded-lg border border-[#242428] flex items-center justify-around px-4 overflow-hidden">
        {/* Animated Radial Waves */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,48,79,0.1),transparent_70%)] pointer-events-none" />
        
        <div className="text-center z-10">
          <span className="text-[9px] text-[#A6A19A] block">ANOMALY SCORE</span>
          <span className="text-lg font-black text-[#FF304F]">{data.anomaly}</span>
        </div>

        <div className="w-16 h-16 rounded-full border border-[#8B5CF6]/40 flex items-center justify-center relative crimson-pulse z-10 bg-[#0D0D0F]">
          <Radio className="w-7 h-7 text-[#8B5CF6] animate-pulse" />
        </div>

        <div className="text-center z-10">
          <span className="text-[9px] text-[#A6A19A] block">AI CONFIDENCE</span>
          <span className="text-lg font-black text-[#8B5CF6]">{data.confidence}</span>
        </div>
      </div>

      {/* Signature DNA Grid Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-[#121214] p-2.5 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">PRIMARY THREAT</span>
          <span className="font-bold text-[#FF304F] truncate block">{data.threat}</span>
        </div>

        <div className="bg-[#121214] p-2.5 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">CATEGORY</span>
          <span className="font-bold text-[#F5F2EA] truncate block">{data.category}</span>
        </div>

        <div className="bg-[#121214] p-2.5 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">PAYMENT VECTOR</span>
          <span className="font-bold text-[#F59E0B] truncate block">{data.payment}</span>
        </div>

        <div className="bg-[#121214] p-2.5 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">GROWTH RATE</span>
          <span className="font-bold text-[#FF304F] truncate block">{data.growth}</span>
        </div>

        <div className="bg-[#121214] p-2.5 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">PRIMARY REGION</span>
          <span className="font-bold text-[#F5F2EA] truncate block">{data.region}</span>
        </div>

        <div className="bg-[#121214] p-2.5 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">CLUSTER SIZE</span>
          <span className="font-bold text-[#8B5CF6] truncate block">{data.cluster_size} Cases</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#121214] p-2.5 rounded-lg border border-[#242428]">
        <div className="text-xs">
          <span className="text-[9px] text-[#A6A19A] block">PEAK ACTIVITY</span>
          <span className="font-bold text-[#F5F2EA]">{data.peak_time}</span>
        </div>

        <button
          onClick={onReviewClick}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FF304F] hover:bg-[#E51C46] text-[#090909] transition-all shadow-md shadow-[#FF304F]/20"
        >
          REVIEW INTELLIGENCE
        </button>
      </div>
    </div>
  );
};
