"use client";

import React, { useState, useEffect } from "react";
import { NcrpHeader } from "@/components/NcrpHeader";
import { NcrpFooter } from "@/components/NcrpFooter";
import { ComplaintStepper } from "@/components/ComplaintStepper";
import { ComplaintAcceptanceView } from "@/components/ComplaintAcceptanceView";
import { CitizenLoginView } from "@/components/CitizenLoginView";
import { FinancialFraudFormView } from "@/components/FinancialFraudFormView";
import { ComplaintWithdrawalModal } from "@/components/ComplaintWithdrawalModal";
import { AdminAuthModal } from "@/components/AdminAuthModal";
import { AdminComplaintLocationInspector } from "@/components/AdminComplaintLocationInspector";
import { ComplaintsListView } from "@/components/ComplaintsListView";
import { AlertsIncidentsView } from "@/components/AlertsIncidentsView";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { IndiaRiskMap } from "@/components/IndiaRiskMap";
import { EntityGraph } from "@/components/EntityGraph";
import { AdminSettingsView } from "@/components/AdminSettingsView";
import { ExplainableDrawer } from "@/components/ExplainableDrawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/api";
import { AlertTriangle, Sparkles, ArrowLeft, ArrowRight, Shield } from "lucide-react";

export default function FinancialFraudPortal() {
  // Navigation State strictly for Complaint Registration 1 -> 2 -> 3 + Intelligence Map
  const [currentView, setCurrentView] = useState<
    "ACCEPTANCE" | "CHECKLIST_LOGIN" | "CASHOUT_PREDICTOR" | "RISK_MAP_ANALYTICS"
  >("ACCEPTANCE");

  // Track completed steps strictly (no auto-completion or skipping)
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Admin Access Control & Specific Complaint Inspector State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminOfficer, setAdminOfficer] = useState<any>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [pendingComplaintCode, setPendingComplaintCode] = useState<string>("");
  const [targetComplaintLocation, setTargetComplaintLocation] = useState<any>(null);

  const [activeSection, setActiveSection] = useState("COMPLAINTS");
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

  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setDataLoadError(null);
    try {
      const [s, locs, fc, tc, ew, inv, logs] = await Promise.all([
        api.getDashboardSummary(),
        api.getRegionalRisk(),
        api.getForecasts("7d"),
        api.getThreatClusters(),
        api.getEarlyWarnings(),
        api.getInvestigations(),
        api.getAuditLogs()
      ]);

      if (s) setSummaryData(s);
      if (locs) setRegionalLocs(locs);
      if (fc) setForecastData(fc);
      if (tc) setThreatClusters(tc);
      if (ew) setEarlyWarnings(ew);
      if (inv) setInvestigations(inv);
      if (logs) setAuditLogs(logs);

      if (!s && !locs && !fc) {
        setDataLoadError("Unable to establish live telemetry connection with central analytics server.");
      }
    } catch (err: any) {
      console.error("Dashboard telemetry sync error:", err);
      setDataLoadError(err?.message || "Dashboard telemetry connection timed out.");
    } finally {
      setIsLoading(false);
    }
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
        title: "Investigation into UPI Impersonation Syndicate",
        risk_score: 94.0,
        lead_officer: "Insp. Rajesh Kumar",
        summary: "Officer created investigation case from Early Warning alert."
      });
    }
    await loadData();
  };

  const getStepNumber = (): 1 | 2 | 3 => {
    if (currentView === "ACCEPTANCE") return 1;
    if (currentView === "CHECKLIST_LOGIN") return 2;
    return 3;
  };

  const handleStep1Accept = () => {
    if (!completedSteps.includes(1)) {
      setCompletedSteps((prev) => [...prev, 1]);
    }
    setCurrentView("CHECKLIST_LOGIN");
  };

  const handleStep2Submit = () => {
    if (!completedSteps.includes(2)) {
      setCompletedSteps((prev) => (prev.includes(1) ? [...prev, 2] : [1, 2]));
    }
    setCurrentView("CASHOUT_PREDICTOR");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      
      {/* Official Financial Cyber Fraud Portal Header */}
      <NcrpHeader
        currentView={currentView}
        isAdminAuthenticated={isAdminAuthenticated}
        adminOfficer={adminOfficer}
        onLogoutAdmin={() => {
          setIsAdminAuthenticated(false);
          setAdminOfficer(null);
          setPendingComplaintCode("");
          setCurrentView("ACCEPTANCE");
        }}
        onNavigate={(view: any) => {
          if (view === "WITHDRAW_MODAL") {
            setIsWithdrawModalOpen(true);
          } else if (view === "ACCEPTANCE") {
            setCurrentView("ACCEPTANCE");
          } else if (view === "ADMIN_LOGIN_GATE") {
            setIsAdminAuthModalOpen(true);
          } else if (view === "RISK_MAP_ANALYTICS") {
            if (isAdminAuthenticated) {
              setCurrentView("RISK_MAP_ANALYTICS");
            } else {
              setIsAdminAuthModalOpen(true);
            }
          } else {
            setCurrentView(view);
          }
        }}
      />

      {/* Sequential Stepper for the 3 Registration Steps with Strict Locks */}
      {currentView !== "RISK_MAP_ANALYTICS" && (
        <ComplaintStepper
          currentStep={getStepNumber()}
          completedSteps={completedSteps}
          onStepClick={(step) => {
            if (step === 1) setCurrentView("ACCEPTANCE");
            if (step === 2 && (completedSteps.includes(1) || currentView === "CASHOUT_PREDICTOR")) {
              setCurrentView("CHECKLIST_LOGIN");
            }
            if (step === 3 && completedSteps.includes(2)) {
              setCurrentView("CASHOUT_PREDICTOR");
            }
          }}
        />
      )}

      {/* STEP 1: TERMS & CONDITIONS */}
      {currentView === "ACCEPTANCE" && (
        <ComplaintAcceptanceView
          onAccept={handleStep1Accept}
        />
      )}

      {/* STEP 2: CITIZEN VERIFICATION & CHECKLIST */}
      {currentView === "CHECKLIST_LOGIN" && (
        <CitizenLoginView
          onSuccessLogin={handleStep2Submit}
          onBack={() => setCurrentView("ACCEPTANCE")}
        />
      )}

      {/* STEP 3: REPORT FRAUD & AI CASH-OUT PREDICTOR */}
      {currentView === "CASHOUT_PREDICTOR" && (
        <FinancialFraudFormView
          onBack={() => setCurrentView("CHECKLIST_LOGIN")}
          onOpenCommandCenter={(complaintCode?: string) => {
            if (complaintCode) setPendingComplaintCode(complaintCode);
            if (isAdminAuthenticated) {
              setCurrentView("RISK_MAP_ANALYTICS");
            } else {
              setIsAdminAuthModalOpen(true);
            }
          }}
        />
      )}

      {/* STEP 4: FINANCIAL THREAT INTELLIGENCE & NATIONAL RISK MAP (ADMIN ONLY) */}
      {currentView === "RISK_MAP_ANALYTICS" && (
        <div className="min-h-screen bg-[#F0F5FA] text-slate-900 flex flex-col font-sans">
          
          {/* Tactical Command Bar styled in official Government Blue */}
          <div className="bg-[#007ceb] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-md">
            <button
              onClick={() => setCurrentView("ACCEPTANCE")}
              className="flex items-center space-x-2 text-xs text-blue-100 hover:text-white font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-yellow-300" />
              <span>&lt; Back to Citizen Complaint Filing</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold bg-white/15 text-white border border-white/25 px-3 py-1 rounded flex items-center space-x-1.5 font-mono shadow-sm">
                <Shield className="w-3.5 h-3.5 text-yellow-300" />
                <span>ADMIN LAW ENFORCEMENT & COMPLAINT TRACKER</span>
              </span>
            </div>
          </div>

          <Navbar
            onSimulateDemo={handleSimulateDemo}
            onResetDemo={handleResetDemo}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            isDemoActive={isDemoActive}
          />

          <div className="flex flex-1">
            <Sidebar
              activeSection={activeSection}
              setActiveSection={(section) => {
                if (section === "REPORTS") {
                  setPendingComplaintCode("");
                  setTargetComplaintLocation(null);
                }
                setActiveSection(section);
              }}
            />

            <main className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Title Banner in Royal Government Blue */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#005A9C] to-[#007CEB] text-white p-5 rounded-xl shadow-md border border-blue-400/30">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-yellow-300 border border-white/30 font-mono tracking-wider">
                      ML CASHOUT FORECASTER
                    </span>
                    <h1 className="text-lg sm:text-xl font-black tracking-wide text-white uppercase font-sans">
                      NATIONAL FINANCIAL CYBER THREAT & RISK MAP PORTAL
                    </h1>
                  </div>
                  <p className="text-xs text-blue-100 mt-1 font-medium">
                    PREDICTIVE CYBERCRIME CORRELATION & ADVANCED CASH-OUT EARLY-WARNING ENGINE
                  </p>
                </div>

                {/* Telemetry KPI Pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/25 shadow-sm min-w-[170px]">
                    <span className="text-blue-100 block text-[9px] font-sans">INGESTED FINANCIAL COMPLAINTS</span>
                    {isLoading && !summaryData ? (
                      <div className="h-5 w-16 bg-white/30 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="font-black text-white text-base">
                        {summaryData?.kpi_metrics?.total_complaints || 10000}
                      </span>
                    )}
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/25 shadow-sm min-w-[150px]">
                    <span className="text-blue-100 block text-[9px] font-sans">TOTAL LOSS IMPAIRMENT</span>
                    {isLoading && !summaryData ? (
                      <div className="h-5 w-20 bg-white/30 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="font-black text-yellow-300 text-base">
                        ₹{((summaryData?.kpi_metrics?.total_financial_loss || 14500000) / 100000).toFixed(1)}L
                      </span>
                    )}
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/25 shadow-sm min-w-[130px]">
                    <span className="text-blue-100 block text-[9px] font-sans">ACTIVE EARLY WARNINGS</span>
                    {isLoading && !summaryData ? (
                      <div className="h-5 w-12 bg-white/30 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="font-black text-red-200 text-base">
                        {earlyWarnings.length || 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Stream Disconnect Warning Banner */}
              {dataLoadError && (
                <ErrorState
                  compact
                  title="Telemetry Disconnected"
                  message={dataLoadError}
                  onRetry={loadData}
                  retryLabel="Reconnect & Retry"
                />
              )}

              {activeSection === "ALERTS_INCIDENTS" && (
                <ErrorBoundary moduleName="Automated Alerts & Telemetry Incidents">
                  <AlertsIncidentsView adminUser={adminOfficer} />
                </ErrorBoundary>
              )}

              {activeSection === "COMPLAINTS" && (
                <ErrorBoundary moduleName="Complaints Repository">
                  <ComplaintsListView
                    onSelectComplaint={(code, data) => {
                      setPendingComplaintCode(code);
                      if (data?.location) {
                        setTargetComplaintLocation(data);
                      }
                      setActiveSection("REPORTS");
                    }}
                  />
                </ErrorBoundary>
              )}

              {(activeSection === "REPORTS" || activeSection === "COMPLAINT_INTELLIGENCE") && (
                <ErrorBoundary moduleName="Forensic Dossier & Location Inspector">
                  <div className="space-y-6 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <button
                        onClick={() => setActiveSection("COMPLAINTS")}
                        className="flex items-center space-x-2 text-xs font-bold text-[#005A9C] hover:text-[#00487D] transition-colors cursor-pointer bg-blue-50/70 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg border border-blue-200"
                      >
                        <ArrowLeft className="w-4 h-4 text-[#005A9C]" />
                        <span>&larr; Back to Complaints Database</span>
                      </button>

                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-[10px] text-slate-500 font-bold">PREDICTED FORENSIC DOSSIER:</span>
                        {pendingComplaintCode ? (
                          <span className="bg-red-50 text-red-700 font-black text-xs px-2.5 py-1 rounded border border-red-200">
                            #{pendingComplaintCode}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 font-bold text-xs px-2.5 py-1 rounded border border-slate-200">
                            NO CASE SELECTED
                          </span>
                        )}
                      </div>
                    </div>

                    <AdminComplaintLocationInspector
                      adminUser={adminOfficer}
                      initialComplaintCode={pendingComplaintCode}
                      onSelectComplaintLocation={(locData) => setTargetComplaintLocation(locData)}
                      onNavigateToComplaints={() => setActiveSection("COMPLAINTS")}
                      onLogoutAdmin={() => {
                        setIsAdminAuthenticated(false);
                        setAdminOfficer(null);
                        setCurrentView("ACCEPTANCE");
                      }}
                    />
                    <IndiaRiskMap
                      locations={regionalLocs}
                      targetComplaintLocation={targetComplaintLocation}
                      onSelectDistrict={() => setIsExplainOpen(true)}
                    />
                  </div>
                </ErrorBoundary>
              )}

              {activeSection === "CYBER_RISK_MAP" && (
                <ErrorBoundary moduleName="Cyber Risk Interactive Map">
                  <IndiaRiskMap
                    locations={regionalLocs}
                    targetComplaintLocation={targetComplaintLocation}
                    onSelectDistrict={() => setIsExplainOpen(true)}
                  />
                </ErrorBoundary>
              )}

              {activeSection === "ENTITY_INTELLIGENCE" && (
                <ErrorBoundary moduleName="Entity Intelligence Graph">
                  <EntityGraph />
                </ErrorBoundary>
              )}

              {activeSection === "SETTINGS" && (
                <ErrorBoundary moduleName="Admin Configuration & Settings">
                  <AdminSettingsView adminUser={adminOfficer} />
                </ErrorBoundary>
              )}
            </main>
          </div>

          <ExplainableDrawer isOpen={isExplainOpen} onClose={() => setIsExplainOpen(false)} />
        </div>
      )}

      {/* 12-Digit Complaint Withdrawal Modal */}
      <ComplaintWithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />

      {/* Admin / Law Enforcement Verification Gate Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        initialComplaintCode={pendingComplaintCode}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccessAuth={(officerInfo, targetCode) => {
          setIsAdminAuthenticated(true);
          setAdminOfficer(officerInfo);
          setPendingComplaintCode(targetCode || "");
          setCurrentView("RISK_MAP_ANALYTICS");
        }}
      />

      {/* Official Government Footer */}
      <NcrpFooter />
    </div>
  );
}
