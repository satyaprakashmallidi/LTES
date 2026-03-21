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
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Job, JobStatus, Priority } from "@/data/mockJobs";
import { engineers } from "@/data/mockJobs";

type CalendarViewMode = "month" | "week" | "today";

interface CalendarViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCreateJob?: (prefillDate: string) => void;
}

const statusColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600",
  "Quote Sent": "bg-amber-500",
  "Approved": "bg-blue-600",
  "In Progress": "bg-purple-600",
  "Completed": "bg-green-600",
  "Invoiced": "bg-zinc-500",
};

const statusTextColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600 text-white",
  "Quote Sent": "bg-amber-500 text-white",
  "Approved": "bg-blue-600 text-white",
  "In Progress": "bg-purple-600 text-white",
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

export function CalendarView({ jobs, onSelectJob, onCreateJob }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [engineerFilter, setEngineerFilter] = useState("all");
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);

  const filteredJobs = useMemo(() => {
    if (engineerFilter === "all") return jobs;
    const eng = engineers.find(e => e.id === engineerFilter);
    return eng ? jobs.filter(j => j.engineer === eng.name) : jobs;
  }, [jobs, engineerFilter]);

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => setCurrentDate(prev => viewMode === "month" ? subMonths(prev, 1) : subWeeks(prev, 1));
  const goNext = () => setCurrentDate(prev => viewMode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1));

  const handleDayClick = (date: Date) => {
    const dayJobs = getJobsForDate(filteredJobs, date);
    if (dayJobs.length > 0) {
      setDayModalDate(date);
    } else if (onCreateJob) {
      onCreateJob(format(date, "yyyy-MM-dd"));
    }
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
          <div className="flex gap-0.5 border border-border rounded-md p-0.5">
            {(["month", "week", "today"] as CalendarViewMode[]).map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7 px-3"
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
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
                        {job.siteName.split(" - ")[0]} {job.engineer ? `(${getInitials(job.engineer)})` : ""}
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
                        <span className="text-sm font-medium flex-1 truncate">{job.siteName}</span>
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
                  style={{ borderLeftColor: `hsl(var(--${job.status === "Logged Fault" ? "destructive" : job.status === "In Progress" ? "primary" : "muted"}))` }}
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{job.engineer || "Unassigned"}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Day detail modal */}
      <Dialog open={!!dayModalDate} onOpenChange={v => { if (!v) setDayModalDate(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dayModalDate && format(dayModalDate, "EEEE, d MMMM yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {dayModalJobs.map(job => (
              <div
                key={job.id}
                className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer"
                onClick={() => { setDayModalDate(null); onSelectJob(job); }}
              >
                <span className={`h-3 w-3 rounded-full shrink-0 ${statusColors[job.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{job.siteName}</p>
                  <p className="text-xs text-muted-foreground">{job.engineer || "Unassigned"} • {job.id}</p>
                </div>
                <Badge className={`${priorityColors[job.priority]} text-[10px]`}>{job.priority}</Badge>
              </div>
            ))}
            {onCreateJob && dayModalDate && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => { setDayModalDate(null); onCreateJob(format(dayModalDate, "yyyy-MM-dd")); }}
              >
                + Schedule New Job
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
