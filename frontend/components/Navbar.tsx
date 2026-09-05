"use client";

import React from "react";
import { ShieldAlert, Play, RotateCcw, UserCheck } from "lucide-react";

interface NavbarProps {
  onSimulateDemo: () => void;
  onResetDemo: () => void;
  onOpenCopilot?: () => void;
  isDemoActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onSimulateDemo, onResetDemo, isDemoActive }) => {
  return (
    <header className="h-16 border-b-2 border-blue-100 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm font-sans">
      {/* Brand & Tactical Command Tagline */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#005A9C] text-white flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide text-[#005A9C] font-sans">
              CYBERPREDICT X
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">
              NATIONAL THREAT PREDICTION OBSERVATORY
            </p>
          </div>
        </div>

        {/* National Threat Level Badge */}
        <div className="hidden md:flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-mono">
          <div className="w-2 h-2 rounded-full bg-red-600 crimson-pulse" />
          <span className="text-xs font-semibold text-slate-600">NATIONAL RISK:</span>
          <span className="text-xs font-bold text-red-600">87 / 100 (CRITICAL)</span>
        </div>
      </div>

      {/* Actions & Intelligence Profile */}
      <div className="flex items-center space-x-3 font-mono">
        {/* Scenario Threat Simulator */}
        <button
          onClick={onSimulateDemo}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
            isDemoActive
              ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
              : "bg-[#005A9C] text-white border-[#005A9C] hover:bg-[#00487D] shadow-sm"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isDemoActive ? "THREAT SIGNAL ACTIVE" : "SIMULATE EMERGING THREAT"}</span>
        </button>

        {/* Scenario Reset Button */}
        <button
          onClick={onResetDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
          title="Reset scenario back to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">RESET</span>
        </button>

        {/* Officer User Profile */}
        <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
          <UserCheck className="w-4 h-4 text-[#005A9C]" />
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-bold text-slate-900">Director General Rao</p>
            <p className="text-[9px] text-[#005A9C] font-mono font-semibold">COMMAND_OFFICER</p>
          </div>
        </div>
      </div>
    </header>
  );
};
