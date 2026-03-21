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
import { Card } from "@/components/ui/card";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarIcon, Check, ChevronsUpDown, AlertTriangle, ShieldAlert } from "lucide-react";
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

export function CreateJobWizard({ open, onOpenChange, onSave, allJobs, editJob, prefillScheduledDate, initialStep, role = "Admin" }: CreateJobWizardProps) {
  const { data: faultCodesByBrand } = useFaultCodes();
  const { data: sites = [] } = useSites();
  const { data: allEquipment = [] } = useAllEquipment();
  const [step, setStep] = useState(initialStep || 1);
  const [siteOpen, setSiteOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [quoteCalOpen, setQuoteCalOpen] = useState(false);
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
  const availableFaultCodes = brand ? (faultCodesByBrand?.[brand] || []) : [];
  const selectedFault = availableFaultCodes.find(fc => fc.code === form.faultCode);

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
    if (!form.reportedFault && !form.faultCode) errs.reportedFault = "Fault info required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-sidebar border-sidebar-border text-sidebar-foreground">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-tight">
            {editJob ? `EDIT JOB ${editJob.id}` : "NEW JOB"} — Page {step} of 2
          </DialogTitle>
          <DialogDescription className="text-sidebar-foreground/60">
            {step === 1 ? "Step 1: Select Customer, Site & Inverter" : "Step 2: Quote, PO & Scheduling"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-6">
          <div className={cn("h-1 flex-1 rounded-full transition-all", step >= 1 ? "bg-primary" : "bg-sidebar-accent")} />
          <div className={cn("h-1 flex-1 rounded-full transition-all", step >= 2 ? "bg-primary" : "bg-sidebar-accent")} />
        </div>

        {step === 1 && (
          <div className="space-y-5">
            {/* Customer Search */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Customer *</Label>
              <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                    {selectedSite?.site_name || "Search or select customer..."}
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
            </div>

            {/* Inverter Location */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Inverter Location *</Label>
              <Select value={form.inverterLocation} onValueChange={v => set("inverterLocation", v)} disabled={!form.siteId}>
                <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                  <SelectValue placeholder="Select inverter location" />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-sidebar-border text-white">
                  {equipmentList.map(e => <SelectItem key={e.location} value={e.location}>{e.location}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Inverter Details (Auto) */}
            {selectedEquipment && (
              <Card className="bg-sidebar-accent/30 border-sidebar-border p-4 space-y-3">
                 <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Inverter Details (Auto-populated)</Label>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] text-sidebar-foreground/40 font-bold uppercase">Model</p>
                       <p className="text-sm font-bold text-white">{selectedEquipment.model}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-sidebar-foreground/40 font-bold uppercase">Serial</p>
                       <p className="text-sm font-bold text-white">{selectedEquipment.serial}</p>
                    </div>
                 </div>
              </Card>
            )}

            {/* Fault Code & Desc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Fault Code *</Label>
                  <Select value={form.faultCode} onValueChange={v => set("faultCode", v)} disabled={!brand}>
                    <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                      <SelectValue placeholder="Select fault code" />
                    </SelectTrigger>
                    <SelectContent className="bg-sidebar border-sidebar-border text-white">
                      {availableFaultCodes.map(fc => <SelectItem key={fc.code} value={fc.code}>{fc.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Priority</Label>
                  <Badge className={cn("w-full h-11 justify-center text-xs font-black rounded-md", 
                    priority === "HIGH" ? "bg-red-600" : priority === "MEDIUM" ? "bg-amber-600" : "bg-green-600"
                  )}>
                    {priority}
                  </Badge>
               </div>
            </div>

            {selectedFault && (
               <p className="text-xs font-bold text-primary italic bg-primary/5 p-2 rounded">
                  Auto-populated Info: {selectedFault.label}
               </p>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Issue Reported</Label>
              <Textarea 
                value={form.reportedFault} 
                onChange={e => set("reportedFault", e.target.value)} 
                className="bg-sidebar-accent/50 border-sidebar-border text-white min-h-[80px]" 
                placeholder="Describe the issue reported by the customer..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="bg-primary text-black font-black uppercase tracking-tighter">
                Next: Schedule & Quote →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Quote Number</Label>
                  <Input value={form.quoteNumber} onChange={e => set("quoteNumber", e.target.value)} className="bg-sidebar-accent/50 border-sidebar-border text-white" placeholder="Q-2026-XXXX" />
                  <p className="text-[10px] text-sidebar-foreground/30">Enter quote number to send to customer.</p>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Purchase Order (PO)</Label>
                  <Input value={form.poNumber} onChange={e => set("poNumber", e.target.value)} className="bg-sidebar-accent/50 border-sidebar-border text-white" placeholder="PO-XXXXXX" />
               </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Contract Type</Label>
              <Select value={form.contractType} onValueChange={v => set("contractType", v as ContractType)}>
                <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-sidebar-border text-white">
                  <SelectItem value="Contract/SLA">Contract/SLA</SelectItem>
                  <SelectItem value="Chargeable">Chargeable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isSimon ? (
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Luke's Command Center — Scheduling</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Scheduled Date</Label>
                      <Popover open={calOpen} onOpenChange={setCalOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                            {form.scheduledDate ? format(new Date(form.scheduledDate), "PPP") : "Select Date"}
                            <CalendarIcon className="h-4 w-4 opacity-40" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-sidebar border-sidebar-border" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={form.scheduledDate ? new Date(form.scheduledDate) : undefined}
                            onSelect={date => { set("scheduledDate", date ? format(date, "yyyy-MM-dd") : ""); setCalOpen(false); }}
                            className="bg-sidebar border-none text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Assign Engineer</Label>
                      <Select value={form.engineer} onValueChange={v => set("engineer", v)}>
                        <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border h-11 text-white">
                          <SelectValue placeholder="Assign Engineer" />
                        </SelectTrigger>
                        <SelectContent className="bg-sidebar border-sidebar-border text-white">
                          {sortedEngineers.map(e => (
                             <SelectItem key={e.id} value={e.name}>
                                {e.name} ({allJobs.filter(j => j.scheduledDate === form.scheduledDate && j.engineer === e.name).length} jobs)
                             </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                 </div>
                 {form.scheduledDate && (
                    <EngineerAvailabilityPanel 
                       selectedDate={form.scheduledDate}
                       jobs={allJobs}
                       onSelectEngineer={(name) => set("engineer", name)}
                    />
                 )}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl space-y-4">
                 <div className="flex items-center gap-2 text-red-500 mb-1">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SCHEDULING RESTRICTED</span>
                 </div>
                 <p className="text-xs text-sidebar-foreground/60 italic leading-relaxed">
                    Luke will schedule this job after PO is received. 
                    Do not change the fields below. Contact Luke to schedule.
                 </p>
  
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Scheduled Date</Label>
                      <Input 
                        value={form.scheduledDate} 
                        className="bg-sidebar-accent/10 border-sidebar-border text-sidebar-foreground/30 cursor-not-allowed h-11" 
                        readOnly 
                        placeholder="Select Date (Luke Only)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Assigned Engineer</Label>
                      <Input 
                        value={form.engineer} 
                        className="bg-sidebar-accent/10 border-sidebar-border text-sidebar-foreground/30 cursor-not-allowed h-11" 
                        readOnly 
                        placeholder="Assign Engineer (Luke Only)"
                      />
                    </div>
                 </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Job Notes</Label>
              <Textarea 
                value={form.jobNotes} 
                onChange={e => set("jobNotes", e.target.value)} 
                className="bg-sidebar-accent/50 border-sidebar-border text-white min-h-[80px]" 
                placeholder="Additional notes for the engineer or office..."
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-white hover:bg-white/5">← Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="border-sidebar-border text-white hover:bg-white/5">Cancel</Button>
                <Button onClick={handleSave} className="bg-primary text-black font-black uppercase tracking-tighter">
                  {editJob ? "Update Job" : "Save Job"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
