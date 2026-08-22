import { Coordinates } from '@/types';

// OSRM public demo API — free, no API key needed
// Returns actual road-following geometry between two or more points
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export interface OSRMRoute {
  waypoints: [number, number][]; // [lat, lng] pairs for Leaflet
  distanceKm: number;
  durationMins: number;
}

/**
 * Fetch a road-following route between two coordinates using OSRM.
 * Returns Leaflet-compatible [lat, lng] array.
 */
export async function fetchRoute(from: Coordinates, to: Coordinates): Promise<OSRMRoute | null> {
  try {
    // OSRM uses lng,lat order (not lat,lng)
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    // GeoJSON coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
    const waypoints: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return {
      waypoints,
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMins: Math.round(route.duration / 60),
    };
  } catch (err) {
    console.warn('OSRM route fetch failed:', err);
    return null;
  }
}

/**
 * Fetch multiple routes (via intermediate waypoints to force different paths).
 * Used to generate alternative routes.
 */
export async function fetchRouteVia(from: Coordinates, via: Coordinates, to: Coordinates): Promise<OSRMRoute | null> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${via.lng},${via.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const waypoints: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return {
      waypoints,
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMins: Math.round(route.duration / 60),
    };
  } catch (err) {
    console.warn('OSRM route via fetch failed:', err);
    return null;
  }
}

/**
 * Fetch alternative routes using OSRM's alternatives parameter.
 */
export async function fetchAlternativeRoutes(from: Coordinates, to: Coordinates): Promise<OSRMRoute[]> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=3`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes) return [];

    return data.routes.map((route: any) => ({
      waypoints: route.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      ),
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMins: Math.round(route.duration / 60),
    }));
  } catch (err) {
    console.warn('OSRM alternatives fetch failed:', err);
    return [];
  }
}
