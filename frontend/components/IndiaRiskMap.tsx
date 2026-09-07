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

interface IndiaRiskMapProps {
  locations: RegionalLocation[];
  onSelectDistrict?: (loc: RegionalLocation) => void;
  targetComplaintLocation?: any;
}

// Map Focus Controller to fly/pan to specific complaint coordinates
const MapFocusController: React.FC<{ coords?: [number, number] }> = ({ coords }) => {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  React.useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, 12, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const DEFAULT_RISK_LOCATIONS: RegionalLocation[] = [
  {
    id: "loc-del",
    state: "Delhi",
    district: "New Delhi",
    police_jurisdiction: "Special Cell Cyber Command, Delhi Police",
    latitude: 28.6139,
    longitude: 77.2090,
    current_risk_score: 89.0,
    forecast_risk_score: 93.5,
    risk_band: "CRITICAL",
    complaint_count: 342,
    dominant_category: "UPI Impersonation"
  },
  {
    id: "loc-mum",
    state: "Maharashtra",
    district: "Mumbai",
    police_jurisdiction: "BKC Cyber Police Station, Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
    current_risk_score: 84.0,
    forecast_risk_score: 88.0,
    risk_band: "CRITICAL",
    complaint_count: 289,
    dominant_category: "Digital Arrest Scam"
  },
  {
    id: "loc-blr",
    state: "Karnataka",
    district: "Bengaluru Urban",
    police_jurisdiction: "CID Cyber Crime Division, Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    current_risk_score: 82.0,
    forecast_risk_score: 86.5,
    risk_band: "CRITICAL",
    complaint_count: 245,
    dominant_category: "Investment Fraud & Phishing"
  },
  {
    id: "loc-chn",
    state: "Tamil Nadu",
    district: "Chennai",
    police_jurisdiction: "Chennai Central Cyber Crime Police Station",
    latitude: 13.0827,
    longitude: 80.2707,
    current_risk_score: 78.0,
    forecast_risk_score: 82.0,
    risk_band: "CRITICAL",
    complaint_count: 210,
    dominant_category: "UPI Impersonation Ring"
  },
  {
    id: "loc-hyd",
    state: "Telangana",
    district: "Hyderabad",
    police_jurisdiction: "Cyberabad Cyber Crime Unit, Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
    current_risk_score: 76.0,
    forecast_risk_score: 80.0,
    risk_band: "CRITICAL",
    complaint_count: 185,
    dominant_category: "Courier & Customs Fraud"
  },
  {
    id: "loc-kol",
    state: "West Bengal",
    district: "Kolkata",
    police_jurisdiction: "Lalbazar Cyber Crime PS, Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
    current_risk_score: 68.0,
    forecast_risk_score: 74.0,
    risk_band: "HIGH",
    complaint_count: 156,
    dominant_category: "Instant Loan App Scam"
  },
  {
    id: "loc-pun",
    state: "Maharashtra",
    district: "Pune",
    police_jurisdiction: "Cyber Police Station, Pune City",
    latitude: 18.5204,
    longitude: 73.8567,
    current_risk_score: 71.0,
    forecast_risk_score: 75.0,
    risk_band: "HIGH",
    complaint_count: 142,
    dominant_category: "Investment Scam"
  },
  {
    id: "loc-ahm",
    state: "Gujarat",
    district: "Ahmedabad",
    police_jurisdiction: "Cyber Crime Police Station, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
    current_risk_score: 59.0,
    forecast_risk_score: 63.0,
    risk_band: "HIGH",
    complaint_count: 118,
    dominant_category: "Fake Customer Support"
  },
  {
    id: "loc-jai",
    state: "Rajasthan",
    district: "Jaipur",
    police_jurisdiction: "Cyber Crime PS, Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
    current_risk_score: 64.0,
    forecast_risk_score: 69.0,
    risk_band: "HIGH",
    complaint_count: 104,
    dominant_category: "Job & Part-Time Scam"
  }
];

export const IndiaRiskMap: React.FC<IndiaRiskMapProps> = ({
  locations,
  onSelectDistrict,
  targetComplaintLocation
}) => {
  const [activeMode, setActiveMode] = useState("CURRENT RISK");
  const [selectedLoc, setSelectedLoc] = useState<RegionalLocation | null>(null);

  const displayLocations = (locations && locations.length > 0) ? locations : DEFAULT_RISK_LOCATIONS;

  // Default coordinates centered over India (20.5937 N, 78.9629 E) or target complaint
  const center: [number, number] = targetComplaintLocation?.location
    ? [targetComplaintLocation.location.latitude, targetComplaintLocation.location.longitude]
    : [20.5937, 78.9629];

  const getMarkerColor = (loc: RegionalLocation) => {
    const score = activeMode === "FORECAST RISK" ? loc.forecast_risk_score : loc.current_risk_score;
    if (score >= 76) return "#DC2626"; // Crimson Critical
    if (score >= 51) return "#D97706"; // Amber Warning
    if (score >= 26) return "#7C3AED"; // Violet Prediction
    return "#005A9C"; // Blue Baseline
  };

  const getMarkerRadius = (loc: RegionalLocation) => {
    if (activeMode === "COMPLAINT DENSITY") {
      return Math.min(24, Math.max(10, loc.complaint_count / 20));
    }
    return Math.min(22, Math.max(10, loc.current_risk_score / 4.5));
  };

  return (
    <div className="bg-white border border-slate-200 border-t-4 border-t-[#005A9C] rounded-xl p-4 shadow-sm flex flex-col h-full min-h-[580px] font-sans">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
        <div>
          <h3 className="text-xs font-extrabold text-[#005A9C] tracking-wider uppercase flex items-center space-x-2 font-mono">
            <MapPin className="w-4 h-4 text-[#005A9C]" />
            <span>PREDICTIVE CYBER RISK MAP (INDIA)</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">
            MODE: <span className="font-bold text-[#005A9C]">{activeMode}</span> • TACTICAL GEO-LAYERS
          </p>
        </div>

        {/* Map Mode Selector */}
        <div className="flex flex-wrap gap-1 font-mono">
          {MAP_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                activeMode === mode
                  ? "bg-[#005A9C] text-white border border-[#005A9C] shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Body */}
      <div className="relative flex-1 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 min-h-[460px]">
        {typeof window !== "undefined" && (
          <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* If a specific complaint is selected, fly to its coordinates */}
            {targetComplaintLocation?.location && (
              <MapFocusController
                coords={[
                  targetComplaintLocation.location.latitude,
                  targetComplaintLocation.location.longitude
                ]}
              />
            )}

            {/* Specific Crime Incident Pinpoint Marker */}
            {targetComplaintLocation?.location && (
              <CircleMarker
                center={[
                  targetComplaintLocation.location.latitude,
                  targetComplaintLocation.location.longitude
                ]}
                radius={16}
                pathOptions={{
                  fillColor: "#EAB308",
                  fillOpacity: 0.9,
                  color: "#DC2626",
                  weight: 3
                }}
              >
                <Popup className="custom-popup" autoPan={false}>
                  <div className="p-2 text-slate-900 text-xs font-sans space-y-1">
                    <p className="font-extrabold text-sm text-red-600">
                      🚨 CRIME INCIDENT: #{targetComplaintLocation.complaint_code}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-600">
                      {targetComplaintLocation.location.city}, {targetComplaintLocation.location.state}
                    </p>
                    <hr className="my-1 border-slate-200" />
                    <p><strong>Category:</strong> <span className="font-bold">{targetComplaintLocation.category}</span></p>
                    <p><strong>Financial Loss:</strong> <span className="text-amber-700 font-bold">₹{targetComplaintLocation.financial_loss?.toLocaleString("en-IN")}</span></p>
                    <p><strong>Victim Bank:</strong> {targetComplaintLocation.victim_bank}</p>
                    <p><strong>Suspect Mule:</strong> {targetComplaintLocation.suspect_mule_account}</p>
                    <p className="text-red-600 font-bold uppercase">{targetComplaintLocation.urgency_level}</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Forecasted ATM Cash-Out Hotspot Markers for this specific complaint */}
            {targetComplaintLocation?.forecasted_atm_hotspots?.map((atm: any, i: number) => (
              <CircleMarker
                key={atm.atm_id || i}
                center={[atm.latitude, atm.longitude]}
                radius={10}
                pathOptions={{
                  fillColor: i === 0 ? "#DC2626" : "#2563EB",
                  fillOpacity: 0.85,
                  color: "#FFFFFF",
                  weight: 2
                }}
              >
                <Popup className="custom-popup" autoPan={false}>
                  <div className="p-2 text-slate-900 text-xs font-sans space-y-1">
                    <p className="font-extrabold text-xs text-[#005A9C]">
                      🏧 {atm.atm_name}
                    </p>
                    <p><strong>Distance:</strong> {atm.distance_km} km</p>
                    <p><strong>Transit ETA:</strong> {atm.estimated_arrival_eta_mins} mins</p>
                    <p><strong>Cash-Out Risk:</strong> <span className="text-red-600 font-bold">{(atm.cashout_risk_score * 100).toFixed(0)}%</span></p>
                    <p><strong>Action Priority:</strong> <span className="text-amber-700 font-bold">{atm.action_priority}</span></p>
                    <p><strong>CCTV Surveillance:</strong> <span className="text-emerald-700 font-bold">{atm.cctv_status}</span></p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {displayLocations.map((loc) => {
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
                    <div className="p-2 text-slate-900 text-xs font-sans">
                      <p className="font-extrabold text-sm text-[#005A9C]">{loc.district}, {loc.state}</p>
                      <p className="text-[11px] font-semibold text-slate-500">{loc.police_jurisdiction}</p>
                      <hr className="my-1 border-slate-200" />
                      <p><strong>Current Risk:</strong> <span className="text-red-600 font-bold">{loc.current_risk_score} ({loc.risk_band})</span></p>
                      <p><strong>Forecast Risk:</strong> <span className="text-purple-700 font-bold">{loc.forecast_risk_score}</span></p>
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
          <div className="absolute top-3 right-3 z-[1000] w-72 bg-white/95 border border-slate-200 rounded-xl p-3.5 shadow-xl text-xs space-y-2 font-sans backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="font-extrabold text-sm text-slate-900">{selectedLoc.district}</p>
                <p className="text-[10px] text-red-600 font-bold font-mono">{selectedLoc.state} JURISDICTION</p>
              </div>
              <button
                onClick={() => setSelectedLoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">CURRENT RISK</span>
                <span className="font-extrabold text-red-600">{selectedLoc.current_risk_score} / 100</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">FORECAST RISK</span>
                <span className="font-extrabold text-purple-700">{selectedLoc.forecast_risk_score}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono">
              <span className="text-[9px] text-slate-500 block">DOMINANT CATEGORY</span>
              <span className="font-bold text-slate-900">{selectedLoc.dominant_category}</span>
            </div>

            <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono">
              <span className="text-[9px] text-slate-500 block">TOTAL COMPLAINTS</span>
              <span className="font-bold text-slate-900">{selectedLoc.complaint_count} Ingested</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
