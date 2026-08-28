"use client";

import { useState } from "react";
import { usePlanningStore } from "@/lib/state/planningStore";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RouteOff, AlertTriangle, ArrowRight, Play, X, Activity, RefreshCw } from "lucide-react";
import { generateEvacuationPlan, generatePlanDelta } from "@/lib/services/evacuationEngine";
import { mockPopulationZones, mockShelters, mockRoads } from "@/lib/services/mockData";

export default function SimulateDisruptionPanel() {
  const { 
    scenarioState, 
    planState,
    draftPlanState,
    draftPlanDelta,
    setDraftScenario,
    setDraftPlan,
    applyDraftPlan,
    discardDraftPlan,
    addTimelineEvent,
    resetToBaseline
  } = usePlanningStore();

  const [selectedRoadToBlock, setSelectedRoadToBlock] = useState<string>("");

  const handleSimulate = () => {
    if (!selectedRoadToBlock) return;
    
    // Create Draft Scenario
    const draftScenario = {
      ...scenarioState,
      blocked_roads: Array.from(new Set([...scenarioState.blocked_roads, selectedRoadToBlock]))
    };

    // Calculate Draft Plan
    const draftPlan = generateEvacuationPlan(draftScenario, mockPopulationZones, mockShelters, mockRoads);
    
    // Calculate Delta
    const delta = generatePlanDelta(planState, draftPlan);

    setDraftScenario(draftScenario);
    setDraftPlan(draftPlan, delta);
  };

  const handleApply = () => {
    applyDraftPlan();
    
    addTimelineEvent({
      type: 'ROAD_BLOCKED',
      message: `Disruption Applied: Road ${selectedRoadToBlock} blocked`,
      details: draftPlanDelta ? `${draftPlanDelta.people_affected.toLocaleString()} people affected, ${draftPlanDelta.assignments_changed} assignments changed.` : undefined
    });
    addTimelineEvent({
      type: 'PLAN_RECALCULATED',
      message: 'Evacuation plan recalculated based on new constraints.',
    });

    setSelectedRoadToBlock("");
  };

  const handleDiscard = () => {
    discardDraftPlan();
    setSelectedRoadToBlock("");
  };

  const handleResetDemo = () => {
    const baselineScenario = {
      disaster_severity: 'HIGH' as const,
      blocked_roads: [] as string[],
      shelter_capacity_changes: {},
      hazard_expansion: 0
    };
    const baselinePlan = generateEvacuationPlan(baselineScenario, mockPopulationZones, mockShelters, mockRoads);
    resetToBaseline(baselineScenario, baselinePlan);
    setSelectedRoadToBlock("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          Scenario Simulator
        </h2>
        <p className="text-slate-400 text-[10px] mt-0.5">Preview what-if disruptions before applying.</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        
        {/* Input Phase */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <RouteOff className="h-4 w-4 text-slate-500" />
            Simulate Road Closure
          </label>
          <Select 
            value={selectedRoadToBlock} 
            onValueChange={(val: any) => setSelectedRoadToBlock(val || "")}
            disabled={!!draftPlanState}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select route to block" />
            </SelectTrigger>
            <SelectContent>
              {mockRoads.filter(r => !scenarioState.blocked_roads.includes(r.id)).map(road => (
                <SelectItem key={road.id} value={road.id}>{road.name} (R-{road.id.split('-')[1]})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            className="w-full bg-slate-800 hover:bg-slate-700" 
            disabled={!selectedRoadToBlock || !!draftPlanState}
            onClick={handleSimulate}
          >
            <Play className="h-4 w-4 mr-2" />
            Simulate Impact
          </Button>
        </div>

        {/* Preview Phase */}
        {draftPlanState && draftPlanDelta && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Impact Preview</h3>
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-4 space-y-4">
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-2 rounded border border-amber-100 text-center">
                    <div className="text-amber-600 font-bold text-lg">{draftPlanDelta.people_affected.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">People Affected</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-100 text-center">
                    <div className="text-amber-600 font-bold text-lg">{draftPlanDelta.assignments_changed}</div>
                    <div className="text-xs text-slate-500">Zones Reassigned</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-100 text-center">
                    <div className="text-amber-600 font-bold text-lg">{draftPlanDelta.avg_travel_time_change > 0 ? '+' : ''}{draftPlanDelta.avg_travel_time_change}m</div>
                    <div className="text-xs text-slate-500">Avg Travel Time</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-100 text-center">
                    <div className="text-red-600 font-bold text-lg">{draftPlanDelta.unassigned_change > 0 ? '+' : ''}{draftPlanDelta.unassigned_change}</div>
                    <div className="text-xs text-slate-500">New Unassigned</div>
                  </div>
                </div>

                {draftPlanDelta.detailed_changes.length > 0 && (
                  <div className="bg-white rounded border border-amber-100 p-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                    <div className="font-semibold text-slate-700 mb-1">Assignment Shifts:</div>
                    {draftPlanDelta.detailed_changes.map((change, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600">
                        <span className="font-medium w-16">{mockPopulationZones.find(z => z.id === change.zone_id)?.name.split(' ')[1] || change.zone_id}</span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <span>{change.before_shelter_id?.split('-')[1] || 'None'}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className={change.after_shelter_id ? 'text-blue-600 font-medium' : 'text-red-600 font-medium'}>
                            {change.after_shelter_id?.split('-')[1] || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-amber-200">
                  <Button variant="outline" className="flex-1 bg-white text-slate-600 border-slate-300" onClick={handleDiscard}>
                    <X className="h-4 w-4 mr-1" /> Discard
                  </Button>
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleApply}>
                    <AlertTriangle className="h-4 w-4 mr-1" /> Apply
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Blocked Roads Status */}
        {scenarioState.blocked_roads.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Blocked Roads</div>
            {scenarioState.blocked_roads.map(roadId => {
              const road = mockRoads.find(r => r.id === roadId);
              return (
                <div key={roadId} className="flex items-center gap-1.5 text-xs text-red-700">
                  <RouteOff className="h-3 w-3" />
                  <span className="font-medium">{road?.name || roadId}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reset */}
        <div className="border-t pt-3">
          <button
            onClick={handleResetDemo}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors py-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Demo Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
