import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Job, JobStatus, Priority } from "@/data/mockJobs";
import type { DocStatus } from "@/pages/Jobs";

interface KanbanBoardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  docStatuses?: Record<string, DocStatus>;
}

const columns: { status: JobStatus; dot: string; label: string }[] = [
  { status: "Logged Fault", dot: "bg-red-500", label: "Logged Fault" },
  { status: "Quote Sent", dot: "bg-amber-500", label: "Quote Sent" },
  { status: "Approved", dot: "bg-blue-500", label: "Approved" },
  { status: "In Progress", dot: "bg-purple-500", label: "In Progress" },
  { status: "Completed", dot: "bg-green-500", label: "Completed" },
  { status: "Invoiced", dot: "bg-zinc-400", label: "Invoiced" },
];

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-600 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-600 text-white",
};

function DocDot({ has, label }: { has: boolean; label: string }) {
  return (
    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${has ? "bg-green-500" : "bg-red-500"}`} />
      {label}
    </span>
  );
}

export function KanbanBoard({ jobs, onSelectJob, docStatuses = {} }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {columns.map(col => {
        const colJobs = jobs.filter(j => j.status === col.status);
        return (
          <div key={col.status} className="space-y-2">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 pb-1 border-b border-border">
              <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
              <span className="text-xs font-semibold uppercase tracking-wider">{col.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{colJobs.length}</span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[100px]">
              {colJobs.map(job => {
                const ds = docStatuses[job.id];
                return (
                  <Card
                    key={job.id}
                    className="p-3 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all space-y-2"
                    onClick={() => onSelectJob(job)}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{job.id}</Badge>
                      <Badge className={`${priorityColors[job.priority]} text-[10px] px-1.5 py-0`}>{job.priority}</Badge>
                    </div>

                    {/* Site name */}
                    <p className="text-sm font-semibold leading-tight">{job.siteName}</p>

                    {/* Fault - truncated */}
                    {job.reportedFault && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{job.reportedFault}</p>
                    )}

                    {/* Notes preview */}
                    {job.jobNotes && (
                      <p className="text-xs italic text-purple-400 line-clamp-1">{job.jobNotes}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="text-muted-foreground">
                        {job.engineer && <span>{job.engineer}</span>}
                        {job.engineer && job.scheduledDate && <span> • </span>}
                        {job.scheduledDate && <span>{job.scheduledDate}</span>}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {job.contractType === "Contract/SLA" ? "SLA" : "CHG"}
                      </Badge>
                      {job.accessCode && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 truncate max-w-[120px]">
                          🔑 {job.accessCode}
                        </Badge>
                      )}
                    </div>

                    {/* Document checklist */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                      <DocDot has={!!ds?.ra} label="RA" />
                      <DocDot has={!!ds?.ms} label="MS" />
                      <DocDot has={!!ds?.sheet} label="Sheet" />
                    </div>
                  </Card>
                );
              })}
              {colJobs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No jobs</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
