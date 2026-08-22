"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { TimelineEvent } from "@/types";
import { AlertCircle, ArrowRight, CheckCircle2, RouteOff, Activity } from "lucide-react";

const EventIcon = ({ type }: { type: TimelineEvent['type'] }) => {
  switch (type) {
    case 'ROAD_BLOCKED':
      return <RouteOff className="h-4 w-4 text-red-500" />;
    case 'ROAD_CLEARED':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'PLAN_RECALCULATED':
      return <Activity className="h-4 w-4 text-blue-500" />;
    case 'SHELTER_THRESHOLD_CROSSED':
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return <ArrowRight className="h-4 w-4 text-slate-400" />;
  }
};

export default function SituationTimeline() {
  const { timelineEvents } = usePlanningStore();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2 bg-slate-50 border-b flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational Timeline</span>
        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-600">{timelineEvents.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {timelineEvents.map((event, index) => {
          const date = new Date(event.timestamp);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={event.id} className="relative pl-6">
              {/* Vertical line connecting events */}
              {index !== timelineEvents.length - 1 && (
                <div className="absolute left-[11px] top-5 bottom-[-16px] w-[2px] bg-slate-200" />
              )}
              
              <div className="absolute left-0 top-1 bg-white p-1 rounded-full border border-slate-200 shadow-sm z-10">
                <EventIcon type={event.type} />
              </div>
              
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-mono text-slate-500">{timeString}</span>
                <span className="text-sm font-medium text-slate-800">{event.message}</span>
                {event.details && (
                  <span className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                    {event.details}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {timelineEvents.length === 0 && (
          <div className="text-center text-sm text-slate-500 mt-10">
            No events recorded.
          </div>
        )}
      </div>
    </div>
  );
}
