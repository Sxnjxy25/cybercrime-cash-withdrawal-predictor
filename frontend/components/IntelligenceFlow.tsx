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
    badgeBg: "bg-[#FF304F]/20",
    badgeText: "text-[#FF304F]",
    badgeBorder: "border-[#FF304F]/40",
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
    badgeBg: "bg-[#FF304F]/15",
    badgeText: "text-[#FF304F]",
    badgeBorder: "border-[#FF304F]/30",
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
    badgeBg: "bg-[#8B5CF6]/20",
    badgeText: "text-[#8B5CF6]",
    badgeBorder: "border-[#8B5CF6]/40",
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
    badgeBg: "bg-[#8B5CF6]/15",
    badgeText: "text-[#8B5CF6]",
    badgeBorder: "border-[#8B5CF6]/30",
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
    badgeBg: "bg-[#F59E0B]/20",
    badgeText: "text-[#F59E0B]",
    badgeBorder: "border-[#F59E0B]/40",
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
    badgeBg: "bg-[#F5F2EA]/20",
    badgeText: "text-[#F5F2EA]",
    badgeBorder: "border-[#F5F2EA]/40",
    evidence: "Authorised Cyber Command Officer confirmed analytical findings and initiated active formal investigation workspace.",
    actionLabel: "Open Investigation Workspace"
  }
];

export const IntelligenceFlow: React.FC<{ onStageClick?: (stageId: string) => void }> = ({ onStageClick }) => {
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[0]);

  return (
    <div className="bg-[#0D0D0F] border border-[#242428] rounded-xl p-4 glass-obsidian-crimson shadow-2xl">
      <div className="flex items-center justify-between mb-3 font-mono">
        <h3 className="text-xs font-bold text-[#FF304F] tracking-widest uppercase flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#FF304F] crimson-pulse" />
          <span>CINEMATIC INTELLIGENCE PIPELINE</span>
        </h3>
        <span className="text-[10px] text-[#A6A19A] bg-[#121214] px-2.5 py-0.5 rounded border border-[#242428]">
          CURRENT SIGNAL STAGE: <span className="font-bold text-[#F5F2EA]">{selectedStage.name}</span>
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
              className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? `${stage.badgeBg} ${stage.badgeBorder} shadow-lg scale-[1.02]`
                  : "bg-[#121214] border-[#1F1F23] hover:border-[#242428] hover:bg-[#171719]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-[#A6A19A]">{idx + 1}. {stage.name}</span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? stage.badgeText : "text-[#706C66]"}`} />
              </div>
              <p className="text-[11px] font-bold text-[#F5F2EA] truncate tracking-tight">{stage.title}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Evidence Details Panel */}
      <div className="bg-[#090909] border border-[#242428] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedStage.badgeBg} ${selectedStage.badgeText} border ${selectedStage.badgeBorder}`}>
              {selectedStage.name} EVIDENCE
            </span>
            <span className="text-xs font-bold text-[#F5F2EA]">{selectedStage.title}</span>
          </div>
          <p className="text-xs text-[#A6A19A] max-w-3xl leading-relaxed">
            {selectedStage.evidence}
          </p>
        </div>

        <button
          onClick={() => onStageClick && onStageClick(selectedStage.id)}
          className={`shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-lg ${selectedStage.badgeBg} ${selectedStage.badgeText} border ${selectedStage.badgeBorder} hover:brightness-125 transition-all text-center flex items-center space-x-1`}
        >
          <span>{selectedStage.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
