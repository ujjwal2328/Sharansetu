"use client";

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, LayerGroup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockPopulationZones, mockShelters, mockRoads } from '@/lib/services/mockData';
import { usePlanningStore } from '@/lib/state/planningStore';

const iconRetinaUrl = '/leaflet/marker-icon-2x.png';
const iconUrl = '/leaflet/marker-icon.png';
const shadowUrl = '/leaflet/marker-shadow.png';

// Basemap tile URLs
const TILE_URLS = {
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  humanitarian: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const TILE_ATTRIBUTIONS = {
  standard: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  humanitarian: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://www.hotosm.org/">HOT</a>',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const createShelterIcon = (loadPct: number) => {
  let color = '#22c55e';
  if (loadPct >= 95) color = '#ef4444';
  else if (loadPct >= 80) color = '#f97316';
  else if (loadPct >= 60) color = '#eab308';

  const pctText = loadPct > 0 ? loadPct + '%' : '';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="position:relative; display:flex; flex-direction:column; align-items:center;">
      <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
      </div>
      <div style="font-size:9px; font-weight:800; color:${color}; text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white; margin-top:1px; font-family:monospace;">${pctText}</div>
    </div>`,
    iconSize: [30, 36],
    iconAnchor: [15, 18]
  });
};

const createZoneIcon = (priority: string, hasUnassigned: boolean) => {
  const color = hasUnassigned ? '#ef4444' :
    priority === 'P1' ? '#ef4444' :
    priority === 'P2' ? '#f97316' :
    priority === 'P3' ? '#eab308' : '#3b82f6';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4); opacity: 0.9;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Component to handle map events and expose map ref
function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// Coordinates display component
function CoordinatesDisplay() {
  const map = useMap();
  const coordRef = useRef<HTMLDivElement>(null);

  useMapEvents({
    mousemove(e) {
      if (coordRef.current) {
        coordRef.current.textContent = `${e.latlng.lat.toFixed(4)}° N, ${e.latlng.lng.toFixed(4)}° E`;
      }
    }
  });

  return (
    <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '4px', marginLeft: '8px' }}>
      <div className="leaflet-control" style={{ background: 'rgba(15,23,42,0.75)', color: '#94a3b8', fontSize: '9px', fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
        <span ref={coordRef}>21.2514° N, 81.6296° E</span>
      </div>
    </div>
  );
}

export default function MapContent() {
  const { planState, scenarioState, draftPlanDelta, mapLayers, basemap } = usePlanningStore();
  const { assignments, projected_loads, intelligence } = planState;
  const mapRef = useRef<L.Map | null>(null);

  const center: [number, number] = [21.2514, 81.6296];

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
  }, []);

  // Expose flyTo for external components
  useEffect(() => {
    (window as any).__mapFlyTo = (lat: number, lng: number, zoom?: number) => {
      mapRef.current?.flyTo([lat, lng], zoom || 15, { duration: 1 });
    };
    (window as any).__mapZoomIn = () => mapRef.current?.zoomIn();
    (window as any).__mapZoomOut = () => mapRef.current?.zoomOut();
    (window as any).__mapReset = () => mapRef.current?.flyTo(center, 13, { duration: 1 });
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <MapController mapRef={mapRef} />
        <CoordinatesDisplay />

        <TileLayer
          key={basemap}
          attribution={TILE_ATTRIBUTIONS[basemap]}
          url={TILE_URLS[basemap]}
        />

        {/* Population Zones */}
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
                        <tr><td style={{ color: '#64748b' }}>Demand</td><td style={{ fontWeight: 700, color: '#d97706' }}>{zone.estimated_demand.toLocaleString()}</td></tr>
                      </tbody>
                    </table>
                    {assignedShelter && (
                      <div style={{ background: '#eff6ff', borderRadius: '4px', padding: '6px', marginTop: '6px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '2px' }}>Assigned Shelter</div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{assignedShelter.name}</div>
                        <div style={{ color: '#64748b', fontSize: '10px' }}>Travel: {assigned!.estimated_travel_time_mins} min | Score: {assigned!.score?.total || '-'}/100</div>
                      </div>
                    )}
                    {hasUnassigned && (
                      <div style={{ background: '#fef2f2', borderRadius: '4px', padding: '6px', marginTop: '6px', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 700, fontSize: '10px' }}>
                        UNASSIGNED — Insufficient accessible shelter capacity
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              {mapLayers.riskZones && (
                <Circle
                  center={[zone.location.lat, zone.location.lng]}
                  radius={Math.max(zone.population / 8, 100)}
                  pathOptions={{
                    color: hasUnassigned ? '#ef4444' : zone.priority_level === 'P1' ? '#ef4444' : zone.priority_level === 'P2' ? '#f97316' : '#3b82f6',
                    fillOpacity: 0.10,
                    weight: 1.5,
                    opacity: 0.5
                  }}
                />
              )}
            </LayerGroup>
          );
        })}

        {/* Shelters */}
        {mapLayers.shelters && mockShelters.map((shelter) => {
          const load = projected_loads[shelter.id] || 0;
          const incoming = assignments.filter(a => a.shelter_id === shelter.id).reduce((s, a) => s + a.assigned_population, 0);
          const projected = shelter.current_occupancy + incoming;
          const assignedZones = assignments.filter(a => a.shelter_id === shelter.id).map(a => mockPopulationZones.find(z => z.id === a.zone_id)?.name).filter(Boolean);

          return (
            <Marker key={shelter.id} position={[shelter.location.lat, shelter.location.lng]} icon={createShelterIcon(load)}>
              <Popup maxWidth={300}>
                <div style={{ fontSize: '11px', lineHeight: '1.4', minWidth: '240px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>{shelter.name}</div>
                  <table style={{ width: '100%', marginBottom: '8px' }}>
                    <tbody>
                      <tr><td style={{ color: '#64748b', paddingRight: '12px' }}>Current</td><td style={{ fontWeight: 700 }}>{shelter.current_occupancy.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Incoming</td><td style={{ fontWeight: 700, color: '#3b82f6' }}>+{incoming.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Projected</td><td style={{ fontWeight: 800 }}>{projected.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Total Capacity</td><td style={{ fontWeight: 700 }}>{shelter.total_capacity.toLocaleString()}</td></tr>
                      <tr><td style={{ color: '#64748b' }}>Available</td><td style={{ fontWeight: 700, color: '#22c55e' }}>{Math.max(0, shelter.total_capacity - projected).toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                  {/* Capacity bar */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '2px' }}>
                      <span style={{ color: '#64748b' }}>Projected Load</span>
                      <span style={{ fontWeight: 800, color: load >= 95 ? '#ef4444' : load >= 80 ? '#f97316' : '#22c55e' }}>{load}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: Math.min(load, 100) + '%', height: '100%', borderRadius: '3px', backgroundColor: load >= 95 ? '#ef4444' : load >= 80 ? '#f97316' : load >= 60 ? '#eab308' : '#22c55e' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '4px' }}>
                    {shelter.facilities.map(f => (
                      <span key={f} style={{ background: '#f1f5f9', fontSize: '9px', padding: '1px 5px', borderRadius: '3px', color: '#475569' }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>Status: {shelter.accessibility_status === 'ACCESSIBLE' ? '✓ Accessible' : shelter.accessibility_status.replace('_', ' ')}</div>
                  {assignedZones.length > 0 && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>Serving: {assignedZones.join(', ')}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Evacuation Routes */}
        {mapLayers.routes && assignments.map((assignment, idx) => {
          if (!assignment.shelter_id) return null;
          const zone = mockPopulationZones.find(z => z.id === assignment.zone_id);
          const shelter = mockShelters.find(s => s.id === assignment.shelter_id);
          if (!zone || !shelter) return null;

          let color = '#6366f1';
          let dashArray: string | undefined = undefined;
          let weight = Math.max(2, Math.min(6, assignment.assigned_population / 500));

          if (assignment.route_status === 'BLOCKED') { color = '#ef4444'; dashArray = '8,5'; weight = 3; }
          else if (assignment.route_status === 'CONGESTED') { color = '#f59e0b'; dashArray = '5,4'; }

          return (
            <Polyline
              key={`route-${idx}`}
              positions={[[zone.location.lat, zone.location.lng], [shelter.location.lat, shelter.location.lng]]}
              pathOptions={{ color, weight, dashArray, opacity: 0.7 }}
            >
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

        {/* Blocked Roads overlay */}
        {mapLayers.blockedRoads && mockRoads
          .filter(r => scenarioState.blocked_roads.includes(r.id) || r.status === 'BLOCKED')
          .map(road => {
            const zone = mockPopulationZones.find(z => z.id === road.source_zone_id);
            const shelter = mockShelters.find(s => s.id === road.target_shelter_id);
            if (!zone || !shelter) return null;
            return (
              <Polyline
                key={`blocked-${road.id}`}
                positions={[[zone.location.lat, zone.location.lng], [shelter.location.lat, shelter.location.lng]]}
                pathOptions={{ color: '#ef4444', weight: 4, dashArray: '8,6', opacity: 0.85 }}
              >
                <Popup>
                  <div style={{ fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>BLOCKED: {road.name}</div>
                    <div style={{ color: '#64748b', marginTop: '4px' }}>{zone.name} &rarr; {shelter.name}</div>
                  </div>
                </Popup>
              </Polyline>
            );
          })
        }

        {/* Impact Radius during simulation */}
        {draftPlanDelta && Array.from(new Set(draftPlanDelta.detailed_changes.map(c => c.zone_id))).map((zoneId, idx) => {
          const zone = mockPopulationZones.find(z => z.id === zoneId);
          if (!zone) return null;
          return (
            <Circle
              key={`impact-${zone.id}-${idx}`}
              center={[zone.location.lat, zone.location.lng]}
              radius={800}
              pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.2, weight: 2, dashArray: '4,4' }}
            >
              <Popup>
                <div style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#d97706' }}>Impact Zone: {zone.name}</div>
                  <div style={{ color: '#64748b' }}>Route invalidated — assignment may change.</div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
