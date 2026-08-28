"use client";

import { useState, useEffect } from "react";
import { Activity, Droplets, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { mockSensorData, SensorLocation } from "@/lib/services/sensorData";

const trendColors = {
  INCREASING: '#ef4444', // Red
  DECREASING: '#22c55e', // Green
  STABLE: '#3b82f6'      // Blue
};

const trendIcons = {
  INCREASING: <TrendingUp className="h-3 w-3 text-red-500" />,
  DECREASING: <TrendingDown className="h-3 w-3 text-emerald-500" />,
  STABLE: <Minus className="h-3 w-3 text-blue-500" />
};

export default function FloatingConditionsPanel() {
  const [expanded, setExpanded] = useState(true);
  const [liveData, setLiveData] = useState<SensorLocation[]>(mockSensorData);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prevData => prevData.map(sensor => {
        // Random fluctuation between -0.1 and 0.1
        const fluctuation = (Math.random() * 0.2) - 0.1;
        let newLevel = sensor.currentLevel + fluctuation;
        // Keep it realistic (don't drop below 0)
        newLevel = Math.max(0, newLevel);
        
        // Update the last data point in the sparkline array
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
    }, 3000); // update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-[96px] right-[340px] z-30 w-[300px] flex flex-col" style={{ maxHeight: 'calc(100vh - 150px)' }}>
      {/* Header */}
      <div
        className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-t-lg border border-slate-700/50 select-none shadow-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Changing Conditions</span>
          
          {/* Live pulsing dot */}
          <div className="flex items-center gap-1.5 ml-2 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[8px] font-bold text-red-400 tracking-wider">LIVE</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </div>

      {/* Content */}
      {expanded && (
        <div className="bg-white/95 backdrop-blur-sm border border-t-0 border-slate-200 rounded-b-lg shadow-2xl overflow-y-auto flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <div className="p-3 text-[10px] text-slate-500 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
            <span>Past 24h Water Level Trends</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Live Sync Active
            </span>
          </div>

          <div className="p-2 space-y-3">
            {liveData.map(sensor => {
              const isDanger = sensor.currentLevel >= sensor.dangerThreshold;
              const color = trendColors[sensor.trend];

              return (
                <div key={sensor.id} className="border border-slate-200 rounded-lg p-2.5 bg-white shadow-sm">
                  {/* Sensor Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-bold text-xs text-slate-800">{sensor.name}</span>
                        {isDanger && <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        {trendIcons[sensor.trend]}
                        {sensor.statusMessage}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold text-sm ${isDanger ? 'text-red-600' : 'text-slate-800'}`}>
                        {sensor.currentLevel.toFixed(1)}m
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Limit: {sensor.dangerThreshold.toFixed(1)}m
                      </div>
                    </div>
                  </div>

                  {/* Recharts Sparkline */}
                  <div className="h-[70px] w-full mt-2 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensor.data24h} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <XAxis dataKey="time" hide={true} />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide={true} />
                        <Tooltip 
                          contentStyle={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                          labelStyle={{ color: '#64748b', marginBottom: '2px' }}
                          formatter={(value: any) => [`${value}m`, 'Water Level']}
                        />
                        {/* Danger Threshold Line */}
                        <ReferenceLine y={sensor.dangerThreshold} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} opacity={0.5} />
                        <Line 
                          type="monotone" 
                          dataKey="level" 
                          stroke={color} 
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
                          isAnimationActive={false} // Disable animation for instant render in hackathon
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
