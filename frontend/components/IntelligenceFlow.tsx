"use client";

import React, { useState } from "react";
import { Search, GitFork, TrendingUp, HelpCircle, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  icon: any;
  colorTheme: "CRIMSON" | "VIOLET" | "AMBER" | "IVORY";
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  evidence: string;
  actionLabel: string;
}

const STAGES: Stage[] = [
  {
    id: "DETECTED",
    name: "DETECTED",
    title: "Complaint Anomaly Detected",
    subtitle: "Volume +47% above baseline in Chennai",
    icon: Search,
    colorTheme: "CRIMSON",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    evidence: "IsolationForest detected 176 complaints matching abnormal QR collect refund pattern within 72h window.",
    actionLabel: "View Complaint Records"
  },
  {
    id: "CORRELATED",
    name: "CORRELATED",
    title: "Threat Cluster Formed",
    subtitle: "74 complaints show potential similarity",
    icon: GitFork,
    colorTheme: "CRIMSON",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    evidence: "DBSCAN grouped shared UPI handles (refund.pay882@ybl) and mobile numbers into Potential Threat Cluster #TC-IN-2026-1042.",
    actionLabel: "Inspect Threat Cluster"
  },
  {
    id: "PREDICTED",
    name: "PREDICTED",
    title: "Activity Escalation Forecast",
    subtitle: "7-day activity expected to reach 547 cases",
    icon: TrendingUp,
    colorTheme: "VIOLET",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    evidence: "Holt-Winters time-series forecaster predicts continuation from 428 to 547 complaints (505–590 range) at 86% confidence.",
    actionLabel: "View Predictive Forecast"
  },
  {
    id: "EXPLAINED",
    name: "EXPLAINED",
    title: "Why This Risk?",
    subtitle: "Top contributing factor: Growth (+27%)",
    icon: HelpCircle,
    colorTheme: "VIOLET",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    evidence: "Explainable AI (XAI) feature attribution breakdown: Complaint Growth +27%, Anomaly +22%, Cluster Expansion +20%, Regional Concentration +18%.",
    actionLabel: "Open Explainability SHAP Breakdown"
  },
  {
    id: "WARNED",
    name: "WARNED",
    title: "High-Severity Warning Issued",
    subtitle: "Early Warning #EW-1042 Dispatched",
    icon: AlertTriangle,
    colorTheme: "AMBER",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    evidence: "Early Warning Engine generated High Priority Alert #EW-1042 for targeted police jurisdictions across Tamil Nadu.",
    actionLabel: "Review Early Warning"
  },
  {
    id: "REVIEWED",
    name: "REVIEWED",
    title: "Officer Review & Case Creation",
    subtitle: "Investigation #CASE-2026-8841 Opened",
    icon: CheckCircle2,
    colorTheme: "IVORY",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
    evidence: "Authorised Cyber Command Officer confirmed analytical findings and initiated active formal investigation workspace.",
    actionLabel: "Open Investigation Workspace"
  }
];

export const IntelligenceFlow: React.FC<{ onStageClick?: (stageId: string) => void }> = ({ onStageClick }) => {
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[0]);

  return (
    <div className="bg-white border border-slate-200 border-t-4 border-t-[#005A9C] rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 font-mono">
        <h3 className="text-xs font-bold text-[#005A9C] tracking-widest uppercase flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#005A9C] animate-pulse" />
          <span>CINEMATIC INTELLIGENCE PIPELINE</span>
        </h3>
        <span className="text-[10px] text-[#005A9C] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-semibold">
          CURRENT SIGNAL STAGE: <span className="font-bold text-[#005A9C]">{selectedStage.name}</span>
        </span>
      </div>

      {/* Pipeline Progression Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4 font-mono">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage.id === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => {
                setSelectedStage(stage);
                if (onStageClick) onStageClick(stage.id);
              }}
              className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? "bg-blue-50 border-2 border-[#005A9C] shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-slate-500">{idx + 1}. {stage.name}</span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#005A9C]" : "text-slate-400"}`} />
              </div>
              <p className="text-[11px] font-bold text-slate-900 truncate">{stage.title}</p>
            </button>
          );
        })}
      </div>

      {/* Stage Detail & Evidence Box */}
      <div className="bg-blue-50/50 border border-blue-200 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedStage.badgeBg} ${selectedStage.badgeText} border ${selectedStage.badgeBorder}`}>
              {selectedStage.name} EVIDENCE
            </span>
            <span className="font-bold text-slate-900">{selectedStage.title}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{selectedStage.evidence}</p>
        </div>

        <button
          onClick={() => {
            if (onStageClick) onStageClick(selectedStage.id);
          }}
          className="shrink-0 px-4 py-2 bg-[#005A9C] hover:bg-[#00487D] text-white text-[11px] font-bold rounded-lg tracking-wider flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
        >
          <span>{selectedStage.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
