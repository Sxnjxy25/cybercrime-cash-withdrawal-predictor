"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { IntelligenceFlow } from "@/components/IntelligenceFlow";
import { GlobalThreatCore } from "@/components/GlobalThreatCore";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { IndiaRiskMap } from "@/components/IndiaRiskMap";
import { ThreatDNACard } from "@/components/ThreatDNACard";
import { PredictionHorizon } from "@/components/PredictionHorizon";
import { EntityGraph } from "@/components/EntityGraph";
import { ExplainableDrawer } from "@/components/ExplainableDrawer";
import { CopilotDrawer } from "@/components/CopilotDrawer";
import { api } from "@/lib/api";
import {
  ShieldAlert, TrendingUp, AlertTriangle, Briefcase, Activity,
  Users, Lock, FileCode2, Cpu, FileSpreadsheet, CheckCircle2, Filter, Zap
} from "lucide-react";

export default function CommandCenter() {
  const [activeSection, setActiveSection] = useState("COMMAND_CENTER");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [regionalLocs, setRegionalLocs] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any>(null);
  const [threatClusters, setThreatClusters] = useState<any[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const [isBackendUnreachable, setIsBackendUnreachable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const s = await api.getDashboardSummary();
    if (s) {
      setSummaryData(s);
      setIsBackendUnreachable(false);
    } else {
      setIsBackendUnreachable(true);
    }

    const locs = await api.getRegionalRisk();
    if (locs) setRegionalLocs(locs);

    const fc = await api.getForecasts("7d");
    if (fc) setForecastData(fc);

    const tc = await api.getThreatClusters();
    if (tc) setThreatClusters(tc);

    const ew = await api.getEarlyWarnings();
    if (ew) setEarlyWarnings(ew);

    const inv = await api.getInvestigations();
    if (inv) setInvestigations(inv);

    const logs = await api.getAuditLogs();
    if (logs) setAuditLogs(logs);

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleSimulateDemo = async () => {
    setIsDemoActive(true);
    await api.simulateEmergingThreat();
    await loadData();
  };

  const handleResetDemo = async () => {
    setIsDemoActive(false);
    await api.resetDemo();
    await loadData();
  };

  const handleWarningAction = async (id: string, action: string) => {
    await api.updateWarningAction(id, action);
    if (action === "INVESTIGATE") {
      await api.createInvestigation({
        title: "Investigation into Simulated UPI Impersonation Spike",
        risk_score: 94.0,
        lead_officer: "Insp. Rajesh Kumar",
        summary: "Officer created investigation case from Early Warning alert."
      });
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F2EA] flex flex-col font-mono">
      {/* Header Bar */}
      <Navbar
        onSimulateDemo={handleSimulateDemo}
        onResetDemo={handleResetDemo}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        isDemoActive={isDemoActive}
      />

      <div className="flex flex-1">
        {/* Tactical Sidebar */}
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {isBackendUnreachable && (
            <div className="p-8 rounded-xl bg-[#0D0D0F] border border-[#FF304F] glass-obsidian-crimson text-center space-y-4 my-4">
              <AlertTriangle className="w-12 h-12 text-[#FF304F] mx-auto animate-pulse" />
              <h2 className="text-xl font-black text-[#FF304F] tracking-wider uppercase">
                INTELLIGENCE SERVICE UNAVAILABLE
              </h2>
              <p className="text-[#A6A19A] text-sm max-w-md mx-auto">
                The predictive intelligence backend is currently unreachable.
              </p>
              <button
                onClick={loadData}
                className="px-6 py-2 bg-[#FF304F] hover:bg-[#E51C46] text-white font-bold rounded-lg tracking-wider text-xs transition-all cursor-pointer shadow-lg shadow-[#FF304F]/30 uppercase"
              >
                [ RETRY ]
              </button>
            </div>
          )}

          {/* Flagship Command Center Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0F] p-4 rounded-xl border border-[#242428] glass-obsidian-crimson">

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF304F]/20 text-[#FF304F] border border-[#FF304F]/40 crimson-pulse">
                  OBSIDIAN INTELLIGENCE v4.0
                </span>
                <h1 className="text-xl font-black tracking-widest text-[#F5F2EA] uppercase font-mono">
                  NATIONAL CYBER THREAT COMMAND CENTER
                </h1>
              </div>
              <p className="text-xs text-[#A6A19A] mt-1">
                PREDICTIVE CYBERCRIME CORRELATION & ADVANCED EARLY-WARNING ENGINE
              </p>
            </div>

            {/* Tactical Stat Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="bg-[#121214] px-3.5 py-1.5 rounded-lg border border-[#242428]">
                <span className="text-[#A6A19A] block text-[9px]">INGESTED COMPLAINTS</span>
                <span className="font-extrabold text-[#F5F2EA] text-sm">
                  {summaryData?.kpi_metrics?.total_complaints || 1000}
                </span>
              </div>
              <div className="bg-[#121214] px-3.5 py-1.5 rounded-lg border border-[#242428]">
                <span className="text-[#A6A19A] block text-[9px]">FINANCIAL LOSS IMPAIRMENT</span>
                <span className="font-extrabold text-[#F59E0B] text-sm">
                  ₹{((summaryData?.kpi_metrics?.total_financial_loss || 14500000) / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="bg-[#121214] px-3.5 py-1.5 rounded-lg border border-[#242428]">
                <span className="text-[#A6A19A] block text-[9px]">CRITICAL EARLY WARNINGS</span>
                <span className="font-extrabold text-[#FF304F] text-sm">
                  {earlyWarnings.length || 2}
                </span>
              </div>
            </div>
          </div>

          {/* Cinematic 6-Stage Intelligence Flow Pipeline */}
          <IntelligenceFlow
            onStageClick={(stageId) => {
              if (stageId === "EXPLAINED") setIsExplainOpen(true);
              if (stageId === "WARNED") setActiveSection("EARLY_WARNINGS");
              if (stageId === "REVIEWED") setActiveSection("INVESTIGATION_WORKSPACE");
            }}
          />

          {/* Command Center Main Layout */}
          {activeSection === "COMMAND_CENTER" && (
            <div className="space-y-6">
              {/* Asymmetric Row 1: 3D Global Threat Core + 3D Risk Score Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GlobalThreatCore />
                </div>
                <div>
                  <RiskScoreGauge score={87} level="CRITICAL RISK" trend="+14.2% THIS WEEK" />
                </div>
              </div>

              {/* Asymmetric Row 2: India Predictive Risk Map + Threat DNA & Prediction Horizon */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <IndiaRiskMap
                    locations={regionalLocs}
                    onSelectDistrict={(loc) => {
                      setIsExplainOpen(true);
                    }}
                  />
                </div>
                <div className="space-y-4">
                  {/* Signature Threat DNA Fingerprint */}
                  <ThreatDNACard
                    dna={threatClusters[0]?.dna_metrics}
                    onReviewClick={() => setIsExplainOpen(true)}
                  />

                  {/* Prediction Horizon Timeline */}
                  <PredictionHorizon data={forecastData} />
                </div>
              </div>

              {/* Row 3: Early Warnings Signals & 3D Entity Relationship Topology */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Early Warnings Signals */}
                <div className="bg-[#0D0D0F] border border-[#242428] rounded-xl p-4 glass-obsidian-crimson shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-[#FF304F]" />
                      <h3 className="text-xs font-bold text-[#F5F2EA] uppercase font-mono">
                        LIVE EARLY INTELLIGENCE SIGNALS
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-[#FF304F] font-bold bg-[#FF304F]/20 px-2 py-0.5 rounded border border-[#FF304F]/40 crimson-pulse">
                      ACTION REQUIRED
                    </span>
                  </div>

                  <div className="space-y-3">
                    {earlyWarnings.map((w) => (
                      <div key={w.id} className="bg-[#090909] p-3 rounded-lg border border-[#242428] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono font-bold text-[#FF304F]">{w.warning_code}</span>
                            <span className="font-bold text-[#F5F2EA]">{w.threat_name}</span>
                          </div>
                          <p className="text-[11px] text-[#A6A19A] leading-relaxed">{w.signal_summary}</p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleWarningAction(w.id, "ACKNOWLEDGE")}
                            className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#171719] hover:bg-[#242428] text-[#A6A19A]"
                          >
                            ACKNOWLEDGE
                          </button>
                          <button
                            onClick={() => handleWarningAction(w.id, "INVESTIGATE")}
                            className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#FF304F] hover:bg-[#E51C46] text-[#090909] shadow-sm"
                          >
                            REVIEW INTELLIGENCE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3D Entity Relationship Topology Graph */}
                <EntityGraph />
              </div>
            </div>
          )}

          {/* Section: Cyber Risk Map Full View */}
          {activeSection === "CYBER_RISK_MAP" && (
            <IndiaRiskMap locations={regionalLocs} />
          )}

          {/* Section: Entity Intelligence Full View */}
          {activeSection === "ENTITY_INTELLIGENCE" && (
            <EntityGraph />
          )}

          {/* Section: Predictive Intelligence Full View */}
          {activeSection === "PREDICTIVE_INTELLIGENCE" && (
            <PredictionHorizon data={forecastData} />
          )}

          {/* Section: Early Warnings Full View */}
          {activeSection === "EARLY_WARNINGS" && (
            <div className="bg-[#0D0D0F] p-5 rounded-xl border border-[#242428] space-y-4">
              <h2 className="text-base font-extrabold text-[#F5F2EA] uppercase font-mono">EARLY WARNING ENGINE WORKSPACE</h2>
              <div className="space-y-3">
                {earlyWarnings.map((w) => (
                  <div key={w.id} className="bg-[#090909] p-4 rounded-xl border border-[#242428] flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-mono font-bold text-[#FF304F] bg-[#FF304F]/20 px-2 py-0.5 rounded border border-[#FF304F]/30">{w.warning_code}</span>
                        <span className="text-sm font-bold text-[#F5F2EA]">{w.threat_name}</span>
                        <span className="text-[10px] font-mono text-[#8B5CF6]">{w.region}</span>
                      </div>
                      <p className="text-[#A6A19A]">{w.signal_summary}</p>
                    </div>
                    <button
                      onClick={() => handleWarningAction(w.id, "INVESTIGATE")}
                      className="px-3.5 py-1.5 bg-[#FF304F] hover:bg-[#E51C46] text-[#090909] font-bold rounded-lg"
                    >
                      OPEN CASE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Investigation Workspace Full View */}
          {activeSection === "INVESTIGATION_WORKSPACE" && (
            <div className="bg-[#0D0D0F] p-5 rounded-xl border border-[#242428] space-y-4 font-mono">
              <h2 className="text-base font-extrabold text-[#F5F2EA] uppercase">INVESTIGATION WORKSPACE</h2>
              <div className="space-y-3">
                {investigations.map((inv) => (
                  <div key={inv.id} className="bg-[#090909] p-4 rounded-xl border border-[#242428] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#8B5CF6] text-sm">{inv.case_number}: {inv.title}</span>
                      <span className="bg-[#F59E0B]/20 text-[#F59E0B] font-mono px-2 py-0.5 rounded border border-[#F59E0B]/30">{inv.status}</span>
                    </div>
                    <p className="text-[#A6A19A]">{inv.summary}</p>
                    <div className="text-[11px] text-[#706C66] font-mono">Lead Officer: {inv.lead_officer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Audit Trail Full View */}
          {activeSection === "AUDIT_TRAIL" && (
            <div className="bg-[#0D0D0F] p-5 rounded-xl border border-[#242428] space-y-4 font-mono">
              <h2 className="text-base font-extrabold text-[#F5F2EA] uppercase">SECURITY & AUDIT TRAIL LOGS</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121214] text-[#A6A19A] border-b border-[#242428]">
                    <tr>
                      <th className="p-2.5">TIMESTAMP</th>
                      <th className="p-2.5">USER</th>
                      <th className="p-2.5">ROLE</th>
                      <th className="p-2.5">ACTION</th>
                      <th className="p-2.5">RESOURCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242428]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#121214]">
                        <td className="p-2.5 text-[#A6A19A]">{log.timestamp}</td>
                        <td className="p-2.5 text-[#F5F2EA]">{log.username}</td>
                        <td className="p-2.5 text-[#8B5CF6]">{log.role}</td>
                        <td className="p-2.5 text-[#F59E0B]">{log.action}</td>
                        <td className="p-2.5 text-[#A6A19A]">{log.resource}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drawers */}
      <ExplainableDrawer isOpen={isExplainOpen} onClose={() => setIsExplainOpen(false)} />
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
