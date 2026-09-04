"use client";

import React, { useEffect, useRef, useState } from "react";
import { Shield, Sparkles, Activity, AlertCircle } from "lucide-react";

export function GlobalThreatCore() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [coreStats, setCoreStats] = useState({
    activeThreats: 142,
    predictionConfidence: 91.4,
    anomaliesDetected: 38,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes on a 3D sphere surface
    const nodeCount = 70;
    const radius = Math.min(width, height) * 0.36;
    
    interface Particle {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      type: "CRIMSON" | "VIOLET" | "AMBER" | "IVORY";
      label?: string;
      size: number;
      pulseSpeed: number;
      pulseOffset: number;
    }

    const particles: Particle[] = [];
    const labels = ["UPI_INJECT_V4", "SMS_PHISH_MUM", "RANSOM_DELHI", "MULE_NET_TN", "OTP_BYPASS_BLR", "HYD_FRAUD_HUB"];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const baseX = radius * Math.cos(theta) * Math.sin(phi);
      const baseY = radius * Math.sin(theta) * Math.sin(phi);
      const baseZ = radius * Math.cos(phi);

      const typeRand = Math.random();
      let type: "CRIMSON" | "VIOLET" | "AMBER" | "IVORY" = "IVORY";
      if (typeRand < 0.4) type = "CRIMSON";
      else if (typeRand < 0.7) type = "VIOLET";
      else if (typeRand < 0.9) type = "AMBER";

      particles.push({
        x: baseX,
        y: baseY,
        z: baseZ,
        baseX,
        baseY,
        baseZ,
        type,
        label: i % 10 === 0 ? labels[i / 10 % labels.length] : undefined,
        size: Math.random() * 3 + 2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Connective arcs / wireframe lines
    let angleX = 0;
    let angleY = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Center of sphere
      const cx = width / 2;
      const cy = height / 2;

      angleY += 0.006;
      angleX += 0.002;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Ambient background glow (obsidian center + violet/crimson aura)
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.3);
      grad.addColorStop(0, "rgba(255, 48, 79, 0.08)");
      grad.addColorStop(0.5, "rgba(139, 92, 246, 0.04)");
      grad.addColorStop(1, "rgba(9, 9, 9, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Rotate particles and sort by Z for proper 3D rendering
      const projected = particles.map((p) => {
        // Rotate around Y
        let x1 = p.baseX * cosY - p.baseZ * sinY;
        let z1 = p.baseZ * cosY + p.baseX * sinY;
        // Rotate around X
        let y1 = p.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.baseY * sinX;

        // Perspective scale factor
        const scale = 360 / (360 + z2);
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;

        return { ...p, px, py, pz: z2, scale };
      });

      projected.sort((a, b) => a.pz - b.pz);

      // Draw wireframe connecting arcs between close nodes
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          if (p1.pz < -radius * 0.5 && p2.pz < -radius * 0.5) continue; // cull back half slightly

          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 65) {
            const alpha = (1 - dist / 65) * 0.2 * Math.max(0, (p1.pz + radius) / (2 * radius));
            if (p1.type === "CRIMSON" || p2.type === "CRIMSON") {
              ctx.strokeStyle = `rgba(255, 48, 79, ${alpha * 1.5})`;
            } else if (p1.type === "VIOLET" || p2.type === "VIOLET") {
              ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 1.5})`;
            } else {
              ctx.strokeStyle = `rgba(245, 242, 234, ${alpha * 0.8})`;
            }
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw particles & labels
      projected.forEach((p) => {
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.5 + 0.5;
        const size = (p.size + pulse * 2) * p.scale;
        const alpha = Math.max(0.25, (p.pz + radius) / (2 * radius));

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1, size), 0, Math.PI * 2);

        if (p.type === "CRIMSON") {
          ctx.fillStyle = `rgba(255, 48, 79, ${alpha})`;
          ctx.shadowColor = "#FF304F";
          ctx.shadowBlur = 12 * p.scale;
        } else if (p.type === "VIOLET") {
          ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.shadowColor = "#8B5CF6";
          ctx.shadowBlur = 10 * p.scale;
        } else if (p.type === "AMBER") {
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.shadowColor = "#F59E0B";
          ctx.shadowBlur = 8 * p.scale;
        } else {
          ctx.fillStyle = `rgba(245, 242, 234, ${alpha * 0.8})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Label rendering for front-facing key nodes
        if (p.label && p.pz > 0 && alpha > 0.6) {
          ctx.font = '9px monospace';
          ctx.fillStyle = `rgba(245, 242, 234, ${alpha * 0.9})`;
          ctx.fillText(p.label, p.px + 8, p.py + 3);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full rounded-xl bg-[#0D0D0F] border border-[#242428] p-4 glass-obsidian-crimson overflow-hidden flex flex-col justify-between">
      {/* Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#FF304F]/10 border border-[#FF304F]/30 text-[#FF304F]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider text-[#A6A19A] block uppercase">
              3D INTELLIGENCE CORE
            </span>
            <h2 className="text-sm font-extrabold tracking-tight text-[#F5F2EA] uppercase font-mono">
              GLOBAL THREAT SPHERE
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/40 crimson-pulse">
            LIVE ORBITAL FEED
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative h-[280px] w-full flex items-center justify-center my-1">
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Center Overlay Badge */}
        <div className="absolute pointer-events-none text-center bg-[#090909]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#242428]">
          <span className="text-[9px] font-mono text-[#A6A19A] block">THREAT DENSITY</span>
          <span className="text-xs font-bold font-mono text-[#FF304F]">HIGH RISK AGGREGATION</span>
        </div>
      </div>

      {/* Metadata Telemetry Footer */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#1F1F23] pt-3 z-10 font-mono text-xs">
        <div className="bg-[#121214] p-2 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">ACTIVE SIGNALS</span>
          <span className="font-bold text-[#FF304F]">{coreStats.activeThreats} NODES</span>
        </div>
        <div className="bg-[#121214] p-2 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">AI FORECAST ACCURACY</span>
          <span className="font-bold text-[#8B5CF6]">{coreStats.predictionConfidence}%</span>
        </div>
        <div className="bg-[#121214] p-2 rounded border border-[#242428]">
          <span className="text-[9px] text-[#A6A19A] block">ANOMALY PULSES</span>
          <span className="font-bold text-[#F59E0B]">{coreStats.anomaliesDetected} / SEC</span>
        </div>
      </div>
    </div>
  );
}
