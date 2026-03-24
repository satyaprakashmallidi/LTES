import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, MapPin, Users, ExternalLink, Receipt, LayoutGrid, List, CalendarDays, Trash2,
  Smartphone, Target,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { type Job, type JobStatus, type RAMSStatus } from "@/data/mockJobs";
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob, type JobWithSite } from "@/hooks/useJobs";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { KanbanBoard } from "@/components/jobs/KanbanBoard";
import { CalendarView } from "@/components/jobs/CalendarView";
import { RAMSWorkflowDialog } from "@/components/RAMSWorkflowDialog";
import { PdfGenerateDialog } from "@/components/jobs/PdfGenerateDialog";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

type FilterTab = "All" | "Unbooked" | "Booked" | "Completed";

const statusColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600 text-white hover:bg-red-600",
  "Quote Sent": "bg-amber-500 text-white hover:bg-amber-500",
  "Approved": "bg-blue-600 text-white hover:bg-blue-600",
  "Scheduled": "bg-purple-600 text-white hover:bg-purple-600",
  "In Progress": "bg-blue-500 text-white hover:bg-blue-500",
  "Completed": "bg-zinc-700 text-white hover:bg-zinc-700",
  "Invoiced": "bg-zinc-500 text-white hover:bg-zinc-500",
};

const ramsColors: Record<RAMSStatus, string> = {
  Pending: "bg-orange-500 text-white",
  Approved: "bg-green-600 text-white",
  "Not Required": "bg-muted text-muted-foreground",
};

export type DocStatus = { ra: boolean; ms: boolean; sheet: boolean };

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading } = useJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const deleteMutation = useDeleteJob();

  const [filterTab, setFilterTab] = useState<FilterTab>("All");
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "calendar">("table");
  const [prefillDate, setPrefillDate] = useState("");

  // Doc generation tracking
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({});

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ramsDialogOpen, setRamsDialogOpen] = useState(false);
  const [selectedRAMSJobId, setSelectedRAMSJobId] = useState("");
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfDialogJob, setPdfDialogJob] = useState<Job | null>(null);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [initialStep, setInitialStep] = useState(1);

  // Auto-open from URL
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setDetailsJob(job);
        setDetailsOpen(true);
      }
    }
  }, [searchParams, jobs]);

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    switch (filterTab) {
      case "Unbooked": return !job.engineer || !job.scheduledDate;
      case "Booked": return job.engineer && job.scheduledDate && job.status !== "Completed" && job.status !== "Invoiced";
      case "Completed": return job.status === "Completed" || job.status === "Invoiced";
      default: return true;
    }
  });

  const counts = {
    all: jobs.length,
    unbooked: jobs.filter(j => !j.engineer || !j.scheduledDate).length,
    booked: jobs.filter(j => j.engineer && j.scheduledDate && j.status !== "Completed" && j.status !== "Invoiced").length,
    completed: jobs.filter(j => j.status === "Completed" || j.status === "Invoiced").length,
  };

  const handleSaveJob = (job: Job) => {
    const isNew = !job.id || !jobs.find(j => j.id === job.id);

    if (isNew) {
      createMutation.mutate(job, {
        onSuccess: (createdJob) => {
          setPdfDialogJob(createdJob as Job);
          setPdfDialogOpen(true);
        },
      });
    } else {
      updateMutation.mutate({ id: job.id, updates: job });
    }
  };

  const handleDocsGenerated = (jobId: string, docs: DocStatus) => {
    setDocStatuses(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], ...docs },
    }));
    // Update RAMS status if both RA+MS generated
    if (docs.ra && docs.ms) {
      updateMutation.mutate({ id: jobId, updates: { ramsStatus: "Approved" } });
    }
  };

  const handleEditFromDetails = (job: Job) => {
    setDetailsOpen(false);
    // Flush so CreateJobWizard mounts with editJob already set (no empty-flash)
    flushSync(() => setEditJob(job));
    setCreateOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setDetailsJob(job);
    setDetailsOpen(true);
  };

  const handleDeleteFromDetails = (job: Job) => {
    setDetailsOpen(false);
    setDeleteJob(job);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <DashboardHeader />
      <div className="p-6 overflow-auto no-scrollbar space-y-6 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Jobs Overview</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Control center for scheduling and monitoring all jobs
          </p>
        </div>
        <Button className="min-h-[44px] active:scale-95" onClick={() => { setEditJob(null); setCreateOpen(true); }}>
          <Briefcase className="mr-2 h-4 w-4" />
          Create New Job
        </Button>
      </div>

      {/* Filter Tabs + View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {([
                { tab: "All" as FilterTab, label: "All Jobs", count: counts.all },
                { tab: "Unbooked" as FilterTab, label: "Unbooked", count: counts.unbooked },
                { tab: "Booked" as FilterTab, label: "Booked", count: counts.booked },
                { tab: "Completed" as FilterTab, label: "Completed", count: counts.completed },
              ]).map(({ tab, label, count }) => (
                <Button
                  key={tab}
                  variant={filterTab === tab ? "default" : "outline"}
                  onClick={() => setFilterTab(tab)}
                >
                  {label}
                </Button>
              ))}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "calendar" ? (
        <CalendarView
          jobs={filteredJobs}
          onSelectJob={j => handleViewDetails(j)}
          onCreateJob={(date) => { setPrefillDate(date); setEditJob(null); setInitialStep(2); setCreateOpen(true); }}
          onEditJob={(job) => { setEditJob(job); setInitialStep(2); setCreateOpen(true); }}
        />
      ) : viewMode === "kanban" ? (
        <KanbanBoard jobs={filteredJobs} onSelectJob={j => handleViewDetails(j)} docStatuses={docStatuses} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {filterTab === "All" ? "All Jobs" : `${filterTab} Jobs`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job #</TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>RAMS Status</TableHead>
                    <TableHead>Docs</TableHead>
                    <TableHead>Report Link</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No jobs found. Create a new job to get started.
                      </TableCell>
                    </TableRow>
                  ) : filteredJobs.map(job => {
                    const ds = docStatuses[job.id];
                    return (
                      <TableRow key={job.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {job.siteName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {job.engineer || "Unassigned"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[job.status]}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={ramsColors[job.ramsStatus]}>
                            {job.ramsStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {ds?.ra ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />} RA
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {ds?.ms ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />} MS
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {ds?.sheet ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />} Sheet
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.reportLink ? (
                            <a href="#" className="flex items-center gap-1 text-primary hover:underline" onClick={e => e.stopPropagation()}>
                              {job.reportLink}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {job.invoiceNumber ? (
                            <div className="flex items-center gap-1">
                              <Receipt className="h-3 w-3 text-muted-foreground" />
                              {job.invoiceNumber}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              className="min-h-[44px] bg-primary hover:bg-primary/90 text-black font-bold"
                              onClick={e => { e.stopPropagation(); navigate(`/jobs/${job.id}/mobile`); }}
                            >
                              <Smartphone className="mr-2 h-4 w-4" />
                              Open Mobile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[44px]"
                              onClick={e => { e.stopPropagation(); handleViewDetails(job); }}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={e => { e.stopPropagation(); setDeleteJob(job); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Wizard */}
      <CreateJobWizard
        open={createOpen}
        onOpenChange={v => { setCreateOpen(v); if (!v) { setEditJob(null); setPrefillDate(""); setInitialStep(1); } }}
        onSave={handleSaveJob}
        allJobs={jobs}
        editJob={editJob}
        prefillScheduledDate={prefillDate}
        initialStep={initialStep}
      />

      {/* View Details Modal */}
      <JobDetailsModal
        job={detailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
        docStatus={detailsJob ? docStatuses[detailsJob.id] : undefined}
        onDocsGenerated={handleDocsGenerated}
      />

      {/* PDF Generate Dialog (after creation) */}
      <PdfGenerateDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        job={pdfDialogJob}
        onDocsGenerated={handleDocsGenerated}
      />

      {/* RAMS Workflow Dialog */}
      <RAMSWorkflowDialog
        jobId={selectedRAMSJobId}
        jobNumber={detailsJob?.id || ""}
        siteName={detailsJob?.siteName || ""}
        open={ramsDialogOpen}
        onOpenChange={setRamsDialogOpen}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteJob} onOpenChange={(v) => !v && setDeleteJob(null)}>
        <DialogContent className="bg-sidebar border-sidebar-border text-sidebar-foreground max-w-md p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Delete Job?</h2>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-sidebar-foreground/60">
                Are you sure you want to delete job{" "}
                <span className="font-bold text-white">{deleteJob?.jobNumber}</span> —{" "}
                <span className="font-semibold text-white">{deleteJob?.siteName}</span>?
              </p>
              <p className="text-sm text-sidebar-foreground/40 italic">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                className="px-4 py-2 rounded-md border border-sidebar-border text-white hover:bg-white/5 text-sm font-medium transition-colors"
                onClick={() => setDeleteJob(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                onClick={() => {
                  if (deleteJob) {
                    const jobNumber = deleteJob.jobNumber;
                    const siteName = deleteJob.siteName;
                    // Optimistic update — remove from local query cache immediately
                    queryClient.setQueryData(["jobs"], (old: any[]) =>
                      old ? old.filter(j => j.id !== deleteJob.id) : old
                    );
                    setDeleteJob(null);
                    toast({
                      title: "Job deleted",
                      description: `Job ${jobNumber} — ${siteName} has been deleted successfully.`,
                    });
                    deleteMutation.mutate(deleteJob.id);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Job
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Jobs;
