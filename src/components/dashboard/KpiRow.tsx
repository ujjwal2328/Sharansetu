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
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl w-[260px]">
      <div className="pb-2 border-b border-slate-700/50 mb-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3 text-blue-500" />
          Live Metrics
        </h2>
      </div>
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        // Dark mode adjustments for KPI colors
        let bgClass = "bg-slate-800";
        let textClass = "text-slate-300";
        let iconColor = "text-slate-400";
        
        if (kpi.bg.includes('blue')) { bgClass = "bg-blue-500/10 border-blue-500/20"; textClass = "text-blue-400"; iconColor = "text-blue-400"; }
        if (kpi.bg.includes('emerald')) { bgClass = "bg-emerald-500/10 border-emerald-500/20"; textClass = "text-emerald-400"; iconColor = "text-emerald-400"; }
        if (kpi.bg.includes('red')) { bgClass = "bg-red-500/10 border-red-500/20"; textClass = "text-red-400"; iconColor = "text-red-400"; }
        if (kpi.bg.includes('amber')) { bgClass = "bg-amber-500/10 border-amber-500/20"; textClass = "text-amber-400"; iconColor = "text-amber-400"; }
        if (kpi.bg.includes('orange')) { bgClass = "bg-orange-500/10 border-orange-500/20"; textClass = "text-orange-400"; iconColor = "text-orange-400"; }

        return (
          <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${bgClass} shadow-sm transition-all hover:bg-opacity-20`}>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.title}</span>
              <span className={`text-xl font-black ${textClass} leading-none`}>{kpi.value}</span>
            </div>
            <div className={`p-2 rounded-md bg-slate-900/50`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
