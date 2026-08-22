import { PopulationZone, Shelter, RoadCondition, Scenario } from '@/types';

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

export const mockShelters: Shelter[] = [
  { id: 'shelter-1', name: 'Science College Camp', location: { lat: 21.2468, lng: 81.5950 }, total_capacity: 2000, current_occupancy: 1900, available_capacity: 100, facilities: ['Medical', 'Food', 'Water', 'Power Backup'], status: 'NEAR_CAPACITY', accessibility_status: 'ACCESSIBLE' },
  { id: 'shelter-2', name: 'NIT Raipur Stadium', location: { lat: 21.2497, lng: 81.6050 }, total_capacity: 3500, current_occupancy: 600, available_capacity: 2900, facilities: ['Food', 'Water', 'Helipad'], status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  { id: 'shelter-3', name: 'Indoor Stadium, Budhapara', location: { lat: 21.2335, lng: 81.6318 }, total_capacity: 1500, current_occupancy: 1500, available_capacity: 0, facilities: ['Medical', 'Food'], status: 'FULL', accessibility_status: 'PARTIALLY_ACCESSIBLE' },
  { id: 'shelter-4', name: 'Govt School, Pandri', location: { lat: 21.2610, lng: 81.6440 }, total_capacity: 800, current_occupancy: 200, available_capacity: 600, facilities: ['Water', 'Food'], status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  { id: 'shelter-5', name: 'Exhibition Center', location: { lat: 21.2395, lng: 81.6660 }, total_capacity: 2500, current_occupancy: 1200, available_capacity: 1300, facilities: ['Medical', 'Food', 'Water', 'Power Backup'], status: 'AVAILABLE', accessibility_status: 'ACCESSIBLE' },
  { id: 'shelter-6', name: 'Community Hall, Bhatagaon', location: { lat: 21.2050, lng: 81.6200 }, total_capacity: 1200, current_occupancy: 1050, available_capacity: 150, facilities: ['Water'], status: 'NEAR_CAPACITY', accessibility_status: 'ACCESSIBLE' }
];

export const mockRoads: RoadCondition[] = [
  { id: 'road-1', name: 'GE Road (West)', source_zone_id: 'zone-5', target_shelter_id: 'shelter-1', status: 'CLEAR', normal_travel_time_mins: 15, current_travel_time_mins: 15 },
  { id: 'road-2', name: 'Ring Road No 1', source_zone_id: 'zone-1', target_shelter_id: 'shelter-5', status: 'CONGESTED', normal_travel_time_mins: 10, current_travel_time_mins: 25 },
  { id: 'road-3', name: 'VIP Road', source_zone_id: 'zone-2', target_shelter_id: 'shelter-5', status: 'CLEAR', normal_travel_time_mins: 12, current_travel_time_mins: 12 },
  { id: 'road-4', name: 'Station Road', source_zone_id: 'zone-8', target_shelter_id: 'shelter-3', status: 'BLOCKED', normal_travel_time_mins: 18, current_travel_time_mins: 999 },
  { id: 'road-5', name: 'Pandri Main', source_zone_id: 'zone-3', target_shelter_id: 'shelter-4', status: 'CLEAR', normal_travel_time_mins: 5, current_travel_time_mins: 5 },
  // Additional cross-routes for alternatives
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
