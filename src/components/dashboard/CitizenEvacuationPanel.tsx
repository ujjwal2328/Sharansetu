"use client";

import { useState, useMemo } from "react";
import { MapPin, Bed, Heart, Shield, Navigation, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock, Stethoscope, Wind, Cross, ArrowRight } from "lucide-react";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";
import { rankSheltersByDistance, generateRouteOptions, RankedShelter, RouteOption } from "@/lib/services/citizenRouting";
import { Shelter } from "@/types";

const riskColors: Record<string, string> = {
  LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  MODERATE: 'text-amber-600 bg-amber-50 border-amber-200',
  HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
  EXTREME: 'text-red-600 bg-red-50 border-red-200',
};

const riskBadgeColors: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MODERATE: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  EXTREME: 'bg-red-100 text-red-700',
};

export default function CitizenEvacuationPanel() {
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [expandedShelterId, setExpandedShelterId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Rank shelters by distance from selected zone
  const rankedShelters = useMemo<RankedShelter[]>(() => {
    if (!selectedZoneId) return [];
    const zone = mockPopulationZones.find(z => z.id === selectedZoneId);
    if (!zone) return [];
    return rankSheltersByDistance(zone.location, mockShelters);
  }, [selectedZoneId]);

  // Generate routes to selected shelter
  const routeOptions = useMemo<RouteOption[]>(() => {
    if (!selectedZoneId || !selectedShelterId) return [];
    const zone = mockPopulationZones.find(z => z.id === selectedZoneId);
    const shelter = mockShelters.find(s => s.id === selectedShelterId);
    if (!zone || !shelter) return [];
    return generateRouteOptions(zone.location, shelter);
  }, [selectedZoneId, selectedShelterId]);

  const handleSelectShelter = (shelterId: string) => {
    setSelectedShelterId(shelterId);
    setSelectedRouteId(null);
    // Pan map to shelter
    const shelter = mockShelters.find(s => s.id === shelterId);
    if (shelter) {
      (window as any).__mapFlyTo?.(shelter.location.lat, shelter.location.lng, 15);
    }
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  return (
    <div className="text-xs">
      {/* Step 1: Select Your Location */}
      <div className="p-3 border-b bg-white">
        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <MapPin className="h-3 w-3 text-blue-500" />
          Your Location
        </label>
        <select
          value={selectedZoneId}
          onChange={(e) => {
            setSelectedZoneId(e.target.value);
            setSelectedShelterId(null);
            setSelectedRouteId(null);
            const zone = mockPopulationZones.find(z => z.id === e.target.value);
            if (zone) (window as any).__mapFlyTo?.(zone.location.lat, zone.location.lng, 14);
          }}
          className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          <option value="">Select your zone...</option>
          {mockPopulationZones.map(zone => (
            <option key={zone.id} value={zone.id}>{zone.name} — Risk: {zone.risk_level}</option>
          ))}
        </select>
      </div>

      {/* Step 2: Ranked Shelters */}
      {selectedZoneId && (
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
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
            const vacantBeds = shelter.available_capacity;
            const occupiedBeds = shelter.current_occupancy;
            const loadPct = Math.round((occupiedBeds / shelter.total_capacity) * 100);

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

                  {/* Quick stats row */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-1.5">
                    <span className="flex items-center gap-0.5"><Navigation className="h-2.5 w-2.5" />{distanceKm.toFixed(1)} km</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{estimatedWalkMins} min walk</span>
                    <span className={`font-bold ${shelter.status === 'FULL' ? 'text-red-600' : shelter.status === 'NEAR_CAPACITY' ? 'text-amber-600' : 'text-emerald-600'}`}>{shelter.status}</span>
                  </div>

                  {/* Bed capacity bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${loadPct >= 95 ? 'bg-red-500' : loadPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(loadPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{loadPct}%</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t px-2.5 pb-2.5 pt-2 space-y-2.5">
                    {/* Bed Details */}
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Bed className="h-3 w-3" />Bed Capacity</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="bg-slate-50 rounded px-2 py-1.5 text-center">
                          <div className="text-[10px] text-slate-500">Total</div>
                          <div className="font-bold text-slate-800 text-sm">{shelter.total_capacity.toLocaleString()}</div>
                        </div>
                        <div className="bg-red-50 rounded px-2 py-1.5 text-center">
                          <div className="text-[10px] text-red-500">Occupied</div>
                          <div className="font-bold text-red-700 text-sm">{occupiedBeds.toLocaleString()}</div>
                        </div>
                        <div className="bg-emerald-50 rounded px-2 py-1.5 text-center">
                          <div className="text-[10px] text-emerald-500">Vacant</div>
                          <div className="font-bold text-emerald-700 text-sm">{vacantBeds.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Medical Facilities */}
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Stethoscope className="h-3 w-3" />Medical Facilities</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5 bg-blue-50 rounded px-2 py-1.5">
                          <Wind className="h-3 w-3 text-blue-500" />
                          <div>
                            <div className="text-[9px] text-blue-500">O₂ Tanks</div>
                            <div className="font-bold text-blue-800">{shelter.medical.oxygen_tanks}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 rounded px-2 py-1.5">
                          <Heart className="h-3 w-3 text-green-500" />
                          <div>
                            <div className="text-[9px] text-green-500">First Aid</div>
                            <div className="font-bold text-green-800">{shelter.medical.first_aid_kits}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-purple-50 rounded px-2 py-1.5">
                          <Cross className="h-3 w-3 text-purple-500" />
                          <div>
                            <div className="text-[9px] text-purple-500">Nurses</div>
                            <div className="font-bold text-purple-800">{shelter.medical.nurses}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-indigo-50 rounded px-2 py-1.5">
                          <Stethoscope className="h-3 w-3 text-indigo-500" />
                          <div>
                            <div className="text-[9px] text-indigo-500">Doctors</div>
                            <div className="font-bold text-indigo-800">{shelter.medical.doctors}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* General Facilities */}
                    <div className="flex flex-wrap gap-1">
                      {shelter.facilities.map(f => (
                        <span key={f} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>

                    {/* Choose Shelter Button */}
                    <button
                      onClick={() => handleSelectShelter(shelter.id)}
                      disabled={shelter.status === 'FULL'}
                      className={`w-full py-2 rounded-md text-[11px] font-bold transition-colors ${
                        shelter.status === 'FULL'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {shelter.status === 'FULL' ? 'SHELTER FULL' : isSelected ? '✓ SELECTED — See Routes Below' : 'SELECT THIS SHELTER'}
                    </button>
                  </div>
                )}

                {/* Route Options (shown inline when selected) */}
                {isSelected && routeOptions.length > 0 && (
                  <div className="border-t px-2.5 pb-2.5 pt-2 bg-blue-50/30">
                    <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      Evacuation Routes
                    </div>
                    <div className="space-y-1.5">
                      {routeOptions.map(route => (
                        <button
                          key={route.id}
                          onClick={() => handleSelectRoute(route.id)}
                          className={`w-full text-left rounded-lg border p-2 transition-all ${
                            selectedRouteId === route.id
                              ? 'border-blue-400 bg-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[11px] text-slate-800">{route.name}</span>
                              {route.isSafest && (
                                <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5" />SAFEST
                                </span>
                              )}
                              {route.isFastest && !route.isSafest && (
                                <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">FASTEST</span>
                              )}
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${riskBadgeColors[route.risk]}`}>{route.risk}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span>{route.distanceKm} km</span>
                            <span>{route.estimatedMins} min walk</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{route.riskReason}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!selectedZoneId && (
        <div className="p-6 text-center text-slate-400">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <div className="text-[11px] font-medium">Select your zone above</div>
          <div className="text-[10px]">to find nearby shelters</div>
        </div>
      )}
    </div>
  );
}
