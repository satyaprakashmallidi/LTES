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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mail, Paperclip, Send, Save } from "lucide-react";

interface Job {
  id: string;
  siteName: string;
  scheduledDate: string;
  workSummary: string;
  invoiceNumber: string;
}

interface EmailPreviewDialogProps {
  job: Job;
  totalCost: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailPreviewDialog({ job, totalCost, open, onOpenChange }: EmailPreviewDialogProps) {
  const { toast } = useToast();
  const [customerEmail, setCustomerEmail] = useState("customer@example.com");
  const [customerName, setCustomerName] = useState("Valued Customer");
  
  const defaultMessage = `Dear ${customerName},

Please find attached the completion report for the recent work carried out at ${job.siteName} on ${format(new Date(job.scheduledDate), "PPP")}.

Work Summary:
${job.workSummary}

Total Cost: £${totalCost.toFixed(2)}
Invoice Number: ${job.invoiceNumber}

If you have any questions or require any clarifications regarding this work, please don't hesitate to contact us.

Best regards,
LTES Group
Email: office@ltesgroup.co.uk
Phone: +44 (0) 1234 567890`;

  const [emailMessage, setEmailMessage] = useState(defaultMessage);

  const handleSendEmail = () => {
    toast({
      title: "Email Sent Successfully! (Demo Mode)",
      description: `Report has been sent to ${customerEmail}`,
      className: "bg-success text-success-foreground",
    });
    onOpenChange(false);
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Email draft has been saved for later",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Report - {job.id}
          </DialogTitle>
          <DialogDescription>
            Review and edit the email before sending (Demo Mode)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Header Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <Label htmlFor="customer-email">To</Label>
              <Input
                id="customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <Label htmlFor="from-email">From</Label>
              <Input
                id="from-email"
                value="office@ltesgroup.co.uk"
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={`Job Completion Report - ${job.id}`}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <Separator />

          {/* Attachment Display */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Attachments:</span>
            </div>
            <div className="mt-2 flex items-center gap-2 bg-background rounded p-2 border">
              <Paperclip className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">Job_Report_{job.id}.pdf</span>
              <span className="text-xs text-muted-foreground ml-auto">(Mock - 245 KB)</span>
            </div>
          </div>

          <Separator />

          {/* Email Message Body */}
          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Edit the message as needed before sending
            </p>
          </div>

          {/* Preview Box */}
          <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="bg-background rounded p-3 text-sm whitespace-pre-wrap">
              {emailMessage}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center italic">
            Demo Mode: No actual email will be sent. This is for demonstration purposes only.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
