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
    <div className="bg-white border border-slate-200 border-t-4 border-t-[#005A9C] rounded-xl p-4 relative overflow-hidden shadow-sm font-sans">
      {/* Background DNA watermark accent */}
      <Dna className="absolute -right-6 -bottom-6 w-36 h-36 text-blue-50 pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-[#005A9C] border border-blue-200">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#005A9C] tracking-wider uppercase font-mono">
              THREAT DNA FINGERPRINT
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">PATTERN SIGNATURE // ID #DNA-8821</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {data.status}
        </span>
      </div>

      {/* Tactical Fingerprint Hexagon Visualizer */}
      <div className="relative w-full h-24 mb-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-around px-4 overflow-hidden font-mono">
        <div className="text-center z-10">
          <span className="text-[9px] text-slate-500 block font-bold">ANOMALY SCORE</span>
          <span className="text-lg font-black text-red-600">{data.anomaly}</span>
        </div>

        <div className="w-16 h-16 rounded-full border border-purple-200 flex items-center justify-center relative z-10 bg-white shadow-sm">
          <Radio className="w-7 h-7 text-purple-600 animate-pulse" />
        </div>

        <div className="text-center z-10">
          <span className="text-[9px] text-slate-500 block font-bold">AI CONFIDENCE</span>
          <span className="text-lg font-black text-purple-700">{data.confidence}</span>
        </div>
      </div>

      {/* Signature DNA Grid Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-bold">PRIMARY THREAT</span>
          <span className="font-bold text-red-700 truncate block">{data.threat}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-bold">CATEGORY</span>
          <span className="font-bold text-slate-900 truncate block">{data.category}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-bold">PAYMENT VECTOR</span>
          <span className="font-bold text-amber-800 truncate block">{data.payment}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-bold">GROWTH RATE</span>
          <span className="font-bold text-red-700">{data.growth}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-bold">PRIMARY REGION</span>
          <span className="font-bold text-slate-800 truncate block">{data.region}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[9px] text-slate-500 block font-bold">CLUSTER SIZE</span>
          <span className="font-bold text-purple-700">{data.cluster_size} Cases</span>
        </div>
      </div>

      {/* Peak Timing & Action */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-mono">
        <div>
          <span className="text-[9px] text-slate-500 block">PEAK ACTIVITY</span>
          <span className="font-bold text-slate-900">{data.peak_time}</span>
        </div>

        <button
          onClick={onReviewClick}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all cursor-pointer"
        >
          REVIEW INTELLIGENCE
        </button>
      </div>
    </div>
  );
};
