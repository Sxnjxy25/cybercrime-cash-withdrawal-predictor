"use client";

import React from "react";
import { TrendingUp, Calendar, AlertOctagon, HelpCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface PredictionHorizonProps {
  data?: any;
}

export function PredictionHorizon({ data }: PredictionHorizonProps) {
  const horizonData = [
    { timeline: "NOW", historical: 428, forecast: 428, upper: 428, lower: 428, risk: "BASELINE" },
    { timeline: "24H", historical: null, forecast: 480, upper: 510, lower: 450, risk: "MODERATE" },
    { timeline: "7D", historical: null, forecast: 547, upper: 600, lower: 490, risk: "HIGH" },
    { timeline: "30D", historical: null, forecast: 685, upper: 760, lower: 610, risk: "CRITICAL" },
  ];

  return (
    <div className="relative w-full rounded-xl bg-white border border-slate-200 border-t-4 border-t-[#005A9C] p-5 shadow-sm flex flex-col justify-between space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#005A9C]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">PREDICTIVE ANALYTICS</span>
            <h3 className="text-xs font-bold text-[#005A9C] uppercase font-mono tracking-tight">
              PREDICTION HORIZON (24H / 7D / 30D)
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200">
            AI MODEL CONFIDENCE: 88.4%
          </span>
        </div>
      </div>

      {/* Timeline Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 font-mono text-[10px]">
        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
          <span className="text-slate-500 block text-[9px]">TIMELINE</span>
          <span className="font-extrabold text-slate-900 text-xs">NOW</span>
          <span className="text-[9px] text-slate-600 block mt-0.5">428 INCIDENTS</span>
        </div>
        <div className="bg-purple-50/50 p-2 rounded border border-purple-200 text-center">
          <span className="text-slate-500 block text-[9px]">SHORT HORIZON</span>
          <span className="font-extrabold text-purple-700 text-xs">+24 HOURS</span>
          <span className="text-[9px] text-purple-600 block mt-0.5">480 EST.</span>
        </div>
        <div className="bg-amber-50/50 p-2 rounded border border-amber-200 text-center">
          <span className="text-slate-500 block text-[9px]">MID HORIZON</span>
          <span className="font-extrabold text-amber-700 text-xs">+7 DAYS</span>
          <span className="text-[9px] text-amber-700 block mt-0.5">547 EST.</span>
        </div>
        <div className="bg-red-50/50 p-2 rounded border border-red-200 text-center">
          <span className="text-slate-500 block text-[9px]">LONG HORIZON</span>
          <span className="font-extrabold text-red-600 text-xs">+30 DAYS</span>
          <span className="text-[9px] text-red-600 block mt-0.5">685 EST.</span>
        </div>
      </div>

      {/* Prediction Horizon Chart Area */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={horizonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Uncertainty Interval Area */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#F59E0B"
              fillOpacity={0.15}
            />
            {/* Main AI Forecast Area */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#7C3AED"
              strokeWidth={2.5}
              fill="#7C3AED"
              fillOpacity={0.15}
            />
            {/* Historical Baseline */}
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#005A9C"
              strokeWidth={3}
              fill="#005A9C"
              fillOpacity={0.1}
            />
            <XAxis dataKey="timeline" stroke="#94A3B8" tick={{ fill: "#64748B", fontSize: 10 }} />
            <YAxis stroke="#94A3B8" tick={{ fill: "#64748B", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E2E8F0",
                borderRadius: "8px",
                color: "#0F172A",
                fontFamily: "monospace",
                fontSize: "11px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-[#005A9C]" />
            <span>HISTORICAL BASELINE</span>
          </span>
          <span className="flex items-center space-x-1 text-purple-700">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>AI FORECAST (VIOLET)</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>UNCERTAINTY BOUND (AMBER)</span>
          </span>
        </div>
        <span className="text-red-600 font-bold">ESCALATION PROBABILITY: HIGH</span>
      </div>
    </div>
  );
}
