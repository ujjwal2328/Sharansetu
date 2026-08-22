import { create } from 'zustand';
import { EvacuationAssignment, PlanState, ScenarioState, TimelineEvent, PlanDelta, PlanIntelligence } from '@/types';

export type BasemapType = 'standard' | 'humanitarian' | 'dark';

interface MapLayersState {
  population: boolean;
  shelters: boolean;
  routes: boolean;
  blockedRoads: boolean;
  riskZones: boolean;
}

interface PlanningStoreState {
  scenarioState: ScenarioState;
  planState: PlanState;
  draftScenarioState: ScenarioState | null;
  draftPlanState: PlanState | null;
  draftPlanDelta: PlanDelta | null;
  previousPlanState: PlanState | null;
  timelineEvents: TimelineEvent[];

  // Map UI State
  mapLayers: MapLayersState;
  basemap: BasemapType;
  
  // Panel UI State
  opsExpanded: boolean;
  intelExpanded: boolean;
  timelineExpanded: boolean;
  layerManagerOpen: boolean;
  legendOpen: boolean;
  
  // Actions
  setScenarioState: (scenario: ScenarioState) => void;
  setPlanState: (plan: PlanState) => void;
  setDraftScenario: (scenario: ScenarioState | null) => void;
  setDraftPlan: (plan: PlanState | null, delta: PlanDelta | null) => void;
  applyDraftPlan: () => void;
  discardDraftPlan: () => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  resetToBaseline: (baselineScenario: ScenarioState, baselinePlan: PlanState) => void;
  toggleLayer: (layer: keyof MapLayersState) => void;
  setBasemap: (basemap: BasemapType) => void;
  setOpsExpanded: (v: boolean) => void;
  setIntelExpanded: (v: boolean) => void;
  setTimelineExpanded: (v: boolean) => void;
  setLayerManagerOpen: (v: boolean) => void;
  setLegendOpen: (v: boolean) => void;
}

const initialScenarioState: ScenarioState = {
  disaster_severity: 'HIGH',
  blocked_roads: [],
  shelter_capacity_changes: {},
  hazard_expansion: 0
};

const initialPlanState: PlanState = {
  assignments: [],
  unassigned_population: 0,
  coverage_percentage: 0,
  total_assigned: 0,
  intelligence: {
    bottlenecks: [],
    critical_shelters: [],
    priority_zones_at_risk: []
  },
  projected_loads: {}
};

export const usePlanningStore = create<PlanningStoreState>((set) => ({
  scenarioState: initialScenarioState,
  planState: initialPlanState,
  draftScenarioState: null,
  draftPlanState: null,
  draftPlanDelta: null,
  previousPlanState: null,
  timelineEvents: [],

  mapLayers: { population: true, shelters: true, routes: true, blockedRoads: true, riskZones: true },
  basemap: 'standard',
  opsExpanded: true,
  intelExpanded: true,
  timelineExpanded: false,
  layerManagerOpen: false,
  legendOpen: true,

  setScenarioState: (scenario) => set({ scenarioState: scenario }),
  setPlanState: (plan) => set({ planState: plan }),
  setDraftScenario: (scenario) => set({ draftScenarioState: scenario }),
  setDraftPlan: (plan, delta) => set({ draftPlanState: plan, draftPlanDelta: delta }),

  applyDraftPlan: () => set((state) => {
    if (!state.draftScenarioState || !state.draftPlanState) return state;
    return {
      previousPlanState: state.planState,
      scenarioState: state.draftScenarioState,
      planState: state.draftPlanState,
      draftScenarioState: null,
      draftPlanState: null,
    };
  }),

  discardDraftPlan: () => set({
    draftScenarioState: null,
    draftPlanState: null,
    draftPlanDelta: null
  }),

  addTimelineEvent: (event) => set((state) => ({
    timelineEvents: [
      { ...event, id: Math.random().toString(36).substring(7), timestamp: new Date().toISOString() },
      ...state.timelineEvents
    ]
  })),

  resetToBaseline: (baselineScenario, baselinePlan) => set({
    scenarioState: baselineScenario,
    planState: baselinePlan,
    draftScenarioState: null,
    draftPlanState: null,
    draftPlanDelta: null,
    previousPlanState: null,
    timelineEvents: [{
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      type: 'SCENARIO_APPLIED',
      message: 'System reset to baseline scenario.'
    }]
  }),

  toggleLayer: (layer) => set((state) => ({
    mapLayers: { ...state.mapLayers, [layer]: !state.mapLayers[layer] }
  })),
  setBasemap: (basemap) => set({ basemap }),
  setOpsExpanded: (v) => set({ opsExpanded: v }),
  setIntelExpanded: (v) => set({ intelExpanded: v }),
  setTimelineExpanded: (v) => set({ timelineExpanded: v }),
  setLayerManagerOpen: (v) => set({ layerManagerOpen: v }),
  setLegendOpen: (v) => set({ legendOpen: v }),
}));
