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
    <div className="relative w-full rounded-xl bg-[#0D0D0F] border border-[#242428] p-5 glass-obsidian-violet flex flex-col justify-between space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#A6A19A] block uppercase">PREDICTIVE ANALYTICS</span>
            <h3 className="text-xs font-bold text-[#F5F2EA] uppercase font-mono tracking-tight">
              PREDICTION HORIZON (24H / 7D / 30D)
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
            AI MODEL CONFIDENCE: 88.4%
          </span>
        </div>
      </div>

      {/* Timeline Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 font-mono text-[10px]">
        <div className="bg-[#121214] p-2 rounded border border-[#242428] text-center">
          <span className="text-[#A6A19A] block text-[9px]">TIMELINE</span>
          <span className="font-extrabold text-[#F5F2EA] text-xs">NOW</span>
          <span className="text-[9px] text-[#F5F2EA]/70 block mt-0.5">428 INCIDENTS</span>
        </div>
        <div className="bg-[#121214] p-2 rounded border border-[#8B5CF6]/30 text-center">
          <span className="text-[#A6A19A] block text-[9px]">SHORT HORIZON</span>
          <span className="font-extrabold text-[#8B5CF6] text-xs">+24 HOURS</span>
          <span className="text-[9px] text-[#8B5CF6] block mt-0.5">480 EST.</span>
        </div>
        <div className="bg-[#121214] p-2 rounded border border-[#F59E0B]/30 text-center">
          <span className="text-[#A6A19A] block text-[9px]">MID HORIZON</span>
          <span className="font-extrabold text-[#F59E0B] text-xs">+7 DAYS</span>
          <span className="text-[9px] text-[#F59E0B] block mt-0.5">547 EST.</span>
        </div>
        <div className="bg-[#121214] p-2 rounded border border-[#FF304F]/30 text-center">
          <span className="text-[#A6A19A] block text-[9px]">LONG HORIZON</span>
          <span className="font-extrabold text-[#FF304F] text-xs">+30 DAYS</span>
          <span className="text-[9px] text-[#FF304F] block mt-0.5">685 EST.</span>
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
              fillOpacity={0.12}
            />
            {/* Main AI Forecast Area */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fill="#8B5CF6"
              fillOpacity={0.2}
            />
            {/* Historical Baseline */}
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#F5F2EA"
              strokeWidth={3}
              fill="#F5F2EA"
              fillOpacity={0.1}
            />
            <XAxis dataKey="timeline" stroke="#706C66" tick={{ fill: "#A6A19A", fontSize: 10 }} />
            <YAxis stroke="#706C66" tick={{ fill: "#A6A19A", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D0D0F",
                borderColor: "#8B5CF6",
                borderRadius: "8px",
                color: "#F5F2EA",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Risk Horizon Tags */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono border-t border-[#1F1F23] pt-3 text-[#A6A19A]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5F2EA] inline-block" />
            <span>HISTORICAL BASELINE</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block" />
            <span>AI FORECAST (VIOLET)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
            <span>UNCERTAINTY BOUND (AMBER)</span>
          </span>
        </div>
        <span className="text-[#FF304F] font-bold">ESCALATION PROBABILITY: HIGH</span>
      </div>
    </div>
  );
}
