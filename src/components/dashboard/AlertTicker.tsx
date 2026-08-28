"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { AlertTriangle, Droplets } from "lucide-react";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";

export default function AlertTicker() {
  const { scenarioState, planState } = usePlanningStore();
  const totalPop = mockPopulationZones.reduce((s, z) => s + z.population, 0);
  const { intelligence } = planState;

  return (
    <div className="absolute top-[56px] left-0 right-0 z-40 bg-red-950/90 backdrop-blur-sm border-b border-red-900/50">
      <div className="flex items-center gap-5 px-5 py-2.5 text-xs overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 text-red-400 font-bold">
          <AlertTriangle className="h-4 w-4" />
          <span>FLOOD ALERT</span>
        </div>
        <span className="text-red-300/40">|</span>
        <div className="flex items-center gap-2 text-white">
          <Droplets className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-semibold">Raipur Urban Flood</span>
        </div>
        <span className="text-red-300/40">|</span>
        <span className="text-red-300">Severity: <b className="text-red-400">{scenarioState.disaster_severity}</b></span>
        <span className="text-red-300/40">|</span>
        <span className="text-red-300">Horizon: <b className="text-white">6 HRS</b></span>
        <span className="text-red-300/40">|</span>
        <span className="text-red-300">{totalPop.toLocaleString()} <b className="text-white">affected</b></span>
        <span className="text-red-300/40">|</span>
        <span className="text-red-300">{mockShelters.length} <b className="text-white">shelters</b></span>
        <span className="text-red-300/40">|</span>
        <span className="text-red-300">{intelligence.bottlenecks.length} <b className="text-amber-400">bottlenecks</b></span>
        <span className="text-red-300/40">|</span>
        {planState.unassigned_population > 0 ? (
          <span className="text-red-400 font-bold">{planState.unassigned_population.toLocaleString()} UNASSIGNED</span>
        ) : (
          <span className="text-emerald-400 font-bold">FULL COVERAGE</span>
        )}
        <span className="text-red-300/40">|</span>
        <span className="text-red-300">Coverage: <b className={planState.coverage_percentage >= 80 ? "text-emerald-400" : "text-amber-400"}>{planState.coverage_percentage}%</b></span>
      </div>
    </div>
  );
}
