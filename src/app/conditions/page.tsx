"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Activity, Droplets, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { mockSensorData, SensorLocation } from "@/lib/services/sensorData";
import { Skeleton } from "@/components/ui/skeleton";

import Header from "@/components/layout/Header";
import MapToolbar from "@/components/map/MapToolbar";
import LayerManager from "@/components/map/LayerManager";
import MapLegend from "@/components/map/MapLegend";
import BottomBar from "@/components/dashboard/BottomBar";

const DynamicMap = dynamic(() => import("@/components/map/MapContent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full bg-slate-800" />,
});

const trendColors = {
  INCREASING: '#ef4444',
  DECREASING: '#22c55e',
  STABLE: '#3b82f6'
};

const trendIcons = {
  INCREASING: <TrendingUp className="h-3 w-3 text-red-500" />,
  DECREASING: <TrendingDown className="h-3 w-3 text-emerald-500" />,
  STABLE: <Minus className="h-3 w-3 text-blue-500" />
};

export default function ConditionsPage() {
  const [liveData, setLiveData] = useState<SensorLocation[]>(mockSensorData);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prevData => prevData.map(sensor => {
        const fluctuation = (Math.random() * 0.2) - 0.1;
        let newLevel = sensor.currentLevel + fluctuation;
        newLevel = Math.max(0, newLevel);
        
        const newData24h = [...sensor.data24h];
        if (newData24h.length > 0) {
          newData24h[newData24h.length - 1] = {
            ...newData24h[newData24h.length - 1],
            level: Number(newLevel.toFixed(1))
          };
        }

        let newTrend: 'INCREASING' | 'DECREASING' | 'STABLE' = sensor.trend;
        if (fluctuation > 0.05) newTrend = 'INCREASING';
        else if (fluctuation < -0.05) newTrend = 'DECREASING';
        else newTrend = 'STABLE';

        return {
          ...sensor,
          currentLevel: Number(newLevel.toFixed(1)),
          trend: newTrend,
          data24h: newData24h
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleZoomIn = useCallback(() => (window as any).__mapZoomIn?.(), []);
  const handleZoomOut = useCallback(() => (window as any).__mapZoomOut?.(), []);
  const handleLocate = useCallback(() => (window as any).__mapReset?.(), []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* FULL-VIEWPORT MAP CANVAS */}
      <div className="absolute inset-0 z-0">
        <DynamicMap 
          highlightFloodZones={true}
          forcedLayers={{
            floodZones: true,
            shelters: false,
            population: false,
            routes: false,
            blockedRoads: false,
            riskZones: false
          }}
        />
      </div>

      {/* TOP HEADER */}
      <Header />

      {/* FULL HEIGHT CONDITIONS PANEL */}
      <div className="absolute top-[80px] left-4 bottom-[36px] w-[420px] z-30 flex flex-col bg-slate-900/85 backdrop-blur-xl rounded-xl border border-slate-700/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-left-8 duration-500">
        
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/40 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Changing Conditions
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">Live Telemetry Active</span>
            </p>
          </div>
        </div>

        {/* Data List */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent p-4 space-y-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-2">
            Past 24h Water Level Trends
          </div>

          {liveData.map(sensor => {
            const isDanger = sensor.currentLevel >= sensor.dangerThreshold;
            const color = trendColors[sensor.trend];

            return (
              <div key={sensor.id} className="border border-slate-700/60 rounded-lg p-3.5 bg-slate-800/60 shadow-lg hover:bg-slate-800/80 transition-colors">
                {/* Sensor Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-sm text-white">{sensor.name}</span>
                      {isDanger && (
                        <div className="flex items-center gap-1 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Critical</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      {trendIcons[sensor.trend]}
                      <span className="font-medium">{sensor.statusMessage}</span>
                    </div>
                  </div>
                  <div className="text-right bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                    <div className={`font-mono font-bold text-lg ${isDanger ? 'text-red-400' : 'text-slate-200'}`}>
                      {sensor.currentLevel.toFixed(1)}m
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Limit: {sensor.dangerThreshold.toFixed(1)}m
                    </div>
                  </div>
                </div>

                {/* Recharts Sparkline */}
                <div className="h-[90px] w-full mt-4 -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensor.data24h} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide={true} />
                      <Tooltip 
                        contentStyle={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#f8fafc', fontWeight: 700 }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                        formatter={(value: any) => [`${value}m`, 'Water Level']}
                      />
                      {/* Danger Threshold Line */}
                      <ReferenceLine y={sensor.dangerThreshold} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} opacity={0.6} />
                      <Line 
                        type="monotone" 
                        dataKey="level" 
                        stroke={color} 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING MAP CONTROLS */}
      <MapToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onLocate={handleLocate} />
      <LayerManager />
      <MapLegend />
      <BottomBar />

    </div>
  );
}
