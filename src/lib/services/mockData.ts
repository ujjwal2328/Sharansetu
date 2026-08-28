import { PopulationZone, Shelter, RoadCondition, Scenario, FloodZone } from '@/types';

export const mockPopulationZones: PopulationZone[] = [
  { id: 'zone-1', name: 'Telibandha', location: { lat: 21.2384, lng: 81.6617 }, population: 2400, vulnerable_population: 420, risk_level: 'HIGH', estimated_demand: 1800, priority_level: 'P1' },
  { id: 'zone-2', name: 'Shankar Nagar', location: { lat: 21.2482, lng: 81.6521 }, population: 1700, vulnerable_population: 210, risk_level: 'MEDIUM', estimated_demand: 900, priority_level: 'P2' },
  { id: 'zone-3', name: 'Pandri', location: { lat: 21.2590, lng: 81.6465 }, population: 3100, vulnerable_population: 600, risk_level: 'EXTREME', estimated_demand: 2800, priority_level: 'P1' },
  { id: 'zone-4', name: 'Civil Lines', location: { lat: 21.2425, lng: 81.6435 }, population: 1200, vulnerable_population: 150, risk_level: 'LOW', estimated_demand: 200, priority_level: 'P4' },
  { id: 'zone-5', name: 'Tatibandh', location: { lat: 21.2588, lng: 81.5794 }, population: 4500, vulnerable_population: 800, risk_level: 'HIGH', estimated_demand: 3200, priority_level: 'P1' },
  { id: 'zone-6', name: 'Bhatagaon', location: { lat: 21.2062, lng: 81.6214 }, population: 2100, vulnerable_population: 350, risk_level: 'MEDIUM', estimated_demand: 1100, priority_level: 'P2' },
  { id: 'zone-7', name: 'Aamanaka', location: { lat: 21.2491, lng: 81.6045 }, population: 1900, vulnerable_population: 250, risk_level: 'LOW', estimated_demand: 400, priority_level: 'P3' },
  { id: 'zone-8', name: 'Fafadih', location: { lat: 21.2612, lng: 81.6360 }, population: 2800, vulnerable_population: 400, risk_level: 'HIGH', estimated_demand: 1500, priority_level: 'P2' },
  { id: 'zone-9', name: 'Gudhiyari', location: { lat: 21.2625, lng: 81.6115 }, population: 3500, vulnerable_population: 750, risk_level: 'MEDIUM', estimated_demand: 1600, priority_level: 'P2' },
  { id: 'zone-10', name: 'Mowa', location: { lat: 21.2721, lng: 81.6654 }, population: 1500, vulnerable_population: 200, risk_level: 'LOW', estimated_demand: 300, priority_level: 'P4' },
];

export const mockFloodZones: FloodZone[] = [
  {
    id: 'flood-1',
    name: 'Pandri Urban Flood',
    severity: 'EXTREME',
    waterLevel: '4.4m (Rising)',
    polygon: [
      [21.2610, 81.6440],
      [21.2625, 81.6490],
      [21.2580, 81.6500],
      [21.2550, 81.6480],
      [21.2560, 81.6450],
      [21.2590, 81.6430]
    ]
  },
  {
    id: 'flood-2',
    name: 'Telibandha Lake Overflow',
    severity: 'HIGH',
    waterLevel: '3.1m (Stable)',
    polygon: [
      [21.2410, 81.6630],
      [21.2380, 81.6660],
      [21.2350, 81.6640],
      [21.2360, 81.6600],
      [21.2390, 81.6590]
    ]
  },
  {
    id: 'flood-3',
    name: 'Station Road Waterlogging',
    severity: 'MODERATE',
    waterLevel: '1.2m (Receding)',
    polygon: [
      [21.2550, 81.6370],
      [21.2560, 81.6340],
      [21.2520, 81.6330],
      [21.2510, 81.6360]
    ]
  }
];

export const mockShelters: Shelter[] = [
  // Moved NW — away from Budhatalab, near Shankar Nagar residential area
  { id: 'shelter-1', name: 'Science College Camp', location: { lat: 21.2510, lng: 81.5985 }, total_capacity: 2000, current_occupancy: 450, available_capacity: 1550, facilities: ['Medical', 'Food', 'Water', 'Power Backup'], medical: { oxygen_tanks: 12, first_aid_kits: 40, nurses: 4, doctors: 2 }, status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  // Moved slightly south — away from pond near NIT campus
  { id: 'shelter-2', name: 'NIT Raipur Stadium', location: { lat: 21.2465, lng: 81.6072 }, total_capacity: 3500, current_occupancy: 600, available_capacity: 2900, facilities: ['Food', 'Water', 'Helipad'], medical: { oxygen_tanks: 25, first_aid_kits: 80, nurses: 8, doctors: 3 }, status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  // Moved south — away from Budhatalab lake
  { id: 'shelter-3', name: 'Indoor Stadium, Budhapara', location: { lat: 21.2290, lng: 81.6350 }, total_capacity: 1500, current_occupancy: 1350, available_capacity: 150, facilities: ['Medical', 'Food'], medical: { oxygen_tanks: 6, first_aid_kits: 20, nurses: 2, doctors: 1 }, status: 'NEAR_CAPACITY', accessibility_status: 'PARTIALLY_ACCESSIBLE' },
  // Moved NE — dry elevated ground in Pandri
  { id: 'shelter-4', name: 'Govt School, Pandri', location: { lat: 21.2635, lng: 81.6410 }, total_capacity: 800, current_occupancy: 200, available_capacity: 600, facilities: ['Water', 'Food'], medical: { oxygen_tanks: 3, first_aid_kits: 15, nurses: 1, doctors: 0 }, status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  // Moved west — away from Telibandha Talab
  { id: 'shelter-5', name: 'Exhibition Center', location: { lat: 21.2420, lng: 81.6580 }, total_capacity: 2500, current_occupancy: 1200, available_capacity: 1300, facilities: ['Medical', 'Food', 'Water', 'Power Backup'], medical: { oxygen_tanks: 18, first_aid_kits: 60, nurses: 6, doctors: 2 }, status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  // Moved NE — away from low-lying Bhatagaon nala
  { id: 'shelter-6', name: 'Community Hall, Bhatagaon', location: { lat: 21.2100, lng: 81.6250 }, total_capacity: 1200, current_occupancy: 1050, available_capacity: 150, facilities: ['Water'], medical: { oxygen_tanks: 2, first_aid_kits: 10, nurses: 1, doctors: 0 }, status: 'NEAR_CAPACITY', accessibility_status: 'ACCESSIBLE' }
];

// Demo user location (Civil Lines area — elevated dry ground)
export const DEMO_USER_LOCATION = { lat: 21.2445, lng: 81.6440, label: 'Your Location (Civil Lines)' };

// Realistic route waypoints for roads (approximating actual road geometry)
export type RouteWaypoints = [number, number][];
export const roadWaypoints: Record<string, RouteWaypoints> = {
  // GE Road (West): Tatibandh → Science College via GE Road curve
  'road-1': [[21.2588, 81.5794], [21.2570, 81.5850], [21.2545, 81.5900], [21.2520, 81.5940], [21.2510, 81.5985]],
  // Ring Road No 1: Telibandha → Exhibition Center
  'road-2': [[21.2384, 81.6617], [21.2390, 81.6600], [21.2400, 81.6590], [21.2420, 81.6580]],
  // VIP Road: Shankar Nagar → Exhibition Center
  'road-3': [[21.2482, 81.6521], [21.2470, 81.6540], [21.2450, 81.6560], [21.2435, 81.6575], [21.2420, 81.6580]],
  // Station Road: Fafadih → Indoor Stadium (BLOCKED)
  'road-4': [[21.2612, 81.6360], [21.2580, 81.6355], [21.2530, 81.6350], [21.2460, 81.6345], [21.2380, 81.6348], [21.2290, 81.6350]],
  // Pandri Main: Pandri → Govt School
  'road-5': [[21.2590, 81.6465], [21.2600, 81.6450], [21.2615, 81.6435], [21.2625, 81.6420], [21.2635, 81.6410]],
  // GE Road (East): Fafadih → NIT Stadium
  'road-6': [[21.2612, 81.6360], [21.2590, 81.6300], [21.2560, 81.6240], [21.2530, 81.6170], [21.2500, 81.6110], [21.2465, 81.6072]],
  // Ring Road No 2: Pandri → NIT Stadium
  'road-7': [[21.2590, 81.6465], [21.2575, 81.6400], [21.2555, 81.6330], [21.2530, 81.6260], [21.2505, 81.6180], [21.2480, 81.6110], [21.2465, 81.6072]],
  // Bhatagaon Link: Bhatagaon → Community Hall
  'road-8': [[21.2062, 81.6214], [21.2070, 81.6220], [21.2080, 81.6230], [21.2090, 81.6240], [21.2100, 81.6250]],
  // Bhatagaon to Center: Bhatagaon → Indoor Stadium (CONGESTED)
  'road-9': [[21.2062, 81.6214], [21.2100, 81.6230], [21.2140, 81.6260], [21.2180, 81.6290], [21.2220, 81.6320], [21.2260, 81.6340], [21.2290, 81.6350]],
};

// Demo route pair: shortest (unsafe) vs safest alternative between two reference shelters
// Reference: Govt School Pandri (shelter-4) ↔ NIT Raipur Stadium (shelter-2)
export const demoRoutes = {
  unsafe: {
    label: 'Shortest Route (UNSAFE — Waterlogged)',
    reason: 'Passes through Pandri flood zone (EXTREME risk)',
    waypoints: [[21.2635, 81.6410], [21.2610, 81.6380], [21.2590, 81.6350], [21.2560, 81.6300], [21.2540, 81.6250], [21.2520, 81.6190], [21.2500, 81.6130], [21.2465, 81.6072]] as RouteWaypoints,
  },
  safe: {
    label: 'Safest Route (via Ring Road — Clear)',
    reason: 'Avoids flood zones; uses elevated Ring Road bypass',
    waypoints: [[21.2635, 81.6410], [21.2660, 81.6440], [21.2690, 81.6420], [21.2710, 81.6380], [21.2700, 81.6320], [21.2680, 81.6250], [21.2650, 81.6180], [21.2610, 81.6130], [21.2560, 81.6095], [21.2510, 81.6078], [21.2465, 81.6072]] as RouteWaypoints,
  }
};

export const mockRoads: RoadCondition[] = [
  { id: 'road-1', name: 'GE Road (West)', source_zone_id: 'zone-5', target_shelter_id: 'shelter-1', status: 'CLEAR', normal_travel_time_mins: 15, current_travel_time_mins: 15 },
  { id: 'road-2', name: 'Ring Road No 1', source_zone_id: 'zone-1', target_shelter_id: 'shelter-5', status: 'CONGESTED', normal_travel_time_mins: 10, current_travel_time_mins: 25 },
  { id: 'road-3', name: 'VIP Road', source_zone_id: 'zone-2', target_shelter_id: 'shelter-5', status: 'CLEAR', normal_travel_time_mins: 12, current_travel_time_mins: 12 },
  { id: 'road-4', name: 'Station Road', source_zone_id: 'zone-8', target_shelter_id: 'shelter-3', status: 'BLOCKED', normal_travel_time_mins: 18, current_travel_time_mins: 999 },
  { id: 'road-5', name: 'Pandri Main', source_zone_id: 'zone-3', target_shelter_id: 'shelter-4', status: 'CLEAR', normal_travel_time_mins: 5, current_travel_time_mins: 5 },
  { id: 'road-6', name: 'GE Road (East)', source_zone_id: 'zone-8', target_shelter_id: 'shelter-2', status: 'CLEAR', normal_travel_time_mins: 20, current_travel_time_mins: 20 },
  { id: 'road-7', name: 'Ring Road No 2', source_zone_id: 'zone-3', target_shelter_id: 'shelter-2', status: 'CLEAR', normal_travel_time_mins: 25, current_travel_time_mins: 25 },
  { id: 'road-8', name: 'Bhatagaon Link', source_zone_id: 'zone-6', target_shelter_id: 'shelter-6', status: 'CLEAR', normal_travel_time_mins: 8, current_travel_time_mins: 8 },
  { id: 'road-9', name: 'Bhatagaon to Center', source_zone_id: 'zone-6', target_shelter_id: 'shelter-3', status: 'CONGESTED', normal_travel_time_mins: 15, current_travel_time_mins: 35 },
];

export const defaultScenario: Scenario = {
  id: 'scenario-raipur-flood',
  name: 'Raipur Urban Flood — Prototype Demonstration',
  disaster_type: 'Flood',
  severity: 'SEVERE',
  planning_horizon_hours: 6,
  events: [
    {
      id: 'event-1',
      type: 'FLOOD_WARNING',
      description: 'Heavy waterlogging in Pandri and Telibandha areas',
      target_id: 'zone-3',
      timestamp: '2026-08-22T08:00:00.000Z'
    }
  ]
};
