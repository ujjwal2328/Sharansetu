"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import PlanIntelligencePanel from "./PlanIntelligencePanel";
import PlanDeltaStrip from "./PlanDeltaStrip";
import ExplainableAssignmentCard from "./ExplainableAssignmentCard";
import { mockPopulationZones, mockShelters } from "@/lib/services/mockData";

export default function FloatingIntelPanel() {
  const { intelExpanded, setIntelExpanded, planState } = usePlanningStore();
  const { assignments } = planState;

  return (
    <div className="absolute top-[76px] right-3 z-30 w-[320px] flex flex-col" style={{ maxHeight: 'calc(100vh - 130px)' }}>
      <div
        className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-t-lg border border-slate-700/50 select-none"
        onClick={() => setIntelExpanded(!intelExpanded)}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Plan Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">{planState.coverage_percentage}%</span>
          {intelExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {intelExpanded && (
        <div className="bg-white/95 backdrop-blur-sm border border-t-0 border-slate-200 rounded-b-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <PlanDeltaStrip />
          <PlanIntelligencePanel />

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignments ({assignments.length})</h3>
            {assignments.slice(0, 6).map((assignment, idx) => (
              <ExplainableAssignmentCard
                key={`${assignment.zone_id}-${assignment.shelter_id}-${idx}`}
                assignment={assignment}
                zoneName={mockPopulationZones.find(z => z.id === assignment.zone_id)?.name || assignment.zone_id}
                shelterName={assignment.shelter_id ? (mockShelters.find(s => s.id === assignment.shelter_id)?.name || assignment.shelter_id) : undefined}
                altShelterName={assignment.alternative_shelter_id ? (mockShelters.find(s => s.id === assignment.alternative_shelter_id)?.name || assignment.alternative_shelter_id) : undefined}
              />
            ))}
            {assignments.length > 6 && (
              <div className="text-[10px] text-slate-400 text-center py-1">+{assignments.length - 6} more assignments</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
