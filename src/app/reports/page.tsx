"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockShelters, mockRoads } from "@/lib/services/mockData";
import { FileText, Printer, AlertTriangle, CheckCircle, Shield } from "lucide-react";

export default function ReportsPage() {
  const { scenarioState, planState } = usePlanningStore();
  const { assignments, intelligence } = planState;

  const totalPop = mockPopulationZones.reduce((s, z) => s + z.population, 0);
  const totalDemand = mockPopulationZones.reduce((s, z) => s + z.estimated_demand, 0);
  const criticalRoutes = intelligence.bottlenecks.filter((b) => b.status === "CRITICAL_BOTTLENECK");
  const blockedRoads = scenarioState.blocked_roads.length;
  const p1Zones = mockPopulationZones.filter((z) => z.priority_level === "P1");
  const timestamp = new Date().toLocaleString();

  // Shelter projection data
  const shelterProjections = mockShelters.map((s) => {
    const load = planState.projected_loads[s.id] || 0;
    const incoming = assignments.filter((a) => a.shelter_id === s.id).reduce((sum, a) => sum + a.assigned_population, 0);
    const projected = s.current_occupancy + incoming;
    return { ...s, load, incoming, projected };
  });

  // Generate recommendations
  const recommendations: string[] = [];
  if (planState.unassigned_population > 0) {
    recommendations.push(`Activate reserve shelters — ${planState.unassigned_population.toLocaleString()} people remain without feasible evacuation assignment.`);
  }
  intelligence.critical_shelters.forEach((id) => {
    const sh = mockShelters.find((s) => s.id === id);
    if (sh) recommendations.push(`Increase capacity or redirect intake at ${sh.name} — projected above 95% capacity.`);
  });
  criticalRoutes.forEach((r) => {
    const road = mockRoads.find((rd) => rd.id === r.route_id);
    if (road) recommendations.push(`Prioritize clearance of ${road.name} — ${r.dependency_percentage}% of evacuees depend on this corridor.`);
  });
  if (recommendations.length === 0) {
    recommendations.push("No immediate capacity or routing crises detected. Continue monitoring.");
  }

  const handlePrint = () => window.print();

  return (
    <div className="w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-slate-100">
      {/* Page Header — hidden in print */}
      <div className="bg-white border-b px-6 py-4 shrink-0 print:hidden flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Situation Report (SITREP)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Generated from current application state · All data is simulated for prototype demonstration</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-auto px-6 py-6 print:p-0 print:overflow-visible">
        <div className="max-w-4xl mx-auto bg-white border rounded-lg shadow-sm p-8 print:shadow-none print:border-0 print:max-w-none space-y-8">
          
          {/* Report Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">SharanSetuX</div>
              <div className="text-sm text-slate-500 mt-0.5">Disaster Shelter & Evacuation Intelligence</div>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2.5 py-1 rounded">
                <Shield className="h-3 w-3" />
                SIMULATION DATA — PROTOTYPE
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-red-600">SITREP</div>
              <div className="text-xs text-slate-500">{timestamp}</div>
              <div className="text-xs text-slate-400 mt-1">Scenario: Raipur Urban Flood</div>
            </div>
          </div>

          {/* Section 1: Situation Summary */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">1. Situation Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Disaster", value: "Flood", sub: `Severity: ${scenarioState.disaster_severity}` },
                { label: "Affected Population", value: totalPop.toLocaleString(), sub: `Demand: ${totalDemand.toLocaleString()}` },
                { label: "Evacuation Coverage", value: `${planState.coverage_percentage}%`, sub: `Assigned: ${planState.total_assigned.toLocaleString()}` },
                { label: "Unassigned Shortfall", value: planState.unassigned_population.toLocaleString(), sub: planState.unassigned_population > 0 ? "ACTION REQUIRED" : "Within limits" },
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-50 border rounded p-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{kpi.value}</div>
                  <div className={`text-[10px] mt-0.5 ${kpi.sub === "ACTION REQUIRED" ? "text-red-600 font-bold" : "text-slate-400"}`}>{kpi.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-600">
              <span>Critical Shelters: <b className="text-red-600">{intelligence.critical_shelters.length}</b></span>
              <span>Blocked Routes: <b className="text-red-600">{blockedRoads}</b></span>
              <span>Route Bottlenecks: <b className="text-amber-600">{intelligence.bottlenecks.length}</b></span>
              <span>P1 Critical Zones: <b className="text-red-600">{p1Zones.length}</b></span>
            </div>
          </div>

          {/* Section 2: Critical Issues & Recommendations */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">2. Critical Issues & Recommended Actions</h2>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className={`${i === 0 && planState.unassigned_population > 0 ? "text-red-700 font-bold" : "text-slate-700"}`}>
                  {rec}
                </li>
              ))}
            </ol>
          </div>

          {/* Section 3: Shelter Capacity */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">3. Shelter Capacity Status</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-2 border">Shelter</th>
                  <th className="p-2 border text-right">Capacity</th>
                  <th className="p-2 border text-right">Current</th>
                  <th className="p-2 border text-right">Incoming</th>
                  <th className="p-2 border text-right">Projected</th>
                  <th className="p-2 border text-right">Load</th>
                </tr>
              </thead>
              <tbody>
                {shelterProjections.map((s) => (
                  <tr key={s.id} className={`border-b ${s.load >= 95 ? "bg-red-50" : s.load >= 80 ? "bg-amber-50" : ""}`}>
                    <td className="p-2 border font-medium">{s.name}</td>
                    <td className="p-2 border text-right font-mono">{s.total_capacity.toLocaleString()}</td>
                    <td className="p-2 border text-right font-mono">{s.current_occupancy.toLocaleString()}</td>
                    <td className="p-2 border text-right font-mono text-blue-600">+{s.incoming.toLocaleString()}</td>
                    <td className="p-2 border text-right font-mono font-bold">{s.projected.toLocaleString()}</td>
                    <td className={`p-2 border text-right font-mono font-bold ${s.load >= 95 ? "text-red-600" : s.load >= 80 ? "text-amber-600" : "text-emerald-600"}`}>{s.load}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Assignment Summary */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">4. Evacuation Assignment Summary</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-2 border">Zone</th>
                  <th className="p-2 border">Priority</th>
                  <th className="p-2 border">Target Shelter</th>
                  <th className="p-2 border text-right">Population</th>
                  <th className="p-2 border text-right">Travel Time</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => {
                  const zone = mockPopulationZones.find((z) => z.id === a.zone_id);
                  const shelter = a.shelter_id ? mockShelters.find((s) => s.id === a.shelter_id) : null;
                  return (
                    <tr key={i} className={`border-b ${a.status === "UNASSIGNED" ? "bg-red-50" : ""}`}>
                      <td className="p-2 border font-medium">{zone?.name || a.zone_id}</td>
                      <td className="p-2 border">{zone?.priority_level}</td>
                      <td className="p-2 border font-medium">{shelter?.name || "UNASSIGNED"}</td>
                      <td className="p-2 border text-right font-mono font-bold">{a.assigned_population.toLocaleString()}</td>
                      <td className="p-2 border text-right font-mono">{a.estimated_travel_time_mins > 0 ? `${a.estimated_travel_time_mins} min` : "-"}</td>
                      <td className={`p-2 border font-bold text-xs ${a.status === "UNASSIGNED" ? "text-red-600" : "text-emerald-600"}`}>{a.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-xs text-slate-400 text-center">
            SharanSetuX · Disaster Shelter & Evacuation Intelligence · Simulation Report · {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
