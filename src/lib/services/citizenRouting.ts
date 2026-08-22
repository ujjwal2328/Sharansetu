import { Shelter, Coordinates, RoadCondition, PopulationZone } from '@/types';
import { mockRoads, mockPopulationZones } from './mockData';

// Haversine distance in km
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface RankedShelter {
  shelter: Shelter;
  distanceKm: number;
  estimatedWalkMins: number;
}

// Sort shelters by distance from origin
export function rankSheltersByDistance(origin: Coordinates, shelters: Shelter[]): RankedShelter[] {
  return shelters
    .map(shelter => {
      const distanceKm = haversineDistance(origin, shelter.location);
      const estimatedWalkMins = Math.round((distanceKm / 4.5) * 60); // ~4.5 km/h walk
      return { shelter, distanceKm, estimatedWalkMins };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export type RouteRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  estimatedMins: number;
  risk: RouteRisk;
  riskReason: string;
  isSafest: boolean;
  isFastest: boolean;
  waypoints: Coordinates[];
}

// Risk zones mapped to zones with high disaster intensity
function getPathRisk(waypoints: Coordinates[], zones: PopulationZone[]): { risk: RouteRisk; reason: string } {
  let worstRisk: RouteRisk = 'LOW';
  let reason = 'Route passes through safe areas.';

  for (const wp of waypoints) {
    for (const zone of zones) {
      const d = haversineDistance(wp, zone.location);
      if (d < 1.5) { // within 1.5km of a zone
        if (zone.risk_level === 'EXTREME' && (worstRisk === 'LOW' || worstRisk === 'MODERATE' || worstRisk === 'HIGH')) {
          worstRisk = 'EXTREME';
          reason = `Route passes near ${zone.name} (EXTREME flood risk).`;
        } else if (zone.risk_level === 'HIGH' && (worstRisk === 'LOW' || worstRisk === 'MODERATE')) {
          worstRisk = 'HIGH';
          reason = `Route passes near ${zone.name} (HIGH flood risk).`;
        } else if (zone.risk_level === 'MEDIUM' && worstRisk === 'LOW') {
          worstRisk = 'MODERATE';
          reason = `Route passes near ${zone.name} (moderate flood risk).`;
        }
      }
    }
  }
  return { risk: worstRisk, reason };
}

// Generate route options between origin and shelter
export function generateRouteOptions(origin: Coordinates, shelter: Shelter): RouteOption[] {
  const directDist = haversineDistance(origin, shelter.location);
  const zones = mockPopulationZones;

  // Route A: Direct (shortest)
  const directWaypoints: Coordinates[] = [origin, shelter.location];
  const directRisk = getPathRisk(directWaypoints, zones);

  // Route B: Detour north (longer but potentially safer)
  const detourNorth: Coordinates = {
    lat: Math.max(origin.lat, shelter.location.lat) + 0.012,
    lng: (origin.lng + shelter.location.lng) / 2
  };
  const northWaypoints: Coordinates[] = [origin, detourNorth, shelter.location];
  const northDist = haversineDistance(origin, detourNorth) + haversineDistance(detourNorth, shelter.location);
  const northRisk = getPathRisk(northWaypoints, zones);

  // Route C: Detour south (different risk profile)
  const detourSouth: Coordinates = {
    lat: Math.min(origin.lat, shelter.location.lat) - 0.008,
    lng: (origin.lng + shelter.location.lng) / 2
  };
  const southWaypoints: Coordinates[] = [origin, detourSouth, shelter.location];
  const southDist = haversineDistance(origin, detourSouth) + haversineDistance(detourSouth, shelter.location);
  const southRisk = getPathRisk(southWaypoints, zones);

  const routes: RouteOption[] = [
    {
      id: 'route-direct',
      name: 'Direct Route',
      distanceKm: Math.round(directDist * 100) / 100,
      estimatedMins: Math.round((directDist / 4.5) * 60),
      risk: directRisk.risk,
      riskReason: directRisk.reason,
      isSafest: false,
      isFastest: false,
      waypoints: directWaypoints,
    },
    {
      id: 'route-north',
      name: 'Northern Bypass',
      distanceKm: Math.round(northDist * 100) / 100,
      estimatedMins: Math.round((northDist / 4.5) * 60),
      risk: northRisk.risk,
      riskReason: northRisk.reason,
      isSafest: false,
      isFastest: false,
      waypoints: northWaypoints,
    },
    {
      id: 'route-south',
      name: 'Southern Bypass',
      distanceKm: Math.round(southDist * 100) / 100,
      estimatedMins: Math.round((southDist / 4.5) * 60),
      risk: southRisk.risk,
      riskReason: southRisk.reason,
      isSafest: false,
      isFastest: false,
      waypoints: southWaypoints,
    },
  ];

  // Mark fastest
  const riskOrder: Record<RouteRisk, number> = { LOW: 0, MODERATE: 1, HIGH: 2, EXTREME: 3 };
  const fastest = routes.reduce((a, b) => a.estimatedMins <= b.estimatedMins ? a : b);
  fastest.isFastest = true;

  // Mark safest (lowest risk, then shortest among ties)
  const safest = routes.reduce((a, b) => {
    if (riskOrder[a.risk] < riskOrder[b.risk]) return a;
    if (riskOrder[a.risk] > riskOrder[b.risk]) return b;
    return a.distanceKm <= b.distanceKm ? a : b;
  });
  safest.isSafest = true;

  return routes;
}
