"use client";

import React from "react";
import {
  LayoutDashboard, Activity, Map, ShieldAlert,
  Users, Network, Settings, FileSpreadsheet
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const NAV_ITEMS = [
  { id: "COMMAND_CENTER", label: "COMMAND CENTER", icon: LayoutDashboard, badge: "LIVE" },
  { id: "COMPLAINTS", label: "COMPLAINTS", icon: ShieldAlert, badge: "10K+" },
  { id: "REPORTS", label: "REPORTS", icon: FileSpreadsheet },
  { id: "THREAT_OVERVIEW", label: "THREAT OVERVIEW", icon: Activity },
  { id: "CYBER_RISK_MAP", label: "CYBER RISK MAP", icon: Map },
  { id: "THREAT_CLUSTERS", label: "THREAT CLUSTERS", icon: Users },
  { id: "ENTITY_INTELLIGENCE", label: "ENTITY INTELLIGENCE", icon: Network },
  { id: "SETTINGS", label: "SETTINGS", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="w-64 bg-white border-r border-blue-100 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto font-sans shadow-sm">
      <div className="p-3 text-[11px] font-mono text-white font-bold tracking-wider uppercase bg-[#005A9C] shadow-sm flex items-center justify-between">
        <span>TACTICAL NAVIGATION</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
      <nav className="p-2 space-y-1 font-mono">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#005A9C] hover:bg-blue-50/70"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#005A9C]/70"}`} />
                <span className="truncate tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  isActive ? "bg-red-500 text-white" : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
