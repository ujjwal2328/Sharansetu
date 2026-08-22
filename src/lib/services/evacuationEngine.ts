import { 
  PopulationZone, 
  Shelter, 
  RoadCondition, 
  EvacuationAssignment,
  PlanState,
  ScenarioState,
  AssignmentScore,
  RouteBottleneck,
  TimelineEvent,
  PlanDelta
} from '@/types';

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const priorityWeight: Record<string, number> = { 'P1': 100, 'P2': 75, 'P3': 50, 'P4': 25 };
const riskWeight: Record<string, number> = { 'EXTREME': 100, 'HIGH': 75, 'MODERATE': 50, 'LOW': 25 };

/**
 * Normalizes a raw value where lower is better (e.g. distance/time) to a 0-100 score.
 */
function normalizeScore(value: number, maxExpected: number): number {
  return Math.max(0, Math.min(100, 100 - (value / maxExpected) * 100));
}

/**
 * Calculates a formalized Assignment Score
 */
function calculateAssignmentScore(
  zone: PopulationZone,
  shelter: Shelter,
  distanceKm: number,
  travelTimeMins: number,
  roadStatus: string
): AssignmentScore {
  const travelEfficiency = normalizeScore(travelTimeMins, 60); // 60 mins is 0 score
  const capacitySuitability = shelter.total_capacity > 0 
    ? (shelter.available_capacity / shelter.total_capacity) * 100 
    : 0;
  
  let accessibility = 100;
  if (roadStatus === 'CONGESTED') accessibility = 60;
  if (roadStatus === 'HIGH_RISK' || roadStatus === 'RESTRICTED') accessibility = 30;

  const riskSafety = riskWeight[zone.risk_level] || 50;
  const priorityMatch = priorityWeight[zone.priority_level] || 50;

  const total = 
    (travelEfficiency * 0.25) + 
    (capacitySuitability * 0.25) + 
    (accessibility * 0.25) + 
    (riskSafety * 0.15) + 
    (priorityMatch * 0.10);

  const breakdown = [
    travelEfficiency > 80 ? "✓ Excellent travel time" : "⚠ Sub-optimal travel time",
    capacitySuitability > 50 ? "✓ Adequate remaining capacity" : "⚠ Shelter nearing capacity",
    accessibility === 100 ? "✓ Route is accessible" : "⚠ Route has accessibility constraints",
    "✓ Matches priority and risk profile"
  ];

  return {
    total: Math.round(total),
    travelEfficiency: Math.round(travelEfficiency),
    shelterCapacity: Math.round(capacitySuitability),
    accessibility,
    riskSafety,
    priorityMatch,
    breakdown
  };
}

export function generateEvacuationPlan(
  scenario: ScenarioState,
  zones: PopulationZone[],
  shelters: Shelter[],
  roads: RoadCondition[]
): PlanState {
  const assignments: EvacuationAssignment[] = [];
  
  // Clone shelters to track available capacity
  const activeShelters = shelters.map(s => {
    let capacity = s.total_capacity;
    if (scenario.shelter_capacity_changes[s.id]) {
      capacity += scenario.shelter_capacity_changes[s.id];
    }
    return { 
      ...s, 
      total_capacity: capacity,
      available_capacity: Math.max(0, capacity - s.current_occupancy)
    };
  });

  // Track dependencies for bottleneck detection
  const routeDependencies: Record<string, { count: number, noAlternative: boolean, pop: number }> = {};
  roads.forEach(r => routeDependencies[r.id] = { count: 0, noAlternative: false, pop: 0 });

  // 1. Sort zones by Priority and Risk
  const sortedZones = [...zones].sort((a, b) => {
    const pDiff = (priorityWeight[b.priority_level] || 0) - (priorityWeight[a.priority_level] || 0);
    if (pDiff !== 0) return pDiff;
    return (riskWeight[b.risk_level] || 0) - (riskWeight[a.risk_level] || 0);
  });

  let totalUnassigned = 0;
  let totalAssigned = 0;
  let totalDemand = 0;

  for (const zone of sortedZones) {
    let remainingDemand = zone.estimated_demand;
    totalDemand += remainingDemand;

    while (remainingDemand > 0) {
      // Score all shelters for this zone
      const scoredShelters = activeShelters
        .filter(s => s.available_capacity > 0 && s.status !== 'OFFLINE')
        .map(shelter => {
          const road = roads.find(r => r.source_zone_id === zone.id && r.target_shelter_id === shelter.id);
          
          if (road && (road.status === 'BLOCKED' || scenario.blocked_roads.includes(road.id))) {
            return null; // Inaccessible
          }

          const distanceKm = getHaversineDistance(zone.location.lat, zone.location.lng, shelter.location.lat, shelter.location.lng);
          const travelTimeMins = road ? road.current_travel_time_mins : (distanceKm / 30) * 60;
          
          const scoreObj = calculateAssignmentScore(zone, shelter, distanceKm, travelTimeMins, road?.status || 'CLEAR');

          return { shelter, scoreObj, travelTimeMins, road, roadStatus: road?.status || 'CLEAR' };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => b.scoreObj.total - a.scoreObj.total);

      if (scoredShelters.length === 0) {
        // INFEASIBLE EVACUATION HANDLING
        assignments.push({
          zone_id: zone.id,
          shelter_id: null,
          assigned_population: remainingDemand,
          estimated_travel_time_mins: 0,
          route_status: 'BLOCKED',
          assignment_reason: 'No accessible shelter with sufficient capacity found.',
          status: 'UNASSIGNED',
          shortfall_reason: 'Insufficient accessible shelter capacity or no accessible route.'
        });
        totalUnassigned += remainingDemand;
        remainingDemand = 0;
        break;
      }

      const primary = scoredShelters[0];
      const alternative = scoredShelters.length > 1 ? scoredShelters[1] : null;

      const assignedAmount = Math.min(remainingDemand, primary.shelter.available_capacity);

      assignments.push({
        zone_id: zone.id,
        shelter_id: primary.shelter.id,
        assigned_population: assignedAmount,
        estimated_travel_time_mins: Math.round(primary.travelTimeMins),
        route_status: primary.roadStatus as any,
        assignment_reason: 'Optimal score based on capacity, travel time, and risk profile.',
        status: remainingDemand === zone.estimated_demand && assignedAmount === remainingDemand ? 'ASSIGNED' : 'PARTIALLY_ASSIGNED',
        score: primary.scoreObj,
        alternative_shelter_id: alternative?.shelter.id,
        alternative_travel_time: alternative ? Math.round(alternative.travelTimeMins) : undefined
      });

      // Update capacities
      primary.shelter.available_capacity -= assignedAmount;
      primary.shelter.current_occupancy += assignedAmount;
      
      // Update bottlenecks
      if (primary.road) {
        routeDependencies[primary.road.id].count += 1;
        routeDependencies[primary.road.id].pop += assignedAmount;
        if (!alternative) routeDependencies[primary.road.id].noAlternative = true;
      }

      totalAssigned += assignedAmount;
      remainingDemand -= assignedAmount;
    }
  }

  // Calculate Intelligence
  const projected_loads: Record<string, number> = {};
  const critical_shelters: string[] = [];
  
  let bestBuffer = 0;
  let bufferShelter = "";

  activeShelters.forEach(s => {
    const load = Math.round((s.current_occupancy / s.total_capacity) * 100);
    projected_loads[s.id] = load;
    if (load > 95) critical_shelters.push(s.id);
    if (s.available_capacity > bestBuffer) {
      bestBuffer = s.available_capacity;
      bufferShelter = s.id;
    }
  });

  const bottlenecks: RouteBottleneck[] = [];
  Object.keys(routeDependencies).forEach(rid => {
    const dep = routeDependencies[rid];
    if (dep.count > 0) {
      const pct = (dep.pop / totalDemand) * 100;
      let status: 'CRITICAL_BOTTLENECK' | 'HIGH_IMPORTANCE' | 'MONITOR' = 'MONITOR';
      
      if (pct > 20 && dep.noAlternative) status = 'CRITICAL_BOTTLENECK';
      else if (pct > 30) status = 'HIGH_IMPORTANCE';

      if (status !== 'MONITOR') {
        bottlenecks.push({
          route_id: rid,
          dependency_percentage: Math.round(pct),
          alternative_available: !dep.noAlternative,
          affected_population: dep.pop,
          status
        });
      }
    }
  });

  // Coverage
  const coverage_percentage = totalDemand === 0 ? 100 : Math.round((totalAssigned / totalDemand) * 100);

  return {
    assignments,
    unassigned_population: totalUnassigned,
    total_assigned: totalAssigned,
    coverage_percentage,
    projected_loads,
    intelligence: {
      bottlenecks,
      critical_shelters,
      priority_zones_at_risk: sortedZones.filter(z => z.priority_level === 'P1' && assignments.find(a => a.zone_id === z.id)?.status !== 'ASSIGNED').map(z => z.id),
      capacity_buffer_shelter: bufferShelter || undefined
    }
  };
}

export function generatePlanDelta(before: PlanState | null, after: PlanState): PlanDelta {
  if (!before) {
    return {
      assignments_changed: 0,
      people_affected: 0,
      avg_travel_time_change: 0,
      shelters_crossed_threshold: 0,
      routes_invalidated: 0,
      unassigned_change: 0,
      detailed_changes: []
    };
  }

  let assignments_changed = 0;
  let people_affected = 0;
  const detailed_changes: any[] = [];
  
  const beforeMap = new Map(before.assignments.map(a => [a.zone_id, a]));
  
  after.assignments.forEach(afterAssignment => {
    const beforeAssignment = beforeMap.get(afterAssignment.zone_id);
    if (!beforeAssignment || beforeAssignment.shelter_id !== afterAssignment.shelter_id) {
      assignments_changed++;
      people_affected += afterAssignment.assigned_population;
      detailed_changes.push({
        zone_id: afterAssignment.zone_id,
        before_shelter_id: beforeAssignment ? beforeAssignment.shelter_id : null,
        after_shelter_id: afterAssignment.shelter_id
      });
    }
  });

  const unassigned_change = after.unassigned_population - before.unassigned_population;
  
  // Calculate avg travel time change
  const beforeAvg = before.assignments.length > 0 ? before.assignments.reduce((sum, a) => sum + a.estimated_travel_time_mins, 0) / before.assignments.length : 0;
  const afterAvg = after.assignments.length > 0 ? after.assignments.reduce((sum, a) => sum + a.estimated_travel_time_mins, 0) / after.assignments.length : 0;

  return {
    assignments_changed,
    people_affected,
    avg_travel_time_change: Math.round((afterAvg - beforeAvg) * 10) / 10,
    shelters_crossed_threshold: after.intelligence.critical_shelters.length - before.intelligence.critical_shelters.length,
    routes_invalidated: detailed_changes.length, // Simplified
    unassigned_change,
    detailed_changes
  };
}
