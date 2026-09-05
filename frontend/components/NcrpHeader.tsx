"use client";

import React from "react";
import { ShieldCheck, Sparkles, MapPin, CheckCircle2, Lock, PhoneCall } from "lucide-react";

interface NcrpHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminAuthenticated?: boolean;
  adminOfficer?: any;
  onLogoutAdmin?: () => void;
}

export const NcrpHeader: React.FC<NcrpHeaderProps> = ({
  currentView,
  onNavigate,
  isAdminAuthenticated = false,
  adminOfficer,
  onLogoutAdmin
}) => {
  const isRegistrationFlow = ["ACCEPTANCE", "CHECKLIST_LOGIN", "CASHOUT_PREDICTOR"].includes(currentView);

  return (
    <header className="w-full bg-white text-gray-800 shadow-sm border-b border-gray-200">
      {/* Top Gov Bar */}
      <div className="w-full bg-[#005a9c] text-white text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center font-sans">
        <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
          <span>भारत सरकार | GOVERNMENT OF INDIA</span>
          <span className="text-blue-300">|</span>
          <span>गृह मंत्रालय | MINISTRY OF HOME AFFAIRS</span>
          <span className="text-blue-300">|</span>
          <span className="font-semibold text-yellow-300">I4C FINANCIAL FRAUD DIVISION</span>
        </div>
        
        {/* TOP RIGHT CORNER: Helpline + Admin Login + Language */}
        <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] flex items-center space-x-1">
            <PhoneCall className="w-3 h-3 inline" />
            <span>HELPLINE: 1930</span>
          </span>
          <span className="text-blue-300">|</span>

          {/* Dedicated Top-Right Admin Login Button */}
          {!isAdminAuthenticated ? (
            <button
              onClick={() => onNavigate("ADMIN_LOGIN_GATE")}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-0.5 rounded text-[10px] flex items-center space-x-1 transition-all shadow cursor-pointer uppercase tracking-wider"
              title="Law Enforcement & Admin Login to Threat Map & Observatory"
            >
              <Lock className="w-3 h-3 text-slate-950" />
              <span>Admin Login 🔒</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onNavigate("RISK_MAP_ANALYTICS")}
                className="bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 cursor-pointer"
              >
                <span>Admin Active (Threat Map)</span>
              </button>
              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          <span className="text-blue-300">|</span>
          <span>English</span>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="w-full px-4 sm:px-8 py-3.5 flex flex-wrap justify-between items-center bg-white">
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Ashoka Lion Emblem */}
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 100 120" className="w-9 h-11 sm:w-11 sm:h-13 text-amber-800 fill-current">
              <path d="M50 5 C40 5 35 15 35 25 C35 32 40 38 45 40 L45 55 C35 52 25 58 20 68 C15 78 20 90 30 95 L30 105 L70 105 L70 95 C80 90 85 78 80 68 C75 58 65 52 55 55 L55 40 C60 38 65 32 65 25 C65 15 60 5 50 5 Z M45 108 L55 108 L55 115 L45 115 Z" fill="#996515" />
              <circle cx="50" cy="25" r="8" fill="#d4af37" />
              <text x="50" y="118" fontSize="8" textAnchor="middle" fill="#555" fontWeight="bold">सत्यमेव जयते</text>
            </svg>
          </div>

          {/* I4C Logo & Title */}
          <div className="flex items-center space-x-3 border-l-2 border-gray-200 pl-3">
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="text-xl sm:text-2xl font-black text-[#005a9c] tracking-tight">I4C</span>
                <div className="h-6 w-0.5 bg-gray-300 mx-1 hidden sm:block"></div>
                <div className="text-[9px] leading-tight text-gray-500 font-semibold hidden sm:block">
                  <div>Indian Cyber</div>
                  <div>Crime Coordination</div>
                  <div>Centre</div>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-gray-200 pl-3">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                राष्ट्रीय वित्तीय साइबर अपराध एवं नकदी निकासी पूर्वानुमान पोर्टल
              </h1>
              <h2 className="text-xs sm:text-sm font-extrabold text-[#005a9c] tracking-tight">
                National Financial Cyber Fraud & Cash-Out Forecasting Portal
              </h2>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CFCFRMS Live Interception Active</span>
          </span>
        </div>
      </div>

      {/* Clean Navigation Bar with Citizen Services */}
      <nav className="w-full bg-[#007ceb] text-white text-xs sm:text-sm font-medium shadow">
        <div className="px-4 sm:px-8 flex items-center justify-between overflow-x-auto">
          
          {/* Citizen Services */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate("ACCEPTANCE")}
              className={`px-4 py-3 hover:bg-[#0066c2] transition-colors flex items-center space-x-1.5 whitespace-nowrap ${isRegistrationFlow ? "bg-[#004d94] font-bold" : ""}`}
            >
              <ShieldCheck className="w-4 h-4 text-yellow-300" />
              <span>Register Online Money Fraud Complaint</span>
            </button>

            <button
              onClick={() => onNavigate("WITHDRAW_MODAL")}
              className="px-4 py-3 hover:bg-[#0066c2] transition-colors flex items-center space-x-1.5 whitespace-nowrap text-amber-200 hover:text-white font-medium"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Withdraw Complaint (12-Digit Code)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 py-1.5 pr-2">
            <span className="text-[11px] text-blue-100 hidden sm:inline">
              Need immediate assistance? Dial <strong>1930</strong>
            </span>
          </div>

        </div>
      </nav>
    </header>
  );
};
