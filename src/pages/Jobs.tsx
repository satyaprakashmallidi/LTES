import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, MapPin, Users, ExternalLink, Receipt, LayoutGrid, List, CalendarDays,
} from "lucide-react";
import { type Job, type JobStatus, type RAMSStatus } from "@/data/mockJobs";
import { useJobs, type JobWithSite } from "@/hooks/useJobs";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { KanbanBoard } from "@/components/jobs/KanbanBoard";
import { CalendarView } from "@/components/jobs/CalendarView";
import { RAMSWorkflowDialog } from "@/components/RAMSWorkflowDialog";
import { PdfGenerateDialog } from "@/components/jobs/PdfGenerateDialog";

type FilterTab = "All" | "Unbooked" | "Booked" | "Completed";

const statusColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600 text-white hover:bg-red-600",
  "Quote Sent": "bg-amber-500 text-white hover:bg-amber-500",
  "Approved": "bg-blue-600 text-white hover:bg-blue-600",
  "In Progress": "bg-purple-600 text-white hover:bg-purple-600",
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
  const { data: supabaseJobs, isLoading } = useJobs();

  // Transform Supabase data to local Job format
  const jobs: Job[] = (supabaseJobs || []).map((j: JobWithSite) => ({
    id: j.job_number,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    siteName: j.sites?.site_name || "",
    siteId: j.site_id || "",
    address: j.sites?.address || "",
    inverterLocation: "",
    contractType: "Contract/SLA" as const,
    inverterType: "",
    inverterModel: "",
    serialNumber: "",
    inverterInProduction: "Yes" as const,
    faultCode: "",
    reportedFault: j.description || "",
    priority: "LOW" as const,
    status: j.status as JobStatus,
    ramsStatus: (j.rams_status || "Pending") as RAMSStatus,
    quoteNumber: j.quote_number || "",
    quoteDate: "",
    poNumber: "",
    poReceived: false,
    scheduledDate: j.scheduled_date || "",
    engineer: j.technician || "",
    accessCode: j.sites?.access_codes || "",
    distance: 0,
    ramsSent: false,
    jobNotes: j.notes || "",
    markComplete: false,
    invoiceNumber: j.invoice_number || "",
    reportLink: j.report_link || "",
  }));
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
    const isNew = !jobs.find(j => j.id === job.id);
    setJobs(prev => {
      const idx = prev.findIndex(j => j.id === job.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = job;
        return updated;
      }
      return [job, ...prev];
    });
    toast({ title: "Job Saved", description: `${job.id} has been saved.` });

    // Show PDF generation dialog for new jobs
    if (isNew) {
      setPdfDialogJob(job);
      setPdfDialogOpen(true);
    }
  };

  const handleDocsGenerated = (jobId: string, docs: DocStatus) => {
    setDocStatuses(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], ...docs },
    }));
    // Update RAMS status if both RA+MS generated
    if (docs.ra && docs.ms) {
      setJobs(prev => prev.map(j =>
        j.id === jobId && j.ramsStatus !== "Not Required" ? { ...j, ramsStatus: "Approved" as RAMSStatus } : j
      ));
    }
  };

  const handleEditFromDetails = (job: Job) => {
    setEditJob(job);
    setCreateOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setDetailsJob(job);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Jobs Overview</h1>
            <Badge className="bg-green-600 text-white border-0 text-xs font-semibold">Phase 1</Badge>
            <Badge className="bg-orange-600 text-white border-0 text-xs font-semibold">🎯 Intelligent Assignment - Phase 2</Badge>
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
                  {label} ({count})
                </Button>
              ))}
            </div>
            <div className="flex gap-1 border border-border rounded-md p-0.5">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "calendar" ? (
        <CalendarView
          jobs={filteredJobs}
          onSelectJob={j => handleViewDetails(j)}
          onCreateJob={(date) => { setPrefillDate(date); setEditJob(null); setCreateOpen(true); }}
        />
      ) : viewMode === "kanban" ? (
        <KanbanBoard jobs={filteredJobs} onSelectJob={j => handleViewDetails(j)} docStatuses={docStatuses} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {filterTab === "All" ? "All Jobs" : `${filterTab} Jobs`} ({filteredJobs.length})
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
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <span className={`h-2 w-2 rounded-full ${ds?.ra ? "bg-green-500" : "bg-red-500"}`} />RA
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <span className={`h-2 w-2 rounded-full ${ds?.ms ? "bg-green-500" : "bg-red-500"}`} />MS
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <span className={`h-2 w-2 rounded-full ${ds?.sheet ? "bg-green-500" : "bg-red-500"}`} />Sheet
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
                              className="min-h-[44px] bg-primary hover:bg-primary/90"
                              onClick={e => { e.stopPropagation(); navigate(`/jobs/${job.id}/mobile`); }}
                            >
                              📱 Open Mobile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[44px]"
                              onClick={e => { e.stopPropagation(); handleViewDetails(job); }}
                            >
                              View Details
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
        onOpenChange={v => { setCreateOpen(v); if (!v) { setEditJob(null); setPrefillDate(""); } }}
        onSave={handleSaveJob}
        allJobs={jobs}
        editJob={editJob}
        prefillScheduledDate={prefillDate}
        initialStep={prefillDate ? 2 : 1}
      />

      {/* View Details Modal */}
      <JobDetailsModal
        job={detailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEditFromDetails}
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
    </div>
  );
};

export default Jobs;
