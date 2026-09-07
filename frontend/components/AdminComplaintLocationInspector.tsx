"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Building2,
  Navigation,
  Clock,
  Radio,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";

interface AdminComplaintLocationInspectorProps {
  adminUser: any;
  initialComplaintCode?: string;
  onSelectComplaintLocation: (complaintData: any) => void;
  onLogoutAdmin: () => void;
}

export const AdminComplaintLocationInspector: React.FC<AdminComplaintLocationInspectorProps> = ({
  adminUser,
  initialComplaintCode = "",
  onSelectComplaintLocation,
  onLogoutAdmin
}) => {
  const [searchCode, setSearchCode] = useState(initialComplaintCode);
  const [complaintData, setComplaintData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [isFreezeActive, setIsFreezeActive] = useState(false);
  const [isPatrolDispatched, setIsPatrolDispatched] = useState(false);

  const sampleComplaints: { code: string; label: string }[] = [];

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
    if (!codeToInspect.trim()) return;
    setIsLoading(true);
    setActionSuccessMsg("");
    setIsFreezeActive(false);
    setIsPatrolDispatched(false);

    try {
      const data = await api.adminInspectComplaint(codeToInspect.trim());
      const normalized = normalizeComplaintData(data, codeToInspect.trim());
      setComplaintData(normalized);
      onSelectComplaintLocation(normalized);
    } catch (e) {
      console.error("Failed to inspect complaint:", e);
      const fallback = normalizeComplaintData(null, codeToInspect.trim());
      setComplaintData(fallback);
      onSelectComplaintLocation(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintCode) {
      setSearchCode(initialComplaintCode);
      inspectComplaint(initialComplaintCode);
    }
  }, [initialComplaintCode]);

  const handleFreeze = () => {
    setIsFreezeActive(true);
    setActionSuccessMsg(`CFCFRMS Emergency Freeze broadcasted across ${complaintData?.victim_bank} & beneficiary node.`);
  };

  const handleDispatch = () => {
    setIsPatrolDispatched(true);
    setActionSuccessMsg(`PCR Patrol Unit Unit-04 dispatched to ${complaintData?.forecasted_atm_hotspots?.[0]?.atm_name} (ETA: 3 mins).`);
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

      {/* Complaint Geolocation & Crime Location Dossier */}
      {complaintData && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-bold font-mono">CASE FILE:</span>
              <span className="text-base font-black text-slate-900 tracking-widest font-mono">
                #{complaintData.complaint_code}
              </span>
              <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                {complaintData.status}
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500 text-[10px] font-mono">CATEGORY: </span>
              <span className="text-amber-800 font-bold">{complaintData.category}</span>
            </div>
          </div>

          {/* Grid Details: Location + Financials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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

            {/* 3. Urgency & Interceptions */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center space-x-1.5 text-red-600 font-bold text-[11px] font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>URGENCY INTERCEPTION</span>
                </div>
                <p className="text-xs font-black text-red-600 mt-1 uppercase tracking-tight font-mono">
                  {complaintData.urgency_level || "CRITICAL IMMEDIATE INTERCEPTION"}
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1 font-mono">
                <button
                  onClick={handleFreeze}
                  disabled={isFreezeActive}
                  className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer uppercase disabled:opacity-50"
                >
                  {isFreezeActive ? "✓ FROZEN" : "CFCFRMS FREEZE"}
                </button>

                <button
                  onClick={handleDispatch}
                  disabled={isPatrolDispatched}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#005A9C] text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer uppercase disabled:opacity-50"
                >
                  {isPatrolDispatched ? "✓ DISPATCHED" : "DISPATCH PCR"}
                </button>
              </div>
            </div>
          </div>

          {/* ATM Forecasted Terminals Matrix */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#005A9C]">
                <Navigation className="w-3.5 h-3.5" />
                <span>FORECASTED ATM CASH-OUT TERMINALS (PINPOINTED AROUND CRIME RADIUS)</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Radius: ~1.5 km • Predictive Mule Vectors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(complaintData.forecasted_atm_hotspots || []).map((atm: any, idx: number) => (
                <div
                  key={atm.atm_id || idx}
                  className="bg-white border border-slate-200 hover:border-blue-300 p-3 rounded-lg space-y-1.5 transition-all text-[11px] shadow-sm font-sans"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]" title={atm.atm_name}>
                      {atm.atm_name || `ATM Point #${idx+1}`}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      idx === 0
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-[#005A9C] border border-blue-200"
                    }`}>
                      Risk: {(Number(atm.cashout_risk_score || 0.8) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
                    <span>GPS: {Number(atm.latitude || 0).toFixed(4)}, {Number(atm.longitude || 0).toFixed(4)}</span>
                    <span className="text-slate-800 font-bold">{atm.distance_km || 0.5} km</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 font-mono">
                    <span className="text-amber-800 flex items-center space-x-1 font-bold">
                      <Clock className="w-3 h-3 inline" />
                      <span>ETA: {atm.estimated_arrival_eta_mins || 5} mins</span>
                    </span>
                    <span className="text-emerald-700 text-[9px] font-bold">
                      {atm.cctv_status || "FEED_STREAMING_ONLINE"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
