export interface SensorDataPoint {
  time: string;
  level: number;
}

export interface SensorLocation {
  id: string;
  name: string;
  type: 'RIVER' | 'LAKE' | 'DRAIN';
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  currentLevel: number;
  dangerThreshold: number;
  data24h: SensorDataPoint[];
  statusMessage: string;
}

function generateData(startLevel: number, endLevel: number, points: number, noise: number): SensorDataPoint[] {
  const data: SensorDataPoint[] = [];
  const step = (endLevel - startLevel) / (points - 1);
  const now = new Date();
  
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - 1 - i) * 2 * 60 * 60 * 1000); // 2 hours per point
    let level = startLevel + (step * i);
    // Add random noise, but ensure the last point is exactly endLevel
    if (i !== 0 && i !== points - 1) {
       level += (Math.random() * noise * 2) - noise;
    }
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: Math.round(level * 10) / 10
    });
  }
  return data;
}

export const mockSensorData: SensorLocation[] = [
  {
    id: 'sensor-1',
    name: 'Pandri',
    type: 'DRAIN',
    trend: 'INCREASING',
    currentLevel: 4.2,
    dangerThreshold: 4.5,
    statusMessage: 'Rising rapidly (+0.8m / 4hr)',
    data24h: generateData(2.1, 4.2, 12, 0.2) // From 2.1m to 4.2m over 24h
  },
  {
    id: 'sensor-2',
    name: 'Maharajbandh',
    type: 'LAKE',
    trend: 'DECREASING',
    currentLevel: 2.8,
    dangerThreshold: 5.0,
    statusMessage: 'Receding (-0.5m / 4hr)',
    data24h: generateData(4.8, 2.8, 12, 0.3) // From 4.8m down to 2.8m
  },
  {
    id: 'sensor-3',
    name: 'Telibandha',
    type: 'LAKE',
    trend: 'STABLE',
    currentLevel: 3.5,
    dangerThreshold: 4.2,
    statusMessage: 'Stable (fluctuating)',
    data24h: generateData(3.4, 3.5, 12, 0.4) // Mostly flat around 3.5m with noise
  }
];
