"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Info, ArrowRight, AlertTriangle } from "lucide-react";
import { mockPopulationZones } from "@/lib/services/mockData";

export default function PlanDeltaStrip() {
  const { previousPlanState, planState, timelineEvents } = usePlanningStore();
  
  if (!previousPlanState) return null;

  // Let's grab the last timeline event if it relates to a scenario apply
  const latestEvent = timelineEvents[0];
  const isRecent = latestEvent && (Date.now() - new Date(latestEvent.timestamp).getTime() < 10000); // 10 seconds

  if (!isRecent) return null; // Only show temporarily

  // Calculate delta manually here or read from a stored delta.
  // We can just compute a simple delta here for the strip.
  let assignmentsChanged = 0;
  let unassignedChange = planState.unassigned_population - previousPlanState.unassigned_population;
  
  const beforeMap = new Map(previousPlanState.assignments.map(a => [a.zone_id, a]));
  const changes = [];
  
  planState.assignments.forEach(afterA => {
    const beforeA = beforeMap.get(afterA.zone_id);
    if (!beforeA || beforeA.shelter_id !== afterA.shelter_id) {
      assignmentsChanged++;
      changes.push({ zone_id: afterA.zone_id, before: beforeA?.shelter_id, after: afterA.shelter_id });
    }
  });

  if (assignmentsChanged === 0 && unassignedChange === 0) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 p-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="w-full">
          <div className="font-bold text-blue-900 text-sm">PLAN DELTA</div>
          <div className="text-xs text-blue-800 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>{assignmentsChanged} assignments changed</span>
            {unassignedChange > 0 && <span className="text-red-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> +{unassignedChange} unassigned population</span>}
          </div>
          
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {changes.map((c, i) => (
              <div key={i} className="text-xs flex items-center text-slate-700 bg-white/60 px-2 py-1 rounded">
                <span className="font-medium w-16">{mockPopulationZones.find(z => z.id === c.zone_id)?.name.split(' ')[1] || c.zone_id}</span>
                <span className="text-slate-500 line-through">{c.before?.split('-')[1] || 'None'}</span>
                <ArrowRight className="h-3 w-3 mx-1 text-slate-400" />
                <span className="font-bold text-blue-700">{c.after?.split('-')[1] || 'UNASSIGNED'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
