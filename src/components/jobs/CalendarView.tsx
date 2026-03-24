import { useState, useMemo } from "react";
import {
  format,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addWeeks, subWeeks,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, MoreHorizontal, Calendar as CalendarIcon, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Job, JobStatus, Priority } from "@/data/mockJobs";
import { engineers } from "@/data/mockJobs";

type CalendarViewMode = "month" | "week" | "today";

interface CalendarViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCreateJob?: (prefillDate: string) => void;
  onEditJob?: (job: Job) => void;
  role?: "Admin" | "Simon";
}

const statusColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600",
  "Quote Sent": "bg-amber-500",
  "Approved": "bg-blue-600",
  "Scheduled": "bg-purple-600",
  "In Progress": "bg-blue-500",
  "Completed": "bg-green-600",
  "Invoiced": "bg-zinc-500",
};

const statusTextColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600 text-white",
  "Quote Sent": "bg-amber-500 text-white",
  "Approved": "bg-blue-600 text-white",
  "Scheduled": "bg-purple-600 text-white",
  "In Progress": "bg-blue-500 text-white",
  "Completed": "bg-green-600 text-white",
  "Invoiced": "bg-zinc-500 text-white",
};

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-600 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-600 text-white",
};

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function getJobsForDate(jobs: Job[], date: Date): Job[] {
  const dateStr = format(date, "yyyy-MM-dd");
  return jobs.filter(j => j.scheduledDate === dateStr);
}

export function CalendarView({ jobs, onSelectJob, onCreateJob, onEditJob, role = "Admin" }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [engineerFilter, setEngineerFilter] = useState("all");
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);

  const isSimon = role === "Simon";

  const filteredJobs = useMemo(() => {
    if (engineerFilter === "all") return jobs;
    const eng = engineers.find(e => e.id === engineerFilter);
    return eng ? jobs.filter(j => j.engineer === eng.name) : jobs;
  }, [jobs, engineerFilter]);

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => setCurrentDate(prev => viewMode === "month" ? subMonths(prev, 1) : subWeeks(prev, 1));
  const goNext = () => setCurrentDate(prev => viewMode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1));

  const handleDayClick = (date: Date) => {
    setDayModalDate(date);
  };

  // Month view data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Week view data
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayJobs = getJobsForDate(filteredJobs, currentDate);
  const dayModalJobs = dayModalDate ? getJobsForDate(filteredJobs, dayModalDate) : [];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="text-lg font-semibold">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : viewMode === "week"
              ? `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`
              : format(currentDate, "EEEE, d MMMM yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={engineerFilter} onValueChange={setEngineerFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All Engineers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engineers</SelectItem>
              {engineers.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex bg-[#1e293b]/50 border border-white/10 rounded-full p-1 relative">
            {(["month", "week", "today"] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "relative z-10 px-4 py-1 text-xs font-bold transition-colors duration-200 uppercase tracking-tight",
                  viewMode === mode ? "text-slate-900" : "text-slate-400 hover:text-white"
                )}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="calendarMode"
                    className="absolute inset-0 bg-primary rounded-full shadow-lg"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
                <span className="relative z-20">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Day names header */}
          <div className="grid grid-cols-7 bg-muted/50">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 border-b border-border">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              const dayJobs = getJobsForDate(filteredJobs, day);
              const inMonth = isSameMonth(day, currentDate);
              const today = isToday(day);
              return (
                <div
                  key={i}
                  className={`min-h-[90px] border-b border-r border-border p-1 cursor-pointer hover:bg-muted/30 transition-colors ${
                    !inMonth ? "opacity-40" : ""
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        today ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayJobs.slice(0, 3).map(job => (
                      <button
                        key={job.id}
                        className={`w-full text-left rounded px-1 py-0.5 text-[10px] text-white truncate ${statusColors[job.status]}`}
                        onClick={e => { e.stopPropagation(); onSelectJob(job); }}
                      >
                        {job.scheduledTime ? `${job.scheduledTime} ` : ""}{job.siteName.split(" - ")[0]} {job.engineer ? `(${getInitials(job.engineer)})` : ""}
                      </button>
                    ))}
                    {dayJobs.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">+{dayJobs.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="space-y-2">
          {weekDays.map(day => {
            const dayJobs = getJobsForDate(filteredJobs, day);
            const today = isToday(day);
            return (
              <div key={day.toISOString()} className={`rounded-lg border border-border ${today ? "ring-1 ring-primary" : ""}`}>
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 border-b border-border">
                  <span className={`text-sm font-semibold ${today ? "text-primary" : ""}`}>
                    {format(day, "EEE")}
                  </span>
                  <span className={`text-lg font-bold ${today ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </span>
                  <span className="text-xs text-muted-foreground">{dayJobs.length} job{dayJobs.length !== 1 ? "s" : ""}</span>
                </div>
                {dayJobs.length === 0 ? (
                  <div
                    className="px-3 py-4 text-xs text-muted-foreground text-center cursor-pointer hover:bg-muted/20"
                    onClick={() => onCreateJob?.(format(day, "yyyy-MM-dd"))}
                  >
                    No jobs — click to schedule
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {dayJobs.map(job => (
                      <div
                        key={job.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => onSelectJob(job)}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusColors[job.status]}`} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">{job.siteName}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{job.scheduledTime || "No Time Set"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{job.engineer || "Unassigned"}</span>
                        <Badge className={`${priorityColors[job.priority]} text-[10px] px-1.5 py-0`}>{job.priority}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Today View */}
      {viewMode === "today" && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-5xl font-bold">{format(currentDate, "d")}</p>
            <p className="text-lg text-muted-foreground">{format(currentDate, "EEEE, MMMM yyyy")}</p>
          </div>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-center">
            <p className="text-sm font-semibold">{todayJobs.length} job{todayJobs.length !== 1 ? "s" : ""} scheduled today</p>
          </div>
          {todayJobs.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No jobs scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {todayJobs.map(job => (
                <Card
                  key={job.id}
                  className={`p-4 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all border-l-4`}
                  style={{ borderLeftColor: `hsl(var(--${job.status === "Logged Fault" ? "destructive" : job.status === "Scheduled" ? "primary" : "muted"}))` }}
                  onClick={() => onSelectJob(job)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{job.id}</Badge>
                      <Badge className={priorityColors[job.priority] + " text-xs"}>{job.priority}</Badge>
                    </div>
                    <Badge className={statusTextColors[job.status] + " text-xs"}>{job.status}</Badge>
                  </div>
                  <p className="text-base font-semibold mb-1">{job.siteName}</p>
                  {job.reportedFault && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.reportedFault}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                      <span className="text-primary">{job.scheduledTime || "ALL DAY"}</span>
                      <span>•</span>
                      <span>{job.engineer || "Unassigned"}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Day detail modal */}
      <Dialog open={!!dayModalDate} onOpenChange={v => { if (!v) setDayModalDate(null); }}>
        <DialogContent className="max-w-md bg-sidebar border-sidebar-border text-white shadow-2xl p-0 overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-sidebar to-sidebar-accent/30">
            <DialogHeader className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary leading-none">
                  {dayModalDate && format(dayModalDate, "dd")}
                </span>
                <div className="flex flex-col">
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white leading-none">
                    {dayModalDate && format(dayModalDate, "MMMM yyyy")}
                  </DialogTitle>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/40 mt-1">
                    {dayModalDate && format(dayModalDate, "EEEE")}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">


              {/* Jobs List */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest px-1">
                  Scheduled Jobs ({dayModalJobs.length})
                </p>
                {dayModalJobs.length === 0 ? (
                  <div className="border border-dashed border-white/5 rounded-xl py-6 flex flex-col items-center justify-center bg-black/5">
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">No Jobs Scheduled</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {dayModalJobs.map(job => (
                      <div
                        key={job.id}
                        className="group relative flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-sidebar-accent/30 hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-all cursor-pointer"
                        onClick={() => { setDayModalDate(null); onSelectJob(job); }}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 shadow-sm ${statusColors[job.status]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-primary uppercase leading-tight truncate tracking-tight">
                            {job.contactName || "Direct Customer"}
                          </p>
                          <p className="text-sm font-bold text-white truncate leading-tight mt-0.5">{job.siteName}</p>
                          <p className="text-[10px] text-sidebar-foreground/50 font-medium flex items-center gap-1.5 mt-1 font-bold uppercase tracking-wider">
                            <span className="text-primary">{job.scheduledTime || "ALL DAY"}</span>
                            <span>•</span>
                            <span>{job.engineer || "TBD"}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${priorityColors[job.priority]} text-[9px] font-black rounded px-1.5 py-0 h-4 border-none shadow-sm`}>
                            {job.priority}
                          </Badge>
                          
                          {!isSimon && onEditJob && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-sidebar-foreground/40 hover:text-white hover:bg-white/5 p-0">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-sidebar border-sidebar-border text-white shadow-2xl min-w-[120px]">
                                <DropdownMenuItem 
                                  className="text-[10px] font-black uppercase tracking-widest focus:bg-white/5 focus:text-primary cursor-pointer gap-2"
                                  onClick={(e) => { e.stopPropagation(); setDayModalDate(null); onSelectJob(job); }}
                                >
                                  <FileText className="h-3 w-3" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-[10px] font-black uppercase tracking-widest focus:bg-white/5 focus:text-primary cursor-pointer gap-2"
                                  onClick={(e) => { e.stopPropagation(); setDayModalDate(null); onEditJob(job); }}
                                >
                                  <CalendarIcon className="h-3 w-3" />
                                  Reschedule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                {!isSimon && onCreateJob && dayModalDate && (
                  <Button
                    className="flex-1 bg-primary text-black font-black uppercase tracking-tight hover:bg-primary/90 shadow-xl shadow-primary/20 h-11"
                    onClick={() => { setDayModalDate(null); onCreateJob(format(dayModalDate, "yyyy-MM-dd")); }}
                  >
                    + Create Job
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className={`${(!isSimon && onCreateJob && dayModalDate) ? 'flex-1' : 'w-full'} text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/40 hover:text-white hover:bg-white/5 h-11`}
                  onClick={() => setDayModalDate(null)}
                >
                  Close Schedule
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
