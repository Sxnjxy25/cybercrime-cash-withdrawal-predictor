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
    { factor: "Complaint Growth", pct: 27, impact: "+27%", color: "bg-red-600", desc: "District complaint volume grew 47% above baseline over 72h window." },
    { factor: "Regional Concentration", pct: 18, impact: "+18%", color: "bg-amber-600", desc: "Highly dense localized concentration in Chennai Central jurisdiction." },
    { factor: "Anomaly Score", pct: 22, impact: "+22%", color: "bg-purple-600", desc: "IsolationForest detected abnormal spike in financial loss and collect QR requests." },
    { factor: "Threat Cluster Expansion", pct: 20, impact: "+20%", color: "bg-purple-600", desc: "DBSCAN identified 74 linked complaints with common UPI identifiers." },
    { factor: "Historical Recurrence", pct: 13, impact: "+13%", color: "bg-[#005A9C]", desc: "Recurrent seasonal peak observed during evening hours (18:00–22:00)." }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end font-sans">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 p-6 h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-wide uppercase font-mono">WHY THIS RISK?</h2>
                <p className="text-[10px] text-purple-700 font-mono">EXPLAINABLE AI (XAI) SHAP ATTRIBUTION</p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Attribution Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-500">HYBRID RISK INDEX</span>
              <span className="text-sm font-extrabold text-red-600 font-mono">87.0 / 100 (CRITICAL)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculated using CyberPredict Hybrid XAI Engine v2.1 combining weighted SHAP feature contributions, IsolationForest anomaly scores, and DBSCAN cluster growth metrics.
            </p>
          </div>

          {/* SHAP Factor Breakdown Bars */}
          <div className="space-y-4 mb-6 font-sans">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">FACTOR CONTRIBUTIONS</h3>

            {factors.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5 font-mono">
                  <span className="text-slate-900">{item.factor}</span>
                  <span className="text-purple-700">{item.impact}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct * 3}%` }} />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 font-mono">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#005A9C] hover:bg-[#00487D] text-white shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            CONFIRM & ACKNOWLEDGE EXPLANATION
          </button>
        </div>
      </div>
    </div>
  );
};
