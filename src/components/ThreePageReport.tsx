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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { Badge } from "./ui/badge";

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
  address?: string;
  accessCode?: string;
  contactName?: string;
  contactPhone?: string;
}

interface ThreePageReportProps {
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
  { item: "MCB 32A", quantity: 4, unitPrice: 11.25, total: 45.0, partNumber: "MCB-32A-001" },
  { item: "Distribution Board", quantity: 1, unitPrice: 280.0, total: 280.0, partNumber: "DB-2024-15" },
  { item: "Cable 6mm² (50m)", quantity: 1, unitPrice: 125.0, total: 125.0, partNumber: "CAB-6MM-50" },
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

export function ThreePageReport({ job, open, onOpenChange }: ThreePageReportProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState("page1");

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
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Completion Report - {job.id}
            </DialogTitle>
            <DialogDescription>
              3-Page Report: Site Access & Info | RAMS Assessment | Work Completion
            </DialogDescription>
          </DialogHeader>

          <Tabs value={currentPage} onValueChange={setCurrentPage} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="page1" className="text-xs sm:text-sm">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Page 1: Site Access
              </TabsTrigger>
              <TabsTrigger value="page2" className="text-xs sm:text-sm">
                <ShieldAlert className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Page 2: RAMS
              </TabsTrigger>
              <TabsTrigger value="page3" className="text-xs sm:text-sm">
                <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Page 3: Work Done
              </TabsTrigger>
            </TabsList>

            {/* PAGE 1: SITE ACCESS & JOB INFORMATION */}
            <TabsContent value="page1" className="space-y-6 mt-6">
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold">SITE ACCESS & JOB INFORMATION</h2>
                  <p className="text-sm text-muted-foreground">LTES Group - Page 1 of 3</p>
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

              {/* Site Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Site Details
                </h3>
                <div className="bg-background border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Site Name</p>
                    <p className="font-medium">{job.siteName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Address</p>
                    <p className="font-medium">{job.address || "Industrial Estate, Cambridge CB21 5JF"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance from Base</p>
                    <p className="font-medium">{job.distance} km</p>
                  </div>
                </div>
              </div>

              {/* Access Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Access Information
                </h3>
                <div className="bg-background border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Access Codes</p>
                    <p className="font-medium font-mono bg-muted/30 p-2 rounded">
                      {job.accessCode || "Gate Code: #4582, Building Access: #7739"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Site Contact</p>
                    <p className="font-medium">{job.contactName || "John Williams"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{job.contactPhone || "07700 900456"}</p>
                  </div>
                </div>
              </div>

              {/* Job Overview */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Overview
                </h3>
                <div className="bg-background border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Work Description</p>
                    <p className="text-sm leading-relaxed">{job.workSummary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Technician(s)</p>
                    <p className="font-medium">{job.technician}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* PAGE 2: POINT OF WORKS RISK ASSESSMENT (RAMS) */}
            <TabsContent value="page2" className="space-y-6 mt-6">
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold">POINT OF WORKS RISK ASSESSMENT</h2>
                  <p className="text-sm text-muted-foreground">LTES Group - Page 2 of 3</p>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Job Number</p>
                    <p className="font-bold">{job.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RAMS Reference</p>
                    <p className="font-bold">{ramsId}</p>
                  </div>
                </div>
              </div>

              {/* RAMS Status */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Risk Assessment Status
                </h3>
                <div className="bg-background border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-green-600 text-white">Approved</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approved By</p>
                    <p className="font-medium">Luke Thompson - H&S Manager</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Date</p>
                    <p className="font-medium">{format(new Date(job.scheduledDate), "PPP")}</p>
                  </div>
                </div>
              </div>

              {/* Identified Hazards */}
              <div>
                <h3 className="font-semibold mb-3">Identified Hazards & Controls</h3>
                <div className="bg-background border rounded-lg p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">Electrical Work</p>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">Medium Risk</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Control Measures: Isolation procedures, testing equipment, PPE (insulated gloves, safety boots)
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">Working at Height</p>
                      <Badge variant="outline" className="text-red-600 border-red-600">High Risk</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Control Measures: Fall arrest equipment, platform inspection, safety harness required
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">Manual Handling</p>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">Low Risk</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Control Measures: Mechanical aids available, team lift for heavy items, proper lifting technique
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Procedures */}
              <div>
                <h3 className="font-semibold mb-3">Emergency Procedures</h3>
                <div className="bg-background border rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-red-600">1.</span>
                    <p>Emergency Contact: Site Manager - {job.contactPhone || "07700 900456"}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-red-600">2.</span>
                    <p>First Aid Kit Location: Site Office, Building Entrance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-red-600">3.</span>
                    <p>Assembly Point: Main Car Park (North Side)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-red-600">4.</span>
                    <p>In case of incident: Secure area, call emergency services (999), notify site contact</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* PAGE 3: WORK COMPLETION (with internal-only fields) */}
            <TabsContent value="page3" className="space-y-6 mt-6">
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold">WORK COMPLETION REPORT</h2>
                  <p className="text-sm text-muted-foreground">LTES Group - Page 3 of 3</p>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Job Number</p>
                    <p className="font-bold">{job.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completion Date</p>
                    <p className="font-bold">{format(new Date(job.scheduledDate), "PPP")}</p>
                  </div>
                </div>
              </div>

              {/* Work Summary (Customer View) */}
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

              {/* Materials Used (Internal Only - highlighted) */}
              <div className="border-2 border-blue-500 rounded-lg p-1">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-t-lg p-2">
                  <Badge className="bg-blue-600 text-white">Internal Only - Not shown to customer</Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Materials Used (Internal Tracking)
                  </h3>
                  <div className="bg-background border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">Item</th>
                          <th className="text-left p-3">Part Number</th>
                          <th className="text-center p-3">Qty</th>
                          <th className="text-right p-3">Unit Price</th>
                          <th className="text-right p-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{material.item}</td>
                            <td className="p-3 font-mono text-xs">{material.partNumber}</td>
                            <td className="text-center p-3">{material.quantity}</td>
                            <td className="text-right p-3">£{material.unitPrice.toFixed(2)}</td>
                            <td className="text-right p-3 font-medium">£{material.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Cost Summary (Customer View) */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Summary
                </h3>
                <div className="bg-background border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Labor ({timeLog.totalHours} hrs)</span>
                    <span className="font-medium">£{costs.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Materials</span>
                    <span className="font-medium">£{costs.materialsCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Travel ({job.distance} km)</span>
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
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-between pt-4 border-t">
            <div className="flex gap-2">
              {currentPage !== "page1" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const pages = ["page1", "page2", "page3"];
                    const currentIndex = pages.indexOf(currentPage);
                    if (currentIndex > 0) setCurrentPage(pages[currentIndex - 1]);
                  }}
                >
                  Previous
                </Button>
              )}
              {currentPage !== "page3" && (
                <Button
                  onClick={() => {
                    const pages = ["page1", "page2", "page3"];
                    const currentIndex = pages.indexOf(currentPage);
                    if (currentIndex < 2) setCurrentPage(pages[currentIndex + 1]);
                  }}
                >
                  Next Page
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {currentPage === "page3" && (
                <Button onClick={handleApproveAndEmail} disabled={!signature}>
                  Approve and Email Report
                </Button>
              )}
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
