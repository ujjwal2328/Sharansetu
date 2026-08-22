"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scenario, RoadCondition, Shelter } from "@/types";
import { AlertTriangle, Map, RefreshCw } from "lucide-react";

interface ScenarioControlsProps {
  scenario: Scenario;
  roads: RoadCondition[];
  shelters: Shelter[];
  onRecalculate: () => void;
  onReset: () => void;
  onSimulateBlockRoad: (roadId: string) => void;
  onIncreaseShelterOccupancy: (shelterId: string) => void;
}

export default function ScenarioControls({
  scenario,
  roads,
  shelters,
  onRecalculate,
  onReset,
  onSimulateBlockRoad,
  onIncreaseShelterOccupancy
}: ScenarioControlsProps) {
  const openRoads = roads.filter(r => r.status !== 'BLOCKED');
  const availableShelters = shelters.filter(s => s.status !== 'FULL');

  return (
    <Card className="h-full flex flex-col border-r shadow-none rounded-none">
      <CardHeader className="bg-slate-50 border-b py-4">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
          <Map className="h-5 w-5 text-blue-600" />
          Scenario & Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 space-y-6">
        
        {/* Scenario Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Situation</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-500">Disaster Type</div>
            <div className="font-medium">{scenario.disaster_type}</div>
            <div className="text-slate-500">Severity</div>
            <div>
              <Badge variant="destructive">{scenario.severity}</Badge>
            </div>
            <div className="text-slate-500">Horizon</div>
            <div className="font-medium">{scenario.planning_horizon_hours} hours</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Planning Actions</h3>
          <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={onRecalculate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recalculate Evacuation Plan
          </Button>
          <Button variant="outline" className="w-full" onClick={onReset}>
            Reset Scenario
          </Button>
        </div>

        {/* Condition Simulation */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Simulate Conditions
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-medium">Block a Road</label>
            <div className="flex gap-2">
              <Select onValueChange={onSimulateBlockRoad}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route to block" />
                </SelectTrigger>
                <SelectContent>
                  {openRoads.map(road => (
                    <SelectItem key={road.id} value={road.id}>{road.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium">Increase Shelter Occupancy</label>
            <div className="flex gap-2">
              <Select onValueChange={onIncreaseShelterOccupancy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shelter" />
                </SelectTrigger>
                <SelectContent>
                  {availableShelters.map(shelter => (
                    <SelectItem key={shelter.id} value={shelter.id}>{shelter.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}
