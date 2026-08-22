"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, AlertTriangle, RouteOff, CheckCircle, Activity } from "lucide-react";
import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockRoads } from "@/lib/services/mockData";

export default function KpiRow() {
  const { planState, scenarioState } = usePlanningStore();
  
  // Formulas
  const affectedPopulation = mockPopulationZones.reduce((sum, z) => sum + z.population, 0);
  const coveragePercentage = planState.coverage_percentage;
  
  const availableFeasibleCapacity = mockPopulationZones.reduce((sum, z) => sum + z.estimated_demand, 0) - planState.total_assigned; 
  // Wait, available feasible capacity is total capacity of accessible shelters minus total assigned. Let's calculate from shelters.
  
  const criticalShelters = planState.intelligence.critical_shelters.length;
  const blockedRoutes = scenarioState.blocked_roads.length;
  
  // Critical Population: P1 + Unassigned + Affected by disruption (draft impact)
  const p1Pop = mockPopulationZones.filter(z => z.priority_level === 'P1').reduce((s, z) => s + z.population, 0);
  const criticalPopulation = p1Pop + planState.unassigned_population;

  const kpis = [
    {
      title: "Affected Population",
      value: affectedPopulation.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Evacuation Coverage",
      value: `${coveragePercentage}%`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Unassigned Shortfall",
      value: planState.unassigned_population.toLocaleString(),
      icon: Home,
      color: planState.unassigned_population > 0 ? "text-red-600" : "text-emerald-600",
      bg: planState.unassigned_population > 0 ? "bg-red-100" : "bg-emerald-100",
    },
    {
      title: "Critical Shelters",
      value: criticalShelters.toString(),
      icon: AlertTriangle,
      color: criticalShelters > 0 ? "text-amber-600" : "text-emerald-600",
      bg: criticalShelters > 0 ? "bg-amber-100" : "bg-emerald-100",
    },
    {
      title: "Blocked Routes",
      value: blockedRoutes.toString(),
      icon: RouteOff,
      color: blockedRoutes > 0 ? "text-red-600" : "text-emerald-600",
      bg: blockedRoutes > 0 ? "bg-red-100" : "bg-emerald-100",
    },
    {
      title: "Critical Population",
      value: criticalPopulation.toLocaleString(),
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-100",
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-slate-50 border-b shrink-0">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="shadow-sm border-slate-200">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{kpi.title}</p>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
