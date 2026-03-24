import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignaturePad } from "./SignaturePad";
import { EmailPreviewDialog } from "./EmailPreviewDialog";
import {
  FileText,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Clock,
  Package,
  DollarSign,
  FileCheck,
} from "lucide-react";

interface Job {
  id: string;
  siteName: string;
  technician: string;
  scheduledDate: string;
  workSummary: string;
  quoteNumber: string;
  quoteLogic: string;
  distance: number;
  reportLink: string;
  invoiceNumber: string;
}

interface ReportPreviewDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for demonstration
const getMockTimeLog = () => ({
  startTime: "08:00 AM",
  endTime: "04:30 PM",
  totalHours: 8.5,
});

const getMockMaterials = () => [
  { item: "MCB 32A", quantity: 4, unitPrice: 11.25, total: 45.0 },
  { item: "Distribution Board", quantity: 1, unitPrice: 280.0, total: 280.0 },
  { item: "Cable 6mm² (50m)", quantity: 1, unitPrice: 125.0, total: 125.0 },
];

const calculateCosts = (job: Job) => {
  const laborRate = 65;
  const travelRate = 0.45;
  const timeLog = getMockTimeLog();
  const materials = getMockMaterials();

  const laborCost = timeLog.totalHours * laborRate;
  const materialsCost = materials.reduce((sum, m) => sum + m.total, 0);
  const travelCost = job.distance * travelRate;
  const total = laborCost + materialsCost + travelCost;

  return {
    laborCost,
    materialsCost,
    travelCost,
    total,
  };
};

export function ReportPreviewDialog({ job, open, onOpenChange }: ReportPreviewDialogProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const timeLog = getMockTimeLog();
  const materials = getMockMaterials();
  const costs = calculateCosts(job);

  const handleApproveAndEmail = () => {
    if (!signature) {
      alert("Please add your signature before approving");
      return;
    }
    setShowEmailDialog(true);
  };

  const ramsId = `RAMS-${job.id.split("-")[1]}-${job.id.split("-")[2]}`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Completion Report - {job.id}
            </DialogTitle>
            <DialogDescription>
              Review the complete report before signing and sending
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">JOB COMPLETION REPORT</h2>
                <p className="text-sm text-muted-foreground">LTES Group</p>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Job Number</p>
                  <p className="font-bold">{job.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-bold">{format(new Date(job.scheduledDate), "PPP")}</p>
                </div>
              </div>
            </div>

            {/* Site Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Site Information
              </h3>
              <div className="bg-background border rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Site Name</p>
                  <p className="font-medium">{job.siteName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance from Base</p>
                  <p className="font-medium">{job.distance} km</p>
                </div>
              </div>
            </div>

            {/* Technician Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Technician Information
              </h3>
              <div className="bg-background border rounded-lg p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Technician(s)</p>
                  <p className="font-medium">{job.technician}</p>
                </div>
              </div>
            </div>

            {/* Work Completed */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Work Completed
              </h3>
              <div className="bg-background border rounded-lg p-4">
                <p className="text-sm leading-relaxed">{job.workSummary}</p>
              </div>
            </div>

            {/* Time Log */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Log
              </h3>
              <div className="bg-background border rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-medium">{timeLog.startTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Time</p>
                    <p className="font-medium">{timeLog.endTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Hours</p>
                    <p className="font-medium">{timeLog.totalHours} hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Used */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Materials Used
              </h3>
              <div className="bg-background border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Item</th>
                      <th className="text-center p-3">Qty</th>
                      <th className="text-right p-3">Unit Price</th>
                      <th className="text-right p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">{material.item}</td>
                        <td className="text-center p-3">{material.quantity}</td>
                        <td className="text-right p-3">£{material.unitPrice.toFixed(2)}</td>
                        <td className="text-right p-3 font-medium">£{material.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Breakdown
              </h3>
              <div className="bg-background border rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Labor ({timeLog.totalHours} hrs @ £65/hr)</span>
                  <span className="font-medium">£{costs.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Materials</span>
                  <span className="font-medium">£{costs.materialsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Travel ({job.distance} km @ £0.45/km)</span>
                  <span className="font-medium">£{costs.travelCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span>£{costs.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Documentation References */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Documentation References
              </h3>
              <div className="bg-background border rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAMS Document</span>
                  <span className="font-medium">{ramsId} (Approved)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SafetyCulture Report</span>
                  <span className="font-medium">{job.reportLink}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-medium">{job.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quote Number</span>
                  <span className="font-medium">{job.quoteNumber}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Signature Section */}
            <SignaturePad signature={signature} onSignatureChange={setSignature} />

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveAndEmail} disabled={!signature}>
                Approve and Email Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EmailPreviewDialog
        job={job}
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        totalCost={costs.total}
      />
    </>
  );
}
