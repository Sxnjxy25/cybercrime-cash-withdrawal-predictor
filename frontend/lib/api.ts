const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

let tokenCache: string | null = null;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Ensure token exists (auto login superadmin for seamless local prototype demo)
  if (!tokenCache) {
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "superadmin", password: "Password@123" })
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        tokenCache = data.access_token;
      }
    } catch (e) {
      console.warn("Backend auth connection error fallback", e);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(tokenCache ? { "Authorization": `Bearer ${tokenCache}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error(`API Fetch Error on ${endpoint}:`, e);
  }
  return null;
}

export const api = {
  getDashboardSummary: () => fetchWithAuth("/dashboard/summary"),
  getComplaints: () => fetchWithAuth("/complaints"),
  getAnalyticsTrends: () => fetchWithAuth("/analytics/trends"),
  getRegionalRisk: () => fetchWithAuth("/analytics/regional-risk"),
  getPredictions: () => fetchWithAuth("/predictions"),
  getForecasts: (horizon = "7d") => fetchWithAuth(`/forecasts?horizon=${horizon}`),
  getAnomalies: () => fetchWithAuth("/anomalies"),
  getThreatClusters: () => fetchWithAuth("/threat-clusters"),
  getEntities: () => fetchWithAuth("/entities"),
  getEntityGraph: () => fetchWithAuth("/entities/graph"),
  getEarlyWarnings: () => fetchWithAuth("/early-warnings"),
  updateWarningAction: (id: string, action: string) => fetchWithAuth(`/early-warnings/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ action })
  }),
  getInvestigations: () => fetchWithAuth("/investigations"),
  createInvestigation: (data: any) => fetchWithAuth("/investigations", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  getModelObservatory: () => fetchWithAuth("/models"),
  getSecurityStatus: () => fetchWithAuth("/security/status"),
  getSecurityEvents: () => fetchWithAuth("/security/events"),
  getAuditLogs: () => fetchWithAuth("/audit-logs"),
  queryCopilot: (question: string) => fetchWithAuth("/copilot/query", {
    method: "POST",
    body: JSON.stringify({ question })
  }),
  simulateEmergingThreat: () => fetchWithAuth("/demo/simulate-emerging-threat", { method: "POST" }),
  resetDemo: () => fetchWithAuth("/demo/reset-demo", { method: "POST" }),
  getHealth: () => fetchWithAuth("/health")
};
