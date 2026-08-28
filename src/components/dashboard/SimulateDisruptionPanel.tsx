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
    <div className="flex flex-col h-full max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0 border-b border-slate-700/50 bg-slate-800/40">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          Scenario Simulator
        </h2>
        <p className="text-slate-400 text-[10px] mt-1">Preview what-if disruptions before applying.</p>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        
        {/* Input Phase */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <RouteOff className="h-3.5 w-3.5 text-slate-400" />
            Simulate Road Closure
          </label>
          <Select 
            value={selectedRoadToBlock} 
            onValueChange={(val: any) => setSelectedRoadToBlock(val || "")}
            disabled={!!draftPlanState}
          >
            <SelectTrigger className="bg-slate-800/60 border-slate-700/60 text-white shadow-inner">
              <SelectValue placeholder="Select route to block" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              {mockRoads.filter(r => !scenarioState.blocked_roads.includes(r.id)).map(road => (
                <SelectItem key={road.id} value={road.id} className="hover:bg-slate-700 focus:bg-slate-700">
                  {road.name} <span className="text-slate-500 text-[10px] ml-1">(R-{road.id.split('-')[1]})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide shadow-lg transition-all disabled:opacity-50 disabled:bg-slate-700" 
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
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Impact Preview</h3>
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-inner">
              <CardContent className="p-4 space-y-4">
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-amber-500/20 text-center flex flex-col justify-center">
                    <div className="text-amber-400 font-black text-xl">{draftPlanDelta.people_affected.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Affected</div>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-amber-500/20 text-center flex flex-col justify-center">
                    <div className="text-amber-400 font-black text-xl">{draftPlanDelta.assignments_changed}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reassigned</div>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-amber-500/20 text-center flex flex-col justify-center">
                    <div className="text-amber-400 font-black text-xl">{draftPlanDelta.avg_travel_time_change > 0 ? '+' : ''}{draftPlanDelta.avg_travel_time_change}m</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Travel Time</div>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-red-500/30 text-center flex flex-col justify-center">
                    <div className="text-red-400 font-black text-xl">{draftPlanDelta.unassigned_change > 0 ? '+' : ''}{draftPlanDelta.unassigned_change}</div>
                    <div className="text-[9px] font-bold text-red-500/80 uppercase tracking-widest mt-1">Unassigned</div>
                  </div>
                </div>

                {draftPlanDelta.detailed_changes.length > 0 && (
                  <div className="bg-slate-900/80 rounded-lg border border-slate-700/50 p-3 text-[11px] space-y-2 max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
                    <div className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[9px]">Assignment Shifts</div>
                    {draftPlanDelta.detailed_changes.map((change, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300 bg-slate-800/50 p-1.5 rounded">
                        <span className="font-bold w-16 truncate">{mockPopulationZones.find(z => z.id === change.zone_id)?.name.split(' ')[1] || change.zone_id}</span>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="bg-slate-700 text-slate-300 px-1 rounded text-[10px]">{change.before_shelter_id?.split('-')[1] || 'None'}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className={`px-1 rounded text-[10px] ${change.after_shelter_id ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                            {change.after_shelter_id?.split('-')[1] || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <Button variant="outline" className="flex-1 bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white transition-colors" onClick={handleDiscard}>
                    <X className="h-4 w-4 mr-2" /> Discard
                  </Button>
                  <Button className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg transition-colors" onClick={handleApply}>
                    <AlertTriangle className="h-4 w-4 mr-2" /> Apply
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Blocked Roads Status */}
        {scenarioState.blocked_roads.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              Active Closures
            </div>
            <div className="space-y-1.5">
              {scenarioState.blocked_roads.map(roadId => {
                const road = mockRoads.find(r => r.id === roadId);
                return (
                  <div key={roadId} className="flex items-center gap-2 text-[11px] text-red-300 bg-red-500/5 px-2 py-1 rounded">
                    <RouteOff className="h-3.5 w-3.5" />
                    <span className="font-semibold">{road?.name || roadId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset */}
        <div className="border-t border-slate-700/50 pt-4 pb-2">
          <button
            onClick={handleResetDemo}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors py-2 bg-slate-800/30 hover:bg-slate-800/80 rounded-md border border-slate-700/50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            RESET DEMO SCENARIO
          </button>
        </div>
      </div>
    </div>
  );
}
