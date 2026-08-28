"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Layers, ChevronDown, ChevronUp, Map, Eye, EyeOff } from "lucide-react";

const layerConfig = [
  { key: 'population' as const, label: 'Population Zones', color: '#3b82f6' },
  { key: 'shelters' as const, label: 'Shelters', color: '#22c55e' },
  { key: 'routes' as const, label: 'Evacuation Routes', color: '#6366f1' },
  { key: 'blockedRoads' as const, label: 'Blocked Roads', color: '#ef4444' },
  { key: 'riskZones' as const, label: 'Risk Zones', color: '#f97316' },
  { key: 'floodZones' as const, label: 'Animated Flood Zones', color: '#0ea5e9' },
];

const basemapOptions = [
  { key: 'standard' as const, label: 'Standard' },
  { key: 'humanitarian' as const, label: 'Humanitarian' },
  { key: 'dark' as const, label: 'Dark' },
];

export default function LayerManager() {
  const { mapLayers, basemap, toggleLayer, setBasemap, layerManagerOpen, setLayerManagerOpen } = usePlanningStore();

  if (!layerManagerOpen) return null;

  return (
    <div className="absolute bottom-[48px] right-3 z-30 w-[220px] bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Layer Manager</span>
        </div>
        <button onClick={() => setLayerManagerOpen(false)} className="hover:bg-slate-700 rounded p-0.5">
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      <div className="p-2.5 space-y-1">
        {layerConfig.map(({ key, label, color }) => (
          <label key={key} className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={mapLayers[key]}
              onChange={() => toggleLayer(key)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[11px] text-slate-700 font-medium">{label}</span>
            {mapLayers[key] ? (
              <Eye className="h-3 w-3 text-slate-300 ml-auto" />
            ) : (
              <EyeOff className="h-3 w-3 text-slate-300 ml-auto" />
            )}
          </label>
        ))}
      </div>

      <div className="border-t px-2.5 py-2 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">Base Map</div>
        {basemapOptions.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 px-2 py-1 rounded cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="basemap"
              checked={basemap === key}
              onChange={() => setBasemap(key)}
              className="text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-[11px] text-slate-700 font-medium">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
