"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import ExplainableAssignmentCard from "./ExplainableAssignmentCard";
import ReportDialog from "./ReportDialog";
import PlanIntelligencePanel from "./PlanIntelligencePanel";
import PlanDeltaStrip from "./PlanDeltaStrip";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";

export default function EvacuationPanel() {
  const { planState } = usePlanningStore();
  const { assignments } = planState;

  return (
    <div className="flex flex-col h-full bg-white border-l overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b shrink-0 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Intelligence</h2>
        <div className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
          {planState.coverage_percentage}% COVERAGE
        </div>
      </div>
      
      <PlanDeltaStrip />
      <PlanIntelligencePanel />

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-100/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assignment Summary</h3>
        
        {assignments.length > 0 ? (
          assignments.map((assignment, idx) => (
            <ExplainableAssignmentCard 
              key={`${assignment.zone_id}-${assignment.shelter_id}-${idx}`}
              assignment={assignment}
              zoneName={mockPopulationZones.find(z => z.id === assignment.zone_id)?.name || assignment.zone_id}
              shelterName={assignment.shelter_id ? (mockShelters.find(s => s.id === assignment.shelter_id)?.name || assignment.shelter_id) : undefined}
              altShelterName={assignment.alternative_shelter_id ? (mockShelters.find(s => s.id === assignment.alternative_shelter_id)?.name || assignment.alternative_shelter_id) : undefined}
            />
          ))
        ) : (
          <div className="text-center p-8 text-slate-400 text-sm border-2 border-dashed rounded-lg">
            No assignments generated. <br/> Initialize a plan from the Scenario controls.
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t mt-auto shrink-0">
        <ReportDialog />
      </div>
    </div>
  );
}
