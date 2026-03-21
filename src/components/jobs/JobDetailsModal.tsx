import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Users, FileText, AlertTriangle, ExternalLink, Download, CheckCircle2, ShieldAlert, Edit, Info } from "lucide-react";
import type { Job, JobStatus, Priority } from "@/data/mockJobs";
import { generateRA, generateMS, generateJobSheet, generateAllPdfs, getRAFilename, getMSFilename, getJobSheetFilename } from "@/utils/generateJobPdfs";
import type { DocStatus } from "@/pages/Jobs";
import { cn } from "@/lib/utils";
import { useFaultCodes } from "@/hooks/useFaultCodes";

interface JobDetailsModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (job: Job) => void;
  initialTab?: string;
  docStatus?: DocStatus;
  onDocsGenerated?: (jobId: string, docs: DocStatus) => void;
  role?: "Admin" | "Simon";
}

const statusColors: Record<JobStatus, string> = {
  "Logged Fault": "bg-red-600/20 text-red-500 border-red-500/30",
  "Quote Sent": "bg-amber-500/20 text-amber-500 border-amber-500/30",
  "Approved": "bg-blue-600/20 text-blue-500 border-blue-500/30",
  "Scheduled": "bg-purple-600/20 text-purple-500 border-purple-500/30",
  "Completed": "bg-green-500/20 text-green-500 border-green-500/30",
  "Invoiced": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-600 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-600 text-white",
};

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">{label}</p>
      <p className="text-sm font-bold text-white tracking-tight">{value || "—"}</p>
    </div>
  );
}

export function JobDetailsModal({ job, open, onOpenChange, onEdit, docStatus, onDocsGenerated, role = "Admin" }: JobDetailsModalProps) {
  if (!job) return null;

  const ds = docStatus || { ra: false, ms: false, sheet: false };
  const isSimon = role === "Simon";

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

  const { data: faultCodesByBrand } = useFaultCodes();
  
  const faultLabel = useMemo(() => {
    if (!job.faultCode || !faultCodesByBrand) return "";
    
    // Try to find brand in equipment details or job
    const brand = job.inverterType || ""; // Usually brand is in inverterType for existing jobs
    const brandLower = brand.toLowerCase();
    
    let allMatchingCodes: any[] = [];
    Object.keys(faultCodesByBrand).forEach(b => {
      const bLower = b.toLowerCase();
      if (bLower.includes(brandLower) || brandLower.includes(bLower)) {
        allMatchingCodes = [...allMatchingCodes, ...faultCodesByBrand[b]];
      }
    });
    
    const fault = allMatchingCodes.find(fc => fc.code === job.faultCode);
    return fault?.label || "";
  }, [job.faultCode, job.inverterType, faultCodesByBrand]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground no-scrollbar">
        <DialogHeader className="border-b border-sidebar-border pb-4 mb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <span className="text-xl font-black text-white tracking-tighter">{job.id}</span>
               <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-2 py-0.5", statusColors[job.status])}>
                  {job.status}
               </Badge>
               <Badge className={cn("text-[10px] font-black px-2 py-0.5 rounded-sm border-none", priorityColors[job.priority])}>
                  {job.priority}
               </Badge>
            </div>
            
            {isSimon && (
               <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> Coordinator Access
               </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Contact & Site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                 <Users className="h-4 w-4" /> Customer Contact
               </h4>
               <div className="grid grid-cols-1 gap-4 bg-sidebar-accent/30 p-4 rounded-xl border border-sidebar-border">
                  <Field label="Contact Name" value={job.contactName} />
                  <Field label="Phone" value={job.contactPhone} />
                  <Field label="Email" value={job.contactEmail} />
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                 <MapPin className="h-4 w-4" /> Site Details
               </h4>
               <div className="grid grid-cols-1 gap-4 bg-sidebar-accent/30 p-4 rounded-xl border border-sidebar-border">
                  <Field label="Site Name" value={job.siteName} />
                  <Field label="Inverter Location" value={job.inverterLocation} />
                  <Field label="Model" value={job.inverterModel} />
                  <Field label="Serial" value={job.serialNumber} />
               </div>
             </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Fault & Commercial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4" /> Fault Information
               </h4>
               <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <Field label="Fault Code" value={job.faultCode} />
                    {faultLabel && (
                      <Badge variant="outline" className="text-[9px] font-black border-red-500/30 text-red-400 bg-red-500/5">
                        {faultLabel}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-red-500/40 tracking-widest">Reported Issue</p>
                    <p className="text-sm font-bold text-white italic">"{job.reportedFault || "No fault description submitted."}"</p>
                  </div>
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <FileText className="h-4 w-4" /> Commercial Details
               </h4>
               <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 space-y-4">
                  <Field label="Quote Number" value={job.quoteNumber} />
                  <Field label="PO Number" value={job.poNumber} />
                  <Field label="Invoice #" value={job.invoiceNumber} />
                  <Field label="PO Status" value={job.poReceived ? "✅ RECEIVED" : "⏳ PENDING"} />
               </div>
             </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Scheduling */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Allocation & Sourcing
            </h4>
            <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10 flex flex-wrap gap-8">
               <Field label="Scheduled Date" value={job.scheduledDate} />
               <Field label="Engineer" value={job.engineer} />
               <Field label="Contract" value={job.contractType} />
               <Field label="RAMS Status" value={job.ramsStatus} />
            </div>
          </div>

          {/* Docs */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Download className="h-4 w-4" /> Generated Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <Button variant="outline" className="bg-white/5 border-white/10 text-white h-auto py-3 flex-col items-start gap-1" onClick={handleGenRA}>
                  <p className="text-[9px] uppercase font-black text-sidebar-foreground/40">Risk Assessment</p>
                  <p className="text-xs font-bold flex items-center justify-between w-full">
                    {ds.ra ? "Regenerate" : "Generate RA"}
                    {ds.ra && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                  </p>
               </Button>
               <Button variant="outline" className="bg-white/5 border-white/10 text-white h-auto py-3 flex-col items-start gap-1" onClick={handleGenMS}>
                  <p className="text-[9px] uppercase font-black text-sidebar-foreground/40">Method Statement</p>
                  <p className="text-xs font-bold flex items-center justify-between w-full">
                    {ds.ms ? "Regenerate" : "Generate MS"}
                    {ds.ms && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                  </p>
               </Button>
               <Button variant="outline" className="bg-white/5 border-white/10 text-white h-auto py-3 flex-col items-start gap-1" onClick={handleGenSheet}>
                  <p className="text-[9px] uppercase font-black text-sidebar-foreground/40">Job Sheet</p>
                  <p className="text-xs font-bold flex items-center justify-between w-full">
                    {ds.sheet ? "Regenerate" : "Generate Sheet"}
                    {ds.sheet && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                  </p>
               </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-sidebar-border mt-4">
           {isSimon && (
              <p className="text-[10px] text-amber-500 font-bold uppercase italic">* Scheduling restricted for coordinator</p>
           )}
           <div className="flex gap-2 ml-auto">
             <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/5">Close</Button>
             <Button onClick={() => { onOpenChange(false); onEdit(job); }} className="bg-primary text-black font-black uppercase tracking-tight shadow-xl shadow-primary/20">
               <Edit className="h-4 w-4 mr-2" /> Edit Job
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
