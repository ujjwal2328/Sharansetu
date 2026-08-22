"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { MapIcon, ChevronDown } from "lucide-react";

export default function MapLegend() {
  const { legendOpen, setLegendOpen } = usePlanningStore();

  if (!legendOpen) {
    return (
      <button
        onClick={() => setLegendOpen(true)}
        className="absolute bottom-[48px] right-[236px] z-30 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1.5"
      >
        <MapIcon className="h-3 w-3" />
        Legend
      </button>
    );
  }

  return (
    <div className="absolute bottom-[48px] right-[236px] z-30 w-[180px] bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-800/95 text-white px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider">Map Legend</span>
        <button onClick={() => setLegendOpen(false)} className="hover:bg-slate-700 rounded p-0.5">
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>
      </div>
      <div className="p-2.5 space-y-1.5 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm shrink-0" />
          <span className="text-slate-700">Population Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm shrink-0" />
          <span className="text-slate-700">High Risk Zone (P1)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm shrink-0" />
          <span className="text-slate-700">Shelter (Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-sm shrink-0" />
          <span className="text-slate-700">Shelter (Critical)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-blue-500 rounded shrink-0" />
          <span className="text-slate-700">Evacuation Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 shrink-0" style={{ background: 'repeating-linear-gradient(90deg, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }} />
          <span className="text-slate-700">Blocked Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 shrink-0" style={{ background: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }} />
          <span className="text-slate-700">Congested Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-500/20 shrink-0" />
          <span className="text-slate-700">Impact Zone</span>
        </div>
      </div>
    </div>
  );
}
