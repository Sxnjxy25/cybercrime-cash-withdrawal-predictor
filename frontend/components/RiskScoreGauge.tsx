"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Zap, ArrowUpRight } from "lucide-react";

interface RiskScoreGaugeProps {
  score?: number;
  level?: string;
  trend?: string;
}

export function RiskScoreGauge({
  score = 87,
  level = "CRITICAL RISK",
  trend = "+14.2% THIS WEEK",
}: RiskScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const steps = 30;
    const increment = score / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Segment calculations
  const totalSegments = 36;
  const filledSegments = Math.round((displayScore / 100) * totalSegments);

  return (
    <div className="relative w-full rounded-xl bg-white border border-slate-200 border-t-4 border-t-[#005A9C] p-5 shadow-sm flex flex-col justify-between items-center text-center font-sans">
      {/* Upper Label */}
      <div className="w-full flex items-center justify-between font-mono text-xs mb-2">
        <div className="flex items-center space-x-2 text-[#005A9C]">
          <Zap className="w-3.5 h-3.5 text-[#005A9C]" />
          <span className="uppercase text-[10px] tracking-wider font-bold">AGGREGATED INDEX</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#005A9C] border border-blue-200">
          REAL-TIME SCORE
        </span>
      </div>

      {/* 3D Segmented Orbital Ring Gauge */}
      <div className="relative w-48 h-48 my-3 flex items-center justify-center">
        {/* Orbital Pulsing Rings */}
        <div className="absolute inset-0 rounded-full border border-purple-200 animate-spin" style={{ animationDuration: "25s" }} />
        <div className="absolute inset-2 rounded-full border border-red-200 border-dashed animate-spin" style={{ animationDuration: "18s", animationDirection: "reverse" }} />
        
        {/* Segmented Ring SVG */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {Array.from({ length: totalSegments }).map((_, i) => {
            const angle = (i * 360) / totalSegments;
            const isFilled = i < filledSegments;
            const isCritical = i > totalSegments * 0.75;
            const isWarning = i > totalSegments * 0.5 && !isCritical;
            
            let strokeColor = "#E2E8F0";
            if (isFilled) {
              if (isCritical) strokeColor = "#DC2626";
              else if (isWarning) strokeColor = "#D97706";
              else strokeColor = "#7C3AED";
            }

            return (
              <line
                key={i}
                x1="50"
                y1="10"
                x2="50"
                y2="17"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center Numeric HUD Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-slate-50 border border-slate-200 m-6 shadow-inner">
          <span className="text-5xl font-black tracking-tight text-slate-900 font-mono leading-none">
            {displayScore}
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-red-600 mt-1 uppercase">
            {level}
          </span>
        </div>
      </div>

      {/* Lower Trend Analytics Info */}
      <div className="w-full grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs font-mono">
        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-left">
          <span className="text-[9px] text-slate-500 block">PREDICTIVE TREND</span>
          <span className="font-bold text-amber-800 flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5 inline text-amber-700" />
            <span>{trend}</span>
          </span>
        </div>
        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-right">
          <span className="text-[9px] text-slate-500 block">SEVERITY LEVEL</span>
          <span className="font-bold text-red-700">TIER 1 ESCALATION</span>
        </div>
      </div>
    </div>
  );
}
