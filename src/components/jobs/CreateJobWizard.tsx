import { useState, useMemo, useEffect, useRef } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  CalendarIcon, Check, ChevronsUpDown, AlertTriangle, ShieldAlert,
  Upload, FileText, Zap, Mic, MicOff,
  UserCircle, MapPin, ClipboardList, ShoppingCart, CreditCard, CheckCircle2,
  HardDrive, Info, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Job, type ContractType, type InverterProduction, type Priority, type JobStatus,
  engineers, calculatePriority, calculateStatus, generateJobId, getEngineerJobCount,
} from "@/data/mockJobs";
import { useFaultCodes } from "@/hooks/useFaultCodes";
import { useSites } from "@/hooks/useSites";
import { useAllEquipment } from "@/hooks/useSiteEquipment";
import { EngineerAvailabilityPanel } from "./EngineerAvailabilityPanel";
import { VoiceInput } from "../VoiceInput";
import { useTeam } from "@/hooks/useTeam";

interface CreateJobWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (job: Job) => void;
  allJobs: Job[];
  editJob?: Job | null;
  prefillScheduledDate?: string;
  initialStep?: number;
  role?: "Admin" | "Simon";
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
  quoteDocument: "",
  poNumber: "",
  poReceived: false,
  poAttachment: "",
  scheduledDate: "",
  engineer: "",
  accessCode: "",
  distance: 0,
  ramsSent: false,
  ramsAttachment: "",
  jobNotes: "",
  jobSheet: "",
  markComplete: false,
  siteInduction: "",
  invoiceNumber: "",
  invoiceAttachment: "",
  scheduledTime: ""
};

// ─── File upload helper ─────────────────────────────────────────────────────
function FileUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">
        {label}
      </Label>
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="w-full justify-start bg-sidebar-accent/30 border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground h-10"
      >
        <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="truncate text-xs">
          {value ? (
            <span className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 flex-shrink-0" />
              {value}
            </span>
          ) : (
            "Upload file..."
          )}
        </span>
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onChange(file.name);
          e.target.value = "";
        }}
      />
      {value && (
        <p className="text-[10px] text-green-400 font-medium pl-1">
          ✓ {value}
        </p>
      )}
    </div>
  );
}

// ─── Priority badge ─────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={cn(
      "w-full h-11 justify-center text-xs font-black rounded-md",
      priority === "HIGH" ? "bg-red-600 hover:bg-red-700" :
      priority === "MEDIUM" ? "bg-amber-600 hover:bg-amber-700" :
      "bg-green-600 hover:bg-green-700"
    )}>
      {priority}
    </Badge>
  );
}

// ─── Auto status display ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<JobStatus, { icon: React.ReactNode; color: string; border: string; bg: string }> = {
  "Logged Fault": { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/5" },
  "Quote Sent":   { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5" },
  "Approved":     { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-blue-400",  border: "border-blue-500/30",  bg: "bg-blue-500/5" },
  "Scheduled":    { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-purple-400",border: "border-purple-500/30",bg: "bg-purple-500/5" },
  "In Progress": { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-blue-500",  border: "border-blue-600/30",  bg: "bg-blue-600/5" },
  "Completed":    { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-green-400",  border: "border-green-500/30", bg: "bg-green-500/5" },
  "Invoiced":     { icon: <Circle className="h-5 w-5 fill-current" />, color: "text-gray-400",   border: "border-gray-500/30", bg: "bg-gray-500/5" },
};

function AutoStatusDisplay({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={cn("rounded-lg border p-3 flex items-center gap-3", cfg.border, cfg.bg)}>
      <div className={cn("flex-shrink-0 animate-pulse", cfg.color)}>{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-black uppercase tracking-wide", cfg.color)}>{status}</p>
        <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">
          Status advances automatically as you complete each stage below
        </p>
      </div>
    </div>
  );
}

export function CreateJobWizard({
  open, onOpenChange, onSave, allJobs, editJob, prefillScheduledDate, initialStep, role = "Admin",
}: CreateJobWizardProps) {
  const { data: faultCodesByBrand } = useFaultCodes();
  const { data: sites = [] } = useSites();
  const { data: allEquipment = [] } = useAllEquipment();
  const { team: teamMembers = [] } = useTeam();
  const dbEngineers = useMemo(() => {
    return teamMembers.filter(m => m.role === "Engineer" || m.role === "Admin");
  }, [teamMembers]);

  const [step, setStep] = useState(initialStep || 1);
  const [siteOpen, setSiteOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [quoteCalOpen, setQuoteCalOpen] = useState(false);
  const [faultOpen, setFaultOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSimon = role === "Simon";

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
          quoteDocument: editJob.quoteDocument || "",
          poNumber: editJob.poNumber,
          poReceived: editJob.poReceived,
          poAttachment: editJob.poAttachment || "",
          scheduledDate: editJob.scheduledDate,
          engineer: editJob.engineer,
          accessCode: editJob.accessCode,
          distance: editJob.distance,
          ramsSent: editJob.ramsSent,
          ramsAttachment: editJob.ramsAttachment || "",
          jobNotes: editJob.jobNotes,
          jobSheet: editJob.jobSheet || "",
          markComplete: editJob.markComplete,
          siteInduction: editJob.siteInduction || "",
          invoiceNumber: editJob.invoiceNumber || "",
          invoiceAttachment: editJob.invoiceAttachment || "",
          scheduledTime: editJob.scheduledTime || ""
        }
      : { ...emptyForm, scheduledDate: prefillScheduledDate || "" }
  );

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
              quoteDocument: editJob.quoteDocument || "",
              poNumber: editJob.poNumber,
              poReceived: editJob.poReceived,
              poAttachment: editJob.poAttachment || "",
              scheduledDate: editJob.scheduledDate,
              engineer: editJob.engineer,
              accessCode: editJob.accessCode,
              distance: editJob.distance,
              ramsSent: editJob.ramsSent,
              ramsAttachment: editJob.ramsAttachment || "",
              jobNotes: editJob.jobNotes,
              jobSheet: editJob.jobSheet || "",
              markComplete: editJob.markComplete,
              siteInduction: editJob.siteInduction || "",
              invoiceNumber: editJob.invoiceNumber || "",
              invoiceAttachment: editJob.invoiceAttachment || "",
              scheduledTime: editJob.scheduledTime || ""
            }
          : { ...emptyForm, scheduledDate: prefillScheduledDate || "" }
      );
      setStep(initialStep || 1);
      setErrors({});
    }
  }, [open, editJob, prefillScheduledDate, initialStep]);

  // ─── Cascade loading: pre-fill site contact/access when sites load ──────────
  useEffect(() => {
    if (!editJob || !sites.length) return;
    const site = sites.find(s => s.id === editJob.siteId);
    if (!site) return;
    setForm(prev => ({
      ...prev,
      // Pre-fill contact from site if form is still empty
      contactName: prev.contactName || site.site_contact_name || prev.contactName,
      contactPhone: prev.contactPhone || site.site_contact_phone || prev.contactPhone,
      // Pre-fill access code from site
      accessCode: prev.accessCode || site.access_codes || prev.accessCode,
    }));
  }, [sites, editJob?.siteId]);

  // ─── Cascade loading: sync inverter details when equipment data loads ─────────
  useEffect(() => {
    if (!editJob || !allEquipment.length) return;
    const siteEquipment = allEquipment.filter(e => e.site_id === editJob.siteId);
    // Try to find the saved inverter location in the loaded equipment
    const matchedEquip = siteEquipment.find(e => {
      const loc = e.location || e.serial_number || e.id;
      return loc === editJob.inverterLocation || e.location === editJob.inverterLocation;
    });
    if (matchedEquip) {
      // Equipment found in DB — use DB values (already loaded via selectedEquipment)
      // No action needed; selectedEquipment computed in render body will pick it up
    } else {
      // Equipment NOT found in DB — fall back to editJob's stored values
      setForm(prev => ({
        ...prev,
        inverterLocation: editJob.inverterLocation || prev.inverterLocation,
      }));
    }
  }, [allEquipment, editJob?.siteId, editJob?.inverterLocation]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const selectedSite = sites.find(s => s.id === form.siteId);
  const equipmentForSite = form.siteId ? allEquipment.filter(e => e.site_id === form.siteId) : [];
  const equipmentList = equipmentForSite.length > 0
    ? equipmentForSite.map(e => ({
        location: e.location || e.serial_number || e.id,
        type: e.equipment_type || "",
        model: e.model || "",
        serial: e.serial_number || "",
        brand: e.manufacturer || "",
      }))
    : [{ location: "Manual Entry / Unknown", type: "", model: "", serial: "", brand: "" }];

  const selectedEquipment = equipmentList.find(e => e.location === form.inverterLocation);
  const brand = selectedEquipment?.brand || "";

  // Fault codes: Show all codes from all brands as requested
  const availableFaultCodes = useMemo(() => {
    if (!faultCodesByBrand) return [];
    
    const all: { code: string; label: string; severity: string }[] = [];
    Object.values(faultCodesByBrand).forEach(codes => {
      all.push(...(codes as any[]));
    });
    
    // De-duplicate by code
    const seen = new Set<string>();
    return all.filter(c => { 
      if (!c.code || seen.has(c.code)) return false; 
      seen.add(c.code); 
      return true; 
    }).sort((a, b) => a.code.localeCompare(b.code));
  }, [faultCodesByBrand]);

  const selectedFault = availableFaultCodes.find(fc => fc.code === form.faultCode);

  // Auto-calculate priority
  const priority: Priority = (form.contractType && form.inverterInProduction)
    ? calculatePriority(form.inverterInProduction as InverterProduction, form.contractType as ContractType)
    : "LOW";

  // Auto-calculate status
  const autoStatus: JobStatus = calculateStatus({
    quoteNumber: form.quoteNumber,
    quoteDate: form.quoteDate,
    contractType: (form.contractType || "Chargeable") as ContractType,
    poNumber: form.poNumber,
    poReceived: form.poReceived,
    scheduledDate: form.scheduledDate,
    engineer: form.engineer,
    jobSheetUploaded: !!form.jobSheet,
    markComplete: form.markComplete,
    invoiceNumber: form.invoiceNumber,
  });

  // Sorted engineers
  const sortedEngineers = useMemo(() => {
    const list = dbEngineers.length > 0 ? dbEngineers : engineers;
    if (!form.scheduledDate) return list;
    return [...list].sort((a, b) => {
      const aJobs = allJobs.filter(j => j.scheduledDate === form.scheduledDate && (j.engineer === a.name)).length;
      const bJobs = allJobs.filter(j => j.scheduledDate === form.scheduledDate && (j.engineer === b.name)).length;
      return aJobs - bJobs;
    });
  }, [form.scheduledDate, allJobs, dbEngineers]);

  // Availability summary
  const availSummary = useMemo(() => {
    const list = dbEngineers.length > 0 ? dbEngineers : engineers;
    if (!form.scheduledDate) return null;
    const engs = list.map(e => ({
      name: e.name,
      count: getEngineerJobCount(e.id, form.scheduledDate, allJobs),
    }));
    const free = engs.filter(e => e.count === 0).length;
    const busy = engs.filter(e => e.count > 0).length;
    return { free, busy };
  }, [form.scheduledDate, allJobs, dbEngineers]);

  // Engineer hint
  const engineerHint = useMemo(() => {
    if (!form.engineer || !form.scheduledDate) return null;
    const eng = engineers.find(e => e.name === form.engineer);
    if (!eng) return null;
    const count = getEngineerJobCount(eng.id, form.scheduledDate, allJobs);
    const engJobs = allJobs.filter(j => j.scheduledDate === form.scheduledDate && j.engineer === eng.name);
    if (count === 0) {
      return { type: "free", text: "✓ Available — no other jobs on this date" };
    }
    const sites = engJobs.map(j => j.siteName).join(", ");
    return {
      type: count === 1 ? "warn" : "error",
      text: count === 1 ? `⚠ 1 job assigned — ${sites}` : `✗ ${count} jobs assigned — ${sites}`,
    };
  }, [form.engineer, form.scheduledDate, allJobs]);

  const handleSave = () => {
    const site = sites.find(s => s.id === form.siteId);
    const equip = equipmentList.find(e => e.location === form.inverterLocation);

    const job: Job = {
      id: editJob?.id || "",           // DB UUID — filled after insert for new jobs
      jobNumber: editJob?.jobNumber || generateJobId(allJobs), // Display number
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
      quoteDocument: form.quoteDocument,
      poNumber: form.poNumber,
      poReceived: form.poReceived,
      poAttachment: form.poAttachment,
      scheduledDate: form.scheduledDate,
      engineer: form.engineer,
      accessCode: form.accessCode,
      distance: form.distance,
      ramsSent: form.ramsSent,
      ramsAttachment: form.ramsAttachment,
      jobNotes: form.jobNotes,
      jobSheet: form.jobSheet,
      markComplete: form.markComplete,
      siteInduction: form.siteInduction,
      invoiceNumber: form.invoiceNumber,
      invoiceAttachment: form.invoiceAttachment,
      reportLink: editJob?.reportLink || "",
      scheduledTime: form.scheduledTime
    };

    onSave(job);
    onOpenChange(false);
  };

  const handleNext = () => {
    const errs: Record<string, string> = {};
    if (!form.siteId) errs.siteId = "Please select a Site Name";
    if (!form.reportedFault && !form.faultCode) errs.reportedFault = "Please enter a Reported Fault or select a Fault Code";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  const isFilled = (val: string) => val && val.length > 0;
  const hasInverterData = selectedEquipment && selectedEquipment.location !== "Manual Entry / Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-tight">
            {editJob ? `EDIT JOB — ${editJob.jobNumber}` : "NEW JOB"} — PAGE {step} OF 2
          </DialogTitle>
          <DialogDescription className="text-sidebar-foreground/60">
            {step === 1 ? "Step 1: Select Customer, Site & Inverter" : "Step 2: Quote, PO & Scheduling"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1 mb-2">
          <div className={cn("h-1 flex-1 rounded-full transition-all", step >= 1 ? "bg-yellow-400" : "bg-sidebar-accent")} />
          <div className={cn("h-1 flex-1 rounded-full transition-all", step >= 2 ? "bg-yellow-400" : "bg-sidebar-accent")} />
        </div>

        {/* ─── PAGE 1 ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">

            {/* SECTION: Contact Information */}
            <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-3 flex items-center gap-2">
                <UserCircle className="h-3.5 w-3.5" />
                Contact Information
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Contact Name</Label>
                  <Input
                    value={form.contactName}
                    onChange={e => set("contactName", e.target.value)}
                    className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Phone</Label>
                  <Input
                    value={form.contactPhone}
                    onChange={e => set("contactPhone", e.target.value)}
                    className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                    placeholder="Enter phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Email</Label>
                  <Input
                    value={form.contactEmail}
                    onChange={e => set("contactEmail", e.target.value)}
                    type="email"
                    className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-sidebar-border" />

            {/* SECTION: Site Selection */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                Site Selection
              </p>

              {/* Site Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">
                  Site Name *
                </Label>
                <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between bg-sidebar-accent/50 border-sidebar-border h-11 text-white",
                        errors.siteId && "border-red-500"
                      )}
                    >
                      <span className={cn(!selectedSite && "text-sidebar-foreground/40")}>
                        {selectedSite?.site_name || "Search or select site..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 opacity-40" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-sidebar border-sidebar-border shadow-2xl">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Type to search..." className="text-white" />
                      <CommandList>
                        <CommandEmpty>No site found.</CommandEmpty>
                        <CommandGroup>
                          {sites.map(site => (
                            <CommandItem
                              key={site.id}
                              value={site.site_name}
                              className="text-white hover:bg-primary hover:text-black cursor-pointer"
                              onSelect={() => {
                                set("siteId", site.id);
                                set("inverterLocation", "");
                                set("faultCode", "");
                                setSiteOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", form.siteId === site.id ? "opacity-100" : "opacity-0")} />
                              {site.site_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.siteId && <p className="text-xs text-red-400 font-medium">{errors.siteId}</p>}
                <p className="text-[10px] text-sidebar-foreground/40 italic">
                  Site details, access codes, and contact info will be auto-filled
                </p>
              </div>

              {/* Inverter Location */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Inverter Location *</Label>
                <Select value={form.inverterLocation} onValueChange={v => set("inverterLocation", v)} disabled={!form.siteId}>
                  <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                    <SelectValue placeholder="Select inverter location" />
                  </SelectTrigger>
                  <SelectContent className="bg-sidebar border-sidebar-border text-white">
                    {equipmentList.map(e => (
                      <SelectItem key={e.location} value={e.location}>
                        {e.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contract Type */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Contract Type *</Label>
                <Select value={form.contractType} onValueChange={v => set("contractType", v as ContractType)}>
                  <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-sidebar border-sidebar-border text-white">
                    <SelectItem value="Contract/SLA">Contract/SLA</SelectItem>
                    <SelectItem value="Chargeable">Chargeable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SLA Warning Banner */}
              {form.contractType === "Contract/SLA" && (
                <div className={cn(
                  "rounded-lg border p-3 text-sm font-bold flex items-start gap-2",
                  form.inverterInProduction === "No"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : form.inverterInProduction === "Yes Reduced Production"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "hidden"
                )}>
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {form.inverterInProduction === "No"
                    ? "⚠ URGENT: SLA site with inverter down — 72-hour attendance required!"
                    : "⏱ SLA Contract — Priority attendance may be required"}
                </div>
              )}
            </div>

            {/* SECTION: Inverter Details (Auto-filled) */}
            {hasInverterData || form.inverterLocation ? (
              <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/20 p-4 space-y-3">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <HardDrive className="h-3.5 w-3.5" />
                  Inverter Details
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-sidebar-foreground/40 font-bold uppercase">Type</p>
                    <p className="text-sm font-semibold text-white bg-sidebar-accent/30 rounded px-2 py-1.5 border border-sidebar-border">
                      {hasInverterData ? (selectedEquipment.type || "—") : "Auto from location"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-sidebar-foreground/40 font-bold uppercase">Model</p>
                    <p className="text-sm font-semibold text-white bg-sidebar-accent/30 rounded px-2 py-1.5 border border-sidebar-border">
                      {hasInverterData ? (selectedEquipment.model || "—") : "Auto from location"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-sidebar-foreground/40 font-bold uppercase">Serial</p>
                    <p className="text-sm font-semibold text-white bg-sidebar-accent/30 rounded px-2 py-1.5 border border-sidebar-border">
                      {hasInverterData ? (selectedEquipment.serial || "—") : "Auto from location"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* SECTION: Fault Information */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Fault Information
              </p>

              {/* Inverter In Production */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Inverter In Production? *</Label>
                <Select
                  value={form.inverterInProduction}
                  onValueChange={v => set("inverterInProduction", v as InverterProduction)}
                >
                  <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-sidebar border-sidebar-border text-white">
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Yes Reduced Production">Yes Reduced Production</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fault Code + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Fault Code *</Label>
                  <Popover open={faultOpen} onOpenChange={setFaultOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={faultOpen}
                        disabled={availableFaultCodes.length === 0}
                        className="w-full justify-between bg-sidebar-accent/50 border-sidebar-border h-11 text-white hover:bg-sidebar-accent/70"
                      >
                        <span className={cn("truncate", !form.faultCode && "text-sidebar-foreground/40")}>
                          {form.faultCode 
                            ? `${form.faultCode}${selectedFault?.label ? ` — ${selectedFault.label}` : ""}`
                            : availableFaultCodes.length > 0 ? "Select fault code" : "No fault codes available"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-sidebar border-sidebar-border shadow-2xl z-[100]" align="start">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Search fault codes..." className="text-white" />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>No fault code found.</CommandEmpty>
                          <CommandGroup>
                            {availableFaultCodes.map(fc => (
                              <CommandItem
                                key={fc.code}
                                value={`${fc.code} ${fc.label}`}
                                className="text-white hover:bg-primary hover:text-black cursor-pointer data-[selected='true']:bg-primary data-[selected='true']:text-black"
                                onSelect={() => {
                                  set("faultCode", fc.code);
                                  setFaultOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", form.faultCode === fc.code ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                  <span className="font-bold">{fc.code}</span>
                                  {fc.label && <span className="text-[10px] opacity-70 line-clamp-1">{fc.label}</span>}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Priority</Label>
                  <PriorityBadge priority={priority} />
                </div>
              </div>

              {/* Fault severity hint */}
              {selectedFault && (
                <div className="flex items-start gap-2 text-xs font-medium text-primary bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  {selectedFault.label} {selectedFault.severity && `(${selectedFault.severity})`}
                </div>
              )}

              {/* Reported Fault */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">
                    Reported Fault
                    {errors.reportedFault && <span className="text-red-400 ml-1">— {errors.reportedFault}</span>}
                  </Label>
                  <VoiceInput
                    onTranscript={(text) => set("reportedFault", text)}
                    placeholder="Tap to speak"
                  />
                </div>
                <Textarea
                  value={form.reportedFault}
                  onChange={e => set("reportedFault", e.target.value)}
                  className="bg-sidebar-accent/50 border-sidebar-border text-white min-h-[80px]"
                  placeholder="Describe the issue reported by the customer..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                className="bg-primary text-black font-black uppercase tracking-tighter hover:bg-primary/90"
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* ─── PAGE 2 ─────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">

            {/* Auto-calculated Status */}
            <AutoStatusDisplay status={autoStatus} />

            {/* SECTION: Quote Details */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Quote Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Quote Number</Label>
                  <Input
                    value={form.quoteNumber}
                    onChange={e => set("quoteNumber", e.target.value)}
                    className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                    placeholder="Q-2026-XXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Quote Date Sent</Label>
                  <Popover open={quoteCalOpen} onOpenChange={setQuoteCalOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-sidebar-accent/50 border-sidebar-border h-10 text-white"
                      >
                        <span className={cn(!form.quoteDate && "text-sidebar-foreground/40")}>
                          {form.quoteDate ? format(new Date(form.quoteDate + "T00:00:00"), "PPP") : "Select date"}
                        </span>
                        <CalendarIcon className="h-4 w-4 opacity-40" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-sidebar border-sidebar-border" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={form.quoteDate ? new Date(form.quoteDate + "T00:00:00") : undefined}
                        onSelect={date => { set("quoteDate", date ? format(date, "yyyy-MM-dd") : ""); setQuoteCalOpen(false); }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <FileUpload
                label="Quote Document"
                value={form.quoteDocument}
                onChange={name => set("quoteDocument", name)}
              />
            </div>

            {/* SECTION: Purchase Order */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <ShoppingCart className="h-3.5 w-3.5" />
                Purchase Order
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Purchase Order (PO)</Label>
                  <Input
                    value={form.poNumber}
                    onChange={e => set("poNumber", e.target.value)}
                    className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                    placeholder="PO-XXXXXX"
                  />
                </div>
                <div className="space-y-1.5 flex items-end">
                  <div className="flex items-center gap-2 h-10 px-3 bg-sidebar-accent/30 border border-sidebar-border rounded-md">
                    <Checkbox
                      id="poReceived"
                      checked={form.poReceived}
                      onCheckedChange={v => set("poReceived", !!v)}
                      className="border-sidebar-border"
                    />
                    <Label htmlFor="poReceived" className="text-sm font-medium text-white cursor-pointer">
                      PO Received
                    </Label>
                  </div>
                </div>
              </div>
              <FileUpload
                label="PO Attachment"
                value={form.poAttachment}
                onChange={name => set("poAttachment", name)}
              />
            </div>

            {/* SECTION: Scheduling & Assignment */}
            {!isSimon ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Scheduling & Assignment</span>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Scheduled Date</Label>
                    <Popover open={calOpen} onOpenChange={setCalOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-sidebar-accent/50 border-sidebar-border h-11 text-white"
                        >
                          <span className={cn(!form.scheduledDate && "text-sidebar-foreground/40")}>
                            {form.scheduledDate
                              ? format(new Date(form.scheduledDate + "T00:00:00"), "PPP")
                              : "Select Date"}
                          </span>
                          <CalendarIcon className="h-4 w-4 opacity-40" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-sidebar border-sidebar-border" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={form.scheduledDate ? new Date(form.scheduledDate + "T00:00:00") : undefined}
                          onSelect={date => { set("scheduledDate", date ? format(date, "yyyy-MM-dd") : ""); setCalOpen(false); }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Scheduled Time</Label>
                    <Input
                      type="time"
                      value={form.scheduledTime}
                      onChange={e => set("scheduledTime", e.target.value)}
                      className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Assign Engineer</Label>
                    <Select value={form.engineer} onValueChange={v => set("engineer", v)}>
                      <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                        <SelectValue placeholder="Assign Engineer" />
                      </SelectTrigger>
                      <SelectContent className="bg-sidebar border-sidebar-border text-white">
                        {sortedEngineers.map(e => {
                          const count = form.scheduledDate
                            ? getEngineerJobCount(e.id, form.scheduledDate, allJobs)
                            : 0;
                          const freeLabel = count === 0 ? " ✓ Free" : "";
                          return (
                            <SelectItem key={e.id} value={e.name}>
                              {e.name}{count > 0 ? ` · ${count} job${count !== 1 ? "s" : ""}` : freeLabel}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {engineerHint && (
                      <p className={cn(
                        "text-xs font-medium pl-1",
                        engineerHint.type === "free" ? "text-green-400" :
                        engineerHint.type === "warn" ? "text-amber-400" :
                        "text-red-400"
                      )}>
                        {engineerHint.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Access Code + Distance */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Access Code</Label>
                    <Input
                      value={form.accessCode}
                      onChange={e => set("accessCode", e.target.value)}
                      className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                      placeholder="Site access code"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Distance from Base (km)</Label>
                    <Input
                      value={form.distance || ""}
                      onChange={e => set("distance", Number(e.target.value) || 0)}
                      type="number"
                      className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                      placeholder="0"
                    />
                  </div>
                </div>


                {/* RAMS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 h-10 px-3 bg-sidebar-accent/30 border border-sidebar-border rounded-md">
                      <Checkbox
                        id="ramsSent"
                        checked={form.ramsSent}
                        onCheckedChange={v => set("ramsSent", !!v)}
                        className="border-sidebar-border"
                      />
                      <Label htmlFor="ramsSent" className="text-sm font-medium text-white cursor-pointer">
                        RAMS Sent
                      </Label>
                    </div>
                  </div>
                  <FileUpload
                    label="RAMS Attachment"
                    value={form.ramsAttachment}
                    onChange={name => set("ramsAttachment", name)}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">SCHEDULING RESTRICTED</span>
                </div>
                <p className="text-xs text-sidebar-foreground/60 italic leading-relaxed">
                  Luke will schedule this job after PO is received. Contact Luke for scheduling updates.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Scheduled Date</Label>
                    <Input
                      value={form.scheduledDate}
                      className="bg-sidebar-accent/10 border-sidebar-border text-sidebar-foreground/30 cursor-not-allowed h-10"
                      readOnly
                      placeholder="Visit TBD"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Assigned Engineer</Label>
                    <Input
                      value={form.engineer}
                      className="bg-sidebar-accent/10 border-sidebar-border text-sidebar-foreground/30 cursor-not-allowed h-10"
                      readOnly
                      placeholder="Engineer TBD"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: Job Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Job Notes</Label>
                <VoiceInput
                  onTranscript={(text) => set("jobNotes", text)}
                  placeholder="Tap to speak"
                />
              </div>
              <Textarea
                value={form.jobNotes}
                onChange={e => set("jobNotes", e.target.value)}
                className="bg-sidebar-accent/50 border-sidebar-border text-white min-h-[80px]"
                placeholder="Additional notes for the engineer or office..."
              />
            </div>

            {/* SECTION: Job Completion */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Job Completion
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FileUpload
                  label="Job Sheet Document"
                  value={form.jobSheet}
                  onChange={name => set("jobSheet", name)}
                />
                <div className="space-y-1.5 flex items-end">
                  <div className="flex items-center gap-2 h-10 px-3 bg-sidebar-accent/30 border border-sidebar-border rounded-md">
                    <Checkbox
                      id="markComplete"
                      checked={form.markComplete}
                      onCheckedChange={v => set("markComplete", !!v)}
                      className="border-sidebar-border"
                    />
                    <Label htmlFor="markComplete" className="text-sm font-medium text-white cursor-pointer">
                      Works Completed
                    </Label>
                  </div>
                </div>
              </div>
              <FileUpload
                label="Site Induction Form"
                value={form.siteInduction}
                onChange={name => set("siteInduction", name)}
              />
            </div>

            {/* SECTION: Invoice */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" />
                Invoice
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Invoice Number</Label>
                  <Input
                    value={form.invoiceNumber}
                    onChange={e => set("invoiceNumber", e.target.value)}
                    className="bg-sidebar-accent/50 border-sidebar-border text-white h-10"
                    placeholder="INV-XXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Priority</Label>
                  <PriorityBadge priority={priority} />
                </div>
              </div>
              <FileUpload
                label="Invoice Attachment"
                value={form.invoiceAttachment}
                onChange={name => set("invoiceAttachment", name)}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-white hover:bg-white/5"
              >
                ← Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-sidebar-border text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-primary text-black font-black uppercase tracking-tighter hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {editJob ? "Update Job" : "Create Job"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
