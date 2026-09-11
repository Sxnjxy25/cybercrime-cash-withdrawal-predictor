/**
 * High-fidelity fallback and offline mock dataset for CyberPredictX
 * Provides instant, zero-latency realistic data when backend is starting or offline.
 */

export interface MockLocation {
  id: string;
  state: string;
  district: string;
  police_jurisdiction: string;
  latitude: number;
  longitude: number;
  current_risk_score: number;
  forecast_risk_score: number;
  risk_band: string;
  complaint_count: number;
  dominant_category: string;
}

export const MOCK_REGIONAL_LOCATIONS: MockLocation[] = [
  {
    id: "loc-del",
    state: "Delhi",
    district: "New Delhi",
    police_jurisdiction: "Special Cell Cyber Command, Delhi Police",
    latitude: 28.6139,
    longitude: 77.2090,
    current_risk_score: 89.0,
    forecast_risk_score: 93.5,
    risk_band: "CRITICAL",
    complaint_count: 412,
    dominant_category: "UPI Impersonation"
  },
  {
    id: "loc-mum",
    state: "Maharashtra",
    district: "Mumbai",
    police_jurisdiction: "BKC Cyber Police Station, Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
    current_risk_score: 84.0,
    forecast_risk_score: 88.2,
    risk_band: "CRITICAL",
    complaint_count: 388,
    dominant_category: "Digital Arrest Scam"
  },
  {
    id: "loc-blr",
    state: "Karnataka",
    district: "Bengaluru Urban",
    police_jurisdiction: "CID Cyber Crime Division, Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    current_risk_score: 82.0,
    forecast_risk_score: 86.4,
    risk_band: "CRITICAL",
    complaint_count: 345,
    dominant_category: "Investment & Crypto Scam"
  },
  {
    id: "loc-chn",
    state: "Tamil Nadu",
    district: "Chennai",
    police_jurisdiction: "Chennai Central Cyber Crime Police Station",
    latitude: 13.0827,
    longitude: 80.2707,
    current_risk_score: 78.0,
    forecast_risk_score: 83.1,
    risk_band: "CRITICAL",
    complaint_count: 298,
    dominant_category: "UPI Impersonation"
  },
  {
    id: "loc-hyd",
    state: "Telangana",
    district: "Hyderabad",
    police_jurisdiction: "Cyberabad Cyber Crime Unit, Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
    current_risk_score: 76.0,
    forecast_risk_score: 79.5,
    risk_band: "CRITICAL",
    complaint_count: 276,
    dominant_category: "Courier & Customs Fraud"
  },
  {
    id: "loc-pun",
    state: "Maharashtra",
    district: "Pune",
    police_jurisdiction: "Cyber Police Station, Pune City",
    latitude: 18.5204,
    longitude: 73.8567,
    current_risk_score: 71.0,
    forecast_risk_score: 75.0,
    risk_band: "HIGH",
    complaint_count: 210,
    dominant_category: "Investment Scam"
  },
  {
    id: "loc-kol",
    state: "West Bengal",
    district: "Kolkata",
    police_jurisdiction: "Lalbazar Cyber Crime PS, Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
    current_risk_score: 68.0,
    forecast_risk_score: 72.8,
    risk_band: "HIGH",
    complaint_count: 195,
    dominant_category: "Instant Loan App Scam"
  },
  {
    id: "loc-jai",
    state: "Rajasthan",
    district: "Jaipur",
    police_jurisdiction: "Cyber Crime PS, Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
    current_risk_score: 64.0,
    forecast_risk_score: 67.2,
    risk_band: "HIGH",
    complaint_count: 164,
    dominant_category: "Job & Part-Time Scam"
  },
  {
    id: "loc-ahd",
    state: "Gujarat",
    district: "Ahmedabad",
    police_jurisdiction: "Cyber Crime Police Station, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
    current_risk_score: 59.0,
    forecast_risk_score: 63.0,
    risk_band: "HIGH",
    complaint_count: 148,
    dominant_category: "Fake Customer Support"
  },
  {
    id: "loc-cbe",
    state: "Tamil Nadu",
    district: "Coimbatore",
    police_jurisdiction: "Cyber Crime Cell, Coimbatore",
    latitude: 11.0168,
    longitude: 76.9558,
    current_risk_score: 55.0,
    forecast_risk_score: 58.5,
    risk_band: "HIGH",
    complaint_count: 112,
    dominant_category: "Job Scam"
  }
];

// Helper to generate realistic complaints
export const createMockComplaints = () => {
  const categories = [
    "UPI Impersonation",
    "Digital Arrest Scam",
    "Phishing & Fake Banking",
    "Investment & Crypto Scam",
    "Job & Part-Time Scam",
    "Fake Customer Support",
    "Courier & Customs Fraud",
    "Instant Loan App Fraud",
    "Account Takeover / SIM Swap"
  ];

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Kotak Mahindra Bank"
  ];

  const channels = ["WhatsApp", "Telegram", "Phone Call", "Phishing Web", "SMS"];
  const payments = ["UPI", "Bank Transfer", "Credit Card", "IMPS"];
  const statuses = ["OPEN", "IN_PROGRESS", "UNDER_INVESTIGATION", "FREEZE_ENFORCED", "RESOLVED"];

  const complaints: any[] = [];
  const now = new Date();

  // Known sample codes for quick testing
  const knownCases = [
    { code: "202688392104", state: "Maharashtra", district: "Mumbai", cat: "Digital Arrest Scam", amount: 245000, bank: "HDFC Bank" },
    { code: "202677102941", state: "Tamil Nadu", district: "Chennai", cat: "UPI Impersonation", amount: 135000, bank: "State Bank of India" },
    { code: "202655410982", state: "Delhi", district: "New Delhi", cat: "Phishing & Fake Banking", amount: 185000, bank: "ICICI Bank" }
  ];

  knownCases.forEach((k, idx) => {
    const loc = MOCK_REGIONAL_LOCATIONS.find(l => l.district === k.district) || MOCK_REGIONAL_LOCATIONS[0];
    complaints.push({
      id: `complaint-seed-${idx + 1}`,
      complaint_number: k.code,
      source_portal: "National Cybercrime Reporting Portal (NCCP)",
      complaint_timestamp: new Date(now.getTime() - (idx + 1) * 3600000 * 4).toISOString(),
      state: loc.state,
      district: loc.district,
      police_jurisdiction: loc.police_jurisdiction,
      location_lat: loc.latitude + 0.002,
      location_lng: loc.longitude + 0.003,
      category: k.cat,
      financial_loss: k.amount,
      channel: "WhatsApp",
      payment_method: "UPI",
      modus_operandi_type: k.cat,
      narrative: `Victim coerced into urgent fund transfer to suspect account under false pretenses of ${k.cat}. Reported loss of INR ${k.amount.toLocaleString('en-IN')}.`,
      upi_identifier: `secure.pay${idx + 201}@ybl`,
      mobile_identifier: `+91 98765 ${10000 + idx * 111}`,
      email_identifier: `target.desk${idx + 1}@fastmail.com`,
      bank_identifier: `SBIN000${8900 + idx}`,
      mule_account: `3098${44200000 + idx * 54321}`,
      domain_url: `https://fraud-check-${idx + 101}.net`,
      social_identifier: `@target_${idx + 100}`,
      priority: k.amount > 200000 ? "CRITICAL" : "HIGH",
      status: idx === 0 ? "UNDER_INVESTIGATION" : "OPEN"
    });
  });

  for (let i = 4; i <= 150; i++) {
    const loc = MOCK_REGIONAL_LOCATIONS[(i - 1) % MOCK_REGIONAL_LOCATIONS.length];
    const cat = categories[(i - 1) % categories.length];
    const bank = banks[(i - 1) % banks.length];
    const channel = channels[(i - 1) % channels.length];
    const payment = cat === "UPI Impersonation" ? "UPI" : payments[(i - 1) % payments.length];
    const status = statuses[(i - 1) % statuses.length];
    const amount = Math.round(5000 + ((i * 3791) % 285000));
    const hoursAgo = (i * 3.7) % 720;
    const time = new Date(now.getTime() - hoursAgo * 3600000).toISOString();
    const code = `NCCP-2026-${100000 + i}`;

    complaints.push({
      id: `complaint-${i}`,
      complaint_number: code,
      source_portal: "National Cybercrime Reporting Portal (NCCP)",
      complaint_timestamp: time,
      state: loc.state,
      district: loc.district,
      police_jurisdiction: loc.police_jurisdiction,
      location_lat: loc.latitude + ((i % 10) - 5) * 0.005,
      location_lng: loc.longitude + ((i % 8) - 4) * 0.005,
      category: cat,
      financial_loss: amount,
      channel: channel,
      payment_method: payment,
      modus_operandi_type: cat,
      narrative: `Victim reported cyber financial fraud under ${cat}. Communication occurred via ${channel} involving illicit redirection to ${bank} account. Total reported loss: INR ${amount.toLocaleString('en-IN')}.`,
      upi_identifier: `pay.refund${100 + (i % 899)}@ybl`,
      mobile_identifier: `+91 98765 ${20000 + (i % 79999)}`,
      email_identifier: `alert.desk${i % 99}@fastmail.com`,
      bank_identifier: `3098${10000000 + (i * 98765) % 89999999}`,
      mule_account: `3098${10000000 + (i * 98765) % 89999999}`,
      domain_url: `https://secure-portal-${100 + (i % 900)}.net`,
      social_identifier: `@target_${100 + (i % 900)}`,
      priority: amount > 200000 ? "CRITICAL" : (amount > 100000 ? "HIGH" : "MEDIUM"),
      status: status
    });
  }

  return complaints;
};

export const MOCK_COMPLAINTS = createMockComplaints();

export const MOCK_DASHBOARD_SUMMARY = {
  kpi_metrics: {
    total_complaints: 10480,
    total_financial_loss: 18450000,
    high_risk_locations: 18,
    global_risk_index: 78.4,
    global_risk_band: "CRITICAL",
    complaints_growth_trend: "+8.4%"
  },
  emerging_threat: {
    name: "UPI Impersonation Fraud Ring",
    growth: "+47%",
    affected_region: "Chennai, Tamil Nadu",
    anomaly_score: 0.91,
    intelligence_state: "CORRELATED"
  },
  forecast_summary: {
    current_vol: 428.0,
    forecast_vol: 475.0,
    lower_bound: 450.0,
    upper_bound: 510.0,
    confidence: 94.2
  },
  active_early_warnings_count: 4,
  monitored_jurisdictions: 10
};

export const MOCK_FORECASTS = {
  horizon: "7d",
  historical: [
    { date: "Day 1", actual: 310, forecast: 310 },
    { date: "Day 2", actual: 340, forecast: 335 },
    { date: "Day 3", actual: 380, forecast: 375 },
    { date: "Day 4", actual: 410, forecast: 405 },
    { date: "Day 5", actual: 428, forecast: 425 },
    { date: "Day 6 (Pred)", actual: null, forecast: 455, lower: 430, upper: 480 },
    { date: "Day 7 (Pred)", actual: null, forecast: 475, lower: 450, upper: 510 }
  ],
  trend_pct: "+8.4%",
  risk_status: "ACCELERATING",
  confidence_score: 94.2
};

export const MOCK_THREAT_CLUSTERS = [
  {
    id: "TC-2026-01",
    title: "Chennai-Bengaluru UPI Cashout Mule Network",
    risk_score: 92.4,
    growth_rate_pct: 47.0,
    primary_state: "Tamil Nadu",
    primary_district: "Chennai",
    anomaly_score: 0.91,
    intelligence_state: "CORRELATED",
    member_count: 48,
    associated_amount: 4850000
  },
  {
    id: "TC-2026-02",
    title: "Delhi NCR Digital Arrest & Impersonation Syndicate",
    risk_score: 88.6,
    growth_rate_pct: 32.0,
    primary_state: "Delhi",
    primary_district: "New Delhi",
    anomaly_score: 0.87,
    intelligence_state: "CORRELATED",
    member_count: 36,
    associated_amount: 3920000
  },
  {
    id: "TC-2026-03",
    title: "Mumbai Western Corridor Instant Loan Fraud App Ring",
    risk_score: 79.5,
    growth_rate_pct: 24.5,
    primary_state: "Maharashtra",
    primary_district: "Mumbai",
    anomaly_score: 0.78,
    intelligence_state: "MONITORED",
    member_count: 22,
    associated_amount: 2150000
  }
];

export const MOCK_EARLY_WARNINGS = [
  {
    id: "EW-901",
    title: "High-Frequency UPI Cash-Out Spike at Chennai ATM Cluster",
    risk_score: 94.0,
    threat_category: "UPI Impersonation",
    status: "PENDING_REVIEW",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    recommended_action: "Dispatch PCR Patrol & Enforce Emergency Geofence on SBI e-Corner ATM",
    affected_district: "Chennai, Tamil Nadu"
  },
  {
    id: "EW-902",
    title: "Coordinated Mule Account Rapid Layering Detected across NCR",
    risk_score: 89.5,
    threat_category: "Digital Arrest Scam",
    status: "PENDING_REVIEW",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    recommended_action: "Initiate Multi-Bank Sec 91 CrPC Freeze Requisition via NPCI Gateway",
    affected_district: "New Delhi, Delhi"
  },
  {
    id: "EW-903",
    title: "Simulated Fake Customs Phishing Domain Surge",
    risk_score: 81.2,
    threat_category: "Courier & Customs Fraud",
    status: "REVIEWED",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    recommended_action: "Block Host IP at National DNS Resolver Level via CERT-In",
    affected_district: "Hyderabad, Telangana"
  }
];

export const MOCK_INVESTIGATIONS = [
  {
    id: "INV-2026-001",
    title: "Investigation into UPI Impersonation Syndicate",
    risk_score: 94.0,
    lead_officer: "Insp. Rajesh Kumar",
    status: "ACTIVE",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    summary: "Officer created investigation case from Early Warning alert for multi-city cashout ring."
  },
  {
    id: "INV-2026-002",
    title: "Digital Arrest Syndicate Bank Layering Probe",
    risk_score: 88.0,
    lead_officer: "Commanding Officer Rao",
    status: "ACTIVE",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    summary: "Forensic cross-correlation of 18 mule bank accounts linked to telecom spoofing in BKC jurisdiction."
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    id: "AUD-101",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    officer_name: "Director General Admin",
    badge_id: "IND-CMD-001",
    action: "ADMIN_INSPECT_COMPLAINT",
    details: "Inspected high-risk dossier for complaint #202688392104",
    ip_address: "10.0.12.44"
  },
  {
    id: "AUD-102",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    officer_name: "Insp. Rajesh Kumar",
    badge_id: "IND-INV-104",
    action: "ATM_GEOFENCE_ENFORCE",
    details: "Dispatched rapid response PCR to Chennai Central ATM cluster",
    ip_address: "10.0.14.89"
  },
  {
    id: "AUD-103",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    officer_name: "Commanding Officer Rao",
    badge_id: "IND-CMD-002",
    action: "BANK_FREEZE_REQUISITION",
    details: "Issued Section 91 CrPC statutory hold to HDFC Bank nodal officer",
    ip_address: "10.0.12.18"
  }
];

export const MOCK_ALERTS_INCIDENTS = {
  items: [
    {
      id: "INC-2026-8841",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      source_type: "ATM_SENSOR",
      severity: "CRITICAL",
      triage_status: "NEW",
      title: "Rapid Micro-Withdrawal Burst Detected at e-Corner ATM",
      summary: "5 consecutive debit cashouts under 3 minutes totaling INR 98,000 on flagged mule card.",
      location: "Chennai Central, Tamil Nadu",
      risk_score: 96.5,
      correlated_complaint_id: "202677102941"
    },
    {
      id: "INC-2026-8840",
      timestamp: new Date(Date.now() - 480000).toISOString(),
      source_type: "BANK_FEED",
      severity: "HIGH",
      triage_status: "IN_REVIEW",
      title: "Rapid Layering Transfer to Unverified Beneficiary",
      summary: "INR 2,45,000 transferred into fresh account and split into 4 UPI addresses within 90 seconds.",
      location: "BKC, Mumbai",
      risk_score: 88.2,
      correlated_complaint_id: "202688392104"
    },
    {
      id: "INC-2026-8839",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      source_type: "TELECOM_PROBE",
      severity: "MEDIUM",
      triage_status: "TRIAGED",
      title: "VoIP CLI Spoofing Cluster Detected Calling Elderly Citizens",
      summary: "SIP trunk origin disguised as Delhi Police Control Room initiating mass voice calls.",
      location: "New Delhi, Delhi",
      risk_score: 78.4,
      correlated_complaint_id: "202655410982"
    }
  ],
  total: 3,
  page: 1,
  total_pages: 1,
  summary: {
    total_incidents: 148,
    critical_count: 14,
    high_count: 42,
    triaged_count: 92,
    ingestion_rate_eps: 2840
  }
};

export const MOCK_MODEL_METRICS = {
  model_name: "XGBoost Cash-Out Early Predictor (v2.4-Production)",
  algorithm: "Gradient Boosted Decision Trees + Graph Neural Network Link Predictor",
  framework: "XGBoost / PyTorch Geometric / Scikit-Learn",
  trained_timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  accuracy: 0.948,
  precision: 0.932,
  recall: 0.961,
  f1_score: 0.946,
  roc_auc: 0.978,
  drift_score: 0.024,
  latency_ms: 42,
  feature_importances: [
    { feature: "Time-Delta Since Transfer", importance: 0.28 },
    { feature: "Mule Account Velocity Ratio", importance: 0.22 },
    { feature: "Proximity to High-Density ATM Hotspot", importance: 0.18 },
    { feature: "Transaction Amount vs Typical Mule Cap", importance: 0.14 },
    { feature: "Geographic Jump (IP vs Card Location)", importance: 0.11 },
    { feature: "Payment Format (UPI vs IMPS)", importance: 0.07 }
  ]
};

export const MOCK_ENTITY_GRAPH = {
  nodes: [
    { id: "node-victim-1", label: "Victim (S. Raman)", type: "VICTIM", risk: 20 },
    { id: "node-mule-1", label: "Mule Acc: 30988421098 (HDFC)", type: "MULE_ACCOUNT", risk: 94 },
    { id: "node-upi-1", label: "UPI: refund.pay991@ybl", type: "UPI_VPA", risk: 96 },
    { id: "node-atm-1", label: "ATM-CHN-101 (SBI e-Corner)", type: "ATM_LOCATION", risk: 92 },
    { id: "node-device-1", label: "IMEI: 864910284019284", type: "DEVICE_HARDWARE", risk: 89 },
    { id: "node-ip-1", label: "IP: 103.24.188.42 (VPN Proxy)", type: "IP_ENDPOINT", risk: 85 }
  ],
  links: [
    { source: "node-victim-1", target: "node-upi-1", label: "UPI Transfer ₹1,35,000" },
    { source: "node-upi-1", target: "node-mule-1", label: "Instant Layering" },
    { source: "node-mule-1", target: "node-atm-1", label: "Predicted Cashout Target" },
    { source: "node-mule-1", target: "node-device-1", label: "Linked Mobile Banking Device" },
    { source: "node-device-1", target: "node-ip-1", label: "Active Network Session" }
  ]
};

export const generatePredictionResult = (input: any) => {
  const amt = Number(input.amount || 150000);
  const lat = Number(input.latitude || 22.5726);
  const lon = Number(input.longitude || 88.3639);
  const city = input.city || "Kolkata, West Bengal";

  const riskScore = amt > 200000 ? 96.2 : (amt > 100000 ? 91.4 : 84.0);
  const etaMins = Math.max(8, Math.min(45, Math.round(50 - (amt / 8000))));

  return {
    prediction_id: `PRED-${Date.now()}`,
    risk_score: riskScore,
    cashout_risk_band: riskScore > 85 ? "CRITICAL" : "HIGH",
    predicted_withdrawal_window_mins: `${etaMins} - ${etaMins + 15} mins`,
    probability_of_cashout: 0.94,
    recommended_action: "IMMEDIATE_ATM_INTERDICTION",
    target_geography: {
      city: city,
      latitude: lat,
      longitude: lon
    },
    hotspots: [
      {
        atm_id: `ATM-${city.substring(0, 3).toUpperCase()}-101`,
        atm_name: `State Bank of India 24x7 e-Corner (${city.split(',')[0]} Main)`,
        latitude: lat + 0.0021,
        longitude: lon + 0.0019,
        distance_km: 0.45,
        estimated_arrival_eta_mins: Math.max(3, Math.round(etaMins * 0.4)),
        cashout_risk_score: 0.96,
        action_priority: "CRITICAL",
        cctv_status: "FEED_STREAMING_ONLINE",
        patrol_distance_mins: 2
      },
      {
        atm_id: `ATM-${city.substring(0, 3).toUpperCase()}-102`,
        atm_name: `HDFC Bank Cash Recycler & ATM (${city.split(',')[0]} Junction)`,
        latitude: lat - 0.0032,
        longitude: lon + 0.0028,
        distance_km: 0.85,
        estimated_arrival_eta_mins: Math.max(6, Math.round(etaMins * 0.7)),
        cashout_risk_score: 0.88,
        action_priority: "HIGH",
        cctv_status: "RECORDING_ACTIVE",
        patrol_distance_mins: 4
      }
    ],
    statutory_freeze: {
      section: "Section 91 / 102 Code of Criminal Procedure (CrPC)",
      jurisdiction_notice: "Formal statutory notice generated and queued for Bank Nodal Officer dispatch."
    }
  };
};

export const getMockComplaintDossier = (code: string) => {
  // Check if we have matching item in list
  const found = MOCK_COMPLAINTS.find(c => (c.complaint_number || "").toLowerCase() === code.toLowerCase() || c.id === code);
  const loc = found ? {
    city: found.district,
    district: found.district,
    state: found.state,
    latitude: found.location_lat,
    longitude: found.location_lng,
    police_jurisdiction: found.police_jurisdiction
  } : {
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    police_jurisdiction: "Chennai Central Cyber Crime Police Station"
  };

  const loss = found ? found.financial_loss : 135000;
  const category = found ? found.category : "UPI Impersonation";

  return {
    complaint_code: code || "202677102941",
    status: found?.status || "UNDER_INVESTIGATION",
    category: category,
    financial_loss: loss,
    victim_bank: "State Bank of India",
    suspect_mule_account: found?.mule_account || "309884210984",
    suspect_upi_id: found?.upi_identifier || "refund.pay991@ybl",
    suspect_mobile: found?.mobile_identifier || "+91 98765 43210",
    transaction_id: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
    timestamp: found?.complaint_timestamp || new Date(Date.now() - 7200000).toISOString(),
    location: loc,
    urgency_level: loss > 200000 ? "CRITICAL" : "HIGH",
    forecasted_atm_hotspots: [
      {
        atm_id: "ATM-CHN-101",
        atm_name: "State Bank of India e-Corner (Chennai Central)",
        latitude: Number(loc.latitude) + 0.0018,
        longitude: Number(loc.longitude) + 0.0028,
        distance_km: 0.45,
        estimated_arrival_eta_mins: 3,
        cashout_risk_score: 0.98,
        action_priority: "CRITICAL",
        cctv_status: "FEED_STREAMING_ONLINE",
        patrol_distance_mins: 2
      },
      {
        atm_id: "ATM-CHN-102",
        atm_name: "HDFC Bank ATM (Anna Salai Branch)",
        latitude: Number(loc.latitude) - 0.0024,
        longitude: Number(loc.longitude) + 0.0035,
        distance_km: 0.92,
        estimated_arrival_eta_mins: 7,
        cashout_risk_score: 0.86,
        action_priority: "HIGH",
        cctv_status: "RECORDING_ACTIVE",
        patrol_distance_mins: 5
      }
    ],
    notes: [
      {
        id: "note-1",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        officer: "Insp. Rajesh Kumar",
        badge: "IND-INV-104",
        text: "Automated cash-out prediction correlated with known mule network. Section 91 CrPC freeze instruction dispatched to SBI Nodal Officer."
      }
    ]
  };
};

export const getMockCopilotAnswer = (query: string) => {
  const q = query.toLowerCase();
  if (q.includes("highest") || q.includes("risk") || q.includes("state") || q.includes("district")) {
    return {
      answer: "Based on empirical real-time telemetry across 10 monitored state jurisdictions, Delhi (New Delhi) and Maharashtra (Mumbai) exhibit the highest composite cybercrime risk scores at 89.0/100 and 84.0/100 respectively. The dominant modus operandi in Delhi is high-velocity UPI Impersonation, whereas Mumbai registers severe Digital Arrest fraud rings.",
      evidence: [
        "Special Cell Cyber Command Telemetry Feed (Delhi): 412 active complaints",
        "BKC Cyber Police Station Records (Mumbai): 388 active complaints",
        "Empirical XGBoost Risk Forecaster: Accelerated 7-day risk growth (+9.2%)"
      ],
      metrics: { confidence: 0.96, status: "ONLINE", source: "CYBERPREDICT_ANALYTICS_V2" },
      drill_down_actions: ["Open India Risk Map", "Inspect High-Risk Hotspots", "Export Regional Intelligence PDF"]
    };
  } else if (q.includes("early warning") || q.includes("alert")) {
    return {
      answer: "Currently, 3 active Early Warning alerts require law enforcement review. The highest priority is alert EW-901: 'High-Frequency UPI Cash-Out Spike at Chennai ATM Cluster' with a 94.0/100 risk score and recommended rapid PCR dispatch to SBI e-Corner ATM.",
      evidence: [
        "Alert ID EW-901 (Chennai Central ATM Cluster)",
        "Coordinated Layering Incident INC-2026-8841",
        "Predicted ATM Cashout Window: 15-30 mins"
      ],
      metrics: { confidence: 0.94, status: "ONLINE", source: "EARLY_WARNING_ENGINE" },
      drill_down_actions: ["Review Early Warning Alerts", "Enforce Emergency ATM Geofence"]
    };
  } else {
    return {
      answer: `Analysis complete for: "${query}". Real-time predictive telemetry correlates live complaint streams with machine learning cashout horizons. All telemetry and forensics engines are synchronized.`,
      evidence: [
        "10,480 Ingested Financial Complaints",
        "10 Active Monitored Police Jurisdictions",
        "Predictive Cash-Out Model Precision: 94.8%"
      ],
      metrics: { confidence: 0.92, status: "ONLINE", source: "CYBERPREDICT_COPILOT" },
      drill_down_actions: ["View Live Complaints Feed", "Run Machine Learning Sandbox"]
    };
  }
};
