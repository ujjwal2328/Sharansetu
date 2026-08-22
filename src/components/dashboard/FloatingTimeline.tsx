"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Clock, ChevronUp, AlertCircle, CheckCircle2, RouteOff, Activity, ArrowRight } from "lucide-react";
import { TimelineEvent } from "@/types";

const EventIcon = ({ type }: { type: TimelineEvent['type'] }) => {
  switch (type) {
    case 'ROAD_BLOCKED': return <RouteOff className="h-3 w-3 text-red-500" />;
    case 'ROAD_CLEARED': return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
    case 'PLAN_RECALCULATED': return <Activity className="h-3 w-3 text-blue-500" />;
    case 'SHELTER_THRESHOLD_CROSSED': return <AlertCircle className="h-3 w-3 text-amber-500" />;
    case 'CAPACITY_SHORTFALL_DETECTED': return <AlertCircle className="h-3 w-3 text-red-500" />;
    default: return <ArrowRight className="h-3 w-3 text-slate-400" />;
  }
};

export default function FloatingTimeline() {
  const { timelineExpanded, setTimelineExpanded, timelineEvents } = usePlanningStore();

  if (!timelineExpanded) {
    return (
      <button
        onClick={() => setTimelineExpanded(true)}
        className="absolute bottom-[42px] left-3 z-30 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700/50 flex items-center gap-2 text-xs font-medium hover:bg-slate-800/90 transition-colors"
      >
        <Clock className="h-3.5 w-3.5 text-blue-400" />
        Timeline
        {timelineEvents.length > 0 && (
          <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-blue-500/30">{timelineEvents.length}</span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute bottom-[42px] left-3 z-30 w-[300px] bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
      <div
        className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setTimelineExpanded(false)}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Timeline</span>
          <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">{timelineEvents.length}</span>
        </div>
        <ChevronUp className="h-4 w-4 text-slate-400" />
      </div>
      
      <div className="max-h-[240px] overflow-y-auto p-3 space-y-2.5">
        {timelineEvents.slice(0, 8).map((event) => {
          const date = new Date(event.timestamp);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return (
            <div key={event.id} className="flex gap-2">
              <div className="mt-0.5 shrink-0"><EventIcon type={event.type} /></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{timeString}</span>
                </div>
                <div className="text-[11px] font-medium text-slate-800 leading-tight">{event.message}</div>
                {event.details && (
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{event.details}</div>
                )}
              </div>
            </div>
          );
        })}
        {timelineEvents.length === 0 && (
          <div className="text-[11px] text-slate-400 text-center py-4">No events recorded.</div>
        )}
      </div>
    </div>
  );
}
