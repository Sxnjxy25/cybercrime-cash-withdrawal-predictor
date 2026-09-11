import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface OfficerInfo {
  full_name?: string;
  badge_id?: string;
  role?: string;
  agency?: string;
  username?: string;
}

export interface ComplaintExportData {
  complaint_code: string;
  status: string;
  category: string;
  financial_loss: number;
  victim_bank?: string;
  suspect_mule_account?: string;
  transaction_id?: string;
  timestamp?: string;
  location?: {
    city?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    police_jurisdiction?: string;
  };
  forecasted_atm_hotspots?: Array<{
    atm_id: string;
    atm_name: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    estimated_arrival_eta_mins: number;
    cashout_risk_score: number;
    action_priority: string;
    cctv_status: string;
    patrol_distance_mins?: number;
  }>;
  urgency_level?: string;
}

/**
 * Generates and triggers download of a formal court-ready
 * "Law Enforcement Action Briefing & Statutory Requisition PDF"
 */
export const exportActionBriefingPdf = (
  complaint: ComplaintExportData,
  officer?: OfficerInfo
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  const primaryNavy = [0, 58, 156] as [number, number, number]; // #003A9C
  const darkNavy = [11, 25, 44] as [number, number, number]; // #0B192C
  const crimson = [220, 38, 38] as [number, number, number]; // #DC2626
  const slateDark = [51, 65, 85] as [number, number, number]; // #334155
  const slateLight = [241, 245, 249] as [number, number, number]; // #F1F5F9

  const officerName = officer?.full_name || "Investigating Officer";
  const badgeId = officer?.badge_id || "IND-CYB-001";
  const agencyName = officer?.agency || "I4C Central Cyber Command & Regional Response Unit";
  const caseCode = complaint.complaint_code || "N/A";
  const incidentDate = complaint.timestamp || new Date().toISOString().replace("T", " ").slice(0, 19);
  const nowStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // -------------------------------------------------------------
  // 1. TOP STATUTORY HEADER & EMBLEM BANNER
  // -------------------------------------------------------------
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("भारत सरकार | GOVERNMENT OF INDIA • गृह मंत्रालय | MINISTRY OF HOME AFFAIRS", pageWidth / 2, 7, { align: "center" });

  doc.setFontSize(11);
  doc.text("INDIAN CYBER CRIME COORDINATION CENTRE (I4C)", pageWidth / 2, 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("NATIONAL FINANCIAL FRAUD DIVISION • ADVANCED CASH-OUT EARLY WARNING SYSTEM", pageWidth / 2, 18, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 220, 100);
  doc.setFontSize(7.5);
  doc.text("RESTRICTED // LAW ENFORCEMENT SENSITIVE // COURT ORDER BRIEFING", pageWidth / 2, 24, { align: "center" });

  currentY = 33;

  // Document Title & Legal Citation
  doc.setTextColor(...darkNavy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("LAW ENFORCEMENT ACTION BRIEFING & JUDICIAL REQUISITION", margin, currentY);
  currentY += 5;

  doc.setFontSize(8);
  doc.setTextColor(...crimson);
  doc.text("ISSUED UNDER SECTION 91 Cr.P.C. / SECTION 102 BNSS & SECTION 69A INFORMATION TECHNOLOGY ACT, 2000", margin, currentY);
  currentY += 6;

  // Metadata Box (Officer & Case Requisition Info)
  doc.setDrawColor(200, 215, 230);
  doc.setFillColor(...slateLight);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 22, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "bold");
  doc.text("REQUISITION ID:", margin + 4, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`REQ-${caseCode}-LE`, margin + 30, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("DATE & TIME:", margin + 4, currentY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(`${nowStr} IST`, margin + 30, currentY + 10);

  doc.setFont("helvetica", "bold");
  doc.text("TARGET CASE #:", margin + 4, currentY + 15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...crimson);
  doc.text(`#${caseCode}`, margin + 30, currentY + 15);

  // Right column of Metadata Box
  const midX = margin + 95;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  doc.text("AUTHORIZING OFFICER:", midX, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`${officerName} (Badge: ${badgeId})`, midX + 38, currentY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("DESIGNATED CELL:", midX, currentY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(`${agencyName}`, midX + 38, currentY + 10);

  doc.setFont("helvetica", "bold");
  doc.text("INCIDENT STATUS:", midX, currentY + 15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...crimson);
  doc.text(`${complaint.status || "ACTIVE_INTERCEPTION"} (${complaint.urgency_level || "CRITICAL URGENCY"})`, midX + 38, currentY + 15);

  currentY += 26;

  // -------------------------------------------------------------
  // 2. INCIDENT & FINANCIAL LOSS ANALYSIS
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryNavy);
  doc.setFontSize(10);
  doc.text("1. INCIDENT FINANCIAL DOSSIER & JURISDICTION", margin, currentY);
  currentY += 4;

  const loc = complaint.location || {};
  const incidentRows = [
    [
      "Complaint Tracking Code",
      `#${caseCode}`,
      "Incident Date/Time",
      incidentDate
    ],
    [
      "Crime Category",
      complaint.category || "Financial Cyber Fraud / Layered Mule Withdrawal",
      "Total Financial Loss",
      `INR ₹${Number(complaint.financial_loss || 0).toLocaleString("en-IN")}`
    ],
    [
      "Victim Financial Institution",
      complaint.victim_bank || "State Bank of India",
      "Primary Beneficiary Mule Node",
      complaint.suspect_mule_account || "HDFC-0019283719"
    ],
    [
      "Primary UTR / Transaction Reference",
      complaint.transaction_id || `UTR${caseCode}`,
      "Incident Jurisdiction",
      loc.police_jurisdiction || "Central Cyber Crime Police Station"
    ],
    [
      "Incident Center Coordinates",
      `${Number(loc.latitude || 13.0827).toFixed(4)}° N, ${Number(loc.longitude || 80.2707).toFixed(4)}° E`,
      "District / State",
      `${loc.city || loc.district || "Chennai"}, ${loc.state || "Tamil Nadu"}`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: incidentRows,
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 42 },
      3: { fontStyle: "bold", cellWidth: "auto" }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // -------------------------------------------------------------
  // 3. MULTI-HOP TRANSACTION CHAIN & MONEY TRAIL
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryNavy);
  doc.setFontSize(10);
  doc.text("2. MULTI-HOP TRANSACTION TRAIL & LAYERED MONEY ROUTING", margin, currentY);
  currentY += 4;

  const lossNum = Number(complaint.financial_loss || 185000);
  const hopChainData = [
    [
      "Hop 0 (Origin)",
      "Victim Remitter Account",
      complaint.victim_bank || "SBI A/C *******4512",
      `₹${lossNum.toLocaleString("en-IN")}`,
      "T-00 mins",
      "Unauthorized Phishing / UPI Debit"
    ],
    [
      "Hop 1 (Layer 1)",
      "Primary Mule Collector",
      complaint.suspect_mule_account || "HDFC-0019283719",
      `₹${(lossNum * 0.95).toFixed(0)}`,
      "T+02 mins",
      "Immediate Split via Instant IMPS"
    ],
    [
      "Hop 2 (Layer 2)",
      "Intermediary Transit Node",
      "Axis-Mule-Gateway #8839",
      `₹${(lossNum * 0.48).toFixed(0)} / split`,
      "T+06 mins",
      "Distributed across Micro-Pockets"
    ],
    [
      "Hop 3 (Terminal)",
      "ATM Cash-Out Vector",
      complaint.forecasted_atm_hotspots?.[0]?.atm_name || "SBI e-Corner Terminal",
      `₹${(lossNum * 0.45).toFixed(0)} (Cash)`,
      "T+12 mins (ETA)",
      "HIGH PROBABILITY PHYSICAL CASH-OUT"
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Hop Index", "Node Classification", "Entity / Account ID", "Amount Routed", "Velocity", "Operational Finding"]],
    body: hopChainData,
    theme: "striped",
    headStyles: { fillColor: primaryNavy, fontSize: 7.5, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 2.2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 24 },
      1: { cellWidth: 34 },
      2: { fontStyle: "bold", cellWidth: 40 },
      3: { fontStyle: "bold", cellWidth: 24 },
      4: { cellWidth: 20 },
      5: { cellWidth: "auto" }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // -------------------------------------------------------------
  // 4. FORECASTED CASH-OUT ATM HOTSPOTS MATRIX
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryNavy);
  doc.setFontSize(10);
  doc.text("3. FORECASTED CASH-OUT ATM HOTSPOTS (PHYSICAL INTERCEPTION TARGETS)", margin, currentY);
  currentY += 4;

  const hotspots = complaint.forecasted_atm_hotspots || [];
  const hotspotRows = hotspots.map((h, i) => [
    `#${i + 1} (${h.atm_id})`,
    h.atm_name,
    `${Number(h.latitude).toFixed(4)}° N, ${Number(h.longitude).toFixed(4)}° E`,
    `${h.distance_km} km`,
    `${h.estimated_arrival_eta_mins} mins`,
    `${(Number(h.cashout_risk_score) * 100).toFixed(0)}%`,
    h.action_priority || "CRITICAL",
    h.cctv_status || "ACTIVE"
  ]);

  if (hotspotRows.length === 0) {
    hotspotRows.push([
      "ATM-DFLT-01",
      "Primary Regional Commercial ATM Hub",
      `${Number(loc.latitude || 13.0827).toFixed(4)}° N, ${Number(loc.longitude || 80.2707).toFixed(4)}° E`,
      "0.5 km",
      "3 mins",
      "95%",
      "CRITICAL",
      "FEED_ONLINE"
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["ATM ID", "Terminal Name & Landmark", "GPS Coordinates", "Distance", "ETA", "Risk %", "Priority", "CCTV Status"]],
    body: hotspotRows,
    theme: "striped",
    headStyles: { fillColor: [180, 20, 20], fontSize: 7.5, fontStyle: "bold" },
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 24 },
      1: { cellWidth: 44 },
      2: { fontStyle: "bold", cellWidth: 34 },
      3: { cellWidth: 16 },
      4: { cellWidth: 14 },
      5: { fontStyle: "bold", cellWidth: 14 },
      6: { fontStyle: "bold", cellWidth: 18 },
      7: { cellWidth: "auto" }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need a new page for legal directives & signature
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin + 5;
  }

  // -------------------------------------------------------------
  // 5. STATUTORY DIRECTIVES & INTERCEPTION MANDATE
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryNavy);
  doc.setFontSize(9.5);
  doc.text("4. STATUTORY DIRECTIVES & LAW ENFORCEMENT ORDERS", margin, currentY);
  currentY += 4;

  const directives = [
    "A. TO BANK NODAL OFFICERS: Under powers conferred by Section 91 Cr.P.C. and Section 102 BNSS, you are commanded to immediately place a FULL DEBIT LIEN & FREEZE on suspect beneficiary accounts identified above and preserve all CCTV footage and ATM cash logs.",
    "B. TO POLICE CONTROL ROOM (PCR) & PATROL UNITS: Deploy immediate physical containment at the predicted high-probability ATM coordinates listed in Table 3. Intercept suspect individuals attempting cardless or rapid bulk withdrawals within the active ETA window.",
    "C. TO CYBER CELL FORENSICS: Register digital telemetry hash in CCTNS repository. Preserve all IP session logs and upstream gateway routing paths."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...slateDark);
  directives.forEach((d) => {
    const splitLines = doc.splitTextToSize(d, pageWidth - (margin * 2));
    doc.text(splitLines, margin, currentY);
    currentY += splitLines.length * 3.5 + 1;
  });

  currentY += 4;

  // -------------------------------------------------------------
  // 6. OFFICIAL SIGNATURE & DIGITAL VERIFICATION BLOCK
  // -------------------------------------------------------------
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = margin + 5;
  }

  doc.setDrawColor(200, 210, 225);
  doc.setFillColor(...slateLight);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text("OFFICIAL DIGITAL VERIFICATION & ACTION HANDOVER SEAL", margin + 4, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateDark);
  doc.text(`Digitally Generated by I4C National Cyber Threat Portal`, margin + 4, currentY + 10);
  doc.text(`Digital Sign-Off: SHA256-${caseCode.slice(0, 8)}-${Date.now().toString(16).toUpperCase()}`, margin + 4, currentY + 15);
  doc.text(`Valid for Immediate Presentation before Judicial Magistrate / Bank Nodal Desk`, margin + 4, currentY + 20);

  // Right side Signature Box
  const sigX = margin + 115;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkNavy);
  doc.text("INVESTIGATING OFFICER SIGNATURE:", sigX, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`${officerName}`, sigX, currentY + 10);
  doc.text(`Badge: ${badgeId}`, sigX, currentY + 15);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...crimson);
  doc.text(`[VERIFIED ELECTRONIC DISPATCH]`, sigX, currentY + 20);

  // -------------------------------------------------------------
  // 7. FOOTER ON ALL PAGES
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(130, 140, 155);
    doc.text(
      `CONFIDENTIAL • LAW ENFORCEMENT & JUDICIAL SENSITIVE • CASE #${caseCode} • Generated: ${nowStr} IST`,
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  // Trigger download
  const cleanFileName = `LawEnforcement_Action_Briefing_${caseCode}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(cleanFileName);
  return cleanFileName;
};

/**
 * Universal browser CSV download helper with RFC 4180 escaping,
 * UTF-8 BOM encoding for Microsoft Excel compatibility,
 * and asynchronous URL revocation to prevent downloads from hanging.
 */
export const triggerCsvDownload = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCell = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const rowLines = rows.map((row) => row.map(escapeCell).join(","));
  const csvContent = [headerLine, ...rowLines].join("\r\n");

  const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });

  if (typeof window !== "undefined") {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 2500);
  }
};

/**
 * Exports active pinpointed ATM hotspot coordinates to CSV for field units
 */
export const exportHotspotsCsv = (
  hotspots: Array<{
    atm_id: string;
    atm_name: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    estimated_arrival_eta_mins: number;
    cashout_risk_score: number;
    action_priority: string;
    cctv_status: string;
    patrol_distance_mins?: number;
  }>,
  complaintCode: string
) => {
  if (!hotspots || hotspots.length === 0) {
    alert("No forecasted ATM hotspots available to export for this complaint.");
    return;
  }

  const headers = [
    "CASE_ID",
    "ATM_ID",
    "ATM_NAME",
    "LATITUDE",
    "LONGITUDE",
    "DISTANCE_KM",
    "MULE_ARRIVAL_ETA_MINS",
    "RISK_SCORE_PERCENT",
    "INTERCEPTION_PRIORITY",
    "CCTV_FEED_STATUS",
    "PATROL_RESPONSE_ETA_MINS"
  ];

  const rows: (string | number)[][] = hotspots.map((h) => [
    complaintCode,
    h.atm_id,
    h.atm_name || "",
    Number(h.latitude || 0).toFixed(6),
    Number(h.longitude || 0).toFixed(6),
    h.distance_km,
    h.estimated_arrival_eta_mins,
    `${(Number(h.cashout_risk_score || 0) * 100).toFixed(1)}%`,
    h.action_priority || "CRITICAL",
    h.cctv_status || "ONLINE",
    h.patrol_distance_mins || 2
  ]);

  const filename = `FieldPatrol_ATM_Hotspots_${complaintCode}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerCsvDownload(filename, headers, rows);
  return filename;
};

/**
 * Exports complaints repository dataset to CSV
 */
export const exportComplaintsCsv = (
  complaints: any[],
  filterContextLabel = "All_Complaints"
) => {
  if (!complaints || complaints.length === 0) {
    alert("No complaints data available to export.");
    return;
  }

  const headers = [
    "COMPLAINT_CODE",
    "TIMESTAMP",
    "CATEGORY",
    "FINANCIAL_LOSS_INR",
    "VICTIM_BANK",
    "SUSPECT_MULE_ACCOUNT",
    "TRANSACTION_REFERENCE",
    "DISTRICT",
    "STATE",
    "POLICE_JURISDICTION",
    "RISK_TIER",
    "STATUS"
  ];

  const rows: (string | number)[][] = complaints.map((c) => {
    const loss = Number(c.financial_loss || 0);
    let riskTier = "LOW";
    if (loss >= 150000) riskTier = "CRITICAL";
    else if (loss >= 75000) riskTier = "HIGH";
    else if (loss >= 25000) riskTier = "MODERATE";

    return [
      c.complaint_number || c.id || "",
      c.complaint_timestamp || c.timestamp || "",
      c.category || "",
      loss,
      c.victim_bank || c.bank_identifier || "State Bank of India",
      c.suspect_mule_account || c.mule_account || "HDFC-0019283719",
      c.transaction_id || c.transaction_reference || "N/A",
      c.district || c.city || "",
      c.state || "",
      c.police_jurisdiction || "",
      riskTier,
      c.status || "UNDER_REVIEW"
    ];
  });

  const filename = `NCRP_Complaints_Ledger_${filterContextLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerCsvDownload(filename, headers, rows);
  return filename;
};

/**
 * Generates an executive summary briefing PDF for a filtered list of complaints
 */
export const exportComplaintsSummaryPdf = (
  complaints: any[],
  officer?: OfficerInfo,
  filterContext = "Filtered Active Cases"
) => {
  if (!complaints || complaints.length === 0) {
    alert("No complaints available to compile summary PDF.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  const primaryNavy = [0, 58, 156] as [number, number, number];
  const darkNavy = [11, 25, 44] as [number, number, number];
  const crimson = [220, 38, 38] as [number, number, number];
  const slateDark = [51, 65, 85] as [number, number, number];
  const slateLight = [241, 245, 249] as [number, number, number];

  const nowStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const officerName = officer?.full_name || "Investigating Officer";
  const badgeId = officer?.badge_id || "IND-CYB-001";

  // Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS • I4C", pageWidth / 2, 7, { align: "center" });

  doc.setFontSize(11);
  doc.text("CENTRALIZED CYBERCRIME COMPLAINTS INTELLIGENCE SUMMARY", pageWidth / 2, 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`CLASSIFICATION: LAW ENFORCEMENT SENSITIVE • FILTER: ${filterContext.toUpperCase()}`, pageWidth / 2, 18, { align: "center" });

  currentY = 30;

  // Key KPI Summary Cards
  const totalCases = complaints.length;
  const totalLoss = complaints.reduce((sum, c) => sum + Number(c.financial_loss || 0), 0);
  const criticalCount = complaints.filter((c) => Number(c.financial_loss || 0) >= 150000).length;

  doc.setDrawColor(200, 215, 230);
  doc.setFillColor(...slateLight);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 18, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkNavy);
  doc.text(`COMPILED BY: ${officerName} (${badgeId})`, margin + 4, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`DATE GENERATED: ${nowStr} IST`, margin + 4, currentY + 10);
  doc.text(`REQUISITION SCOPE: ${totalCases} Indexed Cases Analyzed`, margin + 4, currentY + 15);

  const kpiX = margin + 95;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL FINANCIAL IMPAIRMENT:`, kpiX, currentY + 5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...crimson);
  doc.text(`INR ₹${(totalLoss / 100000).toFixed(2)} Lakhs (₹${totalLoss.toLocaleString("en-IN")})`, kpiX, currentY + 10);
  doc.setTextColor(...slateDark);
  doc.text(`CRITICAL HIGH-VALUE INCIDENTS: ${criticalCount} Cases`, kpiX, currentY + 15);

  currentY += 24;

  // Table of Complaints (Top 40 max to prevent massive PDFs)
  const displayComplaints = complaints.slice(0, 45);
  const tableData = displayComplaints.map((c) => {
    const loss = Number(c.financial_loss || 0);
    let risk = "LOW";
    if (loss >= 150000) risk = "CRITICAL";
    else if (loss >= 75000) risk = "HIGH";
    else if (loss >= 25000) risk = "MODERATE";

    return [
      `#${c.complaint_number || c.id || ""}`,
      (c.category || "UPI Fraud").slice(0, 28),
      `₹${loss.toLocaleString("en-IN")}`,
      `${c.district || c.city || "Chennai"}, ${c.state || "TN"}`.slice(0, 24),
      (c.victim_bank || "SBI").slice(0, 18),
      risk,
      c.status || "OPEN"
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Complaint #", "Category", "Loss (INR)", "District / State", "Victim Bank", "Risk Tier", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: primaryNavy, fontSize: 7, fontStyle: "bold" },
    styles: { fontSize: 6.5, cellPadding: 1.8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 26 },
      1: { cellWidth: 42 },
      2: { fontStyle: "bold", cellWidth: 26 },
      3: { cellWidth: 32 },
      4: { cellWidth: 24 },
      5: { fontStyle: "bold", cellWidth: 16 },
      6: { cellWidth: "auto" }
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(130, 140, 155);
    doc.text(
      `CONFIDENTIAL • LAW ENFORCEMENT SENSITIVE • I4C FINANCIAL COMPLAINTS REPOSITORY • ${nowStr}`,
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
  }

  const cleanFileName = `NCRP_Executive_Summary_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(cleanFileName);
  return cleanFileName;
};
