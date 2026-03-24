import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Job, JobStatus, Priority } from "@/data/mockJobs";
import type { DocStatus } from "@/pages/Jobs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface KanbanBoardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  docStatuses?: Record<string, DocStatus>;
  role?: "Admin" | "Simon";
}

const columns: { status: JobStatus; dot: string; label: string }[] = [
  { status: "Logged Fault", dot: "bg-red-500", label: "Logged Fault" },
  { status: "Quote Sent", dot: "bg-amber-500", label: "Quote Sent" },
  { status: "Approved", dot: "bg-blue-500", label: "Approved" },
  { status: "Scheduled", dot: "bg-purple-500", label: "Scheduled" },
  { status: "Completed", dot: "bg-zinc-700", label: "Completed" },
  { status: "Invoiced", dot: "bg-zinc-500", label: "Invoiced" },
];

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-600 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-600 text-white",
};

export function KanbanBoard({ jobs, onSelectJob, docStatuses = {}, role = "Admin" }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 min-w-[1200px] overflow-x-visible">
      {columns.map(col => {
        const colJobs = jobs.filter(j => j.status === col.status);
        return (
          <div key={col.status} className="flex-1 min-w-[200px] space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 pb-1 border-b border-border/40">
              <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/50">{col.label}</span>
              <span className="text-[10px] font-bold text-white/40 ml-auto">{colJobs.length}</span>
            </div>

            {/* Cards */}
            <div className="space-y-3 min-h-[400px]">
              {colJobs.map(job => {
                const isOverdue = job.scheduledDate && new Date(job.scheduledDate) < new Date() && job.status !== "Completed" && job.status !== "Invoiced";
                
                return (
                  <Card
                    key={job.id}
                    className={cn(
                      "p-3 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all space-y-3 relative overflow-hidden group bg-sidebar-accent/30 border-sidebar-border",
                      isOverdue && "border-red-500/50 ring-1 ring-red-500/20"
                    )}
                    onClick={() => onSelectJob(job)}
                  >
                    {/* Header row: Priority + Location */}
                    <div className="flex items-center justify-between">
                      <Badge className={cn(priorityColors[job.priority], "text-[9px] px-1.5 py-0 h-4 font-black rounded-sm border-none shadow-sm")}>
                        {job.priority}
                      </Badge>
                      <span className="text-[9px] font-black text-sidebar-foreground/40 uppercase tracking-tighter">
                        Inv: {job.inverterLocation || "E1"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase leading-tight truncate tracking-tight">
                        {job.contactName || "Direct Customer"}
                      </p>
                      <p className="text-xs font-bold leading-tight line-clamp-2 text-white/90">{job.siteName}</p>
                      <p className="text-[9px] text-sidebar-foreground/50 font-medium">
                        {job.inverterModel || "SMA CP 500U"}
                      </p>
                    </div>

                    <div className="py-2 border-t border-b border-white/5">
                      <p className="text-[10px] font-medium text-white/70 leading-relaxed">
                        <span className="text-sidebar-foreground/40 font-bold uppercase text-[9px]">Fault:</span> {job.reportedFault || "Overvoltage fault"}
                      </p>
                    </div>

                    {/* Engineer + Date (for Scheduled+) */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-white/80">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        🔧 {job.engineer || "TBD"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-sidebar-foreground/40">
                        <span className="h-2 w-2 rounded-full bg-sidebar-foreground/20" />
                        📅 {job.scheduledDate ? format(new Date(job.scheduledDate), "dd MMM yyyy") : "Pending"}
                      </div>
                    </div>

                    {/* Footer: RAMS/Report Icons + Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 -mx-3 -mb-3 px-3 h-10 bg-black/10">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          📎 RAMS {job.ramsStatus === "Approved" ? "✅" : "⚠️"}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          📄 Report {job.reportLink ? "✅" : "⚠️"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/5" onClick={(e) => { e.stopPropagation(); onSelectJob(job); }}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/5" onClick={(e) => { e.stopPropagation(); onSelectJob(job); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        {role !== "Simon" && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500/40 hover:text-red-500 hover:bg-red-500/5" onClick={(e) => { e.stopPropagation(); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              {colJobs.length === 0 && (
                <div className="border border-dashed border-white/5 rounded-xl h-24 flex items-center justify-center bg-black/5">
                  <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">No Jobs</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
