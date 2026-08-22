import { EvacuationAssignment } from "@/types";
import { ChevronDown, ChevronUp, Route, Clock, Users, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ExplainableAssignmentCardProps {
  assignment: EvacuationAssignment;
  zoneName: string;
  shelterName?: string;
  altShelterName?: string;
}

export default function ExplainableAssignmentCard({ assignment, zoneName, shelterName, altShelterName }: ExplainableAssignmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isUnassigned = assignment.status === 'UNASSIGNED';

  return (
    <div className="border rounded-md mb-2 bg-white overflow-hidden shadow-sm transition-all">
      <div 
        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${isUnassigned ? 'bg-red-50 hover:bg-red-100/50' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">{zoneName}</span>
            {isUnassigned ? (
              <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">UNASSIGNED</Badge>
            ) : (
              <ArrowRightIcon className="h-3 w-3 text-slate-400" />
            )}
            {!isUnassigned && <span className="font-medium text-blue-700 text-sm">{shelterName}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {assignment.assigned_population}</span>
            {!isUnassigned && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {assignment.estimated_travel_time_mins}m</span>}
          </div>
        </div>
        <div>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-3 bg-slate-50 border-t text-sm">
          {isUnassigned ? (
            <div className="space-y-2">
              <div className="font-semibold text-red-700 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> 
                Infeasible Evacuation
              </div>
              <p className="text-slate-600 text-xs">{assignment.shortfall_reason}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">Why this assignment?</div>
                <div className="space-y-1">
                  {assignment.score?.breakdown.map((reason, idx) => (
                    <div key={idx} className={`text-xs ${reason.startsWith('✓') ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {assignment.alternative_shelter_id && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-1">Alternative Evaluated</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <Route className="h-3 w-3" /> {altShelterName} ({assignment.alternative_travel_time} min)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Primary selected due to superior composite score (Capacity + Distance).
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
