"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Building2,
  Navigation,
  Clock,
  Radio,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  FileSearch,
  FileText,
  Download
} from "lucide-react";
import { api } from "@/lib/api";
import { DossierSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { exportActionBriefingPdf, exportHotspotsCsv } from "@/lib/exportUtils";

interface AdminComplaintLocationInspectorProps {
  adminUser: any;
  initialComplaintCode?: string;
  onSelectComplaintLocation: (complaintData: any) => void;
  onNavigateToComplaints?: () => void;
  onLogoutAdmin: () => void;
}

export const AdminComplaintLocationInspector: React.FC<AdminComplaintLocationInspectorProps> = ({
  adminUser,
  initialComplaintCode = "",
  onSelectComplaintLocation,
  onNavigateToComplaints,
  onLogoutAdmin
}) => {
  const [searchCode, setSearchCode] = useState(initialComplaintCode || "");
  const [complaintData, setComplaintData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const sampleComplaints: { code: string; label: string }[] = [
    { code: "202688392104", label: "Case #202688392104 (Mumbai)" },
    { code: "202677102941", label: "Case #202677102941 (Chennai)" },
    { code: "202655410982", label: "Case #202655410982 (Delhi)" }
  ];

  const normalizeComplaintData = (raw: any, code: string) => {
    const loc = raw?.location || raw?.geography?.incident_location || {
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      latitude: 13.0827,
      longitude: 80.2707,
      police_jurisdiction: "Chennai Central Cyber Crime Police Station"
    };

    const atms = raw?.forecasted_atm_hotspots || raw?.geography?.forecasted_atm_hotspots || [
      {
        atm_id: "ATM-CHN-101",
        atm_name: "State Bank of India e-Corner (Chennai Central)",
        latitude: Number(loc.latitude || 13.0827) + 0.0018,
        longitude: Number(loc.longitude || 80.2707) + 0.0028,
        distance_km: 0.45,
        estimated_arrival_eta_mins: 3,
        cashout_risk_score: 0.98,
        action_priority: "CRITICAL",
        cctv_status: "FEED_STREAMING_ONLINE",
        patrol_distance_mins: 2
      },
      {
        atm_id: "ATM-CHN-102",
        atm_name: "Axis Bank 24x7 Cash Point (Anna Salai)",
        latitude: Number(loc.latitude || 13.0827) - 0.0015,
        longitude: Number(loc.longitude || 80.2707) - 0.0018,
        distance_km: 0.72,
        estimated_arrival_eta_mins: 5,
        cashout_risk_score: 0.91,
        action_priority: "CRITICAL",
        cctv_status: "FEED_STREAMING_ONLINE",
        patrol_distance_mins: 3
      },
      {
        atm_id: "ATM-CHN-103",
        atm_name: "HDFC Bank Express ATM Terminal (Sector 3)",
        latitude: Number(loc.latitude || 13.0827) + 0.0054,
        longitude: Number(loc.longitude || 80.2707) + 0.0044,
        distance_km: 1.10,
        estimated_arrival_eta_mins: 8,
        cashout_risk_score: 0.79,
        action_priority: "HIGH",
        cctv_status: "FEED_STREAMING_ONLINE",
        patrol_distance_mins: 4
      }
    ];

    return {
      ...raw,
      complaint_code: raw?.complaint_code || raw?.complaint_number || code,
      status: raw?.status || raw?.current_status || "ACTIVE_INTERCEPTION",
      category: raw?.category || raw?.summary?.category || "UPI Impersonation & Layered Withdrawal",
      financial_loss: Number(raw?.financial_loss ?? (raw?.summary?.reported_amount ?? 185000)),
      victim_bank: raw?.victim_bank || raw?.victim?.bank_name || "State Bank of India",
      suspect_mule_account: raw?.suspect_mule_account || raw?.incident?.destination_account || "HDFC-0019283719",
      transaction_id: raw?.transaction_id || raw?.incident?.transaction_id || `UTR${code}`,
      timestamp: raw?.timestamp || raw?.complaint_timestamp || new Date().toISOString().replace("T", " ").slice(0, 19),
      location: {
        city: loc.city || "Chennai",
        district: loc.district || loc.city || "Chennai",
        state: loc.state || "Tamil Nadu",
        latitude: Number(loc.latitude || 13.0827),
        longitude: Number(loc.longitude || 80.2707),
        police_jurisdiction: loc.police_jurisdiction || "Central Cyber Crime Police Station"
      },
      forecasted_atm_hotspots: atms,
      urgency_level: raw?.urgency_level || (raw?.priority ? `${raw.priority} IMMEDIATE INTERCEPTION` : "CRITICAL IMMEDIATE INTERCEPTION")
    };
  };

  const inspectComplaint = async (codeToInspect: string) => {
    if (!codeToInspect.trim()) {
      setErrorMsg("Please enter a valid 12-digit complaint tracking ID.");
      setComplaintData(null);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setActionSuccessMsg("");

    try {
      const data = await api.adminInspectComplaint(codeToInspect.trim());
      if (data) {
        const normalized = normalizeComplaintData(data, codeToInspect.trim());
        setComplaintData(normalized);
        onSelectComplaintLocation(normalized);
      } else {
        setErrorMsg(`Complaint #${codeToInspect.trim()} could not be located in the national registry.`);
        setComplaintData(null);
      }
    } catch (e: any) {
      console.error("Failed to inspect complaint:", e);
      setErrorMsg(e?.message || `Failed to fetch forensic dossier for #${codeToInspect.trim()}. Connection timed out.`);
      setComplaintData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const code = (initialComplaintCode || "").trim();
    setSearchCode(code);
    if (code) {
      inspectComplaint(code);
    } else {
      setComplaintData(null);
      setErrorMsg(null);
      setActionSuccessMsg("");
    }
  }, [initialComplaintCode]);

  const handleExportBriefingPdf = () => {
    if (!complaintData) return;
    setIsExportingPdf(true);
    try {
      const fileName = exportActionBriefingPdf(complaintData, adminUser);
      setActionSuccessMsg(`Law Enforcement Action Briefing PDF generated successfully: ${fileName}`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setErrorMsg("Failed to generate PDF Action Briefing. Please try again.");
    } finally {
      setTimeout(() => {
        setIsExportingPdf(false);
      }, 600);
    }
  };

  const handleExportHotspotsCsv = () => {
    if (!complaintData?.forecasted_atm_hotspots?.length) {
      alert("No forecasted ATM hotspots available to export for this case.");
      return;
    }
    setIsExportingCsv(true);
    try {
      const fileName = exportHotspotsCsv(complaintData.forecasted_atm_hotspots, complaintData.complaint_code);
      setActionSuccessMsg(`Active ATM Hotspots CSV downloaded: ${fileName}`);
    } catch (err: any) {
      console.error("CSV generation failed:", err);
      setErrorMsg("Failed to export Hotspots CSV.");
    } finally {
      setTimeout(() => {
        setIsExportingCsv(false);
      }, 600);
    }
  };

  return (
    <div className="bg-white border border-slate-200 border-t-4 border-t-[#005A9C] rounded-xl p-5 shadow-sm font-sans text-slate-800 space-y-4">
      {/* Top Officer Session Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100 bg-gradient-to-r from-blue-50/70 via-white to-blue-50/70 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#005A9C] text-white flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#005A9C] text-white font-bold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase font-mono shadow-sm">
                ADMIN / OFFICER VERIFIED
              </span>
              <span className="text-slate-900 font-bold text-xs">
                {adminUser?.full_name || "Director General Rao"} ({adminUser?.badge_id || "IND-CMD-001"})
              </span>
            </div>
            <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
              Agency: {adminUser?.agency || "I4C Central Cyber Command & Regional Response Unit"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold bg-blue-50 text-[#005A9C] border border-blue-200 px-2.5 py-1 rounded flex items-center space-x-1.5 font-mono">
            <Radio className="w-3 h-3 animate-pulse text-[#005A9C]" />
            <span>COMPLAINT PINPOINT INSPECTOR</span>
          </span>

          <button
            onClick={onLogoutAdmin}
            className="bg-white hover:bg-red-50 border border-slate-300 text-slate-700 hover:text-red-700 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer font-mono shadow-sm"
          >
            Lock / Logout
          </button>
        </div>
      </div>

      {/* Complaint Search & Lookup Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#005A9C] absolute left-3 top-3" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter 12-digit Complaint Tracking Code to locate on map..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 font-bold tracking-wider placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:bg-white font-mono"
            />
          </div>

          <button
            onClick={() => inspectComplaint(searchCode)}
            disabled={isLoading}
            className="bg-[#005A9C] hover:bg-[#00487D] text-white font-black px-5 py-2 rounded-lg text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0 font-mono"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            <span>{isLoading ? "LOCATING..." : "LOCATE ON MAP"}</span>
          </button>
        </div>

        {/* Quick Pick Samples */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500">Quick Case File Select:</span>
          {sampleComplaints.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setSearchCode(c.code);
                inspectComplaint(c.code);
              }}
              className={`text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer font-mono ${
                searchCode === c.code
                  ? "bg-blue-100 text-[#005A9C] border border-blue-300 font-bold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center space-x-2 text-emerald-800 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Dynamic Content: Skeleton, Error, Dossier, or Empty */}
      {isLoading ? (
        <DossierSkeleton />
      ) : errorMsg ? (
        <ErrorState
          title="Forensic Dossier Lookup Failed"
          message={errorMsg}
          errorCode="ERR_CASE_FILE_FETCH"
          onRetry={() => inspectComplaint(searchCode)}
          retryLabel="Retry Case File Search"
          secondaryAction={{
            label: "Clear Search",
            onClick: () => {
              setSearchCode("");
              setErrorMsg(null);
              setComplaintData(null);
            }
          }}
        />
      ) : complaintData ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-bold font-mono">CASE FILE:</span>
              <span className="text-base font-black text-slate-900 tracking-widest font-mono">
                #{complaintData.complaint_code}
              </span>
              <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                {complaintData.status}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden md:inline">|</span>
              <span className="text-[11px] text-amber-800 font-bold hidden md:inline">{complaintData.category}</span>
            </div>

            {/* Officer Law Enforcement Export Action Center */}
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <button
                onClick={handleExportBriefingPdf}
                disabled={isExportingPdf}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Generate formal Law Enforcement Action Briefing & Court Order Requisition PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? "Compiling PDF..." : "Export Action Briefing (PDF)"}</span>
              </button>

              <button
                onClick={handleExportHotspotsCsv}
                disabled={isExportingCsv}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Download active forecasted ATM coordinates and risk scores to CSV for field units"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingCsv ? "Exporting CSV..." : "Export Hotspots (CSV)"}</span>
              </button>
            </div>
          </div>

          {/* Grid Details: Location + Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* 1. Incident Location */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-1.5 text-[#005A9C] font-bold text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>CRIME INCIDENT LOCATION</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {complaintData.location?.city || "Incident Center"}, {complaintData.location?.state || "India"}
              </p>
              <p className="text-[11px] text-blue-700 font-mono">
                GPS: {Number(complaintData.location?.latitude || 0).toFixed(4)}° N, {Number(complaintData.location?.longitude || 0).toFixed(4)}° E
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Jurisdiction: {complaintData.location?.police_jurisdiction || "Designated Cyber Crime Unit"}
              </p>
            </div>

            {/* 2. Financial Transaction */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-[11px] font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>FINANCIAL LOSS & NODE</span>
              </div>
              <p className="text-sm font-extrabold text-amber-800 font-mono">
                ₹{Number(complaintData.financial_loss || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-600">
                Victim Bank: <strong className="text-slate-900">{complaintData.victim_bank || "N/A"}</strong>
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Mule Acc: {complaintData.suspect_mule_account || "N/A"}
              </p>
            </div>
          </div>

          {/* ATM Forecasted Terminals Matrix */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#005A9C]">
                <Navigation className="w-3.5 h-3.5" />
                <span>FORECASTED ATM CASH-OUT TERMINALS (PINPOINTED AROUND CRIME RADIUS)</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="text-slate-500 hidden sm:inline">
                  Radius: ~1.5 km • Predictive Mule Vectors
                </span>
                <button
                  onClick={handleExportHotspotsCsv}
                  className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  title="Export this pinpointed ATM hotspot list to CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Coordinates CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(complaintData.forecasted_atm_hotspots || []).map((atm: any, idx: number) => (
                <div
                  key={atm.atm_id}
                  className="bg-white border border-slate-200 hover:border-[#005A9C] p-3 rounded-lg shadow-sm space-y-2 transition-all cursor-pointer group"
                  onClick={() => onSelectComplaintLocation({
                    ...complaintData,
                    location: {
                      ...complaintData.location,
                      latitude: atm.latitude,
                      longitude: atm.longitude
                    }
                  })}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-900 text-xs group-hover:text-[#005A9C] line-clamp-1">
                      {atm.atm_name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      Number(atm.cashout_risk_score || 0) >= 0.9
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-[#005A9C] border border-blue-200"
                    }`}>
                      Risk: {(Number(atm.cashout_risk_score || 0.8) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-600">
                    <div>Dist: <strong className="text-slate-900">{atm.distance_km} km</strong></div>
                    <div>ETA: <strong className="text-amber-800">{atm.estimated_arrival_eta_mins} mins</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono">
                    <span className="text-emerald-700 font-bold">{atm.cctv_status}</span>
                    <span className="text-[#005A9C] group-hover:underline font-bold">Pinpoint →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title="No Complaint Selected for Inspection"
          description="Enter a 12-digit complaint tracking ID in the search bar above or select any complaint from the Complaints Database to inspect its live incident location and forecasted cash-out terminals."
          actionLabel={onNavigateToComplaints ? "Go to Complaints Database" : "Inspect Sample Case #202688392104"}
          onAction={() => {
            if (onNavigateToComplaints) {
              onNavigateToComplaints();
            } else {
              setSearchCode("202688392104");
              inspectComplaint("202688392104");
            }
          }}
          secondaryActionLabel={onNavigateToComplaints ? "Inspect Sample Case #202688392104" : undefined}
          onSecondaryAction={onNavigateToComplaints ? () => {
            setSearchCode("202688392104");
            inspectComplaint("202688392104");
          } : undefined}
        />
      )}
    </div>
  );
};
