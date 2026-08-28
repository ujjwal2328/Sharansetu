"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import CitizenEvacuationPanel from "./CitizenEvacuationPanel";

export default function FloatingOpsPanel() {
  const { opsExpanded, setOpsExpanded } = usePlanningStore();

  return (
    <div className="absolute top-[96px] left-3 z-30 w-[320px] flex flex-col" style={{ maxHeight: 'calc(100vh - 150px)' }}>
      <div
        className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-t-lg border border-slate-700/50 select-none"
        onClick={() => setOpsExpanded(!opsExpanded)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Shelter Finder</span>
        </div>
        {opsExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </div>

      {opsExpanded && (
        <div className="bg-white/95 backdrop-blur-sm border border-t-0 border-slate-200 rounded-b-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <CitizenEvacuationPanel />
        </div>
      )}
    </div>
  );
}
