"use client";

import React from "react";
import { ShieldAlert, Bot, Play, RotateCcw, UserCheck } from "lucide-react";

interface NavbarProps {
  onSimulateDemo: () => void;
  onResetDemo: () => void;
  onOpenCopilot: () => void;
  isDemoActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onSimulateDemo, onResetDemo, onOpenCopilot, isDemoActive }) => {
  return (
    <header className="h-16 border-b border-[#242428] bg-[#090909]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Tactical Command Tagline */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#FF304F]/15 border border-[#FF304F]/40 flex items-center justify-center shadow-lg shadow-[#FF304F]/10 crimson-pulse">
            <ShieldAlert className="w-5 h-5 text-[#FF304F]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-[#F5F2EA] font-mono">
              CYBERPREDICT X
            </h1>
            <p className="text-[10px] text-[#A6A19A] font-mono tracking-widest uppercase">
              OBSIDIAN INTELLIGENCE // NATIONAL THREAT PREDICTION
            </p>
          </div>
        </div>

        {/* National Threat Level Badge */}
        <div className="hidden md:flex items-center space-x-2 bg-[#0D0D0F] border border-[#FF304F]/40 px-3 py-1 rounded-full font-mono">
          <div className="w-2 h-2 rounded-full bg-[#FF304F] crimson-pulse" />
          <span className="text-xs font-semibold text-[#A6A19A]">NATIONAL RISK:</span>
          <span className="text-xs font-bold text-[#FF304F]">87 / 100 (CRITICAL)</span>
        </div>
      </div>

      {/* Actions & Intelligence Profile */}
      <div className="flex items-center space-x-3 font-mono">
        {/* Scenario Threat Simulator */}
        <button
          onClick={onSimulateDemo}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
            isDemoActive
              ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 shadow-md shadow-[#F59E0B]/10"
              : "bg-[#FF304F] text-[#090909] border-[#FF304F] hover:bg-[#E51C46] shadow-md shadow-[#FF304F]/20"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isDemoActive ? "THREAT SIGNAL ACTIVE" : "SIMULATE EMERGING THREAT"}</span>
        </button>

        {/* Scenario Reset Button */}
        <button
          onClick={onResetDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#121214] text-[#A6A19A] border border-[#242428] hover:text-[#F5F2EA] hover:border-[#FF304F]/50 transition-all cursor-pointer"
          title="Reset scenario back to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RESET</span>
        </button>

        {/* AI Copilot Intelligence Drawer Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/20 transition-all shadow-md shadow-[#8B5CF6]/10 cursor-pointer"
        >
          <Bot className="w-4 h-4 text-[#8B5CF6]" />
          <span className="hidden sm:inline">AI COPILOT</span>
        </button>

        {/* Officer User Profile */}
        <div className="flex items-center space-x-2 bg-[#0D0D0F] border border-[#242428] px-3 py-1.5 rounded-lg text-xs">
          <UserCheck className="w-4 h-4 text-[#F5F2EA]" />
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-bold text-[#F5F2EA]">Director General Rao</p>
            <p className="text-[9px] text-[#A6A19A] font-mono">COMMAND_OFFICER</p>
          </div>
        </div>
      </div>
    </header>
  );
};
