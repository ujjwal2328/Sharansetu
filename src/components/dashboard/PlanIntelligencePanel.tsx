"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { AlertTriangle, TrendingUp, CheckCircle, RouteOff, Users, ArrowRight } from "lucide-react";
import { mockShelters } from "@/lib/services/mockData";

export default function PlanIntelligencePanel() {
  const { planState } = usePlanningStore();
  const { intelligence } = planState;

  if (intelligence.bottlenecks.length === 0 && intelligence.critical_shelters.length === 0 && intelligence.priority_zones_at_risk.length === 0) {
    return (
      <div className="bg-slate-50 border-b p-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plan Intelligence</h3>
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" /> All operational parameters within normal limits.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-b p-4 space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Intelligence</h3>
      
      <div className="grid grid-cols-1 gap-2">
        {intelligence.bottlenecks.map(b => (
          <div key={b.route_id} className="flex items-start gap-2 bg-white p-2 rounded border border-red-100 shadow-sm">
            <RouteOff className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-700">CRITICAL BOTTLENECK: R-{b.route_id.split('-')[1]}</div>
              <div className="text-xs text-slate-600">
                {b.dependency_percentage}% of evacuees ({b.affected_population.toLocaleString()}) depend on this route. {b.alternative_available ? '' : 'No viable alternative.'}
              </div>
            </div>
          </div>
        ))}

        {intelligence.critical_shelters.length > 0 && (
          <div className="flex items-start gap-2 bg-white p-2 rounded border border-amber-100 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-700">SHELTER OVERLOAD RISK</div>
              <div className="text-xs text-slate-600">
                {intelligence.critical_shelters.length} shelter(s) projected &gt;95% capacity: {intelligence.critical_shelters.map(id => mockShelters.find(s=>s.id === id)?.name).join(', ')}.
              </div>
            </div>
          </div>
        )}

        {intelligence.priority_zones_at_risk.length > 0 && (
          <div className="flex items-start gap-2 bg-white p-2 rounded border border-orange-200 shadow-sm">
            <Users className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-orange-700">P1 ZONES UNASSIGNED</div>
              <div className="text-xs text-slate-600">
                {intelligence.priority_zones_at_risk.length} immediate priority zone(s) lack feasible evacuation assignment.
              </div>
            </div>
          </div>
        )}

        {intelligence.capacity_buffer_shelter && (
          <div className="flex items-start gap-2 bg-white p-2 rounded border border-emerald-100 shadow-sm">
            <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-700">CAPACITY BUFFER</div>
              <div className="text-xs text-slate-600">
                {mockShelters.find(s => s.id === intelligence.capacity_buffer_shelter)?.name} has the largest remaining capacity buffer.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
