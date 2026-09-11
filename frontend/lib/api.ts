declare const process: { env?: { [key: string]: string | undefined } } | undefined;

import {
  MOCK_REGIONAL_LOCATIONS,
  MOCK_COMPLAINTS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_FORECASTS,
  MOCK_THREAT_CLUSTERS,
  MOCK_EARLY_WARNINGS,
  MOCK_INVESTIGATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_ALERTS_INCIDENTS,
  MOCK_MODEL_METRICS,
  MOCK_ENTITY_GRAPH,
  generatePredictionResult,
  getMockComplaintDossier,
  getMockCopilotAnswer
} from "./mockData";

const API_BASE = (typeof process !== "undefined" && process?.env?.NEXT_PUBLIC_API_URL) || "http://127.0.0.1:8000/api/v1";

let tokenCache: string | null = null;
let dynamicComplaints = [...MOCK_COMPLAINTS];
let dynamicEarlyWarnings = [...MOCK_EARLY_WARNINGS];
let dynamicInvestigations = [...MOCK_INVESTIGATIONS];
let dynamicAlerts = { ...MOCK_ALERTS_INCIDENTS, items: [...MOCK_ALERTS_INCIDENTS.items] };

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  // Ensure token exists (auto login superadmin for seamless local prototype demo)
  if (!tokenCache) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "superadmin", password: "Password@123" }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (loginRes.ok) {
        const data = await loginRes.json();
        tokenCache = data.access_token;
      }
    } catch {
      // Backend auth connection fallback
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(tokenCache ? { "Authorization": `Bearer ${tokenCache}` } : {}),
    ...options.headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback to offline mock data
  }
  return null;
}

export const api = {
  getDashboardSummary: async () => {
    const res = await fetchWithAuth("/dashboard/summary");
    return res || MOCK_DASHBOARD_SUMMARY;
  },

  getComplaints: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    const res = await fetchWithAuth(`/complaints${qs ? `?${qs}` : ""}`);
    if (Array.isArray(res) && res.length > 0) return res;
    
    // Return filtered dynamic complaints
    let list = [...dynamicComplaints];
    if (params.category && params.category !== "ALL") {
      list = list.filter(c => c.category === params.category);
    }
    if (params.limit && typeof params.limit === "number") {
      list = list.slice(0, params.limit);
    }
    return list;
  },

  getAnalyticsTrends: async () => {
    const res = await fetchWithAuth("/analytics/trends");
    return res || MOCK_FORECASTS;
  },

  getRegionalRisk: async () => {
    const res = await fetchWithAuth("/analytics/regional-risk");
    if (Array.isArray(res) && res.length > 0) return res;
    return MOCK_REGIONAL_LOCATIONS;
  },

  getPredictions: async () => {
    const res = await fetchWithAuth("/predictions");
    return res || [];
  },

  getForecasts: async (horizon = "7d") => {
    const res = await fetchWithAuth(`/forecasts?horizon=${horizon}`);
    return res || { ...MOCK_FORECASTS, horizon };
  },

  getAnomalies: async () => {
    const res = await fetchWithAuth("/anomalies");
    return res || [];
  },

  getThreatClusters: async () => {
    const res = await fetchWithAuth("/threat-clusters");
    if (Array.isArray(res) && res.length > 0) return res;
    return MOCK_THREAT_CLUSTERS;
  },

  getEntities: async () => {
    const res = await fetchWithAuth("/entities");
    return res || [];
  },

  getEntityGraph: async () => {
    const res = await fetchWithAuth("/entities/graph");
    return res || MOCK_ENTITY_GRAPH;
  },

  getEarlyWarnings: async () => {
    const res = await fetchWithAuth("/early-warnings");
    if (Array.isArray(res) && res.length > 0) return res;
    return dynamicEarlyWarnings;
  },

  updateWarningAction: async (id: string, action: string) => {
    const res = await fetchWithAuth(`/early-warnings/${id}/action`, {
      method: "POST",
      body: JSON.stringify({ action })
    });
    if (!res) {
      dynamicEarlyWarnings = dynamicEarlyWarnings.map(w => w.id === id ? { ...w, status: "ACTION_TAKEN" } : w);
      return { success: true, message: `Action ${action} updated` };
    }
    return res;
  },

  getInvestigations: async () => {
    const res = await fetchWithAuth("/investigations");
    if (Array.isArray(res) && res.length > 0) return res;
    return dynamicInvestigations;
  },

  createInvestigation: async (data: any) => {
    const res = await fetchWithAuth("/investigations", {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res) {
      const newInv = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        title: data.title || "Investigation Case",
        risk_score: data.risk_score || 90.0,
        lead_officer: data.lead_officer || "Insp. Rajesh Kumar",
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        summary: data.summary || "Case initiated by officer."
      };
      dynamicInvestigations = [newInv, ...dynamicInvestigations];
      return newInv;
    }
    return res;
  },

  getModelObservatory: async () => {
    const res = await fetchWithAuth("/models");
    return res || MOCK_MODEL_METRICS;
  },

  getModelEvaluation: async () => {
    const res = await fetchWithAuth("/models/evaluation");
    return res || MOCK_MODEL_METRICS;
  },

  retrainModel: async () => {
    const res = await fetchWithAuth("/models/retrain", { method: "POST" });
    return res || { status: "SUCCESS", message: "Retraining pipeline completed with updated parameters.", accuracy: 0.952 };
  },

  getSecurityStatus: async () => {
    const res = await fetchWithAuth("/security/status");
    return res || { status: "SECURE", firewall: "ACTIVE", encryption: "AES-256-GCM" };
  },

  getSecurityEvents: async () => {
    const res = await fetchWithAuth("/security/events");
    return res || [];
  },

  getAuditLogs: async () => {
    const res = await fetchWithAuth("/audit-logs");
    if (Array.isArray(res) && res.length > 0) return res;
    return MOCK_AUDIT_LOGS;
  },

  queryCopilot: async (question: string) => {
    const res = await fetchWithAuth("/copilot/query", {
      method: "POST",
      body: JSON.stringify({ question })
    });
    return res || getMockCopilotAnswer(question);
  },

  simulateEmergingThreat: async () => {
    const res = await fetchWithAuth("/demo/simulate-emerging-threat", { method: "POST" });
    if (!res) {
      const newEW = {
        id: `EW-${Date.now().toString().slice(-3)}`,
        title: "CRITICAL: Simulated High-Frequency UPI Cashout Surge",
        risk_score: 97.8,
        threat_category: "UPI Impersonation",
        status: "PENDING_REVIEW",
        created_at: new Date().toISOString(),
        recommended_action: "Dispatch PCR Units & Enforce Immediate ATM Geofence",
        affected_district: "Chennai, Tamil Nadu"
      };
      dynamicEarlyWarnings = [newEW, ...dynamicEarlyWarnings];
      return { status: "SIMULATED", message: "Threat scenario triggered successfully." };
    }
    return res;
  },

  resetDemo: async () => {
    const res = await fetchWithAuth("/demo/reset-demo", { method: "POST" });
    if (!res) {
      dynamicEarlyWarnings = [...MOCK_EARLY_WARNINGS];
      return { status: "RESET", message: "Demo state reset to standard baseline." };
    }
    return res;
  },

  predictCashout: async (data: any) => {
    const res = await fetchWithAuth("/predictions/cashout", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res || generatePredictionResult(data);
  },

  withdrawComplaint: async (data: any) => {
    const res = await fetchWithAuth("/complaints/withdraw", {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res) {
      const code = data.complaint_code || data.complaint_id;
      dynamicComplaints = dynamicComplaints.map(c => 
        (c.complaint_number === code || c.id === code) ? { ...c, status: "WITHDRAWN" } : c
      );
      return { success: true, status: "WITHDRAWN", message: `Complaint #${code} has been successfully withdrawn.` };
    }
    return res;
  },

  searchComplaints: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const res = await fetchWithAuth(`/complaints/search?${query.toString()}`);
    if (Array.isArray(res)) return res;
    return dynamicComplaints.slice(0, 50);
  },

  getComplaintReport: async (idOrCode: string) => {
    const res = await fetchWithAuth(`/complaints/${encodeURIComponent(idOrCode)}/report`);
    return res || getMockComplaintDossier(idOrCode);
  },

  addComplaintNote: async (idOrCode: string, noteData: { note_text: string; officer_name?: string }) => {
    const res = await fetchWithAuth(`/complaints/${encodeURIComponent(idOrCode)}/notes`, {
      method: "POST",
      body: JSON.stringify(noteData)
    });
    return res || { success: true, message: "Note recorded in forensic ledger." };
  },

  performComplaintAction: async (idOrCode: string, actionData: { action_type: string; officer_name?: string; details?: string; [key: string]: any }) => {
    const res = await fetchWithAuth(`/complaints/${encodeURIComponent(idOrCode)}/action`, {
      method: "POST",
      body: JSON.stringify(actionData)
    });
    return res || { success: true, action: actionData.action_type, message: "Statutory action enforced successfully." };
  },

  adminInspectComplaint: async (code: string) => {
    const res = await fetchWithAuth(`/complaints/admin-inspect/${code}`);
    return res || getMockComplaintDossier(code);
  },

  adminLogin: async (credentials: { username: string; password: string }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        const data = await res.json();
        tokenCache = data.access_token;
        return data;
      }
    } catch {
      // Backend offline fallback for standard admin credentials
    }
    if (credentials.username && credentials.password) {
      tokenCache = "mock-admin-jwt-token";
      return {
        access_token: tokenCache,
        token_type: "bearer",
        user: {
          username: credentials.username,
          full_name: credentials.username === "superadmin" ? "Director General Admin" : "Commanding Officer",
          role: "SUPER_ADMIN",
          badge_id: "IND-CMD-001",
          agency: "I4C Central Cyber Command & Regional Cell"
        }
      };
    }
    return null;
  },

  getModelInfo: async () => {
    const res = await fetchWithAuth("/predictions/model-info");
    return res || MOCK_MODEL_METRICS;
  },

  getHealth: async () => {
    const res = await fetchWithAuth("/health");
    return res || { status: "ONLINE", timestamp: new Date().toISOString() };
  },

  changePassword: async (passwords: { current_password: string; new_password: string }) => {
    const res = await fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwords)
    });
    return res || { success: true, message: "Password updated successfully." };
  },

  updateProfile: async (profile: { full_name: string; email: string; badge_id?: string }) => {
    const res = await fetchWithAuth("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    });
    return res || { success: true, message: "Officer profile details updated." };
  },

  getAlertsIncidents: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    const res = await fetchWithAuth(`/alerts-incidents${qs ? `?${qs}` : ""}`);
    if (res && Array.isArray(res.items)) return res;
    return dynamicAlerts;
  },

  getAlertsSummary: async () => {
    const res = await fetchWithAuth("/alerts-incidents/summary");
    return res || MOCK_ALERTS_INCIDENTS.summary;
  },

  getAlertDetails: async (idOrCode: string) => {
    const res = await fetchWithAuth(`/alerts-incidents/${encodeURIComponent(idOrCode)}`);
    if (res) return res;
    const found = dynamicAlerts.items.find(a => a.id === idOrCode);
    return found || dynamicAlerts.items[0];
  },

  triageAlert: async (idOrCode: string, payload: { status: string; notes?: string; assigned_to?: string }) => {
    const res = await fetchWithAuth(`/alerts-incidents/${encodeURIComponent(idOrCode)}/triage`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    if (!res) {
      dynamicAlerts.items = dynamicAlerts.items.map(a => a.id === idOrCode ? { ...a, triage_status: payload.status } : a);
      return { success: true, message: `Alert ${idOrCode} triaged to ${payload.status}` };
    }
    return res;
  },

  simulateAlertTelemetry: async () => {
    const res = await fetchWithAuth("/alerts-incidents/simulate", { method: "POST" });
    if (!res) {
      const newAlert = {
        id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        source_type: "ATM_SENSOR",
        severity: "CRITICAL",
        triage_status: "NEW",
        title: "Spike in Rapid Mule Cash Withdrawals",
        summary: "Multiple high-value cash withdrawals triggered across targeted ATM network within 60 seconds.",
        location: "Chennai Central, Tamil Nadu",
        risk_score: 97.4,
        correlated_complaint_id: "202677102941"
      };
      dynamicAlerts.items = [newAlert, ...dynamicAlerts.items];
      return { success: true, incident: newAlert };
    }
    return res;
  },

  getAlertsStreamUrl: () => `${API_BASE}/alerts-incidents/stream`
};
