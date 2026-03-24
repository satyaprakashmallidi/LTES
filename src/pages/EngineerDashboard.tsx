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
  Info,
  TrendingUp
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
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
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip
} from "recharts";
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
    if (location.pathname.endsWith("/jobs")) return "jobs";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === "calendar") navigate("/dashboard/calendar");
    else if (val === "stock") navigate("/dashboard/inventory");
    else if (val === "jobs") navigate("/dashboard/jobs");
    else navigate("/dashboard");
  };

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [vanStock, setVanStock] = useState(INITIAL_VAN_STOCK);
  const [timeRange, setTimeRange] = useState<"MONTH" | "WEEK" | "TODAY">("WEEK");
  
  // Engineer identification
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Sync with team database to get the official name used for assignments
        const { data: teamData } = await (supabase
          .from("team_members") as any)
          .select("name")
          .eq("email", user.email)
          .maybeSingle();

        if (teamData?.name) {
          setUserName(teamData.name);
        } else {
          setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Engineer");
        }
      }
    }
    getProfile();
  }, []);

  const myJobs = useMemo(() => {
    if (!userName) return [];
    return jobs.filter(j => {
      if (!j.engineer) return false;
      return j.engineer.toLowerCase() === userName.toLowerCase();
    });
  }, [jobs, userName]);

  const todayJobs = useMemo(() => {
    return myJobs.filter(j => j.scheduledDate && isSameDay(new Date(j.scheduledDate), new Date()));
  }, [myJobs]);

  const upcomingJobs = useMemo(() => {
    const today = new Date();
    return myJobs.filter(j => {
      if (!j.scheduledDate) return false;
      const date = new Date(j.scheduledDate);
      return date > today && date <= addDays(today, 3);
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [myJobs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const selectedJob = useMemo(() => 
    jobs.find(j => j.id === selectedJobId), 
    [jobs, selectedJobId]
  );

  const stats = useMemo(() => {
    const total = myJobs.length;
    const completed = myJobs.filter(j => j.status === "Completed" || j.markComplete).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [myJobs]);

  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    if (timeRange === "TODAY") {
      // Generate 24 hours for Today, every 2 hours as requested
      for (let i = 0; i <= 24; i += 2) {
        const hourDate = new Date(today);
        hourDate.setHours(i, 0, 0, 0);
        
        // Format as 12am, 2am, etc.
        const label = format(hourDate, "ha").toLowerCase();
        
        // Count jobs that are scheduled for today (any time) 
        // In a real app we might filter by hour, but for this summary, 
        // showing the overall today status across the timeline as 0 until work happens is common.
        // For a more dynamic feel, we'll mock some distribution if it's "today"
        const totalToday = myJobs.filter(j => j.scheduledDate && isSameDay(new Date(j.scheduledDate), today)).length;
        const completedToday = myJobs.filter(j => 
          j.scheduledDate && 
          isSameDay(new Date(j.scheduledDate), today) && 
          (j.status === "Completed" || j.markComplete)
        ).length;

        // Mock some data distribution so the graph isn't just a flat line at 0 or max
        // In a real system, we'd check if the job was completed BY this hour.
        const hour = new Date().getHours();
        const isPast = i <= hour;
        
        data.push({ 
          name: label, 
          total: totalToday > 0 ? totalToday : 0, 
          completed: (isPast && completedToday > 0) ? completedToday : 0 
        });
      }
    } else {
      const days = timeRange === "MONTH" ? 30 : 7;
      for (let i = days - 1; i >= 0; i--) {
        const date = addDays(today, -i);
        const dayLabel = format(date, days === 7 ? "EEE" : "MMM d");
        
        const totalOnDay = myJobs.filter(j => 
          j.scheduledDate && isSameDay(new Date(j.scheduledDate), date)
        ).length;
        
        const completedOnDay = myJobs.filter(j => 
          j.scheduledDate && 
          isSameDay(new Date(j.scheduledDate), date) && 
          (j.status === "Completed" || j.markComplete)
        ).length;

        data.push({ name: dayLabel, total: totalOnDay, completed: completedOnDay });
      }
    }
    return data;
  }, [myJobs, timeRange]);

  const headerTitle = useMemo(() => {
    switch (activeTab) {
      case "jobs": return "MY JOBS";
      case "calendar": return "CALENDAR";
      case "stock": return "VAN STOCK";
      default: return "DASHBOARD";
    }
  }, [activeTab]);

  if (isLoading) return <div className="p-8 text-white">Loading {userName || "Engineer"}'s Dashboard...</div>;

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
      <DashboardHeader title={headerTitle} role="Engineer" userName={userName} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 pt-6 px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">


          <TabsContent value="dashboard" className="m-0 space-y-6">
             <div className="space-y-1">
               <h2 className="text-lg lg:text-xl font-black tracking-tight uppercase">GOOD MORNING {userName.toUpperCase()}</h2>
               <p className="text-[10px] lg:text-xs text-white/40 font-bold uppercase tracking-widest">
                 Today: {format(new Date(), "EEEE, d MMMM yyyy")}
               </p>
             </div>

             {/* DASHBOARD STATS SECTION */}
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-primary p-3 lg:p-4 rounded-xl shadow-xl flex flex-col justify-between h-28 lg:h-32 transition-all hover:bg-white/[0.07]">
                    <p className="text-[9px] md:text-[10px] uppercase font-black text-primary/80 mb-1 tracking-widest">Total Jobs</p>
                    <p className="text-3xl md:text-4xl font-black text-white">{stats.total}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 border-l-4 border-l-green-500 p-3 md:p-4 rounded-xl shadow-xl flex flex-col justify-between h-28 md:h-32 transition-all hover:bg-white/[0.07]">
                    <p className="text-[9px] md:text-[10px] uppercase font-black text-green-500/80 mb-1 tracking-widest">Completed</p>
                    <p className="text-3xl md:text-4xl font-black text-white">{stats.completed}</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 lg:p-5 rounded-xl shadow-xl h-[280px] lg:h-[350px] transition-all hover:bg-white/[0.1]">
                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 lg:mb-6">
                      <div className="space-y-0.5 lg:space-y-1">
                        <p className="text-[9px] lg:text-[10px] uppercase font-black text-white/40 tracking-widest flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5 lg:h-4 w-4 text-primary" /> Performance Trends
                        </p>
                        <h4 className="text-[10px] lg:text-xs font-black text-white uppercase tracking-tight">Activity Overview</h4>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-4">
                         <div className="flex items-center gap-2 lg:gap-4 ml-1 lg:ml-2 pb-1">
                           <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,255,0,0.4)]" />
                              <span className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-widest">Planned</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                              <span className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-widest">Finished</span>
                           </div>
                         </div>
                         <div className="flex bg-white/5 border border-white/10 rounded-full p-1 scale-90 lg:scale-95 origin-right">
                           {["MONTH", "WEEK", "TODAY"].map((range) => (
                             <button
                               key={range}
                               onClick={() => setTimeRange(range as any)}
                               className={cn(
                                 "px-3 md:px-5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                                 timeRange === range 
                                   ? "bg-primary text-black shadow-lg scale-105" 
                                   : "text-white/40 hover:text-white/60"
                               )}
                             >
                               {range}
                             </button>
                           ))}
                         </div>
                      </div>
                   </div>
                   <div className="h-[200px] lg:h-[260px] w-full mt-auto">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={9} 
                          tick={{ fill: 'rgba(255, 255, 255, 0.2)', fontWeight: 'bold' }} 
                          minTickGap={timeRange === "MONTH" ? 40 : (timeRange === "TODAY" ? 5 : 10)}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorTotal)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#22c55e" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorCompleted)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                </div>
              </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                   <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase">Quick Summary</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                   <p className="text-xs text-white/50 leading-relaxed font-bold">
                     You have <span className="text-primary">{todayJobs.length} jobs</span> scheduled for today and <span className="text-primary">{upcomingJobs.length} jobs</span> in the next 3 days. 
                     Keep up the great work!
                   </p>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="jobs" className="m-0 space-y-6">
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
                          <p className="text-[10px] font-black text-primary uppercase flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(job.scheduledDate), "EEEE d MMMM")}
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

        <div className="grid grid-cols-2 gap-2 lg:gap-3 pt-2">
           <Button className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white font-black text-[9px] md:text-[10px] uppercase h-10 md:h-11" onClick={onView}>
             <FileText className="h-3.5 w-3.5 md:h-4 w-4 mr-1.5 md:mr-2" /> <span className="truncate">View Sheet</span>
           </Button>
           <Button className="bg-primary text-black font-black text-[9px] md:text-[10px] uppercase h-10 md:h-11" onClick={onArrive}>
             <CheckCircle2 className="h-3.5 w-3.5 md:h-4 w-4 mr-1.5 md:mr-2" /> <span className="truncate">Arrived</span>
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
            <DetailItem label="Status" value="Faulty" color="text-red-500" />
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
            <h3 className="text-xs font-black text-red-500 tracking-[0.1em] uppercase flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Needs Restock
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
             {lowStock.map(item => (
               <StockItem key={item.id} item={item} />
             ))}
          </div>
       </div>

       <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-green-500/20 pb-1">
            <h3 className="text-xs font-black text-green-500 tracking-[0.1em] uppercase flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Healthy Stock
            </h3>
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
