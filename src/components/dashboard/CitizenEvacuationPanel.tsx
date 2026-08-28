"use client";

import { useState, useMemo, useCallback } from "react";
import { MapPin, Bed, Heart, Shield, Navigation, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock, Stethoscope, Wind, Cross, ArrowRight, Siren, Phone, Send } from "lucide-react";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";
import { rankSheltersByDistance, generateRouteOptions, RankedShelter, RouteOption } from "@/lib/services/citizenRouting";
import { Shelter, Coordinates } from "@/types";

const riskBadgeColors: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MODERATE: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  EXTREME: 'bg-red-100 text-red-700',
};

// Generate a random citizen location near a zone
function generateRandomLocation(): { coords: Coordinates; label: string } {
  const zone = mockPopulationZones[Math.floor(Math.random() * mockPopulationZones.length)];
  const offset = () => (Math.random() - 0.5) * 0.01; // ~500m random offset
  return {
    coords: { lat: zone.location.lat + offset(), lng: zone.location.lng + offset() },
    label: `Near ${zone.name}`
  };
}

export default function CitizenEvacuationPanel() {
  const [citizenLocation, setCitizenLocation] = useState<{ coords: Coordinates; label: string } | null>(null);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [expandedShelterId, setExpandedShelterId] = useState<string | null>(null);
  const [sosStatus, setSosStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Auto-assign a random location
  const handleFindLocation = useCallback(() => {
    const loc = generateRandomLocation();
    setCitizenLocation(loc);
    setSelectedShelterId(null);
    setSosStatus('idle');
    // Pan map to citizen location
    (window as any).__mapFlyTo?.(loc.coords.lat, loc.coords.lng, 14);
    // Tell map to show citizen marker
    (window as any).__citizenLocation = loc.coords;
    // Force map re-render by dispatching custom event
    window.dispatchEvent(new CustomEvent('citizenLocationChanged', { detail: loc.coords }));
  }, []);

  // Rank shelters by distance from citizen location
  const rankedShelters = useMemo<RankedShelter[]>(() => {
    if (!citizenLocation) return [];
    return rankSheltersByDistance(citizenLocation.coords, mockShelters);
  }, [citizenLocation]);

  // Generate routes to selected shelter
  const routeOptions = useMemo<RouteOption[]>(() => {
    if (!citizenLocation || !selectedShelterId) return [];
    const shelter = mockShelters.find(s => s.id === selectedShelterId);
    if (!shelter) return [];
    return generateRouteOptions(citizenLocation.coords, shelter);
  }, [citizenLocation, selectedShelterId]);

  const handleSelectShelter = (shelterId: string) => {
    setSelectedShelterId(shelterId);
    const shelter = mockShelters.find(s => s.id === shelterId);
    if (shelter) {
      (window as any).__mapFlyTo?.(shelter.location.lat, shelter.location.lng, 15);
    }
    // Pass selected shelter + citizen location to map for route rendering
    if (citizenLocation) {
      (window as any).__citizenRoute = {
        from: citizenLocation.coords,
        toShelterId: shelterId,
      };
      window.dispatchEvent(new CustomEvent('citizenRouteChanged'));
    }
  };

  const handleSOS = () => {
    if (!citizenLocation) return;
    setSosStatus('sending');
    setTimeout(() => {
      setSosStatus('sent');
    }, 1500);
  };

  return (
    <div className="text-xs overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      {/* Step 1: Detect / Assign Location */}
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-white">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <MapPin className="h-3 w-3 text-blue-500" />
          Your Location
        </label>

        {!citizenLocation ? (
          <button
            onClick={handleFindLocation}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Detect My Location
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white border border-blue-200 rounded-lg px-3 py-2">
              <div>
                <div className="font-bold text-slate-800 text-[11px]">📍 {citizenLocation.label}</div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {citizenLocation.coords.lat.toFixed(4)}°N, {citizenLocation.coords.lng.toFixed(4)}°E
                </div>
              </div>
              <button
                onClick={handleFindLocation}
                className="text-[9px] text-blue-500 hover:text-blue-700 font-bold underline"
              >
                Refresh
              </button>
            </div>

            {/* SOS Button */}
            <button
              onClick={handleSOS}
              disabled={sosStatus !== 'idle'}
              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                sosStatus === 'sent'
                  ? 'bg-emerald-600 text-white'
                  : sosStatus === 'sending'
                  ? 'bg-red-400 text-white animate-pulse'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {sosStatus === 'sent' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Alert Sent! Rescue Team Notified
                </>
              ) : sosStatus === 'sending' ? (
                <>
                  <Send className="h-4 w-4 animate-bounce" />
                  Sending Location to Rescue Team...
                </>
              ) : (
                <>
                  <Siren className="h-4 w-4" />
                  🚨 Alert Rescue Team
                </>
              )}
            </button>
            {sosStatus === 'sent' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[10px] text-emerald-700">
                <div className="font-bold mb-0.5">✅ Your coordinates have been transmitted:</div>
                <div className="font-mono text-[9px]">
                  LAT: {citizenLocation.coords.lat.toFixed(6)} | LNG: {citizenLocation.coords.lng.toFixed(6)}
                </div>
                <div className="text-emerald-600 mt-0.5">Nearest rescue unit has been dispatched to your location.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Ranked Shelters */}
      {citizenLocation && (
        <div>
          <div className="px-3 pt-2.5 pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-500" />
                Nearby Shelters
              </span>
              <span className="text-[10px] text-slate-400">{rankedShelters.length} found</span>
            </div>
          </div>

          {rankedShelters.map(({ shelter, distanceKm, estimatedWalkMins }, idx) => {
            const isExpanded = expandedShelterId === shelter.id;
            const isSelected = selectedShelterId === shelter.id;
            const loadPct = Math.round((shelter.current_occupancy / shelter.total_capacity) * 100);

            return (
              <div
                key={shelter.id}
                className={`mx-2 mb-1.5 rounded-lg border transition-all ${isSelected ? 'border-blue-400 bg-blue-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                {/* Shelter Header */}
                <div className="p-2.5 cursor-pointer" onClick={() => setExpandedShelterId(isExpanded ? null : shelter.id)}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] font-bold text-white bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center shrink-0">{idx + 1}</span>
                      <span className="font-bold text-slate-800 text-[11px] truncate">{shelter.name}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-1.5">
                    <span className="flex items-center gap-0.5"><Navigation className="h-2.5 w-2.5" />{distanceKm.toFixed(1)} km</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{estimatedWalkMins} min walk</span>
                    <span className={`font-bold ${shelter.status === 'FULL' ? 'text-red-600' : shelter.status === 'NEAR_CAPACITY' ? 'text-amber-600' : 'text-emerald-600'}`}>{shelter.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${loadPct >= 95 ? 'bg-red-500' : loadPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(loadPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{loadPct}% full</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t px-2.5 pb-2.5 pt-2 space-y-2">
                    {/* Bed info */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-slate-50 rounded px-2 py-1.5 text-center">
                        <div className="text-[10px] text-slate-500">Total</div>
                        <div className="font-bold text-slate-800 text-sm">{shelter.total_capacity.toLocaleString()}</div>
                      </div>
                      <div className="bg-red-50 rounded px-2 py-1.5 text-center">
                        <div className="text-[10px] text-red-500">Occupied</div>
                        <div className="font-bold text-red-700 text-sm">{shelter.current_occupancy.toLocaleString()}</div>
                      </div>
                      <div className="bg-emerald-50 rounded px-2 py-1.5 text-center">
                        <div className="text-[10px] text-emerald-500">Vacant</div>
                        <div className="font-bold text-emerald-700 text-sm">{shelter.available_capacity.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="flex flex-wrap gap-1">
                      {shelter.facilities.map(f => (
                        <span key={f} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>

                    {/* Navigate button */}
                    <button
                      onClick={() => handleSelectShelter(shelter.id)}
                      disabled={shelter.status === 'FULL'}
                      className={`w-full py-2.5 rounded-lg text-[12px] font-bold transition-colors ${
                        shelter.status === 'FULL'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {shelter.status === 'FULL' ? 'SHELTER FULL' : isSelected ? '✓ NAVIGATING — See Routes Below' : 'NAVIGATE TO THIS SHELTER'}
                    </button>
                  </div>
                )}

                {/* Route Options (shown inline when selected) */}
                {isSelected && routeOptions.length > 0 && (
                  <div className="border-t px-2.5 pb-2.5 pt-2 bg-blue-50/30">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      Available Routes
                    </div>
                    <div className="space-y-1.5">
                      {routeOptions.map(route => {
                        // Determine if this is the blocked/shortest or the safe/longer
                        const isBlocked = route.risk === 'EXTREME' || route.risk === 'HIGH';
                        return (
                          <div
                            key={route.id}
                            className={`rounded-lg border p-2.5 ${
                              isBlocked
                                ? 'border-red-300 bg-red-50'
                                : route.isSafest
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[11px] text-slate-800">{route.name}</span>
                                {route.isSafest && (
                                  <span className="text-[8px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <CheckCircle2 className="h-2.5 w-2.5" />RECOMMENDED
                                  </span>
                                )}
                                {isBlocked && (
                                  <span className="text-[8px] font-bold bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <AlertTriangle className="h-2.5 w-2.5" />UNSAFE
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${riskBadgeColors[route.risk]}`}>{route.risk}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                              <span>{route.distanceKm} km</span>
                              <span>{route.estimatedMins} min walk</span>
                            </div>
                            <div className={`text-[9px] mt-1 ${isBlocked ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                              {isBlocked ? `⚠ ${route.riskReason}` : route.riskReason}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!citizenLocation && (
        <div className="p-8 text-center text-slate-400">
          <MapPin className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <div className="text-sm font-semibold text-slate-500">Find Safe Shelter</div>
          <div className="text-[11px] mt-1">Tap the button above to detect your location and find the nearest safe shelter with real-time availability.</div>
        </div>
      )}
    </div>
  );
}
