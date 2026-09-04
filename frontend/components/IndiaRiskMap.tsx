"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Shield, Layers, Filter } from "lucide-react";

// Dynamically import Leaflet components for SSR compatibility in Next.js
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface RegionalLocation {
  id: string;
  state: string;
  district: string;
  police_jurisdiction: string;
  latitude: number;
  longitude: number;
  current_risk_score: number;
  forecast_risk_score: number;
  risk_band: string;
  complaint_count: number;
  dominant_category: string;
}

const MAP_MODES = [
  "CURRENT RISK",
  "FORECAST RISK",
  "COMPLAINT DENSITY",
  "ANOMALY HOTSPOTS",
  "THREAT CLUSTERS",
  "CATEGORY ACTIVITY"
];

export const IndiaRiskMap: React.FC<{
  locations: RegionalLocation[];
  onSelectDistrict?: (loc: RegionalLocation) => void;
}> = ({ locations, onSelectDistrict }) => {
  const [activeMode, setActiveMode] = useState("CURRENT RISK");
  const [selectedLoc, setSelectedLoc] = useState<RegionalLocation | null>(null);

  // Default coordinates centered over India (20.5937 N, 78.9629 E)
  const center: [number, number] = [20.5937, 78.9629];

  const getMarkerColor = (loc: RegionalLocation) => {
    const score = activeMode === "FORECAST RISK" ? loc.forecast_risk_score : loc.current_risk_score;
    if (score >= 76) return "#FF304F"; // Crimson Critical
    if (score >= 51) return "#F59E0B"; // Amber Warning
    if (score >= 26) return "#8B5CF6"; // Violet Prediction
    return "#F5F2EA"; // Warm Ivory Baseline
  };

  const getMarkerRadius = (loc: RegionalLocation) => {
    if (activeMode === "COMPLAINT DENSITY") {
      return Math.min(24, Math.max(10, loc.complaint_count / 20));
    }
    return Math.min(22, Math.max(10, loc.current_risk_score / 4.5));
  };

  return (
    <div className="bg-[#0D0D0F] border border-[#242428] rounded-xl p-4 glass-obsidian-crimson shadow-2xl flex flex-col h-[520px] font-mono">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
        <div>
          <h3 className="text-xs font-extrabold text-[#F5F2EA] tracking-wider uppercase flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#FF304F]" />
            <span>PREDICTIVE CYBER RISK MAP (INDIA)</span>
          </h3>
          <p className="text-[10px] text-[#A6A19A]">
            MODE: <span className="font-bold text-[#FF304F]">{activeMode}</span> • OBSIDIAN TACTICAL LAYERS
          </p>
        </div>

        {/* Map Mode Selector */}
        <div className="flex flex-wrap gap-1">
          {MAP_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                activeMode === mode
                  ? "bg-[#FF304F]/20 text-[#FF304F] border border-[#FF304F]/40 shadow-sm"
                  : "bg-[#121214] text-[#A6A19A] hover:bg-[#171719] hover:text-[#F5F2EA]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Body */}
      <div className="relative flex-1 rounded-lg overflow-hidden border border-[#242428] bg-[#090909]">
        {typeof window !== "undefined" && (
          <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {locations.map((loc) => {
              const color = getMarkerColor(loc);
              const radius = getMarkerRadius(loc);
              return (
                <CircleMarker
                  key={loc.id}
                  center={[loc.latitude, loc.longitude]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.75,
                    color: color,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedLoc(loc);
                      if (onSelectDistrict) onSelectDistrict(loc);
                    }
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 text-[#F5F2EA] text-xs font-mono">
                      <p className="font-extrabold text-sm">{loc.district}, {loc.state}</p>
                      <p className="text-[11px] font-semibold text-[#A6A19A]">{loc.police_jurisdiction}</p>
                      <hr className="my-1 border-[#242428]" />
                      <p><strong>Current Risk:</strong> <span className="text-[#FF304F] font-bold">{loc.current_risk_score} ({loc.risk_band})</span></p>
                      <p><strong>Forecast Risk:</strong> <span className="text-[#8B5CF6] font-bold">{loc.forecast_risk_score}</span></p>
                      <p><strong>Dominant Category:</strong> {loc.dominant_category}</p>
                      <p><strong>Complaint Count:</strong> {loc.complaint_count}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}

        {/* Selected District Drill-Down Overlay Panel */}
        {selectedLoc && (
          <div className="absolute top-3 right-3 z-[1000] w-72 bg-[#0D0D0F]/95 border border-[#FF304F]/40 rounded-xl p-3.5 shadow-2xl glass-obsidian-crimson text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-[#1F1F23] pb-2">
              <div>
                <p className="font-extrabold text-sm text-[#F5F2EA]">{selectedLoc.district}</p>
                <p className="text-[10px] text-[#FF304F]">{selectedLoc.state} JURISDICTION</p>
              </div>
              <button
                onClick={() => setSelectedLoc(null)}
                className="text-[#A6A19A] hover:text-[#F5F2EA] text-sm font-bold px-1.5"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#121214] p-2 rounded border border-[#242428]">
                <span className="text-[9px] text-[#A6A19A] block">CURRENT RISK</span>
                <span className="font-extrabold text-[#FF304F]">{selectedLoc.current_risk_score} / 100</span>
              </div>
              <div className="bg-[#121214] p-2 rounded border border-[#242428]">
                <span className="text-[9px] text-[#A6A19A] block">FORECAST RISK</span>
                <span className="font-extrabold text-[#8B5CF6]">{selectedLoc.forecast_risk_score}</span>
              </div>
            </div>

            <div className="bg-[#121214] p-2 rounded border border-[#242428]">
              <span className="text-[9px] text-[#A6A19A] block">DOMINANT CATEGORY</span>
              <span className="font-bold text-[#F5F2EA]">{selectedLoc.dominant_category}</span>
            </div>

            <div className="bg-[#121214] p-2 rounded border border-[#242428]">
              <span className="text-[9px] text-[#A6A19A] block">TOTAL COMPLAINTS</span>
              <span className="font-bold text-[#F5F2EA]">{selectedLoc.complaint_count} Ingested</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
