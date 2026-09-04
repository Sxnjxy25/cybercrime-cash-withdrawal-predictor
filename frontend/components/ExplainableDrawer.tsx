"use client";

import React from "react";
import { HelpCircle, X, ShieldAlert, BarChart2 } from "lucide-react";

interface ExplainableProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainableDrawer: React.FC<ExplainableProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const factors = [
    { factor: "Complaint Growth", pct: 27, impact: "+27%", color: "bg-[#FF304F]", desc: "District complaint volume grew 47% above baseline over 72h window." },
    { factor: "Regional Concentration", pct: 18, impact: "+18%", color: "bg-[#F59E0B]", desc: "Highly dense localized concentration in Chennai Central jurisdiction." },
    { factor: "Anomaly Score", pct: 22, impact: "+22%", color: "bg-[#8B5CF6]", desc: "IsolationForest detected abnormal spike in financial loss and collect QR requests." },
    { factor: "Threat Cluster Expansion", pct: 20, impact: "+20%", color: "bg-[#8B5CF6]", desc: "DBSCAN identified 74 linked complaints with common UPI identifiers." },
    { factor: "Historical Recurrence", pct: 13, impact: "+13%", color: "bg-[#F5F2EA]", desc: "Recurrent seasonal peak observed during evening hours (18:00–22:00)." }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#090909]/80 backdrop-blur-sm flex justify-end font-mono">
      <div className="w-full max-w-lg bg-[#0D0D0F] border-l border-[#242428] p-6 h-full overflow-y-auto shadow-2xl flex flex-col justify-between glass-obsidian-crimson">
        <div>
          <div className="flex items-center justify-between border-b border-[#1F1F23] pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/40">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#F5F2EA] tracking-wide uppercase">WHY THIS RISK?</h2>
                <p className="text-[10px] text-[#8B5CF6] font-mono">EXPLAINABLE AI (XAI) SHAP ATTRIBUTION</p>
              </div>
            </div>

            <button onClick={onClose} className="text-[#A6A19A] hover:text-[#F5F2EA] p-1 rounded-lg hover:bg-[#171719]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Attribution Summary */}
          <div className="bg-[#121214] border border-[#242428] rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#A6A19A]">HYBRID RISK INDEX</span>
              <span className="text-sm font-extrabold text-[#FF304F] font-mono">87.0 / 100 (CRITICAL)</span>
            </div>
            <p className="text-xs text-[#A6A19A] leading-relaxed">
              Calculated using CyberPredict Hybrid XAI Engine v2.1 combining weighted SHAP feature contributions, IsolationForest anomaly scores, and DBSCAN cluster growth metrics.
            </p>
          </div>

          {/* SHAP Factor Breakdown Bars */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xs font-bold text-[#F5F2EA] uppercase">FACTOR CONTRIBUTIONS</h3>

            {factors.map((item, idx) => (
              <div key={idx} className="bg-[#090909] p-3.5 rounded-xl border border-[#242428]">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#F5F2EA]">{item.factor}</span>
                  <span className="text-[#8B5CF6]">{item.impact}</span>
                </div>
                <div className="w-full h-2.5 bg-[#171719] rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct * 3}%` }} />
                </div>
                <p className="text-[11px] text-[#A6A19A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#1F1F23]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#FF304F] hover:bg-[#E51C46] text-[#090909] shadow-lg shadow-[#FF304F]/20 transition-all"
          >
            CONFIRM & ACKNOWLEDGE EXPLANATION
          </button>
        </div>
      </div>
    </div>
  );
};
