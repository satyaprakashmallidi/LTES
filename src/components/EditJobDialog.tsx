import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, Calendar, MapPin, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type JobStatus = "Not done" | "Booked" | "Complete";
type RAMSStatus = "Approved" | "Pending" | "Not Required";

interface EditHistory {
  timestamp: string;
  field: string;
  value: string;
  editor: string;
}

interface Job {
  id: string;
  siteName: string;
  technician: string;
  status: JobStatus;
  ramsStatus: RAMSStatus;
  reportLink: string;
  invoiceNumber: string;
  scheduledDate: string;
  workSummary: string;
  quoteNumber: string;
  quoteLogic: string;
  distance: number;
  editHistory?: EditHistory[];
}

const editFormSchema = z.object({
  status: z.enum(["Not done", "Booked", "Complete"]),
  ramsStatus: z.enum(["Approved", "Pending", "Not Required"]),
  technician: z.string().trim().min(1, "Technician is required"),
  reportLink: z.string().trim().optional(),
  invoiceNumber: z.string().trim().optional(),
  additionalNotes: z.string().trim().optional(),
});

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedJob: Job) => void;
}

export function EditJobDialog({ job, open, onOpenChange, onSave }: EditJobDialogProps) {
  const [additionalNotes, setAdditionalNotes] = useState("");

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      status: job.status,
      ramsStatus: job.ramsStatus,
      technician: job.technician,
      reportLink: job.reportLink !== "-" ? job.reportLink : "",
      invoiceNumber: job.invoiceNumber !== "-" ? job.invoiceNumber : "",
      additionalNotes: "",
    },
  });

  const onSubmit = (data: z.infer<typeof editFormSchema>) => {
    const timestamp = new Date().toISOString();
    const newHistory: EditHistory[] = job.editHistory || [];

    // Track what changed
    if (data.status !== job.status) {
      newHistory.push({
        timestamp,
        field: "status",
        value: data.status,
        editor: "Current User",
      });
    }
    if (data.ramsStatus !== job.ramsStatus) {
      newHistory.push({
        timestamp,
        field: "ramsStatus",
        value: data.ramsStatus,
        editor: "Current User",
      });
    }
    if (data.technician !== job.technician) {
      newHistory.push({
        timestamp,
        field: "technician",
        value: data.technician,
        editor: "Current User",
      });
    }
    if (data.reportLink && data.reportLink !== job.reportLink) {
      newHistory.push({
        timestamp,
        field: "reportLink",
        value: data.reportLink,
        editor: "Current User",
      });
    }
    if (data.invoiceNumber && data.invoiceNumber !== job.invoiceNumber) {
      newHistory.push({
        timestamp,
        field: "invoiceNumber",
        value: data.invoiceNumber,
        editor: "Current User",
      });
    }
    if (data.additionalNotes && data.additionalNotes.trim()) {
      newHistory.push({
        timestamp,
        field: "additionalNotes",
        value: data.additionalNotes,
        editor: "Current User",
      });
    }

    const updatedJob: Job = {
      ...job,
      status: data.status,
      ramsStatus: data.ramsStatus,
      technician: data.technician,
      reportLink: data.reportLink || "-",
      invoiceNumber: data.invoiceNumber || "-",
      editHistory: newHistory,
    };

    onSave(updatedJob);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Details - {job.id}</DialogTitle>
          <DialogDescription>
            Update job information. Original data is locked and timestamped.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Original Data - Locked Section */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Original Data (Locked)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Site Name
                  </p>
                  <p className="font-medium">{job.siteName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {job.scheduledDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Scheduled Date
                  </p>
                  <p className="font-medium">{job.scheduledDate}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground mb-1">Original Work Summary</p>
                  <p className="font-medium text-sm leading-relaxed bg-background/50 p-3 rounded">
                    {job.workSummary}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Quote Number
                  </p>
                  <p className="font-medium">{job.quoteNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Distance</p>
                  <p className="font-medium">{job.distance} km</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Update Job Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Not done">Not done</SelectItem>
                          <SelectItem value="Booked">Booked</SelectItem>
                          <SelectItem value="Complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ramsStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAMS Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Not Required">Not Required</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Technician</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reportLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Link</FormLabel>
                      <FormControl>
                        <Input placeholder="SC-2024-XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-2024-XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Additional Notes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Add New Notes</h3>
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Updates/Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any new information, updates, or notes..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      This will be timestamped and added to the job history
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Previous Edit History */}
            {job.editHistory && job.editHistory.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Edit History</h3>
                  <div className="bg-muted/30 rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-3">
                    {job.editHistory.map((edit, idx) => (
                      <div key={idx} className="text-sm border-l-2 border-primary pl-3">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(edit.timestamp), "PPP 'at' p")} - {edit.editor}
                        </p>
                        <p className="font-medium">
                          {edit.field === "additionalNotes" ? (
                            <span className="text-foreground">{edit.value}</span>
                          ) : (
                            <span>
                              Updated <span className="text-primary">{edit.field}</span> to:{" "}
                              <span className="text-foreground">{edit.value}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
