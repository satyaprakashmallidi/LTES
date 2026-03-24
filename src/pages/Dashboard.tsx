import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  FileCheck, 
  Briefcase, 
  LayoutDashboard,
  Inbox,
  Settings,
  Search,
  FilterX,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  LogOut,
  User,
  Zap
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useJobs, useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { KanbanBoard } from "@/components/jobs/KanbanBoard";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import type { Job } from "@/data/mockJobs";
import { format, isSameWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading } = useJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");
  
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [userData, setUserData] = useState<{ name: string; email: string }>({ name: "", email: "" });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Office Manager",
          email: user.email || ""
        });
      }
    }
    getProfile();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.siteName.toLowerCase().includes(search.toLowerCase()) || 
                         (job.id && job.id.toLowerCase().includes(search.toLowerCase())) ||
                         (job.contactName && job.contactName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const jobsToday = filteredJobs.filter(j => j.scheduledDate === format(new Date(), "yyyy-MM-dd")).length;
  const completedThisMonth = filteredJobs.filter(j => {
    if (j.status !== "Completed" && j.status !== "Invoiced") return false;
    const date = j.scheduledDate ? new Date(j.scheduledDate) : null;
    return date && date.getMonth() === new Date().getMonth();
  }).length;
  const pendingInvoice = filteredJobs.filter(j => j.status === "Completed").length;

  const needsQuoteJobs = jobs.filter(j => j.status === "Logged Fault" && j.priority === "HIGH");
  const quoteSentJobs = jobs.filter(j => j.status === "Quote Sent" && !j.poReceived);
  const readyToInvoiceJobs = jobs.filter(j => j.status === "Completed" && !j.invoiceNumber);
  const needingAttentionJobs = jobs.filter(j => !j.reportLink || j.ramsStatus === "Pending");

  const handleSendQuote = (job: Job) => {
    const quoteNumber = prompt(`Enter Quote Number for ${job.siteName}:`, `Q-${format(new Date(), "yyyy")}-${job.id.split('-').pop()}`);
    if (quoteNumber) {
      updateMutation.mutate({ 
        id: job.id, 
        updates: { 
          ...job, 
          status: "Quote Sent", 
          quoteNumber: quoteNumber,
          quoteDate: format(new Date(), "yyyy-MM-dd") 
        } 
      });
    }
  };

  const handleMarkInvoiced = (job: Job) => {
    const invNumber = prompt(`Enter Invoice Number for ${job.siteName}:`, `INV-${job.id.split('-').pop()}`);
    if (invNumber) {
      updateMutation.mutate({ 
        id: job.id, 
        updates: { 
          ...job, 
          status: "Invoiced", 
          invoiceNumber: invNumber 
        } 
      });
    }
  };

  const handleSaveJob = (job: Job) => {
    const isNew = !jobs.find(j => j.id === job.id);
    if (isNew) {
      createMutation.mutate(job);
    } else {
      updateMutation.mutate({ id: job.id, updates: job });
    }
  };

  if (isLoading) return <div className="p-8 text-white">Loading Dashboard...</div>;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar text-sidebar-foreground">
      <DashboardHeader userName={userData.name} role="Office Manager" />


      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-6 space-y-6">
        {/* MY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-sidebar-accent/50 border-sidebar-border p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mb-1">My Jobs Today</p>
              <p className="text-2xl font-black text-white">{jobsToday}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </Card>
          <Card className="bg-sidebar-accent/50 border-sidebar-border p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mb-1">Completed This Month</p>
              <p className="text-2xl font-black text-white">{completedThisMonth}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </Card>
          <Card className="bg-sidebar-accent/50 border-sidebar-border p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mb-1">Pending Invoice</p>
              <p className="text-2xl font-black text-white">{pendingInvoice}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* FILTERS */}
        <Card className="p-4 bg-sidebar-accent/30 border-sidebar-border border-dashed">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
              <Input 
                placeholder="Search jobs..." 
                className="pl-9 bg-sidebar-accent border-sidebar-border text-white placeholder:text-sidebar-foreground/30 h-9 text-sm" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-[140px] bg-sidebar-accent border-sidebar-border text-white h-9 text-xs">
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent className="bg-sidebar border-sidebar-border text-white">
                <SelectItem value="all">All Customers</SelectItem>

              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[120px] bg-sidebar-accent border-sidebar-border text-white h-9 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-sidebar border-sidebar-border text-white">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-sidebar-accent border-sidebar-border text-white h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-sidebar border-sidebar-border text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Logged Fault">Logged Fault</SelectItem>
                <SelectItem value="Quote Sent">Quote Sent</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Invoiced">Invoiced</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" className="text-sidebar-foreground/40 hover:text-white h-9 px-2" onClick={() => {
              setSearch("");
              setCustomerFilter("all");
              setPriorityFilter("all");
              setStatusFilter("all");
            }}>
              <FilterX className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>

            <Button className="ml-auto bg-primary text-black hover:bg-primary/90 h-9 font-bold px-4 shadow-lg shadow-primary/20" onClick={() => { setSelectedJob(null); setCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              NEW JOB
            </Button>
          </div>
        </Card>

        {/* KANBAN BOARD */}
        <Card className="bg-sidebar-accent/10 border-sidebar-border p-6 relative">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" /> Kanban Board
             </h3>
             <p className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> NOTE: You cannot schedule jobs. Contact Luke to schedule.
             </p>
          </div>
          
          <div className="overflow-x-auto pb-4 no-scrollbar">
            <KanbanBoard 
              jobs={filteredJobs} 
              onSelectJob={(job) => {
                setSelectedJob(job);
                setDetailsOpen(true);
              }}
              onEditJob={(job) => {
                setSelectedJob(job);
                setCreateOpen(true);
              }}
              onDeleteJob={() => {}} // Disabled for Simon
              role="Simon" 
            />
          </div>
        </Card>

        {/* MY PENDING ACTIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black tracking-tight">MY PENDING ACTIONS</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* URGENT */}
            <Card className="bg-sidebar-accent/30 border-sidebar-border overflow-hidden">
              <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20 flex items-center justify-between">
                <span className="text-xs font-black text-red-500 tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  URGENT (Needs Quote)
                </span>
                <Badge variant="destructive" className="h-4 px-1 text-[9px]">{needsQuoteJobs.length} JOBS</Badge>
              </div>
              <div className="p-4 space-y-3">
                {needsQuoteJobs.length > 0 ? needsQuoteJobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => { setSelectedJob(j); setDetailsOpen(true); }}>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      {j.siteName} — {j.id}
                    </p>
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] bg-primary text-black font-bold uppercase"
                      onClick={(e) => { e.stopPropagation(); handleSendQuote(j); }}
                    >
                      Send Quote
                    </Button>
                  </div>
                )) : (
                  <p className="text-xs text-white/20 italic p-4 text-center">No high priority faults</p>
                )}
              </div>
            </Card>

            {/* AWAITING PO */}
            <Card className="bg-sidebar-accent/30 border-sidebar-border overflow-hidden">
              <div className="bg-amber-500/10 px-4 py-2 border-b border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-black text-amber-500 tracking-wider">📋 QUOTE SENT (Chase Post-PO)</span>
                <Badge className="h-4 px-1 text-[9px] bg-amber-500/20 text-amber-500 border-none">{quoteSentJobs.length} JOBS</Badge>
              </div>
              <div className="p-4 space-y-3">
                {quoteSentJobs.length > 0 ? quoteSentJobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => { setSelectedJob(j); setDetailsOpen(true); }}>
                    <div>
                      <p className="text-xs font-bold text-white">{j.siteName}</p>
                      <p className="text-[10px] text-slate-500 italic">Quote: {j.quoteNumber || "N/A"}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] border-amber-500/30 text-amber-500 font-bold hover:bg-amber-500/10" onClick={(e) => { e.stopPropagation(); navigate("/inbox"); }}>Chase Customer</Button>
                  </div>
                )) : (
                  <p className="text-xs text-white/20 italic p-4 text-center">No quotes pending PO</p>
                )}
              </div>
            </Card>

            {/* READY TO INVOICE */}
            <Card className="bg-sidebar-accent/30 border-sidebar-border overflow-hidden">
              <div className="bg-green-500/10 px-4 py-2 border-b border-green-500/20 flex items-center justify-between">
                <span className="text-xs font-black text-green-500 tracking-wider">✅ READY TO INVOICE</span>
                <Badge className="h-4 px-1 text-[9px] bg-green-500/20 text-green-500 border-none">{readyToInvoiceJobs.length} JOBS</Badge>
              </div>
              <div className="p-4 space-y-3">
                {readyToInvoiceJobs.length > 0 ? readyToInvoiceJobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => { setSelectedJob(j); setDetailsOpen(true); }}>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {j.siteName} — {j.id}
                    </p>
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] bg-green-600 text-white font-bold uppercase hover:bg-green-700 shadow-sm"
                      onClick={(e) => { e.stopPropagation(); handleMarkInvoiced(j); }}
                    >
                      Mark Invoiced
                    </Button>
                  </div>
                )) : (
                  <p className="text-xs text-white/20 italic p-4 text-center">No jobs ready for invoice</p>
                )}
              </div>
            </Card>

            {/* JOBS NEEDING ATTENTION */}
            <Card className="bg-sidebar-accent/30 border-sidebar-border overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 border-b border-primary/20 flex items-center justify-between">
                <span className="text-xs font-black text-primary tracking-wider">⚠️ JOBS NEEDING ATTENTION</span>
                <Badge className="h-4 px-1 text-[9px] bg-primary/20 text-primary border-none">{needingAttentionJobs.length} JOBS</Badge>
              </div>
              <div className="p-4 space-y-3">
                {needingAttentionJobs.length > 0 ? needingAttentionJobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer" onClick={() => { setSelectedJob(j); setDetailsOpen(true); }}>
                    <p className="text-xs font-bold text-white">⚠️ {j.siteName} — {j.ramsStatus === "Pending" ? "Need RAMS" : "Need Report"}</p>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary hover:bg-primary/10 font-bold underline px-1" onClick={(e) => { e.stopPropagation(); setSelectedJob(j); setDetailsOpen(true); }}>
                      View Details
                    </Button>
                  </div>
                )) : (
                  <p className="text-xs text-white/20 italic p-4 text-center">All jobs have docs</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CreateJobWizard 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSave={handleSaveJob} 
        allJobs={jobs}
        editJob={selectedJob}
        // @ts-ignore
        role="Simon" // For read-only fields
      />

      <JobDetailsModal 
        job={selectedJob} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        onEdit={(job) => { setSelectedJob(job); setCreateOpen(true); }}
        onDelete={() => {}} // Disabled for Simon
        role="Simon" // No delete button
      />
    </div>
  );
}
