"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";
import { Search, ChevronDown, ChevronUp, MapPin, Users, Droplets, Zap, Heart, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import Header from "@/components/layout/Header";
import MapToolbar from "@/components/map/MapToolbar";
import LayerManager from "@/components/map/LayerManager";
import MapLegend from "@/components/map/MapLegend";
import MapSearch from "@/components/map/MapSearch";
import BottomBar from "@/components/dashboard/BottomBar";

const DynamicMap = dynamic(() => import("@/components/map/MapContent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full bg-slate-800" />,
});

function getStatusLabel(load: number, accessStatus: string) {
  if (accessStatus === "INACCESSIBLE") return { label: "INACCESSIBLE", color: "bg-slate-800 text-slate-400 border border-slate-600" };
  if (load >= 100) return { label: "FULL", color: "bg-red-500/20 text-red-400 border border-red-500/30" };
  if (load >= 95) return { label: "CRITICAL", color: "bg-orange-500/20 text-orange-400 border border-orange-500/30" };
  if (load >= 80) return { label: "NEAR CAP", color: "bg-amber-500/20 text-amber-400 border border-amber-500/30" };
  if (load >= 60) return { label: "MODERATE", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" };
  return { label: "AVAILABLE", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" };
}

function getLoadBarColor(load: number) {
  if (load >= 95) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  if (load >= 80) return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
  if (load >= 60) return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
  return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
}

function getLoadTextColor(load: number) {
  if (load >= 95) return "text-red-400";
  if (load >= 80) return "text-orange-400";
  if (load >= 60) return "text-amber-400";
  return "text-emerald-400";
}

export default function SheltersPage() {
  const { planState } = usePlanningStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"name" | "load">("load");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Map callbacks to keep interface identical
  const handleMapSearch = useCallback((lat: number, lng: number, zoom?: number) => {
    (window as any).__mapFlyTo?.(lat, lng, zoom);
  }, []);
  const handleZoomIn = useCallback(() => (window as any).__mapZoomIn?.(), []);
  const handleZoomOut = useCallback(() => (window as any).__mapZoomOut?.(), []);
  const handleLocate = useCallback(() => (window as any).__mapReset?.(), []);

  // Derive shelter data
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
    filtered = filtered.filter((s) => s.statusInfo.label.includes(statusFilter));
  }
  if (sortBy === "load") {
    filtered.sort((a, b) => b.projectedLoad - a.projectedLoad);
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const statusOptions = ["ALL", "AVAILABLE", "MODERATE", "NEAR CAP", "CRITICAL", "FULL"];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* FULL-VIEWPORT MAP CANVAS */}
      <div className="absolute inset-0 z-0">
        <DynamicMap 
          forcedLayers={{
            shelters: true,
            population: false,
            routes: false,
            blockedRoads: false,
            riskZones: false
          }}
        />
      </div>

      {/* TOP HEADER */}
      <Header />

      {/* FLOATING SHELTER DATA PANEL */}
      <div className="absolute top-[80px] left-4 bottom-[36px] w-[500px] z-30 flex flex-col bg-slate-900/85 backdrop-blur-xl rounded-xl border border-slate-700/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-left-8 duration-500">
        
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/40 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-400" />
              Shelter Operations
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-slate-200 font-semibold">{mockShelters.length}</span> active shelters · Capacity: <span className="text-slate-200 font-semibold">{mockShelters.reduce((s, sh) => s + sh.total_capacity, 0).toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-3 shrink-0 bg-slate-900/50">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search shelters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-700 rounded-md bg-slate-800/50 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-700 rounded-md px-2 py-1.5 bg-slate-800/50 text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt === "ALL" ? "All Statuses" : opt}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-slate-700 rounded-md px-2 py-1.5 bg-slate-800/50 text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="load">Sort: Projected Load ↓</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-sm border-collapse text-slate-300 table-fixed">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm shadow-md">
              <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700">
                <th className="px-4 py-3 w-[38%]">Shelter Facility</th>
                <th className="px-2 py-3 w-[15%] text-right">Capacity</th>
                <th className="px-2 py-3 w-[15%] text-right">Incoming</th>
                <th className="px-2 py-3 w-[15%] text-center">Status</th>
                <th className="px-2 py-3 w-[12%] text-right">Load %</th>
                <th className="px-2 py-3 w-[5%] text-center"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shelter) => {
                const isExpanded = expandedId === shelter.id;
                return (
                  <tbody key={shelter.id}>
                    <tr
                      className={`border-b border-slate-700/50 cursor-pointer transition-all duration-200 hover:bg-slate-800/50 ${isExpanded ? "bg-slate-800/70" : "bg-transparent"}`}
                      onClick={() => setExpandedId(isExpanded ? null : shelter.id)}
                    >
                      <td className="px-4 py-4 truncate">
                        <div className="font-medium text-slate-200 truncate">{shelter.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {shelter.location.lat.toFixed(4)}, {shelter.location.lng.toFixed(4)}
                        </div>
                      </td>
                      <td className="px-2 py-4 text-right font-mono text-slate-400 truncate">{shelter.total_capacity.toLocaleString()}</td>
                      <td className="px-2 py-4 text-right font-mono text-emerald-400 font-semibold truncate">+{shelter.incomingPopulation.toLocaleString()}</td>
                      <td className="px-2 py-4 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${shelter.statusInfo.color}`}>
                          {shelter.statusInfo.label}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <span className={`text-[11px] font-mono font-bold w-full inline-block ${getLoadTextColor(shelter.projectedLoad)}`}>{shelter.projectedLoad}%</span>
                      </td>
                      <td className="px-2 py-4 text-center text-slate-500">
                        {isExpanded ? <ChevronUp className="h-4 w-4 mx-auto" /> : <ChevronDown className="h-4 w-4 mx-auto" />}
                      </td>
                    </tr>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <tr className="bg-slate-900/50 border-b border-slate-700/80 shadow-inner">
                        <td colSpan={6} className="p-0">
                          <div className="px-5 py-4 grid grid-cols-2 gap-6 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* Capacity Breakdown */}
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                              <div className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5">
                                <Users className="h-3 w-3" /> Capacity Breakdown
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center"><span className="text-slate-500">Total Capacity</span><span className="font-mono text-slate-300">{shelter.total_capacity}</span></div>
                                <div className="flex justify-between items-center"><span className="text-slate-500">Current Occupancy</span><span className="font-mono text-slate-300">{shelter.current_occupancy}</span></div>
                                <div className="flex justify-between items-center"><span className="text-slate-500">Incoming Evacuees</span><span className="font-mono text-emerald-400">+{shelter.incomingPopulation}</span></div>
                                <div className="border-t border-slate-700/50 pt-2 flex justify-between items-center"><span className="text-slate-300 font-semibold">Projected Load</span><span className="font-mono font-bold text-white">{shelter.projectedOccupancy}</span></div>
                              </div>
                            </div>

                            {/* Assigned Zones */}
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                              <div className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" /> Assigned Origin Zones
                              </div>
                              {shelter.assignedZones.length > 0 ? (
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                                  {shelter.assignedZones.map((az) => (
                                    <div key={az.zone?.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1.5">
                                      <div>
                                        <span className="font-medium text-slate-300">{az.zone?.name || "Unknown"}</span>
                                        <span className="text-slate-500 ml-1 text-[10px]">({az.zone?.priority_level})</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-mono font-bold text-emerald-400">{az.population.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-500 italic text-center py-4">No zones currently assigned to this shelter.</div>
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

      {/* FLOATING MAP CONTROLS (Identical to Dashboard) */}
      <MapToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onLocate={handleLocate} />
      <MapSearch onSelect={handleMapSearch} />
      <LayerManager />
      <MapLegend />
      <BottomBar />

    </div>
  );
}
