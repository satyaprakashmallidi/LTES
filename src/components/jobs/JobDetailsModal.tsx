import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Users, FileText, AlertTriangle, ExternalLink, Download, CheckCircle2 } from "lucide-react";
import type { Job, JobStatus, Priority } from "@/data/mockJobs";
import { generateRA, generateMS, generateJobSheet, generateAllPdfs, getRAFilename, getMSFilename, getJobSheetFilename } from "@/utils/generateJobPdfs";
import type { DocStatus } from "@/pages/Jobs";

interface JobDetailsModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (job: Job) => void;
  initialTab?: string;
  docStatus?: DocStatus;
  onDocsGenerated?: (jobId: string, docs: DocStatus) => void;
}

const statusColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600 text-white",
  "Quote Sent": "bg-amber-500 text-white",
  "Approved": "bg-blue-600 text-white",
  "In Progress": "bg-purple-600 text-white",
  "Completed": "bg-zinc-700 text-white",
  "Invoiced": "bg-zinc-500 text-white",
};

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-600 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-600 text-white",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "No data"}</p>
    </div>
  );
}

export function JobDetailsModal({ job, open, onOpenChange, onEdit, docStatus, onDocsGenerated }: JobDetailsModalProps) {
  if (!job) return null;

  const ds = docStatus || { ra: false, ms: false, sheet: false };

  const handleGenRA = () => {
    generateRA(job);
    onDocsGenerated?.(job.id, { ...ds, ra: true });
  };
  const handleGenMS = () => {
    generateMS(job);
    onDocsGenerated?.(job.id, { ...ds, ms: true });
  };
  const handleGenSheet = () => {
    generateJobSheet(job);
    onDocsGenerated?.(job.id, { ...ds, sheet: true });
  };
  const handleGenAll = () => {
    generateAllPdfs(job);
    onDocsGenerated?.(job.id, { ra: true, ms: true, sheet: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {job.id}
            <Badge className={statusColors[job.status]}>{job.status}</Badge>
            <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</h4>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Name" value={job.contactName} />
              <Field label="Phone" value={job.contactPhone} />
              <Field label="Email" value={job.contactEmail} />
            </div>
          </div>

          <Separator />

          {/* Site & Equipment */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Site & Equipment
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Site" value={job.siteName} />
              <Field label="Address" value={job.address} />
              <Field label="Inverter Location" value={job.inverterLocation} />
              <Field label="Contract Type" value={job.contractType} />
              <Field label="Inverter Model" value={job.inverterModel} />
              <Field label="Serial Number" value={job.serialNumber} />
              <Field label="Production Status" value={job.inverterInProduction} />
              <Field label="Access Code" value={job.accessCode} />
            </div>
          </div>

          <Separator />

          {/* Fault */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Fault
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fault Code" value={job.faultCode} />
              <Field label="Distance" value={job.distance ? `${job.distance} km` : ""} />
            </div>
            {job.reportedFault && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Reported Fault</p>
                <p className="text-sm">{job.reportedFault}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Scheduling */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Scheduling
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Scheduled Date" value={job.scheduledDate} />
              <Field label="Engineer" value={job.engineer} />
            </div>
          </div>

          <Separator />

          {/* Commercial */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Commercial
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quote Number" value={job.quoteNumber} />
              <Field label="Quote Date" value={job.quoteDate} />
              <Field label="PO Number" value={job.poNumber} />
              <Field label="PO Received" value={job.poReceived ? "Yes" : "No"} />
              <Field label="Invoice Number" value={job.invoiceNumber} />
              {job.reportLink && (
                <div>
                  <p className="text-xs text-muted-foreground">Report</p>
                  <a href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                    {job.reportLink} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {job.jobNotes && (
            <>
              <Separator />
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Job Notes</p>
                <p className="text-sm italic">{job.jobNotes}</p>
              </div>
            </>
          )}

          {/* RAMS & Flags */}
          <Separator />
          <div className="flex gap-2 flex-wrap">
            <Badge className={job.ramsStatus === "Approved" ? "bg-green-600 text-white" : job.ramsStatus === "Pending" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}>
              RAMS: {job.ramsStatus}
            </Badge>
            {job.ramsSent && <Badge variant="outline">RAMS Sent</Badge>}
            {job.markComplete && <Badge variant="outline">Marked Complete</Badge>}
          </div>

          {/* Generated Documents Section */}
          <Separator />
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Generated Documents
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  {ds.ra ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs">{ds.ra ? getRAFilename(job) : "Risk Assessment (RA)"}</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleGenRA}>
                  {ds.ra ? "Re-generate" : "Generate"} RA
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  {ds.ms ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs">{ds.ms ? getMSFilename(job) : "Method Statement (MS)"}</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleGenMS}>
                  {ds.ms ? "Re-generate" : "Generate"} MS
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  {ds.sheet ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs">{ds.sheet ? getJobSheetFilename(job) : "Job Sheet / Fault Report"}</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleGenSheet}>
                  {ds.sheet ? "Re-generate" : "Generate"} Sheet
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleGenAll}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Download All 3 PDFs
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => { onOpenChange(false); onEdit(job); }}>Edit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
