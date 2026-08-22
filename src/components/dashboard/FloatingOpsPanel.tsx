"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Activity, ChevronDown, ChevronUp, Droplets } from "lucide-react";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";
import SimulateDisruptionPanel from "./SimulateDisruptionPanel";

export default function FloatingOpsPanel() {
  const { opsExpanded, setOpsExpanded, scenarioState } = usePlanningStore();

  return (
    <div className="absolute top-[76px] left-3 z-30 w-[300px] flex flex-col" style={{ maxHeight: 'calc(100vh - 130px)' }}>
      <div
        className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-t-lg border border-slate-700/50 select-none"
        onClick={() => setOpsExpanded(!opsExpanded)}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Operations</span>
        </div>
        {opsExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </div>

      {opsExpanded && (
        <div className="bg-white/95 backdrop-blur-sm border border-t-0 border-slate-200 rounded-b-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Active Scenario */}
          <div className="px-3 py-2.5 border-b bg-slate-50/80">
            <div className="flex items-center gap-2 mb-1.5">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold text-slate-800">Raipur Urban Flood</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-600">
              <span>Severity</span><span className="font-bold text-red-600">{scenarioState.disaster_severity}</span>
              <span>Planning Horizon</span><span className="font-bold text-slate-800">6 hours</span>
              <span>Zones Affected</span><span className="font-bold text-slate-800">{mockPopulationZones.length}</span>
              <span>Shelters Active</span><span className="font-bold text-slate-800">{mockShelters.filter(s => s.status !== 'OFFLINE').length}</span>
            </div>
          </div>

          {/* Simulate Disruption */}
          <div className="flex-1 overflow-y-auto">
            <SimulateDisruptionPanel />
          </div>
        </div>
      )}
    </div>
  );
}
