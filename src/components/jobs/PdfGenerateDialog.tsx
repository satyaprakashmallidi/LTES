import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Job } from "@/data/mockJobs";
import { generateRA, generateMS, generateJobSheet, generateAllPdfs, getRAFilename, getMSFilename, getJobSheetFilename } from "@/utils/generateJobPdfs";

interface PdfGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onDocsGenerated?: (jobId: string, docs: { ra: boolean; ms: boolean; sheet: boolean }) => void;
}

export function PdfGenerateDialog({ open, onOpenChange, job, onDocsGenerated }: PdfGenerateDialogProps) {
  const [generated, setGenerated] = useState<{ ra: boolean; ms: boolean; sheet: boolean }>({ ra: false, ms: false, sheet: false });

  if (!job) return null;

  const faultShort = (job.reportedFault || "Issue").split(".")[0].substring(0, 30).trim();

  const handleGenerateAll = () => {
    generateAllPdfs(job);
    const docs = { ra: true, ms: true, sheet: true };
    setGenerated(docs);
    onDocsGenerated?.(job.id, docs);
  };

  const handleGenerateRA = () => {
    generateRA(job);
    const docs = { ...generated, ra: true };
    setGenerated(docs);
    onDocsGenerated?.(job.id, docs);
  };

  const handleGenerateMS = () => {
    generateMS(job);
    const docs = { ...generated, ms: true };
    setGenerated(docs);
    onDocsGenerated?.(job.id, docs);
  };

  const handleGenerateSheet = () => {
    generateJobSheet(job);
    const docs = { ...generated, sheet: true };
    setGenerated(docs);
    onDocsGenerated?.(job.id, docs);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setGenerated({ ra: false, ms: false, sheet: false }), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Job Created: {job.id}
          </DialogTitle>
          <DialogDescription>
            {job.siteName} — {faultShort}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Generate RAMS & Job Sheet Documents?</p>

          <Button className="w-full" size="lg" onClick={handleGenerateAll}>
            <Download className="mr-2 h-4 w-4" />
            Generate All 3 PDFs
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRA}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              {generated.ra ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4" />}
              <span className="text-[10px]">RA Only</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateMS}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              {generated.ms ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4" />}
              <span className="text-[10px]">MS Only</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSheet}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              {generated.sheet ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4" />}
              <span className="text-[10px]">Job Sheet</span>
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full" onClick={handleClose}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
