import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
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
  Trash2,
  LogOut,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format, startOfWeek, addDays, isSameDay, isSameWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { CalendarView } from "@/components/jobs/CalendarView";
import Inventory from "@/pages/Inventory";
import Analytics from "@/pages/Analytics";
import { TeamManagement } from "@/components/TeamManagement";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import type { Job } from "@/data/mockJobs";
import { engineers } from "@/data/mockJobs";

export default function LukeDashboard() {
  const { data: dbJobs = [], isLoading } = useJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const deleteMutation = useDeleteJob();
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteJobNumber, setDeleteJobNumber] = useState<string>("");
  const [prefillDate, setPrefillDate] = useState("");
  const [initialWizardStep, setInitialWizardStep] = useState(1);
  const [userData, setUserData] = useState<{ name: string; email: string }>({ name: "", email: "" });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Director",
          email: user.email || ""
        });
      }
    }
    getProfile();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.siteName.toLowerCase().includes(search.toLowerCase()) || 
                         job.id.toLowerCase().includes(search.toLowerCase()) ||
                         job.contactName.toLowerCase().includes(search.toLowerCase());
    const matchesEngineer = engineerFilter === "all" || job.engineer === engineerFilter;
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter;
    return matchesSearch && matchesEngineer && matchesPriority;
  });

  // Stats calculations
  const highPriorityCount = filteredJobs.filter(j => j.priority === "HIGH").length;
  const todayJobsCount = filteredJobs.filter(j => j.scheduledDate === format(new Date(), "yyyy-MM-dd")).length;
  const completedThisWeek = filteredJobs.filter(j => {
    if (j.status !== "Completed" && j.status !== "Invoiced") return false;
    return j.scheduledDate && isSameWeek(new Date(j.scheduledDate), new Date(), { weekStartsOn: 1 });
  }).length;
  const totalActive = filteredJobs.filter(j => j.status !== "Invoiced").length;
  const awaitingInvoice = filteredJobs.filter(j => j.status === "Completed").length;

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setInitialWizardStep(2); // Reschedule goes straight to Step 2
    setCreateOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setDeleteId(job.id);
    setDeleteJobNumber(job.jobNumber);
  };

  const handleCreateFromDate = (date: string) => {
    setPrefillDate(date);
    setSelectedJob(null);
    setInitialWizardStep(2); // Creating from calendar day also goes straight to scheduling
    setCreateOpen(true);
  };

  const handleSaveJob = (job: Job) => {
    const isNew = !jobs.find(j => j.id === job.id);
    if (isNew) {
      createMutation.mutate(job);
    } else {
      updateMutation.mutate({ id: job.id, updates: job });
    }
  };

  if (isLoading) return <div className="p-8">Loading Dashboard...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case "Calendar":
        return (
          <div className="p-6 max-w-[1700px] mx-auto w-full">
            <CalendarView 
              jobs={jobs} 
              onSelectJob={handleSelectJob}
              onCreateJob={handleCreateFromDate}
              onEditJob={handleEditJob}
            />
          </div>
        );
      case "Inventory":
        return (
          <div className="p-6 max-w-[1700px] mx-auto w-full">
            <Inventory hideHeader={true} />
          </div>
        );
      case "Analytics":
        return (
          <div className="p-6 max-w-[1700px] mx-auto w-full">
            <Analytics hideHeader={true} />
          </div>
        );
      case "Team":
        return (
          <div className="p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Team Management
              </h2>
              <p className="text-slate-400 font-medium pt-1">Manage engineers, office managers and administrative access.</p>
            </div>
            <TeamManagement />
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
                    {engineers.map(eng => (
                      <SelectItem key={eng.id} value={eng.name}>{eng.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-white/10 text-white">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        HIGH
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        MEDIUM
                      </div>
                    </SelectItem>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-green-500" />
                        LOW
                      </div>
                    </SelectItem>
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

                <Button className="ml-auto bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold" onClick={() => { setSelectedJob(null); setCreateOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  NEW JOB
                </Button>
              </div>
            </Card>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-4 pt-4 px-2 no-scrollbar">
              <KanbanBoard 
                jobs={filteredJobs} 
                onSelectJob={handleSelectJob} 
                onEditJob={handleEditJob}
                onDeleteJob={handleDeleteJob}
              />
            </div>


          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar">
      <DashboardHeader 
        title={activeTab === "Dashboard" ? "DASHBOARD" : activeTab.toUpperCase()} 
        role="Director" 
        userName={userData.name} 
      />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </div>

      <CreateJobWizard 
        open={createOpen} 
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setSelectedJob(null);
            setPrefillDate("");
            setInitialWizardStep(1);
          }
        }}
        onSave={handleSaveJob} 
        allJobs={jobs}
        editJob={selectedJob}
        prefillScheduledDate={prefillDate}
        initialStep={initialWizardStep}
      />

      <JobDetailsModal 
        job={selectedJob} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        onEdit={(job) => { setSelectedJob(job); setCreateOpen(true); }}
        onDelete={handleDeleteJob}
        showActions={false}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-sidebar border-sidebar-border text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete job <span className="text-white font-bold">{deleteJobNumber}</span>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700 font-bold"
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
