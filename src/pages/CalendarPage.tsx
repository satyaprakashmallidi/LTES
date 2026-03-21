import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { type Job } from "@/data/mockJobs";
import { CalendarView } from "@/components/jobs/CalendarView";
import { CreateJobWizard } from "@/components/jobs/CreateJobWizard";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { useToast } from "@/hooks/use-toast";

import { initialJobs } from "@/data/mockJobs";

const CalendarPage = () => {
  const { toast } = useToast();
  const [jobs] = useState<Job[]>(initialJobs);
  const [createOpen, setCreateOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState("");

  const handleSaveJob = (_job: Job) => {
    toast({ title: "Job Saved", description: "Job has been saved." });
  };

  const handleCreateFromDate = (date: string) => {
    setPrefillDate(date);
    setEditJob(null);
    setCreateOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    setDetailsJob(job);
    setDetailsOpen(true);
  };

  const handleEditFromDetails = (job: Job) => {
    setEditJob(job);
    setCreateOpen(true);
  };

  const isSimon = true; // For now, the general /calendar route is for Simon's role
  const role = isSimon ? "Simon" : "Admin";

  return (
    <div className="space-y-6">
      {/* Header */}
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
        onSelectJob={handleViewDetails}
        onCreateJob={handleCreateFromDate}
        role={role}
      />

      <CreateJobWizard
        open={createOpen}
        onOpenChange={v => { setCreateOpen(v); if (!v) { setEditJob(null); setPrefillDate(""); } }}
        onSave={handleSaveJob}
        allJobs={jobs}
        editJob={editJob}
        prefillScheduledDate={prefillDate}
        initialStep={prefillDate ? 2 : 1}
        role={role}
      />

      <JobDetailsModal
        job={detailsJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEditFromDetails}
        role={role}
      />
    </div>
  );
};

export default CalendarPage;
