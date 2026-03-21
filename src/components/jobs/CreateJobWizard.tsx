import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Job, type ContractType, type InverterProduction, type Priority, type JobStatus,
  engineers,
  calculatePriority, calculateStatus, generateJobId,
} from "@/data/mockJobs";
import { useFaultCodes } from "@/hooks/useFaultCodes";
import { useSites } from "@/hooks/useSites";
import { useAllEquipment } from "@/hooks/useSiteEquipment";
import { EngineerAvailabilityPanel } from "./EngineerAvailabilityPanel";

interface CreateJobWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (job: Job) => void;
  allJobs: Job[];
  editJob?: Job | null;
  prefillScheduledDate?: string;
  initialStep?: number;
}

const emptyForm = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  siteId: "",
  inverterLocation: "",
  contractType: "" as ContractType | "",
  inverterInProduction: "" as InverterProduction | "",
  faultCode: "",
  reportedFault: "",
  quoteNumber: "",
  quoteDate: "",
  poNumber: "",
  poReceived: false,
  scheduledDate: "",
  engineer: "",
  accessCode: "",
  distance: 0,
  ramsSent: false,
  jobNotes: "",
  markComplete: false,
  invoiceNumber: "",
};

export function CreateJobWizard({ open, onOpenChange, onSave, allJobs, editJob, prefillScheduledDate, initialStep }: CreateJobWizardProps) {
  const { data: faultCodesByBrand } = useFaultCodes();
  const { data: sites = [] } = useSites();
  const { data: allEquipment = [] } = useAllEquipment();
  const [step, setStep] = useState(initialStep || 1);
  const [siteOpen, setSiteOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [quoteCalOpen, setQuoteCalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState(() =>
    editJob
      ? {
          contactName: editJob.contactName,
          contactPhone: editJob.contactPhone,
          contactEmail: editJob.contactEmail,
          siteId: editJob.siteId,
          inverterLocation: editJob.inverterLocation,
          contractType: editJob.contractType as ContractType | "",
          inverterInProduction: editJob.inverterInProduction as InverterProduction | "",
          faultCode: editJob.faultCode,
          reportedFault: editJob.reportedFault,
          quoteNumber: editJob.quoteNumber,
          quoteDate: editJob.quoteDate,
          poNumber: editJob.poNumber,
          poReceived: editJob.poReceived,
          scheduledDate: editJob.scheduledDate,
          engineer: editJob.engineer,
          accessCode: editJob.accessCode,
          distance: editJob.distance,
          ramsSent: editJob.ramsSent,
          jobNotes: editJob.jobNotes,
          markComplete: editJob.markComplete,
          invoiceNumber: editJob.invoiceNumber,
        }
      : { ...emptyForm, scheduledDate: prefillScheduledDate || "" }
  );

  // Reset form when dialog opens or editJob changes
  useEffect(() => {
    if (open) {
      setForm(
        editJob
          ? {
              contactName: editJob.contactName,
              contactPhone: editJob.contactPhone,
              contactEmail: editJob.contactEmail,
              siteId: editJob.siteId,
              inverterLocation: editJob.inverterLocation,
              contractType: editJob.contractType as ContractType | "",
              inverterInProduction: editJob.inverterInProduction as InverterProduction | "",
              faultCode: editJob.faultCode,
              reportedFault: editJob.reportedFault,
              quoteNumber: editJob.quoteNumber,
              quoteDate: editJob.quoteDate,
              poNumber: editJob.poNumber,
              poReceived: editJob.poReceived,
              scheduledDate: editJob.scheduledDate,
              engineer: editJob.engineer,
              accessCode: editJob.accessCode,
              distance: editJob.distance,
              ramsSent: editJob.ramsSent,
              jobNotes: editJob.jobNotes,
              markComplete: editJob.markComplete,
              invoiceNumber: editJob.invoiceNumber,
            }
          : { ...emptyForm, scheduledDate: prefillScheduledDate || "" }
      );
      setStep(initialStep || 1);
      setErrors({});
    }
  }, [open, editJob, prefillScheduledDate, initialStep]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // Derived data
  const selectedSite = sites.find(s => s.id === form.siteId);
  const equipmentForSite = form.siteId
    ? allEquipment.filter(e => e.site_id === form.siteId)
    : [];
  // Build a location key from serial_number for selection
  const equipmentList = equipmentForSite.map(e => ({
    location: e.serial_number || e.id,
    type: e.equipment_type || "",
    model: e.model || "",
    serial: e.serial_number || "",
    brand: e.manufacturer || "",
    notes: e.notes || "",
  }));
  const selectedEquipment = equipmentList.find(e => e.location === form.inverterLocation);
  const brand = selectedEquipment?.brand || "";
  const availableFaultCodes = brand ? (faultCodesByBrand?.[brand] || []) : [];

  const priority: Priority = (form.contractType && form.inverterInProduction)
    ? calculatePriority(form.inverterInProduction as InverterProduction, form.contractType as ContractType)
    : "LOW";

  const autoStatus: JobStatus = calculateStatus({
    siteName: selectedSite?.site_name || "",
    reportedFault: form.reportedFault,
    faultCode: form.faultCode,
    quoteNumber: form.quoteNumber,
    quoteDate: form.quoteDate,
    contractType: (form.contractType || "Chargeable") as ContractType,
    poReceived: form.poReceived,
    scheduledDate: form.scheduledDate,
    engineer: form.engineer,
    markComplete: form.markComplete,
    invoiceNumber: form.invoiceNumber,
  });

  const isUrgentSLA = form.inverterInProduction === "No" && form.contractType === "Contract/SLA";

  // Sort engineers by availability
  const sortedEngineers = useMemo(() => {
    if (!form.scheduledDate) return engineers;
    return [...engineers].sort((a, b) => {
      const aJobs = allJobs.filter(j => j.scheduledDate === form.scheduledDate && j.engineer === a.name).length;
      const bJobs = allJobs.filter(j => j.scheduledDate === form.scheduledDate && j.engineer === b.name).length;
      return aJobs - bJobs;
    });
  }, [form.scheduledDate, allJobs]);

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.siteId) errs.siteId = "Site must be selected";
    if (!form.reportedFault && !form.faultCode) errs.reportedFault = "Reported fault or fault code required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSave = () => {
    const site = sites.find(s => s.id === form.siteId);
    const equip = equipmentList.find(e => e.location === form.inverterLocation);

    const job: Job = {
      id: editJob?.id || generateJobId(allJobs),
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      siteName: site?.site_name || "",
      siteId: form.siteId,
      address: site?.address || "",
      inverterLocation: form.inverterLocation,
      contractType: (form.contractType || "Chargeable") as ContractType,
      inverterType: equip?.type || "",
      inverterModel: equip?.model || "",
      serialNumber: equip?.serial || "",
      inverterInProduction: (form.inverterInProduction || "Yes") as InverterProduction,
      faultCode: form.faultCode,
      reportedFault: form.reportedFault,
      priority,
      status: autoStatus,
      ramsStatus: editJob?.ramsStatus || "Pending",
      quoteNumber: form.quoteNumber,
      quoteDate: form.quoteDate,
      poNumber: form.poNumber,
      poReceived: form.poReceived,
      scheduledDate: form.scheduledDate,
      engineer: form.engineer,
      accessCode: form.accessCode,
      distance: form.distance,
      ramsSent: form.ramsSent,
      jobNotes: form.jobNotes,
      markComplete: form.markComplete,
      invoiceNumber: form.invoiceNumber,
      reportLink: editJob?.reportLink || "",
    };

    onSave(job);
    onOpenChange(false);
    setForm(emptyForm);
    setStep(1);
  };

  const priorityColors: Record<Priority, string> = {
    HIGH: "bg-red-600 text-white",
    MEDIUM: "bg-amber-500 text-white",
    LOW: "bg-green-600 text-white",
  };

  const statusColors: Record<JobStatus, string> = {
    "Logged Fault": "bg-red-600 text-white",
    "Quote Sent": "bg-amber-500 text-white",
    "Approved": "bg-blue-600 text-white",
    "In Progress": "bg-purple-600 text-white",
    "Completed": "bg-zinc-700 text-white",
    "Invoiced": "bg-zinc-500 text-white",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setStep(1); setForm(emptyForm); setErrors({}); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editJob ? `Edit ${editJob.id}` : "Create New Job"}</DialogTitle>
          <DialogDescription>
            Step {step} of 2 — {step === 1 ? "Job Logging" : "Scheduling & Documents"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex gap-2 mb-4">
          <div className={cn("h-1.5 flex-1 rounded-full", step >= 1 ? "bg-primary" : "bg-muted")} />
          <div className={cn("h-1.5 flex-1 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Contact fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Contact Name</Label>
                <Input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Name" />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="Phone" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="Email" />
              </div>
            </div>

            <Separator />

            {/* Site Name - searchable */}
            <div>
              <Label>Site Name *</Label>
              <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className={cn("w-full justify-between", !form.siteId && "text-muted-foreground")}>
                    {selectedSite?.site_name || "Search and select site..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 pointer-events-auto" align="start">
                  <Command>
                    <CommandInput placeholder="Type to search sites..." />
                    <CommandList>
                      <CommandEmpty>No site found.</CommandEmpty>
                      <CommandGroup>
                        {sites.map(site => (
                          <CommandItem
                            key={site.id}
                            value={site.site_name}
                            onSelect={() => {
                              set("siteId", site.id);
                              set("inverterLocation", "");
                              set("faultCode", "");
                              setSiteOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", form.siteId === site.id ? "opacity-100" : "opacity-0")} />
                            <div>
                              <p className="text-sm font-medium">{site.site_name}</p>
                              <p className="text-xs text-muted-foreground">{site.address || site.postcode || ""}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.siteId && <p className="text-xs text-destructive mt-1">{errors.siteId}</p>}
            </div>

            {/* Inverter Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Inverter Location *</Label>
                <Select value={form.inverterLocation} onValueChange={v => { set("inverterLocation", v); set("faultCode", ""); }} disabled={!form.siteId}>
                  <SelectTrigger><SelectValue placeholder={form.siteId ? "Select location" : "Select site first"} /></SelectTrigger>
                  <SelectContent>
                    {equipmentList.map(e => (
                      <SelectItem key={e.location} value={e.location}>{e.location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contract Type *</Label>
                <Select value={form.contractType} onValueChange={v => set("contractType", v as ContractType)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contract/SLA">Contract/SLA</SelectItem>
                    <SelectItem value="Chargeable">Chargeable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-filled equipment */}
            {selectedEquipment && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-muted-foreground">Inverter Type</Label>
                  <Input value={selectedEquipment.type} readOnly className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Inverter Model</Label>
                  <Input value={selectedEquipment.model} readOnly className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Serial Number</Label>
                  <Input value={selectedEquipment.serial} readOnly className="bg-muted/50" />
                </div>
              </div>
            )}

            <Separator />

            {/* Production status + fault code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Inverter In Production</Label>
                <Select value={form.inverterInProduction} onValueChange={v => set("inverterInProduction", v as InverterProduction)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes Reduced Production">Yes Reduced Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fault Code</Label>
                <Select value={form.faultCode} onValueChange={v => set("faultCode", v)} disabled={!brand}>
                  <SelectTrigger><SelectValue placeholder={brand ? "Select fault code" : "Select location first"} /></SelectTrigger>
                  <SelectContent>
                    {availableFaultCodes.map(fc => (
                      <SelectItem key={fc.code} value={fc.code}>
                        {fc.code} — {fc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reported Fault */}
            <div>
              <Label>Reported Fault *</Label>
              <Textarea
                value={form.reportedFault}
                onChange={e => set("reportedFault", e.target.value)}
                placeholder="Describe the reported fault..."
                rows={3}
              />
              {errors.reportedFault && <p className="text-xs text-destructive mt-1">{errors.reportedFault}</p>}
            </div>

            {/* Priority badge + SLA warning */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Calculated Priority:</span>
              <Badge className={priorityColors[priority]}>{priority}</Badge>
              {isUrgentSLA && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>⚠ Urgent SLA — Inverter Down</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleNext}>Next →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Auto status */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Auto Status:</span>
              <Badge className={statusColors[autoStatus]}>{autoStatus}</Badge>
              <Badge className={priorityColors[priority]}>{priority}</Badge>
            </div>

            <Separator />

            {/* Quote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Quote Number</Label>
                <Input value={form.quoteNumber} onChange={e => set("quoteNumber", e.target.value)} placeholder="Q-2024-XXX" />
              </div>
              <div>
                <Label>Quote Date</Label>
                <Popover open={quoteCalOpen} onOpenChange={setQuoteCalOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.quoteDate && "text-muted-foreground")}>
                      {form.quoteDate || "Pick date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.quoteDate ? new Date(form.quoteDate) : undefined}
                      onSelect={d => { set("quoteDate", d ? format(d, "yyyy-MM-dd") : ""); setQuoteCalOpen(false); }}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* PO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <Label>PO Number</Label>
                <Input value={form.poNumber} onChange={e => set("poNumber", e.target.value)} placeholder="PO-2024-XXX" />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Checkbox checked={form.poReceived} onCheckedChange={v => set("poReceived", !!v)} id="po-received" />
                <Label htmlFor="po-received" className="cursor-pointer">PO Received</Label>
              </div>
            </div>

            <Separator />

            {/* Scheduled date + engineer */}
            <div>
              <Label>Scheduled Date</Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.scheduledDate && "text-muted-foreground")}>
                    {form.scheduledDate || "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={form.scheduledDate ? new Date(form.scheduledDate) : undefined}
                    onSelect={d => { set("scheduledDate", d ? format(d, "yyyy-MM-dd") : ""); setCalOpen(false); }}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Engineer availability panel */}
            {form.scheduledDate && (
              <EngineerAvailabilityPanel
                selectedDate={form.scheduledDate}
                jobs={allJobs}
                onSelectEngineer={name => set("engineer", name)}
              />
            )}

            <div>
              <Label>Engineer Allocated</Label>
              <Select value={form.engineer} onValueChange={v => set("engineer", v)}>
                <SelectTrigger><SelectValue placeholder="Select engineer" /></SelectTrigger>
                <SelectContent>
                  {sortedEngineers.map(e => (
                    <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Other fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Access Code</Label>
                <Input value={form.accessCode} onChange={e => set("accessCode", e.target.value)} placeholder="Gate code, badge info..." />
              </div>
              <div>
                <Label>Distance from Base (km)</Label>
                <Input type="number" value={form.distance || ""} onChange={e => set("distance", Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={form.ramsSent} onCheckedChange={v => set("ramsSent", !!v)} id="rams-sent" />
              <Label htmlFor="rams-sent" className="cursor-pointer">RAMS Sent</Label>
            </div>

            <Separator />

            <div>
              <Label>Job Notes</Label>
              <Textarea value={form.jobNotes} onChange={e => set("jobNotes", e.target.value)} placeholder="Additional notes..." rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={form.markComplete} onCheckedChange={v => set("markComplete", !!v)} id="mark-complete" />
              <Label htmlFor="mark-complete" className="cursor-pointer">Mark Job Complete</Label>
            </div>

            <div>
              <Label>Invoice Number</Label>
              <Input value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} placeholder="INV-2024-XXX" />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editJob ? "Update Job" : "Create Job"}</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
