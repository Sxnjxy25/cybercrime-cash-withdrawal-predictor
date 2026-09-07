"use client";

import React, { useState } from "react";
import { RefreshCw, ArrowLeft, ShieldCheck, Check, AlertCircle, ArrowRight, Lock } from "lucide-react";

interface CitizenLoginViewProps {
  onSuccessLogin: () => void;
  onBack: () => void;
}

export const CitizenLoginView: React.FC<CitizenLoginViewProps> = ({ onSuccessLogin, onBack }) => {
  const [mobileNo, setMobileNo] = useState("");
  const [otp, setOtp] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("h61r8r");
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const refreshCaptcha = () => {
    const chars = "abcdefhkmnprstuvwxyz23456789";
    let res = "";
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(res);
  };

  const handleSendOtp = () => {
    if (!mobileNo || mobileNo.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSent(true);
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNo) {
      setErrorMsg("Please enter mobile number.");
      return;
    }
    if (!otp) {
      setErrorMsg("Please enter OTP.");
      return;
    }
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      setErrorMsg("Invalid Captcha code entered.");
      return;
    }
    setErrorMsg("");
    onSuccessLogin();
  };

  const handleClear = () => {
    setMobileNo("");
    setOtp("");
    setCaptchaInput("");
    setErrorMsg("");
  };

  return (
    <div className="w-full bg-[#f8fafc] py-6 px-4 sm:px-8 font-sans min-h-[75vh]">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&lt; Back to Step 1: Terms & Conditions</span>
          </button>

          <span className="text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
            STEP 2 OF 3: PRE-FILING VERIFICATION
          </span>
        </div>

        {/* 2-Column Grid matching Screenshot Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Checklist for Complainant */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
            <h2 className="text-center text-emerald-800 font-extrabold text-sm sm:text-base tracking-wider uppercase mb-3 flex items-center justify-center space-x-2">
              <span className="h-0.5 w-8 bg-emerald-600"></span>
              <span>CHECK LIST FOR COMPLAINANT</span>
              <span className="h-0.5 w-8 bg-emerald-600"></span>
            </h2>

            <p className="text-xs text-pink-600 font-bold mb-4">
              Please keep this information ready before filing your financial fraud complaint:
            </p>

            <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Mandatory Information</h3>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Incident Date and Time.</li>
                  <li>Incident details (minimum 200 characters) without any special characters (#$@^*^~!?).</li>
                  <li>Soft copy of any national Id (Voter Id, Driving license, Passport, PAN Card, Aadhaar Card) of complainant in .jpeg, .jpg, .png format (file size should not more than 5 MB).</li>
                  <li>
                    <span className="font-semibold text-blue-900">In case of financial fraud, please keep following information ready:</span>
                    <ul className="list-none pl-3 space-y-1 mt-1 text-gray-700">
                      <li>i) Name of the Bank/Wallet/Merchant</li>
                      <li>ii) 12-digit Transaction id/UTR No.</li>
                      <li>iii) Date of transaction</li>
                      <li>iv) Fraud amount</li>
                    </ul>
                  </li>
                  <li>Soft copy of all the relevant evidences related to the cyber crime (not more than 10 MB each)</li>
                </ol>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">Optional/Desirable Information:</h3>
                <ol className="list-decimal pl-4 space-y-1.5 text-gray-700">
                  <li>Suspected website URLs/Social Media handles (wherever applicable)</li>
                  <li>
                    <span className="font-semibold">Suspect Details (if available)</span>
                    <ul className="list-none pl-3 space-y-1 mt-1">
                      <li>i) Mobile No</li>
                      <li>ii) Email id</li>
                      <li>iii) Bank Account No</li>
                      <li>iv) Address</li>
                      <li>v) Soft copy of photograph of suspect in .jpeg, .jpg, .png format (not more than 5 MB)</li>
                      <li>vi) Any other document through which suspect can be identified.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Citizen Login Form */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
            <h2 className="text-center text-emerald-800 font-extrabold text-sm sm:text-base tracking-wider uppercase mb-2 flex items-center justify-center space-x-2">
              <span className="h-0.5 w-8 bg-emerald-600"></span>
              <span>CITIZEN LOGIN</span>
              <span className="h-0.5 w-8 bg-emerald-600"></span>
            </h2>

            <div className="text-right mb-4">
              <a href="#new-user" onClick={(e) => e.preventDefault()} className="text-xs text-blue-700 font-semibold hover:underline">
                Click Here for New User
              </a>
            </div>

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              
              {/* Mobile Number Field */}
              <div>
                <label className="block text-gray-800 font-bold mb-1.5">
                  MOBILE NO: <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-1.5">
                  <div className="w-16 bg-gray-100 border border-gray-300 rounded px-2 py-2 text-center text-gray-700 font-medium text-xs flex items-center justify-center">
                    +91 ▾
                  </div>
                  <input
                    type="tel"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    placeholder="Mobile No."
                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="bg-[#007ceb] hover:bg-[#0066c2] text-white px-3 py-2 rounded font-bold text-xs whitespace-nowrap transition-colors"
                  >
                    Get OTP
                  </button>
                </div>
                {otpSent && (
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                    ✓ OTP dispatched to verified mobile number
                  </div>
                )}
              </div>

              {/* OTP Field */}
              <div>
                <label className="block text-gray-800 font-bold mb-1.5">
                  OTP: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Your OTP Number"
                  className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 text-xs font-mono font-bold"
                />
              </div>

              {/* Captcha Field */}
              <div>
                <label className="block text-gray-800 font-bold mb-1.5">
                  CAPTCHA CODE: <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-amber-50/80 border border-gray-300 px-4 py-2 rounded text-base font-mono font-bold tracking-widest text-slate-800 select-none relative overflow-hidden flex items-center space-x-1">
                    <span className="line-through decoration-gray-400">{captchaText}</span>
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Refresh Captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter Captcha"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons: Clear & Submit */}
              <div className="flex items-center justify-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-[#e53935] hover:bg-[#d32f2f] text-white px-6 py-2.5 rounded font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-6 py-2.5 rounded font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center space-x-1.5 uppercase tracking-wide"
                >
                  <span>Submit & Proceed to Step 3</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
