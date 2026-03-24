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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldAlert,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";

interface RAMSWorkflowDialogProps {
  jobId: string;
  jobNumber: string;
  siteName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RAMSWorkflowDialog({
  jobId,
  jobNumber,
  siteName,
  open,
  onOpenChange,
}: RAMSWorkflowDialogProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"pending" | "uploaded" | "approved" | "rejected">("pending");
  const [assignedTo, setAssignedTo] = useState("Luke Thompson");
  const [documentUrl, setDocumentUrl] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, this would upload to Supabase Storage
      setDocumentUrl(file.name);
      setStatus("uploaded");
      toast({
        title: "RAMS Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleApprove = () => {
    setStatus("approved");
    toast({
      title: "RAMS Approved",
      description: "Job can now proceed. Document will be sent to customer.",
      className: "bg-green-600 text-white",
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting the RAMS.",
        variant: "destructive",
      });
      return;
    }
    setStatus("rejected");
    toast({
      title: "RAMS Rejected",
      description: "H&S team has been notified to revise the document.",
      variant: "destructive",
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting RAMS Creation
          </Badge>
        );
      case "uploaded":
        return (
          <Badge className="bg-blue-600 text-white">
            <FileText className="h-3 w-3 mr-1" />
            Awaiting Approval
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved - Ready to Proceed
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600 text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected - Requires Revision
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            RAMS Workflow - {jobNumber}
          </DialogTitle>
          <DialogDescription>
            Manage Risk Assessment & Method Statement for this job
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Information */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Job Number</p>
                <p className="font-bold">{jobNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Site Name</p>
                <p className="font-bold">{siteName}</p>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Current Status
            </h3>
            <div className="flex items-center justify-between bg-background border rounded-lg p-4">
              {getStatusBadge()}
              <span className="text-sm text-muted-foreground">
                Updated: {format(new Date(), "PPP 'at' p")}
              </span>
            </div>
          </div>

          <Separator />

          {/* H&S Assignment */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              H&S Team Assignment
            </h3>
            <div className="bg-background border rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Assigned To</p>
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter H&S person name"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Notification will be sent to assigned H&S person</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Document Upload */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              RAMS Document Upload
            </h3>
            <div className="bg-background border rounded-lg p-4 space-y-3">
              {status === "pending" && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    H&S team will create and upload RAMS document here
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
              {(status === "uploaded" || status === "approved" || status === "rejected") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Uploaded Document</p>
                  <div className="flex items-center gap-2 bg-muted/30 p-3 rounded">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{documentUrl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Uploaded: {format(new Date(), "PPP 'at' p")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Approval/Rejection Actions */}
          {status === "uploaded" && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Approval Actions</h3>
                <div className="bg-background border rounded-lg p-4 space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve RAMS
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject RAMS
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rejection Reason (if rejecting)
                    </label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why the RAMS is being rejected..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Approved Status Info */}
          {status === "approved" && (
            <>
              <Separator />
              <div className="bg-green-50 dark:bg-green-950 border border-green-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      RAMS Approved - Job Ready to Proceed
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      The RAMS document has been approved and will be automatically sent to the customer.
                      Technicians can now proceed with the job.
                    </p>
                    <div className="text-xs text-green-700 dark:text-green-300 mt-3">
                      Approved by: {assignedTo} on {format(new Date(), "PPP 'at' p")}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Rejected Status Info */}
          {status === "rejected" && (
            <>
              <Separator />
              <div className="bg-red-50 dark:bg-red-950 border border-red-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      RAMS Rejected - Requires Revision
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      The RAMS document has been rejected. H&S team will be notified to revise and resubmit.
                    </p>
                    {rejectionReason && (
                      <div className="bg-red-100 dark:bg-red-900 rounded p-3 mt-3">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
