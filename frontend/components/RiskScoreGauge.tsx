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
    <div className="relative w-full rounded-xl bg-[#0D0D0F] border border-[#242428] p-5 glass-obsidian-crimson flex flex-col justify-between items-center text-center">
      {/* Upper Label */}
      <div className="w-full flex items-center justify-between font-mono text-xs mb-2">
        <div className="flex items-center space-x-2 text-[#A6A19A]">
          <Zap className="w-3.5 h-3.5 text-[#FF304F]" />
          <span className="uppercase text-[10px] tracking-wider">AGGREGATED INDEX</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF304F]/10 text-[#FF304F] border border-[#FF304F]/30">
          REAL-TIME SCORE
        </span>
      </div>

      {/* 3D Segmented Orbital Ring Gauge */}
      <div className="relative w-48 h-48 my-3 flex items-center justify-center">
        {/* Orbital Pulsing Rings */}
        <div className="absolute inset-0 rounded-full border border-[#8B5CF6]/20 animate-spin" style={{ animationDuration: "25s" }} />
        <div className="absolute inset-2 rounded-full border border-[#FF304F]/30 border-dashed animate-spin" style={{ animationDuration: "18s", animationDirection: "reverse" }} />
        
        {/* Segmented Ring SVG */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {Array.from({ length: totalSegments }).map((_, i) => {
            const angle = (i * 360) / totalSegments;
            const isFilled = i < filledSegments;
            const isCritical = i > totalSegments * 0.75;
            const isWarning = i > totalSegments * 0.5 && !isCritical;
            
            let strokeColor = "#242428";
            if (isFilled) {
              if (isCritical) strokeColor = "#FF304F";
              else if (isWarning) strokeColor = "#F59E0B";
              else strokeColor = "#8B5CF6";
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
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-[#090909]/90 border border-[#242428] m-6 backdrop-blur-md">
          <span className="text-5xl font-black tracking-tight text-[#F5F2EA] font-mono leading-none">
            {displayScore}
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF304F] mt-1 uppercase">
            {level}
          </span>
        </div>
      </div>

      {/* Metric Breakdown Pill */}
      <div className="w-full font-mono text-xs pt-3 border-t border-[#1F1F23] flex items-center justify-between">
        <div className="text-left">
          <span className="text-[9px] text-[#A6A19A] block">PREDICTIVE TREND</span>
          <span className="font-bold text-[#F59E0B] flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3 text-[#FF304F]" />
            <span>{trend}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-[#A6A19A] block font-mono">SEVERITY LEVEL</span>
          <span className="font-bold text-[#FF304F] text-xs">TIER 1 ESCALATION</span>
        </div>
      </div>
    </div>
  );
}
