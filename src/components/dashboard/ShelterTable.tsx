"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shelter } from "@/types";

interface ShelterTableProps {
  shelters: Shelter[];
}

export default function ShelterTable({ shelters }: ShelterTableProps) {
  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Shelter Name</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="w-[150px]">Utilization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Accessibility</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shelters.map((shelter) => {
            const utilization = Math.round((shelter.current_occupancy / shelter.total_capacity) * 100);
            
            return (
              <TableRow key={shelter.id}>
                <TableCell className="font-medium">{shelter.name}</TableCell>
                <TableCell>{shelter.total_capacity.toLocaleString()}</TableCell>
                <TableCell>{shelter.current_occupancy.toLocaleString()}</TableCell>
                <TableCell className="font-bold">{shelter.available_capacity.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={utilization} className={`h-2 ${utilization > 90 ? 'bg-red-200 *:bg-red-600' : utilization > 75 ? 'bg-amber-200 *:bg-amber-500' : 'bg-emerald-200 *:bg-emerald-500'}`} />
                    <span className="text-xs text-slate-500 w-8">{utilization}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={shelter.status === 'FULL' ? 'destructive' : shelter.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                    {shelter.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={shelter.accessibility_status === 'ACCESSIBLE' ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-600'}>
                    {shelter.accessibility_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
