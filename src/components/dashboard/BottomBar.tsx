"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { AlertTriangle, Users, Home, Shield } from "lucide-react";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";

export default function BottomBar() {
  const { planState } = usePlanningStore();
  const totalPop = mockPopulationZones.reduce((s, z) => s + z.population, 0);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-1.5 text-[10px]">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="h-3 w-3" />
            <span>Population</span>
            <span className="text-white font-bold font-mono">{totalPop.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Home className="h-3 w-3" />
            <span>Shelters</span>
            <span className="text-white font-bold font-mono">{mockShelters.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="h-3 w-3" />
            <span>Coverage</span>
            <span className={`font-bold font-mono ${planState.coverage_percentage >= 80 ? 'text-emerald-400' : planState.coverage_percentage >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{planState.coverage_percentage}%</span>
          </div>
          {planState.unassigned_population > 0 && (
            <div className="flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-bold font-mono">{planState.unassigned_population.toLocaleString()} Unassigned</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          {['MAP', 'ROUTE ENGINE', 'SHELTER DATA', 'POPULATION'].map(svc => (
            <div key={svc} className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{svc}</span>
            </div>
          ))}
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">SIMULATION MODE</span>
        </div>
      </div>
    </div>
  );
}
