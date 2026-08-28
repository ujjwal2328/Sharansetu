"use client";

import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import AlertTicker from "@/components/dashboard/AlertTicker";
import FloatingOpsPanel from "@/components/dashboard/FloatingOpsPanel";
import FloatingIntelPanel from "@/components/dashboard/FloatingIntelPanel";
import FloatingTimeline from "@/components/dashboard/FloatingTimeline";
import BottomBar from "@/components/dashboard/BottomBar";
import MapToolbar from "@/components/map/MapToolbar";
import LayerManager from "@/components/map/LayerManager";
import MapLegend from "@/components/map/MapLegend";
import MapSearch from "@/components/map/MapSearch";
import { Skeleton } from "@/components/ui/skeleton";
import KpiRow from "@/components/dashboard/KpiRow";

import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockShelters, mockRoads } from "@/lib/services/mockData";
import { generateEvacuationPlan } from "@/lib/services/evacuationEngine";

const DynamicMap = dynamic(() => import("@/components/map/MapContent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export default function Dashboard() {
  const { scenarioState, planState, setPlanState, addTimelineEvent, timelineEvents, userRole } = usePlanningStore();

  // Initialize baseline plan on mount
  useEffect(() => {
    if (planState.assignments.length === 0) {
      const initialPlan = generateEvacuationPlan(scenarioState, mockPopulationZones, mockShelters, mockRoads);
      setPlanState(initialPlan);

      if (timelineEvents.length <= 1) {
        addTimelineEvent({
          type: 'SCENARIO_APPLIED',
          message: 'Flood scenario activated — Severity: HIGH',
          details: 'Raipur Urban Flood prototype scenario loaded.'
        });
        addTimelineEvent({
          type: 'PLAN_RECALCULATED',
          message: 'Baseline evacuation plan generated',
          details: `${initialPlan.assignments.length} assignments computed across ${mockPopulationZones.length} zones.`
        });
        if (initialPlan.unassigned_population > 0) {
          addTimelineEvent({
            type: 'CAPACITY_SHORTFALL_DETECTED',
            message: `${initialPlan.unassigned_population.toLocaleString()} people unassigned`,
            details: 'Insufficient accessible shelter capacity for full coverage.'
          });
        }
      }
    }
  }, []);

  const handleMapSearch = useCallback((lat: number, lng: number, zoom?: number) => {
    (window as any).__mapFlyTo?.(lat, lng, zoom);
  }, []);

  const handleZoomIn = useCallback(() => (window as any).__mapZoomIn?.(), []);
  const handleZoomOut = useCallback(() => (window as any).__mapZoomOut?.(), []);
  const handleLocate = useCallback(() => (window as any).__mapReset?.(), []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* FULL-VIEWPORT MAP CANVAS */}
      <div className="absolute inset-0 z-0">
        <DynamicMap />
      </div>

      {/* FLOATING OVERLAYS — all absolute/z-indexed over the map */}

      {/* Top: Header (both modes) */}
      <Header />

      {/* ====== CITIZEN MODE ====== */}
      {userRole === 'citizen' && (
        <>
          {/* Left: Shelter Finder */}
          <FloatingOpsPanel />
        </>
      )}

      {/* ====== AUTHORITY MODE ====== */}
      {userRole === 'authority' && (
        <>
          {/* Top Center: KPI Row */}
          <div className="absolute top-[100px] left-[320px] right-[340px] z-30 transition-all">
            <KpiRow />
          </div>

          {/* Right: Intelligence Panel */}
          <FloatingIntelPanel />

          {/* Bottom-left: Timeline */}
          <FloatingTimeline />
        </>
      )}

      {/* Shared: Map Controls (both modes) */}
      <MapToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onLocate={handleLocate} />
      <MapSearch onSelect={handleMapSearch} />

      {/* Bottom-right: Layer Manager + Legend (both modes) */}
      <LayerManager />
      <MapLegend />

      {/* Bottom: Status Bar (both modes) */}
      <BottomBar />
    </div>
  );
}
