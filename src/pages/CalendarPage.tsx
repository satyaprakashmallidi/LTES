import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { type Job } from "@/data/mockJobs";
import { CalendarView } from "@/components/jobs/CalendarView";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import {
  useJobs,
  useCreateJob,
  useUpdateJob,
  useDeleteJob
} from "@/hooks/useJobs";

const CalendarPage = () => {
  const { toast } = useToast();
  const { data: jobs = [] } = useJobs();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const deleteMutation = useDeleteJob();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState("");
  const [initialStep, setInitialStep] = useState(1);

  const handleSaveJob = (job: Job) => {
    const isNew = !job.id || !jobs.find(j => j.id === job.id);

    if (isNew) {
      createMutation.mutate(job);
    } else {
      updateMutation.mutate({ id: job.id, updates: job });
    }
  };

  const handleDeleteJob = (job: Job) => {
    if (confirm(`Are you sure you want to delete job ${job.jobNumber}?`)) {
      deleteMutation.mutate(job.id);
      setDetailsOpen(false);
    }
  };

  const handleCreateFromDate = (date: string) => {
    setPrefillDate(date);
    setEditJob(null);
    setInitialStep(2);
    setCreateOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setDetailsJob(job);
    setDetailsOpen(true);
  };

  const handleEditFromDetails = (job: Job) => {
    setDetailsOpen(false);
    setEditJob(job);
    setCreateOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditJob(job);
    setInitialStep(2);
    setCreateOpen(true);
  };

  const isSimon = true;
  const role = isSimon ? "Simon" : "Admin";

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <DashboardHeader />
      <div className="p-6 overflow-auto no-scrollbar space-y-6 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View job schedule {isSimon && "(Read-Only Scheduling)"}
          </p>
        </div>
        <Button className="min-h-[44px] active:scale-95" onClick={() => { setEditJob(null); setCreateOpen(true); }}>
          <Briefcase className="mr-2 h-4 w-4" />
          Create New Job
        </Button>
      </div>

      <CalendarView
        jobs={jobs}
        onSelectJob={j => handleViewDetails(j)}
        onCreateJob={(date) => { setPrefillDate(date); setEditJob(null); setCreateOpen(true); }}
        onEditJob={(job) => { setEditJob(job); setCreateOpen(true); }}
        role={role}
      />

      <CreateJobWizard
        open={createOpen}
        onOpenChange={v => { setCreateOpen(v); if (!v) { setEditJob(null); setPrefillDate(""); setInitialStep(1); } }}
        onSave={handleSaveJob}
        allJobs={jobs}
        editJob={editJob}
        prefillScheduledDate={prefillDate}
        initialStep={initialStep}
        role={role}
      />

      <JobDetailsModal
        job={detailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteJob}
        role={role}
      />
      </div>
    </div>
  );
};

export default CalendarPage;
