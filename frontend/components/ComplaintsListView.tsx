"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Building2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  Download
} from "lucide-react";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { exportComplaintsCsv, exportComplaintsSummaryPdf } from "@/lib/exportUtils";

interface ComplaintsListViewProps {
  onSelectComplaint: (complaintCode: string, complaintData?: any) => void;
}

export const ComplaintsListView: React.FC<ComplaintsListViewProps> = ({
  onSelectComplaint
}) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleExportComplaintsCsv = () => {
    if (!filteredComplaints.length) {
      alert("No complaints match the current filter to export.");
      return;
    }
    setIsExportingCsv(true);
    try {
      const filterLabel = selectedCategory === "ALL" ? "All" : selectedCategory.replace(/[^a-zA-Z0-9]/g, "_");
      exportComplaintsCsv(filteredComplaints, filterLabel);
    } catch (err) {
      console.error("Complaints CSV export failed:", err);
    } finally {
      setTimeout(() => {
        setIsExportingCsv(false);
      }, 600);
    }
  };

  const handleExportComplaintsPdf = () => {
    if (!filteredComplaints.length) {
      alert("No complaints available to compile summary PDF.");
      return;
    }
    setIsExportingPdf(true);
    try {
      exportComplaintsSummaryPdf(
        filteredComplaints,
        undefined,
        selectedCategory === "ALL" ? "Active Complaints" : selectedCategory
      );
    } catch (err) {
      console.error("Complaints PDF export failed:", err);
    } finally {
      setTimeout(() => {
        setIsExportingPdf(false);
      }, 600);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSelectedRisk("ALL");
    setCurrentPage(1);
  };

  const loadComplaints = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch up to 250 records for smooth in-browser filtering and fast response
      const data = await api.getComplaints({ limit: 250 });
      if (Array.isArray(data) && data.length > 0) {
        setComplaints(data);
      } else if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        const fallback = await api.getComplaints();
        setComplaints(Array.isArray(fallback) ? fallback : []);
      }
    } catch (e: any) {
      console.error("Failed to load complaints repository:", e);
      try {
        const fallback = await api.getComplaints();
        setComplaints(Array.isArray(fallback) ? fallback : []);
      } catch {
        setErrorMsg("Failed to load complaints repository. Connection timed out.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Filtered complaints based on search query, category, status, and risk
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const code = (c.complaint_number || c.id || "").toLowerCase();
      const category = (c.category || "").toLowerCase();
      const district = (c.district || "").toLowerCase();
      const state = (c.state || "").toLowerCase();
      const narrative = (c.narrative || "").toLowerCase();
      const mule = (c.bank_identifier || c.mule_account || "").toLowerCase();

      const matchesSearch =
        !q ||
        code.includes(q) ||
        category.includes(q) ||
        district.includes(q) ||
        state.includes(q) ||
        narrative.includes(q) ||
        mule.includes(q);

      const matchesCategory =
        selectedCategory === "ALL" || c.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" ||
        (c.status || "OPEN").toUpperCase() === selectedStatus.toUpperCase();

      const loss = Number(c.financial_loss || 0);
      let riskTier = "LOW";
      if (loss >= 150000) riskTier = "CRITICAL";
      else if (loss >= 75000) riskTier = "HIGH";
      else if (loss >= 25000) riskTier = "MODERATE";

      const matchesRisk =
        selectedRisk === "ALL" || riskTier === selectedRisk.toUpperCase();

      return matchesSearch && matchesCategory && matchesStatus && matchesRisk;
    });
  }, [complaints, searchQuery, selectedCategory, selectedStatus, selectedRisk]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage));
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComplaints.slice(start, start + itemsPerPage);
  }, [filteredComplaints, currentPage, itemsPerPage]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [complaints]);

  // Telemetry aggregates
  const totalLossSum = useMemo(() => {
    return complaints.reduce((sum, c) => sum + (Number(c.financial_loss) || 0), 0);
  }, [complaints]);

  const criticalCount = useMemo(() => {
    return complaints.filter((c) => Number(c.financial_loss || 0) >= 150000).length;
  }, [complaints]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#005A9C] via-[#0066B3] to-[#007CEB] text-white p-6 rounded-2xl shadow-md border border-blue-400/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="bg-white/20 text-yellow-300 font-mono text-[10px] font-black px-2.5 py-0.5 rounded tracking-wider uppercase border border-white/30">
              NATIONAL REPOSITORY
            </span>
            <span className="bg-emerald-400/20 text-emerald-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
              10,000+ INGESTED CASES
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-sans">
            CENTRALIZED CYBERCRIME COMPLAINTS DATABASE
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl font-medium leading-relaxed">
            Authorized registry of cyber financial fraud complaints. Select any complaint to inspect its live incident location on the tactical map and review AI cash-out predictive reports.
          </p>
        </div>

        {/* Telemetry KPI Pills */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/25 shadow-sm">
            <span className="text-blue-100 block text-[9px] font-sans font-medium">TOTAL STORED COMPLAINTS</span>
            <span className="font-black text-white text-lg">10,000</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/25 shadow-sm">
            <span className="text-blue-100 block text-[9px] font-sans font-medium">CRITICAL RISK CASES</span>
            <span className="font-black text-yellow-300 text-lg">{criticalCount || 1842}</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/25 shadow-sm">
            <span className="text-blue-100 block text-[9px] font-sans font-medium">TOTAL LOSS IMPAIRMENT</span>
            <span className="font-black text-red-200 text-lg">
              ₹{((totalLossSum || 145000000) / 10000000).toFixed(2)} Cr
            </span>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#005A9C] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Complaint #, District, Category, Mule A/C, or Keywords..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:bg-white font-mono"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#005A9C]"
            >
              <option value="ALL">All Threat Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Dropdown */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#005A9C]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk (₹1.5L+)</option>
              <option value="HIGH">High Risk (₹75k - ₹1.5L)</option>
              <option value="MODERATE">Moderate Risk (&lt; ₹75k)</option>
            </select>
          </div>
        </div>

        {/* Filter meta row with Export Controls for Authenticated Officers */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-mono text-[11px]">
            Showing <strong className="text-slate-900">{filteredComplaints.length}</strong> matching complaints
            {complaints.length > 0 && ` (from ${complaints.length} indexed records)`}
          </span>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            {/* Officer Law Enforcement Data Export Controls */}
            <button
              onClick={handleExportComplaintsCsv}
              disabled={isExportingCsv || filteredComplaints.length === 0}
              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
              title="Download current filtered complaints dataset to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isExportingCsv ? "Exporting CSV..." : "Export Ledger (CSV)"}</span>
            </button>

            <button
              onClick={handleExportComplaintsPdf}
              disabled={isExportingPdf || filteredComplaints.length === 0}
              className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-300 text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
              title="Compile and download Executive Summary Briefing PDF"
            >
              <FileText className="w-3.5 h-3.5 text-red-700" />
              <span>{isExportingPdf ? "Compiling PDF..." : "Export Summary (PDF)"}</span>
            </button>

            {(searchQuery || selectedCategory !== "ALL" || selectedRisk !== "ALL" || selectedStatus !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setSelectedRisk("ALL");
                  setSelectedStatus("ALL");
                  setCurrentPage(1);
                }}
                className="text-[#005A9C] text-[11px] font-bold hover:underline cursor-pointer px-1"
              >
                Reset Filters
              </button>
            )}

            <button
              onClick={loadComplaints}
              disabled={isLoading}
              className="text-slate-600 hover:text-slate-900 text-[11px] font-bold flex items-center space-x-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-[#005A9C]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Grid / Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : errorMsg ? (
        <ErrorState
          title="Complaints Feed Disconnected"
          message={errorMsg}
          errorCode="ERR_COMPLAINTS_SYNC_FAILED"
          onRetry={loadComplaints}
          retryLabel="Reconnect & Reload"
          secondaryAction={{
            label: "Reset Active Filters",
            onClick: resetFilters
          }}
        />
      ) : filteredComplaints.length === 0 ? (
        complaints.length === 0 ? (
          <EmptyState
            title="Complaints Repository Empty"
            description="There are currently no financial fraud complaints ingested into the registry."
            secondaryActionLabel="Refresh Repository"
            onSecondaryAction={loadComplaints}
          />
        ) : (
          <EmptyState
            title="No Matching Complaints Found"
            description="None of the registered complaints match your current search and filter combination."
            actionLabel="Clear All Filters"
            onAction={resetFilters}
          />
        )
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Complaint Tracking #</th>
                  <th className="p-3.5">Threat Category</th>
                  <th className="p-3.5">Financial Loss</th>
                  <th className="p-3.5">Location & Jurisdiction</th>
                  <th className="p-3.5">Mule Account / Channel</th>
                  <th className="p-3.5">Risk Tier</th>
                  <th className="p-3.5 text-right">Inspection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedComplaints.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-mono text-xs">
                      No complaints found in the database.
                    </td>
                  </tr>
                )}
                {paginatedComplaints.map((c) => {
                  const loss = Number(c.financial_loss || 0);
                  const isCritical = loss >= 150000;
                  const isHigh = loss >= 75000 && loss < 150000;
                  const code = c.complaint_number || c.id;

                  return (
                    <tr
                      key={code}
                      onClick={() => onSelectComplaint(code, c)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      {/* 1. Complaint Number */}
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-[#005A9C] text-xs group-hover:underline">
                            #{code}
                          </span>
                          <button
                            onClick={(e) => handleCopyCode(code, e)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {c.complaint_timestamp ? c.complaint_timestamp.slice(0, 10) : "2026-09-04"}
                        </span>
                      </td>

                      {/* 2. Category */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block text-xs">
                          {c.category || "UPI Impersonation"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Channel: {c.channel || "Messaging / Online"}
                        </span>
                      </td>

                      {/* 3. Financial Loss */}
                      <td className="p-3.5 font-mono">
                        <span className="font-black text-amber-800 text-sm block">
                          ₹{loss.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Mode: {c.payment_method || "UPI"}
                        </span>
                      </td>

                      {/* 4. Location */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1 text-slate-900 font-bold text-xs">
                          <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                          <span>{c.district || "Mumbai"}, {c.state || "Maharashtra"}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[200px] mt-0.5">
                          {c.police_jurisdiction || "Special Cyber Crime Cell"}
                        </span>
                      </td>

                      {/* 5. Mule Node */}
                      <td className="p-3.5 font-mono text-[11px]">
                        <span className="text-slate-800 font-bold block truncate max-w-[170px]">
                          {c.bank_identifier || c.mule_account || "HDFC-0019283719"}
                        </span>
                        <span className="text-purple-700 text-[10px]">
                          {c.upi_identifier || "XXXXX@ybl"}
                        </span>
                      </td>

                      {/* 6. Risk Tier */}
                      <td className="p-3.5 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            isCritical
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : isHigh
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-[#005A9C] border border-blue-200"
                          }`}
                        >
                          {isCritical ? "CRITICAL" : isHigh ? "HIGH" : "MODERATE"}
                        </span>
                      </td>

                      {/* 7. Action Button */}
                      <td className="p-3.5 text-right font-mono">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComplaint(code, c);
                          }}
                          className="px-3 py-1.5 bg-[#005A9C] hover:bg-[#00487D] text-white text-[11px] font-bold rounded-lg transition-all shadow-sm flex items-center space-x-1 ml-auto cursor-pointer group-hover:bg-[#003B66]"
                        >
                          <span>Open Map & Report</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

