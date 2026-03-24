import { useState, useMemo, useEffect } from "react";
import { format, isToday, addDays, isSameDay } from "date-fns";
import { 
  Briefcase, 
  Calendar, 
  Package, 
  MapPin, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Navigation, 
  Phone, 
  Lock, 
  FileText, 
  Camera, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
  RefreshCw,
  LogOut,
  ChevronDown,
  ArrowLeft,
  Settings,
  Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useJobs, useUpdateJob } from "@/hooks/useJobs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Mock Van Stock Data
const INITIAL_VAN_STOCK = [
  { id: "1", name: "SMA Grid Monitoring Module", inVan: 0, min: 1, status: "Order" },
  { id: "2", name: "20A SMA Grid Fuse", inVan: 1, min: 2, status: "Low" },
  { id: "3", name: "DC Connector Type Y (pair)", inVan: 6, min: 2, status: "Good" },
  { id: "4", name: "Schneider XC Fuse 10A", inVan: 4, min: 2, status: "Good" },
  { id: "5", name: "IGBT Module SMA CP", inVan: 1, min: 1, status: "Good" },
  { id: "6", name: "Multimeter (loan kit)", inVan: 1, min: 1, status: "Good" },
];

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: jobs = [], isLoading } = useJobs();
  const updateMutation = useUpdateJob();
  
  const getTabFromPath = () => {
    if (location.pathname.endsWith("/calendar")) return "calendar";
    if (location.pathname.endsWith("/inventory")) return "stock";
    return "jobs";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === "calendar") navigate("/dashboard/calendar");
    else if (val === "stock") navigate("/dashboard/inventory");
    else navigate("/dashboard");
  };

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [vanStock, setVanStock] = useState(INITIAL_VAN_STOCK);
  
  // Engineer identification
  const [userName, setUserName] = useState("Terry");

  const todayJobs = useMemo(() => {
    return jobs.filter(j => j.scheduledDate && isSameDay(new Date(j.scheduledDate), new Date()));
  }, [jobs]);

  const upcomingJobs = useMemo(() => {
    const today = new Date();
    return jobs.filter(j => {
      if (!j.scheduledDate) return false;
      const date = new Date(j.scheduledDate);
      return date > today && date <= addDays(today, 3);
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [jobs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const selectedJob = useMemo(() => 
    jobs.find(j => j.id === selectedJobId), 
    [jobs, selectedJobId]
  );

  if (isLoading) return <div className="p-8 text-white">Loading Terry's Dashboard...</div>;

  if (selectedJobId && selectedJob) {
    return (
      <JobSheetView 
        job={selectedJob} 
        onBack={() => setSelectedJobId(null)} 
        onComplete={(id) => {
          updateMutation.mutate({ id, updates: { status: "Completed" } });
          setSelectedJobId(null);
          toast({ title: "Job Submitted", description: "Job sheet has been sent to the office." });
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-sidebar text-foreground overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 pt-6 px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">


          <TabsContent value="jobs" className="m-0 space-y-6">
             <div className="space-y-1">
               <h2 className="text-xl font-black tracking-tight uppercase">GOOD MORNING {userName.toUpperCase()}</h2>
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                 Today: {format(new Date(), "EEEE, d MMMM yyyy")}
               </p>
             </div>

               <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-primary/20 pb-1">
                   <h3 className="text-xs font-black text-primary tracking-[0.2em] uppercase">Today's Jobs ({todayJobs.length})</h3>
                 </div>

                 <div className="space-y-4">
                   {todayJobs.length > 0 ? todayJobs.map(job => (
                     <JobCard 
                      key={job.id} 
                      job={job} 
                      onView={() => setSelectedJobId(job.id)}
                      onArrive={() => {
                        toast({ title: "Arrived", description: "Arrival time recorded for " + job.id });
                      }}
                    />
                   )) : (
                     <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                        <p className="text-sm text-white/20 italic font-bold">No jobs scheduled for today.</p>
                     </div>
                   )}
                 </div>
               </div>

               <div className="space-y-4 pt-4">
                 <div className="flex items-center justify-between border-b border-white/10 pb-1">
                   <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase">Upcoming (Next 3 Days)</h3>
                 </div>
                 
                 <div className="space-y-3">
                   {upcomingJobs.length > 0 ? upcomingJobs.map(job => (
                     <div key={job.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group" onClick={() => setSelectedJobId(job.id)}>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary uppercase">
                            📅 {format(new Date(job.scheduledDate), "EEEE d MMMM")}
                          </p>
                          <p className="text-sm font-bold text-white">{job.siteName}</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Location: {job.inverterLocation} | {job.faultCode} {job.reportedFault?.slice(0, 20)}...
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                     </div>
                   )) : (
                    <p className="text-xs text-white/20 italic px-4">No upcoming jobs scheduled.</p>
                   )}
                 </div>
               </div>
            </TabsContent>

            <TabsContent value="calendar" className="m-0">
               <div className="space-y-6">
                  <h2 className="text-xl font-black uppercase tracking-tight">MY SCHEDULE</h2>
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                    <Calendar className="h-10 w-10 text-white/10 mx-auto mb-4" />
                    <p className="text-sm text-white/20 italic font-bold">Calendar view optimized for tablet...</p>
                    <p className="text-xs text-white/40 mt-2 font-bold uppercase tracking-widest italic font-bold">Phase 2: Full Planner Integration</p>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="stock" className="m-0">
               <VanStockView stock={vanStock} engineerName={userName} />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function JobCard({ job, onView, onArrive }: { job: any; onView: () => void; onArrive: () => void }) {
  return (
    <Card className="bg-card border-sidebar-border overflow-hidden shadow-2xl relative">
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        job.priority === "HIGH" ? "bg-destructive" : "bg-primary"
      )} />
      
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
           <div className="space-y-1">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Job #{job.id.split('-').pop()}</span>
               {job.priority === "HIGH" && (
                 <Badge variant="destructive" className="h-4 px-1 text-[8px] font-black">HIGH PRIORITY</Badge>
               )}
             </div>
             <h4 className="text-lg font-black text-foreground leading-none tracking-tight">{job.siteName}</h4>
           </div>
           {job.priority === "HIGH" ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Info className="h-5 w-5 text-primary" />}
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-sidebar-border py-3">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Location</p>
            <p className="text-xs font-bold text-foreground">{job.inverterLocation || "TBD"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Model</p>
            <p className="text-xs font-bold text-foreground">{job.inverterModel || "N/A"}</p>
          </div>
          <div className="space-y-0.5 col-span-2">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Reported Fault</p>
            <p className="text-xs font-bold text-primary flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {job.faultCode}: {job.reportedFault || "Check inverter"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
           <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white h-10 font-black text-[10px] uppercase tracking-wider hover:bg-white/10" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, '_blank')}>
              <Navigation className="h-4 w-4 mr-2 text-primary" /> Get Directions
           </Button>
           
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5 text-primary" />
                 <span className="text-[10px] font-bold text-white/60">Estimated: 45 mins away</span>
              </div>
           </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg space-y-2">
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Gate Code</span>
              <span className="text-xs font-black text-white flex items-center gap-1"><Lock className="h-3 w-3 text-primary" /> {job.accessCode || "4829"}</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">W3W</span>
              <span className="text-xs font-bold text-primary italic">///table.london.island</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Contact</span>
              <span className="text-xs font-bold text-white flex items-center gap-2">
                {job.contactName} 
                <a href={`tel:${job.contactPhone}`}><Phone className="h-3 w-3 text-primary" /></a>
              </span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
           <Button className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white font-black text-[10px] uppercase h-11" onClick={onView}>
             <FileText className="h-4 w-4 mr-2" /> View Job Sheet
           </Button>
           <Button className="bg-primary text-black font-black text-[10px] uppercase h-11" onClick={onArrive}>
             <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Arrived
           </Button>
        </div>
      </div>
    </Card>
  );
}

function JobSheetView({ job, onBack, onComplete }: { job: any; onBack: () => void; onComplete: (id: string) => void }) {
  const [workCarriedOut, setWorkCarriedOut] = useState("");
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [completionTime, setCompletionTime] = useState<string | null>(null);

  const handleRecordArrival = () => {
    setArrivalTime(format(new Date(), "HH:mm"));
  };

  const handleRecordCompletion = () => {
    setCompletionTime(format(new Date(), "HH:mm"));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-sidebar text-foreground">
      <div className="px-4 py-3 border-b border-sidebar-border flex items-center gap-4 bg-sidebar sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 text-foreground hover:bg-accent/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-sm font-black uppercase tracking-tight text-foreground">JOB SHEET #{job.id.split('-').pop()}</h2>
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{job.siteName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Job Details
          </h3>
          <div className="bg-card p-5 rounded-2xl border border-sidebar-border grid grid-cols-2 gap-y-4 shadow-sm">
             <DetailItem label="Job Number" value={`#${job.id.split('-').pop()}`} />
             <DetailItem label="Customer" value="SolarCo Ltd" />
             <DetailItem label="Site Name" value={job.siteName} colSpan={2} />
             <DetailItem label="Address" value={job.address} colSpan={2} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Site Access
          </h3>
          <div className="bg-card p-5 rounded-2xl border border-sidebar-border space-y-4 shadow-xl">
             <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
               <span className="text-[10px] font-black text-muted-foreground uppercase">Gate Code</span>
               <span className="text-lg font-black text-primary tracking-widest">🔒 {job.accessCode || "4829"}</span>
             </div>
             <div className="space-y-1 border-b border-sidebar-border pb-3">
               <span className="text-[10px] font-black text-muted-foreground uppercase">Security Info</span>
               <p className="text-sm font-bold text-foreground italic">"Dial 2 on gate intercom, say Solar Repair"</p>
             </div>
             <DetailItem label="What3Words" value="///table.london.island" color="text-primary" />
             <div className="flex items-center justify-between pt-1">
                <DetailItem label="Site Contact" value={job.contactName} />
                <Button size="sm" className="bg-primary text-black h-8 font-black uppercase text-[10px]">
                  <Phone className="h-3 w-3 mr-1.5" /> Call
                </Button>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" /> Inverter Details
          </h3>
          <div className="bg-card p-5 rounded-2xl border border-sidebar-border grid grid-cols-2 gap-y-4">
            <DetailItem label="Location" value={job.inverterLocation} />
            <DetailItem label="Status" value="❌ Faulty" />
            <DetailItem label="Model" value={job.inverterModel} colSpan={2} />
            <DetailItem label="Serial" value={job.serialNumber} colSpan={2} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Fault Reported
          </h3>
          <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10 space-y-4">
            <DetailItem label="Fault Code" value={job.faultCode} />
            <div className="space-y-1">
              <span className="text-[10px] font-black text-red-500/50 uppercase">Description</span>
              <p className="text-sm font-bold text-white leading-relaxed">{job.reportedFault || "Unit stopped producing yesterday."}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Parts to Bring
          </h3>
          <div className="bg-card rounded-2xl border border-sidebar-border overflow-hidden">
             <table className="w-full text-left text-xs">
                <thead className="bg-accent/5 border-b border-sidebar-border text-[9px] uppercase font-black text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-black">Part</th>
                    <th className="px-4 py-2 font-black">Description</th>
                    <th className="px-4 py-2 font-black">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sidebar-border">
                  <tr className="bg-transparent">
                    <td className="px-4 py-3 font-bold text-primary">MODULE-G1</td>
                    <td className="px-4 py-3 text-muted-foreground">Grid Monitor</td>
                    <td className="px-4 py-3 font-black">1</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-primary">FUSE-24</td>
                    <td className="px-4 py-3 text-muted-foreground">20A SMA Fuse</td>
                    <td className="px-4 py-3 font-black">2</td>
                  </tr>
                </tbody>
             </table>
             <div className="p-3 bg-amber-500/5 border-t border-amber-500/10 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-[9px] font-bold text-amber-500 uppercase leading-normal">
                  If parts not available in van, contact warehouse immediately.
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">ENGINEER REPORT</h3>

          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Arrival Time</span>
                <Button 
                  onClick={handleRecordArrival} 
                  className={cn(
                    "w-full h-12 font-black uppercase text-xs rounded-xl border border-dashed transition-all",
                    arrivalTime ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-white/5 border-white/20 text-white/40 hover:bg-white/10"
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {arrivalTime ? `Arrived at ${arrivalTime}` : "Tap to record arrival time"}
                </Button>
             </div>

             <div className="space-y-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Work Carried Out</span>
                <textarea 
                  className="w-full bg-card border border-sidebar-border rounded-2xl p-4 text-sm font-bold placeholder:text-muted-foreground focus:ring-1 focus:ring-primary h-32 no-scrollbar"
                  placeholder="Tap to type or use voice dictation..."
                  value={workCarriedOut}
                  onChange={(e) => setWorkCarriedOut(e.target.value)}
                />
             </div>

             <div className="space-y-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Photos of Work</span>
                <div className="grid grid-cols-3 gap-3">
                   <PhotoButton />
                   <PhotoButton />
                   <PhotoButton />
                </div>
             </div>

             <div className="space-y-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Completion Time</span>
                <Button 
                  onClick={handleRecordCompletion}
                  className={cn(
                    "w-full h-12 font-black uppercase text-xs rounded-xl border border-dashed transition-all",
                    completionTime ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-white/5 border-white/20 text-white/40 hover:bg-white/10"
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {completionTime ? `Finished at ${completionTime}` : "Tap to record completion time"}
                </Button>
             </div>
          </div>

          <div className="pt-8 pb-12">
             <Button 
               onClick={() => onComplete(job.id)} 
               className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tighter text-base rounded-2xl shadow-2xl shadow-red-600/30 group"
               disabled={!workCarriedOut || !arrivalTime || !completionTime}
             >
               SUBMIT JOB REPORT — MARK COMPLETE
               <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
             </Button>
             <p className="text-center text-[10px] font-bold text-white/30 uppercase mt-4 tracking-widest">
               ⚠️ Report will be sent to Simon for invoicing
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, colSpan = 1, color = "text-foreground" }: { label: string; value: string; colSpan?: number; color?: string }) {
  return (
    <div className={cn("space-y-1", colSpan === 2 && "col-span-2")}>
      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      <p className={cn("text-xs font-bold leading-tight", color)}>{value || "—"}</p>
    </div>
  );
}

function PhotoButton() {
  return (
    <div className="aspect-square bg-accent/5 border-2 border-dashed border-sidebar-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-accent/10 transition-all cursor-pointer">
      <Camera className="h-5 w-5 text-muted-foreground" />
      <span className="text-[8px] font-black text-muted-foreground uppercase">Add Photo</span>
    </div>
  );
}

function VanStockView({ stock, engineerName }: { stock: any[]; engineerName: string }) {
  const lowStock = stock.filter(s => s.status !== "Good");
  const goodStock = stock.filter(s => s.status === "Good");

  return (
    <div className="space-y-6">
       <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tight">{engineerName.toUpperCase()}'S VAN STOCK</h2>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Van: #T1 | Last Synced: Today 07:45 AM</p>
       </div>

       <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-1">
            <h3 className="text-xs font-black text-red-500 tracking-[0.1em] uppercase">🔴 Needs Restock</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
             {lowStock.map(item => (
               <StockItem key={item.id} item={item} />
             ))}
          </div>
       </div>

       <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-green-500/20 pb-1">
            <h3 className="text-xs font-black text-green-500 tracking-[0.1em] uppercase">✅ Healthy Stock</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
             {goodStock.map(item => (
               <StockItem key={item.id} item={item} />
             ))}
          </div>
       </div>

       <div className="flex gap-3 pt-6 pb-12">
          <Button className="flex-1 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] h-12">
            <RefreshCw className="h-4 w-4 mr-2" /> Sync Stock
          </Button>
          <Button className="flex-1 bg-primary text-black font-black uppercase text-[10px] h-12">
            <Phone className="h-4 w-4 mr-2" /> Call Office
          </Button>
       </div>
    </div>
  );
}

function StockItem({ item }: { item: any }) {
  const isCritical = item.inVan === 0;
  return (
    <div className="bg-card p-3 rounded-xl border border-sidebar-border flex items-center justify-between">
       <div className="space-y-0.5">
          <p className="text-xs font-black text-foreground">{item.name}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Min: {item.min}</p>
       </div>
       <div className="flex items-center gap-4">
          <div className="text-right">
             <p className={cn("text-lg font-black leading-none", isCritical ? "text-destructive" : (item.status === 'Low' ? "text-warning" : "text-success"))}>
               {item.inVan}
             </p>
             <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Qty</p>
          </div>
          <Badge className={cn(
             "h-5 text-[8px] font-black uppercase tracking-widest",
             item.status === "Order" ? "bg-destructive/20 text-destructive" : (item.status === "Low" ? "bg-warning/20 text-warning" : "bg-success/20 text-success")
          )}>
            {item.status}
          </Badge>
       </div>
    </div>
  );
}
