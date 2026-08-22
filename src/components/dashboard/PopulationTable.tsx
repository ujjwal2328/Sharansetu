"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PopulationZone, EvacuationAssignment } from "@/types";

interface PopulationTableProps {
  zones: PopulationZone[];
  assignments: EvacuationAssignment[];
}

export default function PopulationTable({ zones, assignments }: PopulationTableProps) {
  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Zone Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Population</TableHead>
            <TableHead>Demand</TableHead>
            <TableHead>Evac Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.map((zone) => {
            const zoneAssignments = assignments.filter(a => a.zone_id === zone.id);
            const totalAssigned = zoneAssignments.reduce((sum, a) => sum + a.assigned_population, 0);
            
            const isFullyEvacuated = totalAssigned >= zone.estimated_demand;
            const isPartiallyEvacuated = totalAssigned > 0 && !isFullyEvacuated;

            return (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">{zone.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    zone.priority_level === 'P1' ? 'border-red-500 text-red-700 bg-red-50' :
                    zone.priority_level === 'P2' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                    zone.priority_level === 'P3' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                    'border-blue-300 text-blue-700 bg-blue-50'
                  }>
                    {zone.priority_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={zone.risk_level === 'EXTREME' || zone.risk_level === 'HIGH' ? 'destructive' : 'secondary'}>
                    {zone.risk_level}
                  </Badge>
                </TableCell>
                <TableCell>{zone.population.toLocaleString()}</TableCell>
                <TableCell className="font-bold text-amber-700">{zone.estimated_demand.toLocaleString()}</TableCell>
                <TableCell>
                  {zone.estimated_demand === 0 ? (
                    <span className="text-sm text-slate-500">Not Required</span>
                  ) : isFullyEvacuated ? (
                    <Badge className="bg-emerald-500">Assigned</Badge>
                  ) : isPartiallyEvacuated ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Partial ({totalAssigned})</Badge>
                  ) : (
                    <span className="text-sm text-slate-400">Pending</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
