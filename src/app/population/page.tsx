"use client";

import { useState } from "react";
import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";
import { Search, ChevronDown, ChevronUp, Users, AlertTriangle, Shield } from "lucide-react";

const priorityColors: Record<string, string> = {
  P1: "bg-red-100 text-red-700 border-red-200",
  P2: "bg-orange-100 text-orange-700 border-orange-200",
  P3: "bg-amber-100 text-amber-700 border-amber-200",
  P4: "bg-blue-100 text-blue-700 border-blue-200",
};

const riskColors: Record<string, string> = {
  EXTREME: "bg-red-600 text-white",
  HIGH: "bg-red-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-emerald-600 text-white",
};

export default function PopulationPage() {
  const { planState } = usePlanningStore();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Derive zone data from assignments
  const zoneData = mockPopulationZones.map((zone) => {
    const zoneAssignments = planState.assignments.filter((a) => a.zone_id === zone.id);
    const totalAssigned = zoneAssignments.reduce((sum, a) => sum + a.assigned_population, 0);
    const unassigned = Math.max(0, zone.estimated_demand - totalAssigned);
    const primaryAssignment = zoneAssignments.find((a) => a.status === "ASSIGNED" || a.status === "PARTIALLY_ASSIGNED");
    const unassignedAssignment = zoneAssignments.find((a) => a.status === "UNASSIGNED");
    const assignedShelter = primaryAssignment?.shelter_id
      ? mockShelters.find((s) => s.id === primaryAssignment.shelter_id)
      : null;
    const altShelter = primaryAssignment?.alternative_shelter_id
      ? mockShelters.find((s) => s.id === primaryAssignment.alternative_shelter_id)
      : null;

    return {
      ...zone,
      totalAssigned,
      unassigned,
      primaryAssignment,
      unassignedAssignment,
      assignedShelter,
      altShelter,
      allAssignments: zoneAssignments,
    };
  });

  // Filter and sort
  let filtered = zoneData.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase())
  );
  if (priorityFilter !== "ALL") {
    filtered = filtered.filter((z) => z.priority_level === priorityFilter);
  }
  // Sort: P1 first, then P2, etc.
  filtered.sort((a, b) => {
    const pOrder: Record<string, number> = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return (pOrder[a.priority_level] ?? 4) - (pOrder[b.priority_level] ?? 4);
  });

  const totalPop = mockPopulationZones.reduce((s, z) => s + z.population, 0);
  const totalDemand = mockPopulationZones.reduce((s, z) => s + z.estimated_demand, 0);
  const totalAssigned = planState.total_assigned;
  const totalUnassigned = planState.unassigned_population;

  return (
    <div className="w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4 shrink-0">
        <h1 className="text-lg font-bold text-slate-800">Population & Demand Analysis</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {mockPopulationZones.length} zones · {totalPop.toLocaleString()} total population · {totalDemand.toLocaleString()} evacuation demand · {planState.coverage_percentage}% coverage
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-6 shrink-0 text-xs">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-slate-500">Assigned:</span>
          <span className="font-bold text-slate-800">{totalAssigned.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-slate-500">Unassigned:</span>
          <span className="font-bold text-red-600">{totalUnassigned.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-slate-500">P1 Critical Zones:</span>
          <span className="font-bold text-amber-600">{mockPopulationZones.filter((z) => z.priority_level === "P1").length}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-3 shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {["ALL", "P1", "P2", "P3", "P4"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                priorityFilter === p
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p === "ALL" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="p-3 border-b">Zone</th>
              <th className="p-3 border-b text-right">Population</th>
              <th className="p-3 border-b text-center">Priority</th>
              <th className="p-3 border-b text-center">Risk</th>
              <th className="p-3 border-b">Assigned Shelter</th>
              <th className="p-3 border-b text-right">Assigned</th>
              <th className="p-3 border-b text-right">Unassigned</th>
              <th className="p-3 border-b text-right">Travel Time</th>
              <th className="p-3 border-b text-center">Route</th>
              <th className="p-3 border-b text-center w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((zone) => {
              const isExpanded = expandedId === zone.id;
              const hasUnassigned = zone.unassigned > 0;
              return (
                <tbody key={zone.id}>
                  <tr
                    className={`border-b cursor-pointer transition-colors hover:bg-blue-50/50 ${
                      hasUnassigned ? "bg-red-50/30" : isExpanded ? "bg-blue-50/30" : "bg-white"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : zone.id)}
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{zone.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Demand: {zone.estimated_demand.toLocaleString()}</div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">{zone.population.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityColors[zone.priority_level] || ""}`}>
                        {zone.priority_level}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${riskColors[zone.risk_level] || "bg-slate-200"}`}>
                        {zone.risk_level}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {zone.assignedShelter?.name || <span className="text-red-500 font-semibold">UNASSIGNED</span>}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">{zone.totalAssigned > 0 ? zone.totalAssigned.toLocaleString() : "-"}</td>
                    <td className="p-3 text-right font-mono font-bold text-red-600">{zone.unassigned > 0 ? zone.unassigned.toLocaleString() : "-"}</td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {zone.primaryAssignment ? `${zone.primaryAssignment.estimated_travel_time_mins} min` : "-"}
                    </td>
                    <td className="p-3 text-center">
                      {zone.primaryAssignment ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          zone.primaryAssignment.route_status === "CLEAR" ? "bg-emerald-100 text-emerald-700" :
                          zone.primaryAssignment.route_status === "CONGESTED" ? "bg-amber-100 text-amber-700" :
                          zone.primaryAssignment.route_status === "BLOCKED" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {zone.primaryAssignment.route_status}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-center">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </td>
                  </tr>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <tr className="bg-slate-50 border-b">
                      <td colSpan={10} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Zone Info */}
                          <div>
                            <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Zone Details</div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between"><span className="text-slate-500">Total Population</span><span className="font-mono font-bold">{zone.population.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Vulnerable Population</span><span className="font-mono">{zone.vulnerable_population.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Evacuation Demand</span><span className="font-mono font-bold text-amber-600">{zone.estimated_demand.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Priority Level</span><span className="font-bold">{zone.priority_level}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Risk Level</span><span className="font-bold">{zone.risk_level}</span></div>
                            </div>
                          </div>

                          {/* Assignment Explanation */}
                          <div>
                            <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Assignment Decision</div>
                            {zone.primaryAssignment?.score ? (
                              <div className="space-y-2">
                                {zone.primaryAssignment.score.breakdown.map((reason, idx) => (
                                  <div key={idx} className={`text-xs ${reason.startsWith("✓") ? "text-emerald-700" : "text-amber-700"}`}>
                                    {reason}
                                  </div>
                                ))}
                                <div className="border-t pt-2 mt-2 space-y-1">
                                  <div className="flex justify-between"><span className="text-slate-500">Travel Efficiency</span><span className="font-mono">{zone.primaryAssignment.score.travelEfficiency}/100</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500">Shelter Capacity</span><span className="font-mono">{zone.primaryAssignment.score.shelterCapacity}/100</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500">Accessibility</span><span className="font-mono">{zone.primaryAssignment.score.accessibility}/100</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500">Risk Safety</span><span className="font-mono">{zone.primaryAssignment.score.riskSafety}/100</span></div>
                                  <div className="flex justify-between font-bold"><span className="text-slate-700">Overall Score</span><span className="font-mono text-blue-600">{zone.primaryAssignment.score.total}/100</span></div>
                                </div>
                              </div>
                            ) : zone.unassignedAssignment ? (
                              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
                                <div className="font-bold mb-1">Infeasible Assignment</div>
                                <div>{zone.unassignedAssignment.shortfall_reason}</div>
                              </div>
                            ) : (
                              <div className="text-slate-400">No assignment data available.</div>
                            )}
                          </div>

                          {/* Alternative */}
                          <div>
                            <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Alternative Shelter</div>
                            {zone.altShelter ? (
                              <div className="bg-white border rounded p-2 space-y-1">
                                <div className="font-medium text-slate-700">{zone.altShelter.name}</div>
                                <div className="flex justify-between"><span className="text-slate-500">Travel Time</span><span className="font-mono">{zone.primaryAssignment?.alternative_travel_time} min</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-mono">{zone.altShelter.total_capacity}</span></div>
                                <div className="text-slate-400 mt-1 text-[10px]">Primary shelter selected due to superior composite score.</div>
                              </div>
                            ) : (
                              <div className="text-slate-400">No alternative evaluated.</div>
                            )}

                            {zone.unassigned > 0 && (
                              <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                                <div className="font-bold text-red-700 text-[11px]">SHORTFALL</div>
                                <div className="text-red-600 mt-0.5">{zone.unassigned.toLocaleString()} people remain without feasible shelter assignment.</div>
                              </div>
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
  );
}
