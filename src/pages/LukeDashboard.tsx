import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useJobs, useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanBoard } from "@/components/jobs/KanbanBoard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  FilterX, 
  ChevronLeft, 
  ChevronRight,
  User,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format, startOfWeek, addDays, isSameDay, isSameWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { CalendarView } from "@/components/jobs/CalendarView";
import Inventory from "@/pages/Inventory";
import Analytics from "@/pages/Analytics";
import type { Job } from "@/data/mockJobs";

export default function LukeDashboard() {
  const { data: dbJobs = [], isLoading } = useJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Combine DB jobs with shared initial mock data
  const jobs = useMemo(() => {
    // If we have DB jobs, use them. The useJobs hook already falls back to initialJobs if empty.
    return dbJobs;
  }, [dbJobs]);

  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/calendar")) return "Calendar";
    if (path.includes("/inventory")) return "Inventory";
    if (path.includes("/team")) return "Team";
    if (path.includes("/analytics")) return "Analytics";
    return "Dashboard";
  }, [location.pathname]);

  const [search, setSearch] = useState("");
  const [engineerFilter, setEngineerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [myJobsOnly, setMyJobsOnly] = useState(false);
  
  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Stats calculations
  const highPriorityCount = jobs.filter(j => j.priority === "HIGH").length;
  const todayJobsCount = jobs.filter(j => j.scheduledDate === format(new Date(), "yyyy-MM-dd")).length;
  const completedThisWeek = jobs.filter(j => {
    if (j.status !== "Completed" && j.status !== "Invoiced") return false;
    return j.scheduledDate && isSameWeek(new Date(j.scheduledDate), new Date(), { weekStartsOn: 1 });
  }).length;
  const totalActive = jobs.filter(j => j.status !== "Invoiced").length;
  const awaitingInvoice = jobs.filter(j => j.status === "Completed").length;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.siteName.toLowerCase().includes(search.toLowerCase()) || 
                         job.id.toLowerCase().includes(search.toLowerCase()) ||
                         job.contactName.toLowerCase().includes(search.toLowerCase());
    const matchesEngineer = engineerFilter === "all" || job.engineer === engineerFilter;
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter;
    return matchesSearch && matchesEngineer && matchesPriority;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const handleSaveJob = (job: Job) => {
    const isNew = !jobs.find(j => j.id === job.id);
    if (isNew) {
      createMutation.mutate(job);
    } else {
      updateMutation.mutate({ id: job.id, updates: job });
    }
  };

  if (isLoading) return <div className="p-8">Loading Luke's Command Center...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case "Calendar":
        return (
          <div className="p-6">
            <CalendarView jobs={jobs} onSelectJob={handleSelectJob} />
          </div>
        );
      case "Inventory":
        return (
          <div className="p-6">
            <Inventory hideHeader={true} />
          </div>
        );
      case "Analytics":
        return (
          <div className="p-6">
            <Analytics hideHeader={true} />
          </div>
        );
      case "Team":
        return (
          <div className="p-12 text-center text-slate-400">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-white">Team Management</h2>
            <p>Team view is currently under development.</p>
          </div>
        );
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-red-500 p-4 rounded-xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-red-500/80 mb-1">High Priority</p>
                <p className="text-2xl font-black text-white">{highPriorityCount}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-amber-500 p-4 rounded-xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-amber-500/80 mb-1">Today's Jobs</p>
                <p className="text-2xl font-black text-white">{todayJobsCount}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-green-500 p-4 rounded-xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-green-500/80 mb-1">Completed Week</p>
                <p className="text-2xl font-black text-white">{completedThisWeek}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-blue-500 p-4 rounded-xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-blue-500/80 mb-1">Total Active</p>
                <p className="text-2xl font-black text-white">{totalActive}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-slate-400 p-4 rounded-xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Awaiting Invoice</p>
                <p className="text-2xl font-black text-white">{awaitingInvoice}</p>
              </div>
            </div>

            {/* Filters */}
            <Card className="p-4 bg-white/5 backdrop-blur-sm border-white/10 border-dashed">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search jobs, customers, or sites..." 
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Engineer" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                    <SelectItem value="all">All Engineers</SelectItem>
                    <SelectItem value="Terry Morris">Terry Morris</SelectItem>
                    <SelectItem value="Jason">Jason</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="HIGH">🔴 HIGH</SelectItem>
                    <SelectItem value="MEDIUM">🟡 MEDIUM</SelectItem>
                    <SelectItem value="LOW">🟢 LOW</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-md border border-white/10">
                  <Checkbox 
                    id="my-jobs" 
                    checked={myJobsOnly} 
                    onCheckedChange={(checked) => setMyJobsOnly(checked as boolean)} 
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                  />
                  <label htmlFor="my-jobs" className="text-sm font-medium leading-none cursor-pointer text-slate-300">
                    My Jobs Only
                  </label>
                </div>

                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => {
                  setSearch("");
                  setEngineerFilter("all");
                  setPriorityFilter("all");
                }}>
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>

                <Button className="ml-auto bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  NEW JOB
                </Button>
              </div>
            </Card>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-4 no-scrollbar">
              <KanbanBoard 
                jobs={filteredJobs} 
                onSelectJob={handleSelectJob} 
              />
            </div>


          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar">
      {/* Top Header Section */}
      <div className="bg-sidebar border-b border-sidebar-border px-6 py-4 flex items-center justify-between sticky top-0 z-20 h-16">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:bg-white/5" />
          <h1 className="text-lg font-bold text-white tracking-tight">
            {activeTab === "Dashboard" ? "Luke's Command Center" : `Luke's Dashboard / ${activeTab}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-white">Luke Morris</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Director</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#2c3344] flex items-center justify-center border border-sidebar-border shadow-inner">
            <User className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {renderContent()}
      </div>

      <CreateJobWizard 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSave={handleSaveJob} 
        allJobs={jobs}
      />

      <JobDetailsModal 
        job={selectedJob} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        onEdit={(job) => { setSelectedJob(job); setCreateOpen(true); }}
      />
    </div>
  );
}
