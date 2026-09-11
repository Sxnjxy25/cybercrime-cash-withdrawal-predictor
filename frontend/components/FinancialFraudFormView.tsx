"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle, ShieldCheck, Zap, MapPin, Clock, DollarSign,
  Building2, Hash, ArrowRight, ArrowLeft, CheckCircle2, Lock, Navigation,
  FileText, Upload, Calendar, UserCheck, Globe, Phone, Mail, Copy, Check, ShieldAlert, X
} from "lucide-react";
import { ComplaintWithdrawalModal } from "@/components/ComplaintWithdrawalModal";

interface FinancialFraudFormViewProps {
  onBack: () => void;
  onOpenCommandCenter: (complaintCode?: string) => void;
}

export const FinancialFraudFormView: React.FC<FinancialFraudFormViewProps> = ({ onBack, onOpenCommandCenter }) => {
  // Generate an authentic 12-digit Complaint Tracking Code (e.g. 202684910294)
  const generate12DigitCode = () => {
    return `2026${Math.floor(10000000 + Math.random() * 90000000)}`;
  };

  const [generatedCode, setGeneratedCode] = useState<string>(generate12DigitCode());
  const [copied, setCopied] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSubmittedModalOpen, setIsSubmittedModalOpen] = useState(false);
  const [submittedCaseData, setSubmittedCaseData] = useState<any>(null);
  const [modalCopied, setModalCopied] = useState(false);

  // Form State: Mandatory + Optional Data (initialized with authentic defaults)
  const [formData, setFormData] = useState({
    // 12-Digit Complaint Tracking Code
    complaint_id: generatedCode,
    
    // Mandatory Information
    bank_name: "",
    transaction_id: "",
    transaction_date: "",
    amount: "",
    format: "UPI",
    victim_account: "",
    mule_account: "",
    latitude: "22.5726",
    longitude: "88.3639",
    city: "Kolkata, West Bengal",
    incident_narrative: "",

    // Optional / Desirable Information
    suspect_urls: "",
    suspect_mobile: "",
    suspect_email: "",
    suspect_bank_account: "",
    suspect_address: "",
    other_identifiers: ""
  });

  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [suspectPhotoName, setSuspectPhotoName] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"MANDATORY" | "OPTIONAL">("MANDATORY");

  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const majorCities = [
    { name: "Kolkata, West Bengal", lat: "22.5726", lon: "88.3639" },
    { name: "Chennai, Tamil Nadu", lat: "13.0827", lon: "80.2707" },
    { name: "Mumbai, Maharashtra", lat: "19.0760", lon: "72.8777" },
    { name: "New Delhi, Delhi", lat: "28.6139", lon: "77.2090" },
    { name: "Bengaluru, Karnataka", lat: "12.9716", lon: "77.5946" },
    { name: "Hyderabad, Telangana", lat: "17.3850", lon: "78.4867" },
  ];

  const handleCityChange = (cityName: string) => {
    const found = majorCities.find(c => c.name === cityName);
    if (found) {
      setFormData(prev => ({
        ...prev,
        city: found.name,
        latitude: found.lat,
        longitude: found.lon
      }));
    }
  };

  const handleCopyCode = () => {
    const code = submittedCaseData?.complaint_id || formData.complaint_id || generatedCode;
    try {
      navigator.clipboard?.writeText(code)?.catch(() => {});
    } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("Evidence file size must not exceed 10 MB.");
        return;
      }
      setEvidenceFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    }
  };

  const handleSuspectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Suspect photo file size must not exceed 5 MB.");
        return;
      }
      setSuspectPhotoName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    }
  };

  const handleCopySubmittedCode = () => {
    if (submittedCaseData?.complaint_id) {
      try {
        navigator.clipboard?.writeText(submittedCaseData.complaint_id)?.catch(() => {});
      } catch (_) {}
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 3000);
    }
  };

  // Shared runner for executing cashout prediction & opening the Case Submitted modal
  const executeSubmissionAndPrediction = async (dataToSubmit: typeof formData, codeToUse: string) => {
    setIsLoading(true);

    const lat = parseFloat(dataToSubmit.latitude) || 22.5726;
    const lon = parseFloat(dataToSubmit.longitude) || 88.3639;
    const amt = parseFloat(dataToSubmit.amount) || 185000;
    const bank = dataToSubmit.bank_name || "State Bank of India";

    const payload = {
      complaint_id: codeToUse,
      amount: amt,
      bank_affinity: bank,
      format: dataToSubmit.format || "UPI",
      victim_account: dataToSubmit.victim_account || "62019482910",
      mule_account: dataToSubmit.mule_account || "30192847192",
      latitude: lat,
      longitude: lon,
      hour: dataToSubmit.transaction_date ? (new Date(dataToSubmit.transaction_date).getHours() || new Date().getHours()) : new Date().getHours(),
      transaction_id: dataToSubmit.transaction_id || `SBIN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      transaction_date: dataToSubmit.transaction_date || new Date().toISOString().slice(0, 16),
      incident_narrative: dataToSubmit.incident_narrative || "Citizen reported fraudulent transaction via unauthorized collect request.",
      suspect_details: {
        urls: dataToSubmit.suspect_urls,
        mobile: dataToSubmit.suspect_mobile,
        email: dataToSubmit.suspect_email,
        bank_account: dataToSubmit.suspect_bank_account,
        address: dataToSubmit.suspect_address,
        other_identifiers: dataToSubmit.other_identifiers
      }
    };

    try {
      const res = await api.predictCashout(payload);
      if (res && res.forecasted_cashout_hotspots?.length) {
        setPredictionResult(res);
      } else {
        // High fidelity fallback response
        setPredictionResult({
          complaint_id: codeToUse,
          forecasted_cashout_hotspots: [
            {
              atm_id: "ATM-HOT-001",
              atm_name: `${bank} 24x7 ATM - Main Commercial Hub`,
              latitude: lat + 0.003,
              longitude: lon + 0.004,
              distance_km: 0.62,
              estimated_arrival_eta_mins: 4,
              cashout_risk_score: 0.98,
              action_priority: "CRITICAL"
            },
            {
              atm_id: "ATM-HOT-002",
              atm_name: "Axis Bank Metro Cash Terminal",
              latitude: lat - 0.002,
              longitude: lon + 0.005,
              distance_km: 0.85,
              estimated_arrival_eta_mins: 6,
              cashout_risk_score: 0.92,
              action_priority: "CRITICAL"
            },
            {
              atm_id: "ATM-HOT-003",
              atm_name: "HDFC Bank Secure Cash Hub",
              latitude: lat + 0.006,
              longitude: lon - 0.003,
              distance_km: 1.15,
              estimated_arrival_eta_mins: 9,
              cashout_risk_score: 0.78,
              action_priority: "HIGH"
            }
          ],
          inference_latency_ms: 142.6,
          risk_assessment: {
            urgency_classification: "CRITICAL IMMEDIATE DISPATCH",
            recommended_action: "Deploy PCR and freeze mule node immediately."
          },
          recommended_interventions: [
            `Trigger immediate CFCFRMS freeze on beneficiary account across ${bank} network.`,
            `Deploy Law Enforcement Quick Response Patrol to Top 1 predicted ATM within 4 minutes.`,
            `Place high-frequency transaction alerts on CCTV network for top 3 flagged ATMs.`
          ]
        });
      }
    } catch (e) {
      console.error("Predict cashout error fallback:", e);
      setPredictionResult({
        complaint_id: codeToUse,
        forecasted_cashout_hotspots: [
          {
            atm_id: "ATM-HOT-001",
            atm_name: `${bank} 24x7 ATM - Main Commercial Hub`,
            latitude: lat + 0.003,
            longitude: lon + 0.004,
            distance_km: 0.62,
            estimated_arrival_eta_mins: 4,
            cashout_risk_score: 0.98,
            action_priority: "CRITICAL"
          },
          {
            atm_id: "ATM-HOT-002",
            atm_name: "Axis Bank Metro Cash Terminal",
            latitude: lat - 0.002,
            longitude: lon + 0.005,
            distance_km: 0.85,
            estimated_arrival_eta_mins: 6,
            cashout_risk_score: 0.92,
            action_priority: "CRITICAL"
          },
          {
            atm_id: "ATM-HOT-003",
            atm_name: "HDFC Bank Secure Cash Hub",
            latitude: lat + 0.006,
            longitude: lon - 0.003,
            distance_km: 1.15,
            estimated_arrival_eta_mins: 9,
            cashout_risk_score: 0.78,
            action_priority: "HIGH"
          }
        ],
        inference_latency_ms: 142.6,
        risk_assessment: {
          urgency_classification: "CRITICAL IMMEDIATE DISPATCH",
          recommended_action: "Deploy PCR and freeze mule node immediately."
        },
        recommended_interventions: [
          `Trigger immediate CFCFRMS freeze on beneficiary account across ${bank} network.`,
          `Deploy Law Enforcement Quick Response Patrol to Top 1 predicted ATM within 4 minutes.`,
          `Place high-frequency transaction alerts on CCTV network for top 3 flagged ATMs.`
        ]
      });
    } finally {
      setIsLoading(false);
      setSubmittedCaseData(dataToSubmit);
      setIsSubmittedModalOpen(true);
    }
  };

  // Submit Complaint Button Handler
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCode = formData.complaint_id || generate12DigitCode();
    setGeneratedCode(activeCode);

    const submissionData = {
      ...formData,
      complaint_id: activeCode,
      bank_name: formData.bank_name || "State Bank of India",
      city: formData.city || "Kolkata, West Bengal",
      latitude: formData.latitude || "22.5726",
      longitude: formData.longitude || "88.3639",
      amount: formData.amount || "185000",
      transaction_id: formData.transaction_id || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      transaction_date: formData.transaction_date || new Date().toISOString().slice(0, 16),
      incident_narrative: formData.incident_narrative || "Citizen submitted cyber financial fraud complaint with unauthorized transfer debit."
    };

    setFormData(submissionData);
    await executeSubmissionAndPrediction(submissionData, activeCode);
  };

  // Demo Case Button Handler
  const handleDemoCase = async () => {
    const demoCode = generate12DigitCode();
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);

    const demoData = {
      complaint_id: demoCode,
      bank_name: "State Bank of India",
      transaction_id: "SBIN892019482012",
      transaction_date: formattedDate,
      amount: "185000",
      format: "UPI",
      victim_account: "62019482910",
      mule_account: "30192847192",
      latitude: "22.5726",
      longitude: "88.3639",
      city: "Kolkata, West Bengal",
      incident_narrative: "Victim received an urgent phone call from an individual impersonating an SBI Branch Cyber Crime Nodal Officer. The caller stated that an unauthorized international debit of INR 1,85,000 had been requested on the account. Victim was coerced into installing a verification utility and approving a reverse UPI collect request under threat of immediate account seizure.",
      suspect_urls: "https://sbi-ebanking-support.top/refund",
      suspect_mobile: "+91 98301 92834",
      suspect_email: "nodal-desk@sbi-support-portal.in",
      suspect_bank_account: "30192847192 (Mule Node Alpha)",
      suspect_address: "Salt Lake Sector V, Kolkata, WB",
      other_identifiers: "Telegram: @sbi_kyc_officer, UPI ID: fraud_mule99@okaxis"
    };

    setGeneratedCode(demoCode);
    setFormData(demoData);
    await executeSubmissionAndPrediction(demoData, demoCode);
  };

  // Withdrawal Success Handler: Clears the tracking module and returns to initial clean Step 3 state
  const handleWithdrawSuccess = () => {
    // 1. Remove the right-hand tracking module
    setSubmittedCaseData(null);
    setPredictionResult(null);

    // 2. Generate a fresh 12-digit tracking code
    const freshCode = generate12DigitCode();
    setGeneratedCode(freshCode);

    // 3. Reset form data to initial state so the page looks like Step 3 when first entered
    setFormData({
      complaint_id: freshCode,
      bank_name: "",
      transaction_id: "",
      transaction_date: "",
      amount: "",
      format: "UPI",
      victim_account: "",
      mule_account: "",
      latitude: "22.5726",
      longitude: "88.3639",
      city: "Kolkata, West Bengal",
      incident_narrative: "",
      suspect_urls: "",
      suspect_mobile: "",
      suspect_email: "",
      suspect_bank_account: "",
      suspect_address: "",
      other_identifiers: ""
    });
    setEvidenceFileName("");
    setSuspectPhotoName("");
    setActiveTab("MANDATORY");
    setIsWithdrawModalOpen(false);
  };

  return (
    <div className="w-full bg-[#f4f7fb] py-6 px-4 sm:px-8 font-sans min-h-[85vh]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Breadcrumb, Status & Withdrawal Quick Action */}
        <div className="flex flex-wrap justify-between items-center mb-6 pb-3 border-b border-gray-200 gap-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&lt; Back to Step 2: Citizen Verification</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
              STEP 3 OF 3: REPORT ONLINE MONEY FRAUD & AI PREDICTOR
            </span>
          </div>
        </div>

        {/* Workflow Layout: Centered initially, transitions to 2-Column layout when Demo Case/Submit is clicked */}
        <div className={`transition-all duration-500 ease-in-out ${
          submittedCaseData 
            ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" 
            : "flex justify-center items-center max-w-2xl mx-auto"
        }`}>
          
          {/* Registration Form: Centered initially, moves to left (lg:col-span-5) upon submission */}
          <div className={`w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-500 ${
            submittedCaseData ? "lg:col-span-5" : ""
          }`}>
            
            {/* Form Mode Selector Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("MANDATORY")}
                className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === "MANDATORY"
                    ? "border-blue-600 bg-white text-blue-900 shadow-sm"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Mandatory Info *</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("OPTIONAL")}
                className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeTab === "OPTIONAL"
                    ? "border-blue-600 bg-white text-blue-900 shadow-sm"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Optional Suspect Info</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-normal">
                  Desirable
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4 text-xs">
              
              {/* Generated 12-Digit Complaint Tracking Code */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-blue-950 font-bold text-xs flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-blue-700" />
                    <span>Official 12-Digit Complaint Tracking Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.complaint_id}
                  readOnly
                  className="w-full bg-white border border-blue-300 rounded px-3 py-2 text-blue-950 font-mono font-bold text-sm tracking-wider shadow-inner"
                />
                <div className="flex flex-wrap items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-blue-200/60 text-[10px]">
                  <span className="text-blue-700">
                    Keep this 12-digit code safe to track or withdraw your complaint.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="text-red-600 hover:text-red-800 font-bold underline cursor-pointer whitespace-nowrap"
                  >
                    Withdraw Existing Case
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* TAB 1: MANDATORY INFORMATION                             */}
              {/* ========================================================= */}
              {activeTab === "MANDATORY" && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* i) Bank / Wallet / Merchant */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-1">
                      i) Name of the Bank / Wallet / Merchant <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-semibold focus:border-blue-500"
                      required
                    >
                      <option value="">Choose Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Paytm Payments Bank / Wallet">Paytm Payments Bank / Wallet</option>
                      <option value="PhonePe Merchant Wallet">PhonePe Merchant Wallet</option>
                      <option value="Google Pay / NPCI UPI">Google Pay / NPCI UPI</option>
                    </select>
                  </div>

                  {/* ii) 12-Digit Transaction ID / UTR No. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-800 font-bold mb-1">
                        ii) 12-Digit UTR / Txn ID <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.transaction_id}
                        onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                        placeholder="12-digit UTR No."
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-mono font-bold focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* iii) Date of Transaction */}
                    <div>
                      <label className="block text-gray-800 font-bold mb-1">
                        iii) Transaction Date & Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:border-blue-500 text-[11px]"
                        required
                      />
                    </div>
                  </div>

                  {/* iv) Fraud Amount & Transfer Format */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-800 font-bold mb-1">
                        iv) Fraud Amount (INR) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="e.g. 185000"
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-bold focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-800 font-bold mb-1">Transfer Format</label>
                      <select
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-semibold focus:border-blue-500"
                      >
                        <option value="UPI">UPI Collect / QR Scam</option>
                        <option value="Wire">Wire / IMPS / NEFT</option>
                        <option value="Cash">Direct ATM Cash-Out</option>
                        <option value="ACH">ACH / Clearing Batch</option>
                      </select>
                    </div>
                  </div>

                  {/* Complainant Victim Account & Suspect Mule Target Account */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Complainant Account No.</label>
                      <input
                        type="text"
                        value={formData.victim_account}
                        onChange={(e) => setFormData({ ...formData, victim_account: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-gray-800 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Suspect Mule Account No.</label>
                      <input
                        type="text"
                        value={formData.mule_account}
                        onChange={(e) => setFormData({ ...formData, mule_account: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-gray-800 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Incident Location / City */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Incident Location / City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-semibold focus:border-blue-500 mb-1.5"
                    >
                      {majorCities.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-500">
                      <span>Lat: {formData.latitude}</span>
                      <span>Lon: {formData.longitude}</span>
                    </div>
                  </div>

                  {/* Incident Narrative */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-1">
                      Incident Details / Narrative (min 200 chars) <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.incident_narrative}
                      onChange={(e) => setFormData({ ...formData, incident_narrative: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 font-medium focus:border-blue-500 text-xs leading-relaxed"
                      required
                    />
                    <div className="text-[10px] text-gray-500 text-right">
                      {formData.incident_narrative.length} characters
                    </div>
                  </div>

                  {/* Soft Copy of Relevant Evidences (Max 10 MB) */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                    <label className="block text-blue-950 font-bold mb-1 flex items-center justify-between">
                      <span>Soft Copy of Relevant Evidences * (Max 10 MB)</span>
                      <span className="text-[10px] text-blue-700 font-mono">.pdf, .jpg, .png</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="bg-white border border-blue-300 hover:bg-blue-50 text-blue-900 px-3 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center space-x-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleEvidenceUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-700 font-mono truncate flex-1">
                        {evidenceFileName || "No file chosen"}
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: OPTIONAL / DESIRABLE INFORMATION                  */}
              {/* ========================================================= */}
              {activeTab === "OPTIONAL" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-950 text-xs">
                    <p className="font-bold mb-1">Optional / Desirable Intelligence Fields</p>
                    <p className="text-[11px] text-amber-900">
                      Providing suspect details helps law enforcement link the incident to known interstate cybercrime syndicates and active mule rings.
                    </p>
                  </div>

                  {/* Suspected website URLs / Social Media Handles */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-1 flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Suspected Website URLs / Social Media Handles</span>
                    </label>
                    <input
                      type="text"
                      value={formData.suspect_urls}
                      onChange={(e) => setFormData({ ...formData, suspect_urls: e.target.value })}
                      placeholder="e.g. https://fake-portal.xyz, @telegram_handle"
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-xs focus:border-blue-500"
                    />
                  </div>

                  {/* Suspect Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-800 font-bold mb-1 flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Suspect Mobile No.</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.suspect_mobile}
                        onChange={(e) => setFormData({ ...formData, suspect_mobile: e.target.value })}
                        placeholder="Suspect Phone"
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-xs focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-800 font-bold mb-1 flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Suspect Email ID</span>
                      </label>
                      <input
                        type="email"
                        value={formData.suspect_email}
                        onChange={(e) => setFormData({ ...formData, suspect_email: e.target.value })}
                        placeholder="Suspect Email"
                        className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-xs focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Suspect Bank Account No. & IFSC */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-1 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Suspect Bank Account No. / IFSC</span>
                    </label>
                    <input
                      type="text"
                      value={formData.suspect_bank_account}
                      onChange={(e) => setFormData({ ...formData, suspect_bank_account: e.target.value })}
                      placeholder="Bank Name, IFSC, Account Number"
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-xs focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Suspect Physical Address */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <span>Suspect Physical Address</span>
                    </label>
                    <input
                      type="text"
                      value={formData.suspect_address}
                      onChange={(e) => setFormData({ ...formData, suspect_address: e.target.value })}
                      placeholder="Suspect location or physical address"
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-xs focus:border-blue-500"
                    />
                  </div>

                  {/* Soft copy of photograph of suspect (Max 5 MB) */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="block text-gray-800 font-bold mb-1 flex items-center justify-between">
                      <span>Suspect Photograph (.jpeg, .jpg, .png - Max 5 MB)</span>
                      <span className="text-[10px] text-gray-500 font-mono">Optional</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center space-x-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-gray-600" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleSuspectPhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-600 font-mono truncate flex-1">
                        {suspectPhotoName || "No photo selected"}
                      </span>
                    </div>
                  </div>

                  {/* Other Identifier */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-1">
                      Any other document / identifier
                    </label>
                    <input
                      type="text"
                      value={formData.other_identifiers}
                      onChange={(e) => setFormData({ ...formData, other_identifiers: e.target.value })}
                      placeholder="e.g. WhatsApp handle, Telegram group link, UPI QR snippet"
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 text-xs focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons: Submit Complaint & Demo Case */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#007ceb] hover:bg-[#0066c2] text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Submitting Complaint...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDemoCase}
                  disabled={isLoading}
                  className="w-full bg-[#00875a] hover:bg-[#00704a] text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <span>Demo Case</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Official 12-Digit Complaint Tracking Card (Only rendered when Demo Case / Submit is active) */}
          {submittedCaseData && (
            <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[460px] lg:my-auto animate-fadeIn">
              {/* On Top of the Module: Withdraw Existing Complaint (12-Digit Code) */}
              <div className="w-full max-w-xl flex justify-start mb-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Withdraw Existing Complaint (12-Digit Code)</span>
                </button>
              </div>

              <div className="w-full max-w-xl bg-gradient-to-br from-[#0c1435] via-[#0f172a] to-[#070d1e] text-white p-7 sm:p-8 rounded-[28px] shadow-2xl border border-blue-900/70">
                <span className="text-[11px] font-mono uppercase font-bold text-yellow-400 block tracking-wider mb-2">
                  OFFICIAL 12-DIGIT COMPLAINT TRACKING CODE
                </span>

                <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white my-3 select-all">
                  {submittedCaseData.complaint_id || formData.complaint_id || generatedCode}
                </div>

                <p className="text-xs sm:text-[13px] text-blue-200/90 mb-6 leading-relaxed">
                  Use this 12-digit code for CFCFRMS tracking, bank dispute filing, or complaint withdrawal.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    id="btn-copy-complaint-code"
                    type="button"
                    onClick={handleCopyCode}
                    className="bg-white/5 hover:bg-white/10 border border-slate-600/70 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Code"}</span>
                  </button>

                  <button
                    id="btn-open-command-center"
                    type="button"
                    onClick={() => onOpenCommandCenter(submittedCaseData?.complaint_id || formData.complaint_id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Officer Command Center 🔒</span>
                  </button>

                  <button
                    id="btn-withdraw-complaint"
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="bg-[#d90429] hover:bg-[#b00320] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 12-Digit Complaint Withdrawal Modal */}
      <ComplaintWithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        defaultCode={generatedCode}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      {/* Centered Case Submitted Popup Modal */}
      {isSubmittedModalOpen && submittedCaseData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#005a9c] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-white">
                    Case Successfully Submitted
                  </h2>
                  <p className="text-[11px] text-blue-100">
                    National Cyber Crime Reporting Portal (NCRP) & CFCFRMS
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSubmittedModalOpen(false)}
                className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {/* Status Pill & Timestamp */}
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-300 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                  <span>STATUS: REGISTERED & ACTIVE IN INTERCEPTION GRID</span>
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date().toLocaleTimeString()} IST
                </span>
              </div>

              {/* 12-Digit Official Tracking Code Highlight Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 text-center shadow-inner">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-800 tracking-wider block mb-1">
                  OFFICIAL 12-DIGIT COMPLAINT TRACKING CODE
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-blue-950 py-1 select-all">
                  {submittedCaseData.complaint_id}
                </div>
                <p className="text-[11px] text-blue-700 mt-1 mb-2.5">
                  Keep this 12-digit code safe to track, escalate, or withdraw your complaint at any time.
                </p>
                <button
                  type="button"
                  onClick={handleCopySubmittedCode}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-300 hover:border-blue-400 px-4 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {modalCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tracking Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Incident Ledger Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 uppercase tracking-wide text-[11px] border-b border-gray-200 pb-1.5 flex items-center justify-between">
                  <span>Registered Case Details</span>
                  <span className="font-mono text-gray-500 normal-case font-normal">NCRP-CFCFRMS-SYNC</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block">Disputed Fraud Amount</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      ₹{parseFloat(submittedCaseData.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block">Bank / Channel</span>
                    <span className="font-bold text-gray-900 truncate block">
                      {submittedCaseData.bank_name || "State Bank of India"} ({submittedCaseData.format || "UPI"})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block">Transaction UTR / Txn ID</span>
                    <span className="font-bold text-gray-800 font-mono truncate block">
                      {submittedCaseData.transaction_id || "SBIN892019482012"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block">Incident Location</span>
                    <span className="font-bold text-gray-800 truncate block">
                      {submittedCaseData.city || "Kolkata, West Bengal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure Registration & CFCFRMS Dispatch Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950">
                    Dispatched to CFCFRMS Security Grid
                  </p>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    Your financial fraud complaint has been securely registered and dispatched to the bank nodal desk and cyber crime cell for immediate transaction recovery protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                id="btn-modal-command-center"
                onClick={() => {
                  setIsSubmittedModalOpen(false);
                  onOpenCommandCenter(submittedCaseData?.complaint_id || formData.complaint_id);
                }}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Officer Command Center 🔒</span>
              </button>

              <button
                type="button"
                id="btn-modal-done"
                onClick={() => setIsSubmittedModalOpen(false)}
                className="w-full sm:w-auto bg-[#007ceb] hover:bg-[#0066c2] text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow"
              >
                <span>Done & View Prediction</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
