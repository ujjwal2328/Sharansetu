"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, LayerGroup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockPopulationZones, mockShelters, mockRoads, DEMO_USER_LOCATION, demoRoutes } from '@/lib/services/mockData';
import { usePlanningStore } from '@/lib/state/planningStore';
import { fetchRoute, fetchAlternativeRoutes, OSRMRoute } from '@/lib/services/osrmRouting';

const iconRetinaUrl = '/leaflet/marker-icon-2x.png';
const iconUrl = '/leaflet/marker-icon.png';
const shadowUrl = '/leaflet/marker-shadow.png';

const TILE_URLS = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  humanitarian: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Fallback to OSM for dark mode as most free dark maps require API keys
};
const TILE_ATTRIBUTIONS = {
  standard: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  humanitarian: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://www.hotosm.org/">HOT</a>',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Shelter icon — color by vacancy (green=available, red=full)
const createShelterIcon = (shelter: typeof mockShelters[0], isHighlighted: boolean = false, projectedVacancyPct?: number) => {
  const vacancyPct = projectedVacancyPct !== undefined 
    ? projectedVacancyPct 
    : Math.round((shelter.available_capacity / shelter.total_capacity) * 100);
    
  let color: string;
  if (vacancyPct <= 0) color = '#dc2626';
  else if (vacancyPct <= 10) color = '#ef4444';
  else if (vacancyPct <= 30) color = '#f97316';
  else if (vacancyPct <= 60) color = '#eab308';
  else color = '#22c55e';

  const label = vacancyPct <= 0 ? 'FULL' : `${vacancyPct}%`;
  const size = isHighlighted ? 44 : 28;
  const pulseStyle = isHighlighted 
    ? `position:absolute; width:48px; height:48px; left:-2px; top:-2px; border-radius:50%; background:rgba(34, 197, 94, 0.3); animation: pulse-ring 1.5s ease-out infinite; z-index: -1;` 
    : 'display:none;';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="position:relative; display:flex; flex-direction:column; align-items:center;">
      <div style="${pulseStyle}"></div>
      <div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; transition: all 0.3s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isHighlighted ? 20 : 13}" height="${isHighlighted ? 20 : 13}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
      </div>
      <div style="font-size:${isHighlighted ? 12 : 9}px; font-weight:800; color:${color}; text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white; margin-top:1px; font-family:monospace; transition: all 0.3s ease;">${label}</div>
    </div>
    <style>@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }</style>`,
    iconSize: [48, 54],
    iconAnchor: [24, 27]
  });
};

const createZoneIcon = (priority: string, hasUnassigned: boolean) => {
  const color = hasUnassigned ? '#ef4444' :
    priority === 'P1' ? '#ef4444' : priority === 'P2' ? '#f97316' : priority === 'P3' ? '#eab308' : '#3b82f6';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4); opacity: 0.9;"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7]
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="position:relative; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:32px; height:32px; border-radius:50%; background:rgba(59,130,246,0.2); animation: pulse-ring 1.5s ease-out infinite;"></div>
      <div style="width:14px; height:14px; border-radius:50%; background:#3b82f6; border:3px solid white; box-shadow:0 2px 8px rgba(59,130,246,0.5); z-index:1;"></div>
    </div>
    <style>@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }</style>`,
    iconSize: [32, 32], iconAnchor: [16, 16]
  });
};

function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

function CoordinatesDisplay() {
  const coordRef = useRef<HTMLDivElement>(null);
  useMapEvents({
    mousemove(e: any) {
      if (coordRef.current) coordRef.current.textContent = `${e.latlng.lat.toFixed(4)}° N, ${e.latlng.lng.toFixed(4)}° E`;
    }
  });
  return (
    <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '4px', marginLeft: '8px' }}>
      <div className="leaflet-control" style={{ background: 'rgba(15,23,42,0.75)', color: '#94a3b8', fontSize: '9px', fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px' }}>
        <span ref={coordRef}>21.2514° N, 81.6296° E</span>
      </div>
    </div>
  );
}

// Cached OSRM routes for evacuation assignments
interface CachedRoute {
  key: string;
  waypoints: [number, number][];
  distanceKm: number;
}

// Demo routes between Govt School Pandri and NIT Raipur Stadium
interface DemoRouteData {
  unsafe: [number, number][] | null;
  safe: [number, number][] | null;
}

interface MapContentProps {
  forcedLayers?: {
    population?: boolean;
    shelters?: boolean;
    routes?: boolean;
    blockedRoads?: boolean;
    riskZones?: boolean;
  };
  highlightShelters?: boolean;
}

export default function MapContent({ forcedLayers, highlightShelters = false }: MapContentProps) {
  const store = usePlanningStore();
  const mapLayers = forcedLayers ? { ...store.mapLayers, ...forcedLayers } : store.mapLayers;
  const { planState, scenarioState, draftPlanDelta, basemap } = store;
  const { assignments } = planState;
  const mapRef = useRef<L.Map | null>(null);
  const center: [number, number] = [21.2514, 81.6296];

  // State for OSRM-fetched routes
  const [routeCache, setRouteCache] = useState<Record<string, [number, number][]>>({});
  const [demoRoutesData, setDemoRoutesData] = useState<DemoRouteData>({ unsafe: null, safe: null });
  const fetchedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
  }, []);

  useEffect(() => {
    (window as any).__mapFlyTo = (lat: number, lng: number, zoom?: number) => { mapRef.current?.flyTo([lat, lng], zoom || 15, { duration: 1 }); };
    (window as any).__mapZoomIn = () => mapRef.current?.zoomIn();
    (window as any).__mapZoomOut = () => mapRef.current?.zoomOut();
    (window as any).__mapReset = () => mapRef.current?.flyTo(center, 13, { duration: 1 });
  }, []);

  // Fetch OSRM routes for evacuation assignments
  useEffect(() => {
    if (!mapLayers.routes) return;

    assignments.forEach((assignment) => {
      if (!assignment.shelter_id) return;
      const zone = mockPopulationZones.find(z => z.id === assignment.zone_id);
      const shelter = mockShelters.find(s => s.id === assignment.shelter_id);
      if (!zone || !shelter) return;

      const key = `${assignment.zone_id}-${assignment.shelter_id}`;
      if (fetchedKeysRef.current.has(key)) return;
      fetchedKeysRef.current.add(key);

      fetchRoute(zone.location, shelter.location).then(result => {
        if (result) {
          setRouteCache(prev => ({ ...prev, [key]: result.waypoints }));
        }
      });
    });
  }, [assignments, mapLayers.routes]);

  // Fetch OSRM demo routes (unsafe shortest + safe alternative)
  useEffect(() => {
    const shelter4 = mockShelters.find(s => s.id === 'shelter-4'); // Govt School Pandri
    const shelter2 = mockShelters.find(s => s.id === 'shelter-2'); // NIT Raipur Stadium
    if (!shelter4 || !shelter2) return;

    // Fetch direct route (shortest — mark as unsafe)
    fetchRoute(shelter4.location, shelter2.location).then(result => {
      if (result) setDemoRoutesData(prev => ({ ...prev, unsafe: result.waypoints }));
    });

    // Fetch alternative route via a northern waypoint (safe)
    const viaPoint = { lat: 21.2710, lng: 81.6280 }; // Northern bypass point
    import('@/lib/services/osrmRouting').then(({ fetchRouteVia }) => {
      fetchRouteVia(shelter4.location, viaPoint, shelter2.location).then(result => {
        if (result) setDemoRoutesData(prev => ({ ...prev, safe: result.waypoints }));
      });
    });
  }, []);

  // Fetch OSRM routes for blocked roads
  const [blockedRouteCache, setBlockedRouteCache] = useState<Record<string, [number, number][]>>({});
  const blockedFetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!mapLayers.blockedRoads) return;
    mockRoads
      .filter(r => scenarioState.blocked_roads.includes(r.id) || r.status === 'BLOCKED')
      .forEach(road => {
        if (blockedFetchedRef.current.has(road.id)) return;
        blockedFetchedRef.current.add(road.id);

        const zone = mockPopulationZones.find(z => z.id === road.source_zone_id);
        const shelter = mockShelters.find(s => s.id === road.target_shelter_id);
        if (!zone || !shelter) return;

        fetchRoute(zone.location, shelter.location).then(result => {
          if (result) setBlockedRouteCache(prev => ({ ...prev, [road.id]: result.waypoints }));
        });
      });
  }, [scenarioState.blocked_roads, mapLayers.blockedRoads]);

  return (
    <div className="h-full w-full relative">
      {/* Compass Rose */}
      <div className="absolute top-4 right-4 z-[500] bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-slate-200" style={{ width: '56px', height: '56px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* North arrow (red) */}
          <polygon points="50,8 44,48 56,48" fill="#ef4444" />
          {/* South arrow (white/gray) */}
          <polygon points="50,92 44,52 56,52" fill="#94a3b8" />
          {/* East arrow */}
          <polygon points="92,50 52,44 52,56" fill="#94a3b8" />
          {/* West arrow */}
          <polygon points="8,50 48,44 48,56" fill="#94a3b8" />
          {/* Center circle */}
          <circle cx="50" cy="50" r="4" fill="#1e293b" />
          {/* Labels */}
          <text x="50" y="6" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ef4444">N</text>
          <text x="50" y="99" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">S</text>
          <text x="97" y="53" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">E</text>
          <text x="3" y="53" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">W</text>
        </svg>
      </div>

      <MapContainer center={center} zoom={13} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <MapController mapRef={mapRef} />
        <CoordinatesDisplay />
        <TileLayer key={basemap} attribution={TILE_ATTRIBUTIONS[basemap]} url={TILE_URLS[basemap]} />

        {/* YOUR LOCATION */}
        <Marker position={[DEMO_USER_LOCATION.lat, DEMO_USER_LOCATION.lng]} icon={createUserLocationIcon()}>
          <Popup>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>📍 {DEMO_USER_LOCATION.label}</div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>This is your current position.</div>
          </Popup>
        </Marker>

        {/* POPULATION ZONES */}
        {mapLayers.population && mockPopulationZones.map((zone) => {
          const zoneAssignments = assignments.filter(a => a.zone_id === zone.id);
          const assigned = zoneAssignments.find(a => a.status === 'ASSIGNED' || a.status === 'PARTIALLY_ASSIGNED');
          const hasUnassigned = zoneAssignments.some(a => a.status === 'UNASSIGNED');
          const assignedShelter = assigned?.shelter_id ? mockShelters.find(s => s.id === assigned.shelter_id) : null;

          return (
            <LayerGroup key={zone.id}>
              <Marker position={[zone.location.lat, zone.location.lng]} icon={createZoneIcon(zone.priority_level, hasUnassigned)}>
                <Popup maxWidth={280}>
                  <div style={{ fontSize: '11px', lineHeight: '1.4', minWidth: '220px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>{zone.name}</div>
                    <table style={{ width: '100%' }}>
                      <tbody>
                        <tr><td style={{ color: '#64748b', paddingRight: '12px' }}>Population</td><td style={{ fontWeight: 700 }}>{zone.population.toLocaleString()}</td></tr>
                        <tr><td style={{ color: '#64748b' }}>Vulnerable</td><td style={{ fontWeight: 700 }}>{zone.vulnerable_population.toLocaleString()}</td></tr>
                        <tr><td style={{ color: '#64748b' }}>Priority</td><td style={{ fontWeight: 700, color: zone.priority_level === 'P1' ? '#ef4444' : '#f97316' }}>{zone.priority_level}</td></tr>
                        <tr><td style={{ color: '#64748b' }}>Risk</td><td style={{ fontWeight: 700 }}>{zone.risk_level}</td></tr>
                      </tbody>
                    </table>
                    {assignedShelter && (
                      <div style={{ background: '#eff6ff', borderRadius: '4px', padding: '6px', marginTop: '6px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '2px' }}>Assigned Shelter</div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{assignedShelter.name}</div>
                      </div>
                    )}
                    {hasUnassigned && (
                      <div style={{ background: '#fef2f2', borderRadius: '4px', padding: '6px', marginTop: '6px', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '10px' }}>
                        UNASSIGNED — Insufficient shelter capacity
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              {mapLayers.riskZones && (
                <Circle center={[zone.location.lat, zone.location.lng]} radius={Math.max(zone.population / 8, 100)}
                  pathOptions={{ color: hasUnassigned ? '#ef4444' : zone.priority_level === 'P1' ? '#ef4444' : zone.priority_level === 'P2' ? '#f97316' : '#3b82f6', fillOpacity: 0.10, weight: 1.5, opacity: 0.5 }} />
              )}
            </LayerGroup>
          );
        })}

        {/* SHELTERS (vacancy-colored) */}
        {mapLayers.shelters && mockShelters.map((shelter) => {
          const vacancyPct = Math.round((shelter.available_capacity / shelter.total_capacity) * 100);
          const incoming = assignments.filter(a => a.shelter_id === shelter.id).reduce((s, a) => s + a.assigned_population, 0);
          
          // Calculate projected vacancy after arrivals
          const projectedVacantBeds = Math.max(0, shelter.available_capacity - incoming);
          const projectedVacancyPct = Math.round((projectedVacantBeds / shelter.total_capacity) * 100);
          
          const assignedZones = assignments.filter(a => a.shelter_id === shelter.id).map(a => mockPopulationZones.find(z => z.id === a.zone_id)?.name).filter(Boolean);

          return (
            <Marker key={shelter.id} position={[shelter.location.lat, shelter.location.lng]} icon={createShelterIcon(shelter, highlightShelters, projectedVacancyPct)}>
              <Popup maxWidth={300}>
                <div style={{ fontSize: '11px', lineHeight: '1.4', minWidth: '240px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>{shelter.name}</div>
                  <table style={{ width: '100%', marginBottom: '8px' }}>
                    <tbody>
                      <tr><td style={{ color: '#64748b' }}>Total Beds</td><td style={{ fontWeight: 700 }}>{shelter.total_capacity.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Occupied</td><td style={{ fontWeight: 700, color: '#ef4444' }}>{shelter.current_occupancy.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Vacant</td><td style={{ fontWeight: 700, color: '#22c55e' }}>{shelter.available_capacity.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Incoming</td><td style={{ fontWeight: 700, color: '#3b82f6' }}>+{incoming.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '2px' }}>
                      <span style={{ color: '#64748b' }}>Current Vacancy</span>
                      <span style={{ fontWeight: 800, color: vacancyPct <= 10 ? '#ef4444' : vacancyPct <= 30 ? '#f97316' : '#22c55e' }}>{vacancyPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ width: Math.min(vacancyPct, 100) + '%', height: '100%', borderRadius: '3px', backgroundColor: vacancyPct <= 10 ? '#ef4444' : vacancyPct <= 30 ? '#f97316' : vacancyPct <= 60 ? '#eab308' : '#22c55e' }} />
                    </div>
                    
                    {/* Projected Vacancy Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '2px' }}>
                      <span style={{ color: '#64748b' }}>Projected Vacancy (after arrivals)</span>
                      <span style={{ fontWeight: 800, color: projectedVacancyPct <= 10 ? '#ef4444' : projectedVacancyPct <= 30 ? '#f97316' : '#22c55e' }}>{projectedVacancyPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: Math.min(projectedVacancyPct, 100) + '%', height: '100%', borderRadius: '3px', backgroundColor: projectedVacancyPct <= 10 ? '#ef4444' : projectedVacancyPct <= 30 ? '#f97316' : projectedVacancyPct <= 60 ? '#eab308' : '#22c55e' }} />
                    </div>
                  </div>
                  <div style={{ background: '#f0fdf4', borderRadius: '4px', padding: '6px', border: '1px solid #dcfce7', marginBottom: '6px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '3px' }}>Medical Facilities</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '10px' }}>
                      <span>O₂ Tanks: <b>{shelter.medical.oxygen_tanks}</b></span>
                      <span>First Aid: <b>{shelter.medical.first_aid_kits}</b></span>
                      <span>Nurses: <b>{shelter.medical.nurses}</b></span>
                      <span>Doctors: <b>{shelter.medical.doctors}</b></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {shelter.facilities.map(f => (<span key={f} style={{ background: '#f1f5f9', fontSize: '9px', padding: '1px 5px', borderRadius: '3px', color: '#475569' }}>{f}</span>))}
                  </div>
                  {assignedZones.length > 0 && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Serving: {assignedZones.join(', ')}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* EVACUATION ROUTES (real OSRM road geometry) */}
        {mapLayers.routes && assignments.map((assignment, idx) => {
          if (!assignment.shelter_id) return null;
          const zone = mockPopulationZones.find(z => z.id === assignment.zone_id);
          const shelter = mockShelters.find(s => s.id === assignment.shelter_id);
          if (!zone || !shelter) return null;

          const key = `${assignment.zone_id}-${assignment.shelter_id}`;
          const waypoints = routeCache[key] || [[zone.location.lat, zone.location.lng], [shelter.location.lat, shelter.location.lng]];

          let color = '#6366f1';
          let dashArray: string | undefined = undefined;
          let weight = Math.max(2, Math.min(5, assignment.assigned_population / 600));
          if (assignment.route_status === 'BLOCKED') { color = '#ef4444'; dashArray = '8,5'; weight = 3; }
          else if (assignment.route_status === 'CONGESTED') { color = '#f59e0b'; dashArray = '5,4'; }

          return (
            <Polyline key={`route-${idx}`} positions={waypoints} pathOptions={{ color, weight, dashArray, opacity: 0.7 }}>
              <Popup maxWidth={260}>
                <div style={{ fontSize: '11px', lineHeight: '1.4', minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>Evacuation Route</div>
                  <table style={{ width: '100%' }}>
                    <tbody>
                      <tr><td style={{ color: '#64748b' }}>From</td><td style={{ fontWeight: 700 }}>{zone.name}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>To</td><td style={{ fontWeight: 700 }}>{shelter.name}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Population</td><td style={{ fontWeight: 700 }}>{assignment.assigned_population.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>ETA</td><td style={{ fontWeight: 700 }}>{assignment.estimated_travel_time_mins} min</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Status</td><td style={{ fontWeight: 700, color: assignment.route_status === 'BLOCKED' ? '#ef4444' : assignment.route_status === 'CONGESTED' ? '#f59e0b' : '#22c55e' }}>{assignment.route_status}</td></tr>
                    </tbody>
                  </table>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* BLOCKED ROADS (real road geometry) */}
        {mapLayers.blockedRoads && mockRoads
          .filter(r => scenarioState.blocked_roads.includes(r.id) || r.status === 'BLOCKED')
          .map(road => {
            const zone = mockPopulationZones.find(z => z.id === road.source_zone_id);
            const shelter = mockShelters.find(s => s.id === road.target_shelter_id);
            if (!zone || !shelter) return null;
            const waypoints = blockedRouteCache[road.id] || [[zone.location.lat, zone.location.lng], [shelter.location.lat, shelter.location.lng]];
            return (
              <Polyline key={`blocked-${road.id}`} positions={waypoints}
                pathOptions={{ color: '#ef4444', weight: 4, dashArray: '8,6', opacity: 0.85 }}>
                <Popup>
                  <div style={{ fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>🚫 BLOCKED: {road.name}</div>
                    <div style={{ color: '#64748b', marginTop: '4px' }}>This road is currently impassable.</div>
                  </div>
                </Popup>
              </Polyline>
            );
          })
        }

        {/* DEMO: Unsafe (Red) vs Safe (Green) Route — real OSRM roads */}
        {mapLayers.routes && demoRoutesData.unsafe && (
          <Polyline positions={demoRoutesData.unsafe} pathOptions={{ color: '#ef4444', weight: 5, dashArray: '10,6', opacity: 0.85 }}>
            <Popup maxWidth={260}>
              <div style={{ fontSize: '11px' }}>
                <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>⚠️ Shortest Route (UNSAFE)</div>
                <div style={{ color: '#64748b' }}>Passes through Pandri flood zone — waterlogged, EXTREME risk.</div>
                <div style={{ marginTop: '6px', fontWeight: 700, color: '#dc2626', fontSize: '10px' }}>DO NOT USE THIS ROUTE</div>
              </div>
            </Popup>
          </Polyline>
        )}
        {mapLayers.routes && demoRoutesData.safe && (
          <Polyline positions={demoRoutesData.safe} pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.9 }}>
            <Popup maxWidth={260}>
              <div style={{ fontSize: '11px' }}>
                <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>✅ Safest Route (via Ring Road)</div>
                <div style={{ color: '#64748b' }}>Avoids flood zones; uses elevated Ring Road bypass.</div>
                <div style={{ marginTop: '6px', fontWeight: 700, color: '#16a34a', fontSize: '10px' }}>RECOMMENDED SAFE ROUTE</div>
              </div>
            </Popup>
          </Polyline>
        )}

        {/* IMPACT ZONES (simulation preview) */}
        {draftPlanDelta && Array.from(new Set(draftPlanDelta.detailed_changes.map(c => c.zone_id))).map((zoneId, idx) => {
          const zone = mockPopulationZones.find(z => z.id === zoneId);
          if (!zone) return null;
          return <Circle key={`impact-${zone.id}-${idx}`} center={[zone.location.lat, zone.location.lng]} radius={800}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.2, weight: 2, dashArray: '4,4' }} />;
        })}
      </MapContainer>
    </div>
  );
}
