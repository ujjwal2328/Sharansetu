"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { usePlanningStore } from "@/lib/state/planningStore";
import { mockPopulationZones, mockShelters, mockRoads } from "@/lib/services/mockData";

export default function ReportDialog() {
  const { scenarioState, planState } = usePlanningStore();
  const { assignments, intelligence } = planState;

  const handlePrint = () => {
    window.print();
  };

  const criticalRoutes = intelligence.bottlenecks.filter(b => b.status === 'CRITICAL_BOTTLENECK');

  return (
    <Dialog>
      <DialogTrigger className="w-full flex items-center justify-center gap-2 border-slate-300 border bg-white hover:bg-slate-50 text-sm font-medium text-slate-900 px-4 py-2 rounded-md shadow-sm transition-colors">
        <FileText className="h-4 w-4" />
        Generate Situation Report
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto printable-report">
        <DialogHeader className="print:hidden">
          <DialogTitle>Operational Situation Report</DialogTitle>
        </DialogHeader>

        <div className="p-6 bg-white space-y-6 text-slate-800" id="report-content">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SANKAT SETU</h1>
              <p className="text-sm text-slate-500">Intelligent Disaster Shelter & Evacuation Planning</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-amber-600">SITREP</h2>
              <p className="text-xs text-slate-500">{new Date().toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 border-b pb-1">1. Situation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 font-semibold text-xs">DISASTER SEVERITY</div>
                <div className="text-xl font-bold text-red-600">{scenarioState.disaster_severity}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 font-semibold text-xs">AFFECTED POP</div>
                <div className="text-xl font-bold">{mockPopulationZones.reduce((s, z) => s + z.population, 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 font-semibold text-xs">UNASSIGNED SHORTFALL</div>
                <div className="text-xl font-bold text-red-600">{planState.unassigned_population.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded">
                <div className="text-slate-500 font-semibold text-xs">EVAC COVERAGE</div>
                <div className="text-xl font-bold text-blue-600">{planState.coverage_percentage}%</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 border-b pb-1">2. Critical Issues & Recommendations</h3>
            <ul className="list-disc pl-5 text-sm space-y-2">
              {criticalRoutes.length > 0 && (
                <li className="text-red-600 font-medium">
                  CRITICAL BOTTLENECKS: {criticalRoutes.map(r => r.route_id).join(', ')}. Avoid additional routing through these corridors.
                </li>
              )}
              {intelligence.critical_shelters.length > 0 && (
                <li className="text-amber-600 font-medium">
                  SHELTER OVERLOAD WARNING: {intelligence.critical_shelters.map(id => mockShelters.find(s=>s.id === id)?.name).join(', ')} are projected to exceed 95% capacity.
                </li>
              )}
              {planState.unassigned_population > 0 && (
                <li className="text-red-700 font-bold">
                  ACTION REQUIRED: {planState.unassigned_population.toLocaleString()} people remain unassigned due to capacity shortfalls. Activate reserve shelters immediately.
                </li>
              )}
              {planState.unassigned_population === 0 && intelligence.critical_shelters.length === 0 && (
                <li className="text-emerald-700 font-medium">No immediate capacity or routing crises detected. Continue monitoring.</li>
              )}
            </ul>
          </div>

          <div className="overflow-x-auto">
            <h3 className="font-bold text-lg mb-2 border-b pb-1">3. Assignment Summary</h3>
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-2 border">Zone</th>
                  <th className="p-2 border">Priority</th>
                  <th className="p-2 border">Target Shelter</th>
                  <th className="p-2 border">Population</th>
                  <th className="p-2 border">Est. Time</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => {
                  const zone = mockPopulationZones.find(z => z.id === a.zone_id);
                  const shelter = mockShelters.find(s => s.id === a.shelter_id);
                  return (
                    <tr key={i} className={`border-b ${a.status === 'UNASSIGNED' ? 'bg-red-50' : ''}`}>
                      <td className="p-2 border font-medium">{zone?.name || a.zone_id}</td>
                      <td className="p-2 border">{zone?.priority_level}</td>
                      <td className="p-2 border font-medium">{shelter?.name || 'UNASSIGNED'}</td>
                      <td className="p-2 border font-bold">{a.assigned_population}</td>
                      <td className="p-2 border">{a.estimated_travel_time_mins > 0 ? `${a.estimated_travel_time_mins} min` : '-'}</td>
                      <td className={`p-2 border font-semibold ${a.status === 'UNASSIGNED' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {a.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 print:hidden">
          <Button onClick={handlePrint} className="bg-blue-700 hover:bg-blue-800">
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
