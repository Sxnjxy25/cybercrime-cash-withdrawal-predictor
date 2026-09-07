"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

interface IndiaRiskMapLeafletProps {
  center: [number, number];
  displayLocations: RegionalLocation[];
  activeMode: string;
  targetComplaintLocation?: any;
  onSelectDistrict?: (loc: RegionalLocation) => void;
  onMarkerClick: (loc: RegionalLocation) => void;
  getMarkerColor: (loc: RegionalLocation) => string;
  getMarkerRadius: (loc: RegionalLocation) => number;
}

const MapFocusController: React.FC<{ coords?: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, 12, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

export const IndiaRiskMapLeaflet: React.FC<IndiaRiskMapLeafletProps> = ({
  center,
  displayLocations,
  activeMode,
  targetComplaintLocation,
  onSelectDistrict,
  onMarkerClick,
  getMarkerColor,
  getMarkerRadius
}) => {
  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ width: "100%", height: "100%", minHeight: "460px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Focus on target complaint if selected */}
      {targetComplaintLocation?.location && (
        <MapFocusController
          coords={[
            targetComplaintLocation.location.latitude,
            targetComplaintLocation.location.longitude
          ]}
        />
      )}

      {/* Target Crime Incident Pinpoint Marker */}
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

      {/* Forecasted ATM Cash-Out Hotspot Markers */}
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

      {/* Regional Cybercrime Hotspot Markers */}
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
                onMarkerClick(loc);
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
  );
};
