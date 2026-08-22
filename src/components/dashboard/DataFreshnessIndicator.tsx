"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockPopulationZones, mockShelters, mockRoads } from "@/lib/services/mockData";
import { generateEvacuationPlan } from "@/lib/services/evacuationEngine";

export default function DataFreshnessIndicator() {
  const { resetToBaseline } = usePlanningStore();

  const handleResetDemo = () => {
    const baselineScenario = {
      disaster_severity: 'HIGH' as const,
      blocked_roads: [],
      shelter_capacity_changes: {},
      hazard_expansion: 0
    };
    const baselinePlan = generateEvacuationPlan(baselineScenario, mockPopulationZones, mockShelters, mockRoads);
    resetToBaseline(baselineScenario, baselinePlan);
  };

  return (
    <div className="flex items-center gap-6 text-xs text-slate-500 bg-slate-50 px-4 py-1 border-b">
      <div className="font-semibold text-slate-700 mr-2">DATA STATUS</div>
      
      <div className="flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        <span>Population <span className="text-slate-400 font-light ml-1">Updated</span></span>
      </div>

      <div className="flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        <span>Shelters <span className="text-slate-400 font-light ml-1">Updated 2m ago</span></span>
      </div>

      <div className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 text-amber-500" />
        <span>Roads <span className="text-amber-600 font-medium ml-1">Simulated Demo Data</span></span>
      </div>

      <div className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 text-amber-500" />
        <span>Disaster <span className="text-amber-600 font-medium ml-1">Prototype</span></span>
      </div>

      <div className="ml-auto">
        <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={handleResetDemo}>
          <RefreshCw className="h-3 w-3 mr-1" /> Reset Demo Scenario
        </Button>
      </div>
    </div>
  );
}
