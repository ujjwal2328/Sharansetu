export type RiskLevel = 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type ShelterStatus = 'AVAILABLE' | 'NEAR_CAPACITY' | 'FULL' | 'OFFLINE';
export type RoadStatus = 'CLEAR' | 'CONGESTED' | 'BLOCKED' | 'RESTRICTED' | 'HIGH_RISK';
export type DisasterSeverity = 'LOW' | 'MODERATE' | 'SEVERE' | 'CRITICAL';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PopulationZone {
  id: string;
  name: string;
  location: Coordinates;
  population: number;
  vulnerable_population: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  estimated_demand: number;
  priority_level: PriorityLevel;
}

export interface FloodZone {
  id: string;
  name: string;
  severity: RiskLevel;
  waterLevel: string;
  polygon: [number, number][];
}

export interface MedicalFacilities {
  oxygen_tanks: number;
  first_aid_kits: number;
  nurses: number;
  doctors: number;
}

export interface Shelter {
  id: string;
  name: string;
  location: Coordinates;
  total_capacity: number;
  current_occupancy: number;
  available_capacity: number;
  facilities: string[];
  medical: MedicalFacilities;
  status: ShelterStatus;
  accessibility_status: 'ACCESSIBLE' | 'PARTIALLY_ACCESSIBLE' | 'INACCESSIBLE';
}

export interface RoadCondition {
  id: string;
  name: string;
  source_zone_id: string;
  target_shelter_id: string;
  status: RoadStatus;
  normal_travel_time_mins: number;
  current_travel_time_mins: number;
}

export interface EvacuationAssignment {
  zone_id: string;
  shelter_id: string | null; // null if UNASSIGNED
  assigned_population: number;
  estimated_travel_time_mins: number;
  route_status: RoadStatus;
  assignment_reason: string;
  
  // NEW: Intelligence and Explainability
  status: 'ASSIGNED' | 'PARTIALLY_ASSIGNED' | 'UNASSIGNED';
  shortfall_reason?: string;
  score?: AssignmentScore;
  alternative_shelter_id?: string;
  alternative_travel_time?: number;
}

export interface AssignmentScore {
  total: number;
  travelEfficiency: number; // 25%
  shelterCapacity: number;  // 25%
  accessibility: number;    // 25%
  riskSafety: number;       // 15%
  priorityMatch: number;    // 10%
  breakdown: string[];
}

export interface RouteBottleneck {
  route_id: string;
  dependency_percentage: number; // e.g., 47
  alternative_available: boolean;
  affected_population: number;
  status: 'CRITICAL_BOTTLENECK' | 'HIGH_IMPORTANCE' | 'MONITOR';
}

export interface PlanIntelligence {
  bottlenecks: RouteBottleneck[];
  critical_shelters: string[]; // IDs
  priority_zones_at_risk: string[]; // IDs
  capacity_buffer_shelter?: string; // ID
}

export interface PlanDelta {
  assignments_changed: number;
  people_affected: number;
  avg_travel_time_change: number;
  shelters_crossed_threshold: number;
  routes_invalidated: number;
  unassigned_change: number;
  detailed_changes: {
    zone_id: string;
    before_shelter_id: string | null;
    after_shelter_id: string | null;
  }[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO
  type: 'ROAD_BLOCKED' | 'ROAD_CLEARED' | 'SHELTER_CAPACITY_CHANGED' | 'SCENARIO_APPLIED' | 'PLAN_RECALCULATED' | 'SHELTER_THRESHOLD_CROSSED' | 'CAPACITY_SHORTFALL_DETECTED';
  message: string;
  details?: string;
}

export interface ScenarioState {
  disaster_severity: RiskLevel;
  blocked_roads: string[];
  shelter_capacity_changes: Record<string, number>;
  hazard_expansion: number;
}

export interface PlanState {
  assignments: EvacuationAssignment[];
  unassigned_population: number;
  coverage_percentage: number;
  total_assigned: number;
  intelligence: PlanIntelligence;
  projected_loads: Record<string, number>; // shelter_id -> Projected Load %
}

export interface ScenarioEvent {
  id: string;
  type: 'ROAD_BLOCKED' | 'FLOOD_WARNING' | 'SHELTER_FULL' | 'CUSTOM';
  description: string;
  target_id: string; // ID of the road, shelter, or zone affected
  timestamp: string;
}

export interface Scenario {
  id: string;
  name: string;
  disaster_type: string;
  severity: DisasterSeverity;
  planning_horizon_hours: number;
  events: ScenarioEvent[];
}

export interface EvacuationPlan {
  id: string;
  scenario_id: string;
  assignments: EvacuationAssignment[];
  timestamp: string;
}
