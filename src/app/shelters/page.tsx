"use client";

import { useState } from "react";
import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";
import { Search, ChevronDown, ChevronUp, MapPin, Users, Droplets, Zap, Heart, Wifi } from "lucide-react";

import MapWrapper from "@/components/map/MapWrapper";

const facilityIcons: Record<string, any> = {
  Medical: Heart,
  Food: Droplets,
  Water: Droplets,
  "Power Backup": Zap,
  Helipad: MapPin,
};

function getStatusLabel(load: number, accessStatus: string) {
  if (accessStatus === "INACCESSIBLE") return { label: "INACCESSIBLE", color: "bg-slate-600 text-white" };
  if (load >= 100) return { label: "FULL", color: "bg-red-600 text-white" };
  if (load >= 95) return { label: "CRITICAL", color: "bg-red-500 text-white" };
  if (load >= 80) return { label: "NEAR CAPACITY", color: "bg-orange-500 text-white" };
  if (load >= 60) return { label: "MODERATE LOAD", color: "bg-amber-500 text-white" };
  return { label: "AVAILABLE", color: "bg-emerald-600 text-white" };
}

function getLoadBarColor(load: number) {
  if (load >= 95) return "bg-red-500";
  if (load >= 80) return "bg-orange-500";
  if (load >= 60) return "bg-amber-400";
  return "bg-emerald-500";
}

export default function SheltersPage() {
  const { planState } = usePlanningStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"name" | "load">("load");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Derive shelter data from assignments and projected loads
  const shelterData = mockShelters.map((s) => {
    const load = planState.projected_loads[s.id] || 0;
    const assignedZones = planState.assignments
      .filter((a) => a.shelter_id === s.id)
      .map((a) => ({
        zone: mockPopulationZones.find((z) => z.id === a.zone_id),
        population: a.assigned_population,
        travelTime: a.estimated_travel_time_mins,
      }));
    const incomingPopulation = assignedZones.reduce((sum, z) => sum + z.population, 0);
    const projectedOccupancy = s.current_occupancy + incomingPopulation;
    const projectedLoad = s.total_capacity > 0 ? Math.round((projectedOccupancy / s.total_capacity) * 100) : 0;
    const status = getStatusLabel(projectedLoad, s.accessibility_status);

    return {
      ...s,
      incomingPopulation,
      projectedOccupancy,
      projectedLoad,
      statusInfo: status,
      assignedZones,
    };
  });

  // Filter and sort
  let filtered = shelterData.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  if (statusFilter !== "ALL") {
    filtered = filtered.filter((s) => s.statusInfo.label === statusFilter);
  }
  if (sortBy === "load") {
    filtered.sort((a, b) => b.projectedLoad - a.projectedLoad);
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const statusOptions = ["ALL", "AVAILABLE", "MODERATE LOAD", "NEAR CAPACITY", "CRITICAL", "FULL"];

  return (
    <div className="w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4 shrink-0 shadow-sm z-20 relative">
        <h1 className="text-lg font-bold text-slate-800">Shelter Operations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {mockShelters.length} shelters · Total capacity {mockShelters.reduce((s, sh) => s + sh.total_capacity, 0).toLocaleString()} · Projected loads derived from current evacuation assignments
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Controls & Table */}
        <div className="w-[60%] flex flex-col border-r border-slate-200 bg-white overflow-hidden shadow-xl z-10 relative">
          
          {/* Controls */}
          <div className="bg-slate-50/80 backdrop-blur border-b px-6 py-3 flex items-center gap-3 shrink-0 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search shelters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === "ALL" ? "All Statuses" : opt}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
            >
              <option value="load">Sort: Projected Load ↓</option>
              <option value="name">Sort: Name A-Z</option>
            </select>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100/95 backdrop-blur shadow-sm text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3 border-b">Shelter</th>
                  <th className="px-4 py-3 border-b text-right">Total Capacity</th>
                  <th className="px-4 py-3 border-b text-right">Current</th>
                  <th className="px-4 py-3 border-b text-right">Incoming</th>
                  <th className="px-4 py-3 border-b text-right">Projected</th>
                  <th className="px-4 py-3 border-b w-[140px]">Projected Load</th>
                  <th className="px-4 py-3 border-b">Status</th>
                  <th className="px-4 py-3 border-b text-center w-8"></th>
                </tr>
              </thead>
          <tbody>
            {filtered.map((shelter) => {
              const isExpanded = expandedId === shelter.id;
              return (
                <tbody key={shelter.id}>
                  <tr
                    className={`border-b cursor-pointer transition-colors hover:bg-blue-50/50 ${isExpanded ? "bg-blue-50/30" : "bg-white"}`}
                    onClick={() => setExpandedId(isExpanded ? null : shelter.id)}
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{shelter.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {shelter.location.lat.toFixed(4)}, {shelter.location.lng.toFixed(4)}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">{shelter.total_capacity.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{shelter.current_occupancy.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-blue-600 font-semibold">+{shelter.incomingPopulation.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">{shelter.projectedOccupancy.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getLoadBarColor(shelter.projectedLoad)}`}
                            style={{ width: `${Math.min(shelter.projectedLoad, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 w-10 text-right">{shelter.projectedLoad}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${shelter.statusInfo.color}`}>
                        {shelter.statusInfo.label}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </td>
                  </tr>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <tr className="bg-slate-50 border-b">
                      <td colSpan={8} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Facilities */}
                          <div>
                            <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Facilities</div>
                            <div className="flex flex-wrap gap-1.5">
                              {shelter.facilities.map((f) => (
                                <span key={f} className="bg-white border px-2 py-1 rounded text-slate-600">{f}</span>
                              ))}
                            </div>
                            <div className="mt-3">
                              <div className="font-semibold text-slate-700 uppercase tracking-wider mb-1">Accessibility</div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                shelter.accessibility_status === "ACCESSIBLE" ? "bg-emerald-100 text-emerald-700" :
                                shelter.accessibility_status === "PARTIALLY_ACCESSIBLE" ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {shelter.accessibility_status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Capacity Breakdown */}
                          <div>
                            <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Capacity Breakdown</div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between"><span className="text-slate-500">Total Capacity</span><span className="font-mono font-bold">{shelter.total_capacity}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Pre-existing Occupancy</span><span className="font-mono">{shelter.current_occupancy}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Incoming (Assigned)</span><span className="font-mono text-blue-600">+{shelter.incomingPopulation}</span></div>
                              <div className="border-t pt-1.5 flex justify-between"><span className="text-slate-700 font-semibold">Projected Occupancy</span><span className="font-mono font-bold">{shelter.projectedOccupancy}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Remaining Available</span><span className="font-mono font-bold text-emerald-600">{Math.max(0, shelter.total_capacity - shelter.projectedOccupancy)}</span></div>
                            </div>
                          </div>

                          {/* Assigned Zones */}
                          <div>
                            <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Assigned Population Zones</div>
                            {shelter.assignedZones.length > 0 ? (
                              <div className="space-y-1.5">
                                {shelter.assignedZones.map((az) => (
                                  <div key={az.zone?.id} className="flex items-center justify-between bg-white border rounded px-2 py-1.5">
                                    <div>
                                      <span className="font-medium text-slate-700">{az.zone?.name || "Unknown"}</span>
                                      <span className="text-slate-400 ml-1">({az.zone?.priority_level})</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-bold text-slate-700">{az.population.toLocaleString()}</span>
                                      <span className="text-slate-400 ml-1">{az.travelTime}m</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-slate-400">No zones currently assigned.</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="w-[40%] bg-slate-100 relative z-0 h-full">
          <MapWrapper 
            forcedLayers={{
              shelters: true,
              population: false,
              routes: false,
              blockedRoads: false,
              riskZones: false
            }}
          />
        </div>
      </div>
    </div>
  );
}
