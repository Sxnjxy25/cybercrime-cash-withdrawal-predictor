"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Siren,
  ShieldAlert,
  Radio,
  Server,
  Terminal,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Eye,
  X,
  Copy,
  Check,
  ChevronRight,
  Cpu,
  Layers,
  ArrowUpRight,
  Clock,
  ShieldX
} from "lucide-react";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface AlertsIncidentsViewProps {
  adminUser?: any;
}

export const AlertsIncidentsView: React.FC<AlertsIncidentsViewProps> = ({ adminUser }) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Pagination
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Real-time Stream State
  const [isStreamActive, setIsStreamActive] = useState(true);
  const [streamEps, setStreamEps] = useState(2840);
  const [livePulse, setLivePulse] = useState(false);

  // Detail Modal / Triage Drawer
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isTriageUpdating, setIsTriageUpdating] = useState(false);
  const [triageNotes, setTriageNotes] = useState("");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await api.getAlertsSummary();
      if (data) setSummary(data);
    } catch (err) {
      console.error("Failed to load telemetry summary:", err);
    }
  };

  const fetchIncidents = async (page = 1, showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMsg(null);

    try {
      const data = await api.getAlertsIncidents({
        page,
        page_size: 15,
        severity: severityFilter,
        source_type: sourceFilter,
        triage_status: statusFilter,
        search: searchQuery
      });

      if (data) {
        setIncidents(data.items || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setCurrentPage(data.page || 1);
        if (data.summary?.ingestion_rate_eps) {
          setStreamEps(data.summary.ingestion_rate_eps);
        }
      } else {
        setErrorMsg("Failed to retrieve machine telemetry incidents from SOC sensor pipeline.");
      }
    } catch (err: any) {
      console.error("Failed to fetch telemetry incidents:", err);
      setErrorMsg("Telemetry collection pipeline unreachable. Verify SOC gateway status.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchIncidents(1, true);
  }, [severityFilter, sourceFilter, statusFilter, searchQuery]);

  // Real-time SSE Connection with fallback
  useEffect(() => {
    if (!isStreamActive) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    try {
      const streamUrl = api.getAlertsStreamUrl();
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "TELEMETRY_HEARTBEAT") {
            setStreamEps(payload.ingestion_rate_eps || 2840);
            setLivePulse(true);
            setTimeout(() => setLivePulse(false), 500);
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      es.onerror = () => {
        // Fallback to polling if SSE is disconnected
        es.close();
        eventSourceRef.current = null;
      };
    } catch (e) {
      console.warn("EventSource setup skipped or failed; using polling.");
    }

    // Polling interval fallback for live counter
    const pollInterval = setInterval(() => {
      fetchSummary();
    }, 8000);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      clearInterval(pollInterval);
    };
  }, [isStreamActive]);

  const handleSimulateBurst = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateAlertTelemetry();
      if (res && res.success) {
        setToastMessage(`⚡ Telemetry burst ingested: ${res.simulated_incidents?.length || 3} critical alerts streamed!`);
        setTimeout(() => setToastMessage(""), 5000);
        await fetchSummary();
        await fetchIncidents(1, false);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTriageAction = async (newStatus: string) => {
    if (!selectedIncident) return;
    setIsTriageUpdating(true);

    try {
      const officerName = adminUser?.full_name || "Investigating Officer";
      const res = await api.triageAlert(selectedIncident.id, {
        status: newStatus,
        notes: triageNotes || `Triage action [${newStatus}] applied by ${officerName}.`,
        assigned_to: officerName
      });

      if (res && res.success) {
        setSelectedIncident(res.incident);
        setToastMessage(`Incident #${res.incident.incident_code} marked as ${newStatus}.`);
        setTimeout(() => setToastMessage(""), 4000);
        await fetchIncidents(currentPage, false);
        await fetchSummary();
      }
    } catch (err: any) {
      console.error("Triage action failed:", err);
      alert("Failed to update incident triage state.");
    } finally {
      setIsTriageUpdating(false);
    }
  };

  const handleCopyPayload = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#003B6F] border border-blue-400/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-fadeIn font-mono text-xs">
          <Zap className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & TELEMETRY HUD */}
      <div className="bg-gradient-to-r from-[#002D5A] via-[#00487D] to-[#005A9C] text-white p-5 rounded-2xl shadow-md border border-blue-400/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center shadow-sm">
                <Siren className="w-4 h-4 animate-bounce" />
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-red-500 text-white font-mono tracking-wider uppercase border border-red-300">
                AUTOMATED SYSTEM TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-blue-200">
                SIEM • EDR • FIREWALLS • NDR
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-wide text-white uppercase font-sans mt-1.5">
              REAL-TIME SECURITY ALERTS & TELEMETRY INCIDENTS
            </h1>
            <p className="text-xs text-blue-100 mt-0.5 font-medium max-w-3xl">
              Machine-generated high-velocity telemetry pipeline correlating endpoint behaviors, perimeter breaches, and payment API exploit probes across national critical cyber infrastructure.
            </p>
          </div>

          {/* Real-time telemetry controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <button
              onClick={() => setIsStreamActive(!isStreamActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                isStreamActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30"
                  : "bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700"
              }`}
              title="Toggle live telemetry streaming socket"
            >
              <Radio className={`w-3.5 h-3.5 ${livePulse ? "text-emerald-400 animate-ping" : "text-emerald-300"}`} />
              <span>{isStreamActive ? "SSE STREAM ACTIVE" : "STREAM PAUSED"}</span>
            </button>

            <button
              onClick={handleSimulateBurst}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-lg transition-all shadow cursor-pointer flex items-center space-x-1 disabled:opacity-50"
              title="Trigger synthetic high-velocity attack telemetry across sensors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "INGESTING..." : "SIMULATE BURST"}</span>
            </button>

            <button
              onClick={() => fetchIncidents(currentPage, false)}
              disabled={isRefreshing}
              className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* HUD KPI Telemetry Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 font-mono text-xs">
          {/* Tile 1: Critical Alerts Badge */}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm">
            <span className="text-blue-200 text-[9px] block font-sans font-bold">SEVERITY 1 (CRITICAL)</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-red-500 text-white font-black px-2 py-0.5 rounded text-xs shadow-xs">
                {summary?.critical_badge || "99+ CRIT"}
              </span>
              <span className="text-[10px] text-red-200">Immediate Intercept</span>
            </div>
          </div>

          {/* Tile 2: Ingestion Velocity */}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm">
            <span className="text-blue-200 text-[9px] block font-sans font-bold">INGESTION VELOCITY</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span className="text-white font-black text-sm">
                {streamEps.toLocaleString()} <span className="text-[10px] text-blue-200">EPS</span>
              </span>
            </div>
          </div>

          {/* Tile 3: Total Events Ingested */}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm">
            <span className="text-blue-200 text-[9px] block font-sans font-bold">TODAY'S RAW TELEMETRY</span>
            <span className="text-yellow-300 font-black text-sm block mt-1">
              {((summary?.total_events_today || 2450000) / 1000000).toFixed(2)}M <span className="text-[10px] text-blue-200 font-normal">Events</span>
            </span>
          </div>

          {/* Tile 4: Active Triage Queue */}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm">
            <span className="text-blue-200 text-[9px] block font-sans font-bold">ACTIVE TRIAGE QUEUE</span>
            <span className="text-white font-black text-sm block mt-1">
              {summary?.active_triage_queue || totalCount} <span className="text-[10px] text-blue-200">Pending</span>
            </span>
          </div>

          {/* Tile 5: Mean Time to Detect */}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm">
            <span className="text-blue-200 text-[9px] block font-sans font-bold">AVG MTTD (DETECTION)</span>
            <span className="text-emerald-300 font-black text-sm block mt-1">
              {summary?.mean_time_to_detect_mins || 3.4} <span className="text-[10px] text-blue-200">mins</span>
            </span>
          </div>

          {/* Tile 6: Sensors Status */}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm">
            <span className="text-blue-200 text-[9px] block font-sans font-bold">SENSOR GRID NODES</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-white font-black text-xs">
                {summary?.sensor_health?.online_sensors || 48} / {summary?.sensor_health?.total_sensors || 48} ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 font-sans">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Host, IP, Rule, MITRE ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#005A9C] font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-mono text-xs">
            
            {/* Severity Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">SEVERITY:</span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    severityFilter === sev
                      ? sev === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : "bg-[#005A9C] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Source Type Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">SOURCE:</span>
              {["ALL", "EDR", "SIEM", "FIREWALL", "NDR"].map((src) => (
                <button
                  key={src}
                  onClick={() => setSourceFilter(src)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    sourceFilter === src ? "bg-[#005A9C] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>

            {/* Triage Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">STATUS:</span>
              {["ALL", "NEW", "CONTAINED", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === st ? "bg-[#005A9C] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* MACHINE TELEMETRY LEDGER TABLE */}
      {errorMsg ? (
        <ErrorState
          title="Telemetry Data Stream Offline"
          message={errorMsg}
          onRetry={() => fetchIncidents(currentPage, true)}
          retryLabel="Reconnect SOC Stream"
        />
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans">
          
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#005A9C]" />
              <span className="font-bold text-slate-900">
                ACTIVE MACHINE INCIDENT QUEUE ({totalCount.toLocaleString()} Indexed Telemetry Events)
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Showing Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Incident Code / Time</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Telemetry Title & Detection Rule</th>
                  <th className="p-3">Sensor Source</th>
                  <th className="p-3">Target Asset & IP</th>
                  <th className="p-3">MITRE ATT&CK</th>
                  <th className="p-3 text-center">Events</th>
                  <th className="p-3">Triage State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-mono text-xs">
                      No machine telemetry alerts matching current active filter filters.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => {
                    const isCrit = inc.severity === "CRITICAL";
                    const isHigh = inc.severity === "HIGH";

                    return (
                      <tr
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                      >
                        {/* 1. Incident Code & Time */}
                        <td className="p-3 font-mono">
                          <span className="font-black text-[#005A9C] block group-hover:underline">
                            #{inc.incident_code}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {inc.timestamp?.slice(11, 19)} IST
                          </span>
                        </td>

                        {/* 2. Severity */}
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black font-mono tracking-wider ${
                            isCrit
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : isHigh
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-[#005A9C] border border-blue-200"
                          }`}>
                            {inc.severity}
                          </span>
                        </td>

                        {/* 3. Title & Detection Rule */}
                        <td className="p-3 max-w-xs">
                          <span className="font-bold text-slate-900 block truncate" title={inc.title}>
                            {inc.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block truncate" title={inc.detection_rule}>
                            Rule: {inc.detection_rule}
                          </span>
                        </td>

                        {/* 4. Sensor Source */}
                        <td className="p-3 font-mono">
                          <span className="font-bold text-slate-800 block text-[11px]">
                            {inc.source_type}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {inc.source_tool}
                          </span>
                        </td>

                        {/* 5. Target Asset & IP */}
                        <td className="p-3 font-mono">
                          <span className="font-bold text-slate-900 block truncate max-w-[150px]" title={inc.target_host}>
                            {inc.target_host}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            IP: {inc.target_ip}
                          </span>
                        </td>

                        {/* 6. MITRE ATT&CK */}
                        <td className="p-3 font-mono">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-bold block truncate max-w-[160px]" title={inc.mitre_technique}>
                            {inc.mitre_technique?.split(" - ")[0]}
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-0.5 truncate max-w-[160px]">
                            {inc.mitre_tactic}
                          </span>
                        </td>

                        {/* 7. Event Count */}
                        <td className="p-3 text-center font-mono">
                          <span className="bg-slate-100 text-slate-700 font-black text-xs px-2 py-0.5 rounded border border-slate-200">
                            {Number(inc.event_count || 1).toLocaleString()}
                          </span>
                        </td>

                        {/* 8. Triage State */}
                        <td className="p-3 font-mono">
                          <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                            inc.triage_status === "NEW"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : inc.triage_status === "CONTAINED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inc.triage_status === "RESOLVED"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            <span>{inc.triage_status}</span>
                          </span>
                        </td>

                        {/* 9. Actions */}
                        <td className="p-3 text-right font-mono">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(inc);
                            }}
                            className="bg-[#005A9C] hover:bg-[#00487D] text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-xs cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Triage</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500">
                Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => fetchIncidents(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchIncidents(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORENSIC TELEMETRY & TRIAGE ACTION MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden text-slate-900 flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#003B6F] to-[#005A9C] p-4 text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Siren className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                      {selectedIncident.severity} TELEMETRY
                    </span>
                    <span className="text-blue-100 text-[11px] font-bold">
                      INCIDENT #{selectedIncident.incident_code}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white truncate max-w-md mt-0.5">
                    {selectedIncident.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Context Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-sans">SENSOR TOOL</span>
                  <strong className="text-slate-900 text-xs mt-0.5 block">{selectedIncident.source_tool}</strong>
                  <span className="text-[10px] text-blue-700">Type: {selectedIncident.source_type}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-sans">TARGET ASSET</span>
                  <strong className="text-slate-900 text-xs mt-0.5 block truncate" title={selectedIncident.target_host}>
                    {selectedIncident.target_host}
                  </strong>
                  <span className="text-[10px] text-slate-600">IP: {selectedIncident.target_ip}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 block font-sans">SUSPECT IP / ORIGIN</span>
                  <strong className="text-red-700 text-xs mt-0.5 block">{selectedIncident.source_ip}</strong>
                  <span className="text-[10px] text-slate-500">Events: {Number(selectedIncident.event_count).toLocaleString()}</span>
                </div>
              </div>

              {/* MITRE ATT&CK Matrix Mapping */}
              <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-xl space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-900 font-bold">
                    <Layers className="w-4 h-4 text-purple-700" />
                    <span>MITRE ATT&CK MATRIX CORRELATION</span>
                  </div>
                  <span className="text-[10px] bg-purple-200/60 text-purple-800 px-2 py-0.5 rounded font-black">
                    CONFIDENCE: {Math.round((selectedIncident.confidence_score || 0.95) * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                  <div>
                    <span className="text-[10px] text-purple-600 font-bold block">TACTIC:</span>
                    <span className="font-bold text-xs">{selectedIncident.mitre_tactic}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-600 font-bold block">TECHNIQUE:</span>
                    <span className="font-bold text-xs">{selectedIncident.mitre_technique}</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-purple-200/60 text-[11px] text-purple-900">
                  <strong>Detection Signature:</strong> {selectedIncident.detection_rule}
                </div>
              </div>

              {/* Raw Telemetry JSON Payload */}
              <div className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>RAW TELEMETRY SENSOR PAYLOAD (JSON)</span>
                  </div>
                  <button
                    onClick={() => handleCopyPayload(selectedIncident.raw_payload)}
                    className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPayload ? "COPIED" : "COPY JSON"}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-[11px] overflow-x-auto max-h-40 border border-slate-800 leading-relaxed">
                  {JSON.stringify(selectedIncident.raw_payload || {}, null, 2)}
                </pre>
              </div>

              {/* Analyst Triage Remark Input */}
              <div className="space-y-1.5 font-sans">
                <label className="font-bold text-slate-700 text-xs font-mono">
                  OPERATIONAL TRIAGE REMARKS & SOAR ACTIONS:
                </label>
                <textarea
                  rows={2}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Record incident triage notes, forensic containment actions, or quarantine directives..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#005A9C]"
                />
              </div>

              {/* Triage Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 font-mono">
                <button
                  onClick={() => handleTriageAction("CONTAINED")}
                  disabled={isTriageUpdating}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                  title="Trigger automated SOAR host network quarantine & block source IP"
                >
                  <ShieldX className="w-3.5 h-3.5" />
                  <span>CONTAIN / ISOLATE HOST</span>
                </button>

                <button
                  onClick={() => handleTriageAction("ESCALATED")}
                  disabled={isTriageUpdating}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                  title="Escalate alert to formal National Cyber Crime Investigation"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ESCALATE TO CASE</span>
                </button>

                <button
                  onClick={() => handleTriageAction("RESOLVED")}
                  disabled={isTriageUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>MARK RESOLVED</span>
                </button>

                <button
                  onClick={() => handleTriageAction("SUPPRESSED")}
                  disabled={isTriageUpdating}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>SUPPRESS FALSE POSITIVE</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
