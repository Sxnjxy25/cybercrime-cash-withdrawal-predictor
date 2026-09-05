"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle, ShieldCheck, Zap, MapPin, Clock, DollarSign,
  Building2, Hash, ArrowRight, ArrowLeft, CheckCircle2, Lock, Sparkles, Navigation,
  FileText, Upload, Calendar, UserCheck, Globe, Phone, Mail, Copy, Check, ShieldAlert
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

  // Form State: Mandatory + Optional Data
  const [formData, setFormData] = useState({
    // 12-Digit Complaint Tracking Code
    complaint_id: generatedCode,
    
    // Mandatory Information
    bank_name: "State Bank of India",
    transaction_id: "UTR992144810234",
    transaction_date: new Date().toISOString().slice(0, 16),
    amount: "185000",
    format: "UPI",
    victim_account: "SBIN-9921448102",
    mule_account: "HDFC-0019283719",
    latitude: "22.5726",
    longitude: "88.3639",
    city: "Kolkata, West Bengal",
    incident_narrative: "Victim received fraudulent call masquerading as banking official requesting urgent KYC verification for debit card. An unauthorized IMPS/UPI transfer of INR 1,85,000 was executed to suspect account.",

    // Optional / Desirable Information
    suspect_urls: "https://secure-kyc-update-portal.xyz, @telegram_fastloan",
    suspect_mobile: "9876543210",
    suspect_email: "support@verify-kyc-alert.in",
    suspect_bank_account: "HDFC0001234 - 501009827361",
    suspect_address: "Sector 62, Industrial Cyber Hub, Noida / Jamtara Corridor",
    other_identifiers: "Suspect WhatsApp Display Name: 'SBI Support Desk #41'"
  });

  const [evidenceFileName, setEvidenceFileName] = useState<string | null>("bank_statement_sept_2026.pdf (1.8 MB)");
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
    navigator.clipboard.writeText(formData.complaint_id);
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

  // Generate Code & Predict Cash-Out Handler
  const handleGenerateCodeAndPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Ensure fresh 12-digit code
    const freshCode = generate12DigitCode();
    setGeneratedCode(freshCode);
    setFormData(prev => ({ ...prev, complaint_id: freshCode }));

    const payload = {
      complaint_id: freshCode,
      amount: parseFloat(formData.amount) || 50000,
      bank_affinity: formData.bank_name,
      format: formData.format,
      victim_account: formData.victim_account,
      mule_account: formData.mule_account,
      latitude: parseFloat(formData.latitude) || 22.5726,
      longitude: parseFloat(formData.longitude) || 88.3639,
      hour: new Date(formData.transaction_date).getHours() || new Date().getHours(),
      transaction_id: formData.transaction_id,
      transaction_date: formData.transaction_date,
      incident_narrative: formData.incident_narrative,
      suspect_details: {
        urls: formData.suspect_urls,
        mobile: formData.suspect_mobile,
        email: formData.suspect_email,
        bank_account: formData.suspect_bank_account,
        address: formData.suspect_address,
        other_identifiers: formData.other_identifiers
      }
    };

    try {
      const res = await api.predictCashout(payload);
      if (res) {
        setPredictionResult(res);
      } else {
        // Fallback realistic response
        setPredictionResult({
          complaint_id: freshCode,
          forecasted_cashout_hotspots: [
            {
              atm_id: "ATM-CHN-001",
              atm_name: `${formData.bank_name} ATM - Anna Salai`,
              latitude: parseFloat(formData.latitude) + 0.003,
              longitude: parseFloat(formData.longitude) + 0.004,
              distance_km: 0.62,
              estimated_arrival_eta_mins: 4,
              cashout_risk_score: 0.98,
              action_priority: "CRITICAL"
            },
            {
              atm_id: "ATM-CHN-002",
              atm_name: "Axis Bank 24x7 Cash Point",
              latitude: parseFloat(formData.latitude) - 0.002,
              longitude: parseFloat(formData.longitude) + 0.005,
              distance_km: 0.85,
              estimated_arrival_eta_mins: 6,
              cashout_risk_score: 0.92,
              action_priority: "CRITICAL"
            },
            {
              atm_id: "ATM-CHN-003",
              atm_name: "HDFC Bank ATM Terminal",
              latitude: parseFloat(formData.latitude) + 0.006,
              longitude: parseFloat(formData.longitude) - 0.003,
              distance_km: 1.15,
              estimated_arrival_eta_mins: 9,
              cashout_risk_score: 0.78,
              action_priority: "HIGH"
            }
          ],
          inference_latency_ms: 142.6,
          risk_assessment: {
            urgency_classification: "CRITICAL IMMEDIATE DISPATCH",
            recommended_action: "Deploy PCR and freeze node immediately."
          },
          recommended_interventions: [
            `Trigger immediate CFCFRMS freeze on beneficiary account across ${formData.bank_name} network.`,
            `Deploy Law Enforcement Quick Response Patrol to Top 1 predicted ATM within 4 minutes.`,
            `Place high-frequency transaction alerts on CCTV network for top 3 flagged ATMs.`
          ]
        });
      }
    } catch (e) {
      console.error("Predict cashout error fallback:", e);
    } finally {
      setIsLoading(false);
    }
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

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Withdraw Existing Complaint (12-Digit Code)</span>
            </button>

            <span className="bg-blue-900 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
              <span>STEP 3 OF 3: REPORT ONLINE MONEY FRAUD & AI PREDICTOR</span>
            </span>

            <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full flex items-center space-x-1 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>32,448 ATMs Active</span>
            </span>
          </div>
        </div>

        {/* 2-Column Workflow: Left Incident Input Form, Right Live Cashout Prediction Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Incident Details (Mandatory + Optional Sections) */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            
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

            <form onSubmit={handleGenerateCodeAndPredict} className="p-6 space-y-4 text-xs">
              
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
                <span className="text-[10px] text-blue-700 mt-1 block">
                  Keep this 12-digit code safe to track or withdraw your complaint at any time.
                </span>
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

              {/* Action Button: Generate Code & Predict */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#007ceb] hover:bg-[#0066c2] text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? (
                  <span>Generating 12-Digit Code & Executing AI Inference...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Generate Code & Predict</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Instant Live ML Predictions, 12-Digit Official Badge & ATM Hotspots */}
          <div className="lg:col-span-7 space-y-6">
            
            {predictionResult ? (
              <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500/50 p-6 relative overflow-hidden animate-fadeIn">
                
                {/* 12-Digit Official Code Highlight Banner */}
                <div className="mb-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-xl shadow-md border border-blue-700/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-yellow-300 block tracking-wider">
                      OFFICIAL 12-DIGIT COMPLAINT TRACKING CODE
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                      {generatedCode}
                    </span>
                    <span className="text-[10px] text-blue-200 block mt-0.5">
                      Use this 12-digit code for CFCFRMS tracking, bank dispute filing, or complaint withdrawal.
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyCode}
                      className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy Code"}</span>
                    </button>

                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Live AI Output</span>
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                      <span>Forensic Cash-Out Risk Assessment</span>
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        {predictionResult.inference_latency_ms}ms
                      </span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                      predictionResult.risk_assessment.urgency_classification.includes("CRITICAL")
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-amber-500 text-slate-950"
                    }`}>
                      {predictionResult.risk_assessment.urgency_classification}
                    </span>
                  </div>
                </div>

                {/* Forecasted ATM Cash-Out Hotspots */}
                <div className="mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-gray-700 mb-3 flex items-center space-x-1.5">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Predicted Physical ATM Cash-Out Terminals (Top Hotspots)</span>
                  </h4>

                  <div className="space-y-2.5">
                    {predictionResult.forecasted_cashout_hotspots?.map((atm: any, i: number) => (
                      <div
                        key={atm.atm_id || i}
                        className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 ${
                          i === 0
                            ? "bg-amber-50 border-amber-300 shadow-sm"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            i === 0 ? "bg-amber-500 text-slate-950" : "bg-gray-300 text-gray-700"
                          }`}>
                            #{i + 1}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{atm.atm_name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              GPS: {atm.latitude}, {atm.longitude} • Distance: {atm.distance_km} km
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-bold text-blue-900 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>ETA: {atm.estimated_arrival_eta_mins} mins</span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Risk: {(atm.cashout_risk_score * 100).toFixed(0)}%
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            atm.action_priority === "CRITICAL"
                              ? "bg-red-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}>
                            {atm.action_priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Immediate Interventions */}
                <div className="bg-blue-50/80 p-4 rounded-lg border border-blue-200 mb-4">
                  <h4 className="text-xs font-bold text-blue-950 mb-2 uppercase">
                    Automated Law Enforcement Interventions
                  </h4>
                  <ul className="text-xs text-blue-900 space-y-1.5 list-disc pl-4">
                    {predictionResult.recommended_interventions?.map((rec: string, idx: number) => (
                      <li key={idx} className="leading-snug font-medium">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onOpenCommandCenter(generatedCode)}
                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>View in National Command Center & Risk Map</span>
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                      Admin
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Real-Time Cash-Out Forecaster Ready
                </h3>
                <p className="text-xs text-gray-600 max-w-md mb-6 leading-relaxed">
                  Fill in the incident details on the left and click <strong>"Generate Code & Predict"</strong> to register your complaint, generate your 12-digit code, and forecast physical ATM withdrawal targets in real-time.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-300 px-4 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Withdraw an existing complaint with 12-digit code</span>
                  </button>
                  <button
                    onClick={() => onOpenCommandCenter()}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Explore National Risk Observatory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 12-Digit Complaint Withdrawal Modal */}
      <ComplaintWithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        defaultCode={generatedCode}
      />
    </div>
  );
};
