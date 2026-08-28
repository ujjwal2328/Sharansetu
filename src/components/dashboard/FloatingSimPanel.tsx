"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Activity, ChevronDown, ChevronUp, Download } from "lucide-react";
import SimulateDisruptionPanel from "./SimulateDisruptionPanel";

export default function FloatingSimPanel() {
  const { opsExpanded, setOpsExpanded, planState } = usePlanningStore();

  const handleExportPlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planState, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "evacuation_plan.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="absolute top-[96px] left-3 z-30 w-[300px] flex flex-col" style={{ maxHeight: 'calc(100vh - 150px)' }}>
      <div
        className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-t-lg border border-slate-700/50 select-none"
        onClick={() => setOpsExpanded(!opsExpanded)}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Operations Center</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPlan}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors"
          >
            <Download className="h-3 w-3" /> EXPORT
          </button>
          {opsExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {opsExpanded && (
        <div className="bg-white/95 backdrop-blur-sm border border-t-0 border-slate-200 rounded-b-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <SimulateDisruptionPanel />
        </div>
      )}
    </div>
  );
}
