"use client";

import React from "react";
import {
  LayoutDashboard, Activity, TrendingUp, Map, ShieldAlert,
  Users, Network, FileText, Bell, Briefcase, Bot, FileSpreadsheet,
  Cpu, Lock, FileCode2, Settings
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const NAV_ITEMS = [
  { id: "COMMAND_CENTER", label: "COMMAND CENTER", icon: LayoutDashboard, badge: "LIVE" },
  { id: "THREAT_OVERVIEW", label: "THREAT OVERVIEW", icon: Activity },
  { id: "PREDICTIVE_INTELLIGENCE", label: "PREDICTIVE INTELLIGENCE", icon: TrendingUp },
  { id: "CYBER_RISK_MAP", label: "CYBER RISK MAP", icon: Map },
  { id: "COMPLAINT_INTELLIGENCE", label: "COMPLAINT INTELLIGENCE", icon: ShieldAlert },
  { id: "THREAT_CLUSTERS", label: "THREAT CLUSTERS", icon: Users },
  { id: "ENTITY_INTELLIGENCE", label: "ENTITY INTELLIGENCE", icon: Network },
  { id: "MODUS_OPERANDI", label: "MODUS OPERANDI", icon: FileText },
  { id: "EARLY_WARNINGS", label: "EARLY WARNINGS", icon: Bell, alert: true },
  { id: "INVESTIGATION_WORKSPACE", label: "INVESTIGATION WORKSPACE", icon: Briefcase },
  { id: "AI_COPILOT", label: "AI COPILOT", icon: Bot, isAi: true },
  { id: "REPORTS", label: "REPORTS", icon: FileSpreadsheet },
  { id: "MODEL_OBSERVATORY", label: "MODEL OBSERVATORY", icon: Cpu },
  { id: "SECURITY_CENTER", label: "SECURITY CENTER", icon: Lock },
  { id: "AUDIT_TRAIL", label: "AUDIT TRAIL", icon: FileCode2 },
  { id: "SETTINGS", label: "SETTINGS", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="w-64 bg-[#090909] border-r border-[#242428] flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-3 text-[10px] font-mono text-[#A6A19A] tracking-wider uppercase border-b border-[#242428]">
        OBSIDIAN TACTICAL NAV
      </div>
      <nav className="p-2 space-y-1 font-mono">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/40 shadow-md shadow-[#FF304F]/10"
                  : item.isAi
                  ? "text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                  : "text-[#A6A19A] hover:text-[#F5F2EA] hover:bg-[#121214]"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#FF304F]" : item.isAi ? "text-[#8B5CF6]" : "text-[#706C66]"}`} />
                <span className="truncate tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF304F]/20 text-[#FF304F] border border-[#FF304F]/30 crimson-pulse">
                  {item.badge}
                </span>
              )}
              {item.alert && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                  ALERT
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
