import { useJobs } from "@/hooks/useJobs";
import { useInventoryParts } from "@/hooks/useInventoryParts";
import { StatCard } from "@/components/StatCard";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Package, 
  AlertTriangle, 
  Users, 
  Settings, 
  FileWarning, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { format, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: inventory = [], isLoading: inventoryLoading } = useInventoryParts();

  // 1. Job Management Metrics
  const kanbanStages = [
    { label: "Logged Fault", status: "Logged Fault", color: "bg-red-500" },
    { label: "Quote Sent", status: "Quote Sent", color: "bg-amber-500" },
    { label: "Approved", status: "Approved", color: "bg-blue-500" },
    { label: "Scheduled", status: "Scheduled", color: "bg-purple-500" },
    { label: "Completed", status: "Completed", color: "bg-zinc-700" },
    { label: "Invoiced", status: "Invoiced", color: "bg-zinc-500" },
  ];

  const stageCounts = kanbanStages.map(stage => ({
    ...stage,
    count: jobs.filter(j => j.status === stage.status).length
  }));

  // 2. Scheduling Overview
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const upcomingJobs = jobs.filter(j => 
    j.scheduled_date && 
    isWithinInterval(new Date(j.scheduled_date), { start: weekStart, end: weekEnd })
  ).sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime());

  // 3. Inventory Stats
  const lowStock = inventory.filter(p => 
    (p.warehouse_stock + p.terry_van_stock + p.jason_van_stock) < (p.min_stock_level ?? 5)
  );
  const totalValue = inventory.reduce((sum, p) => 
    sum + (p.unit_price ?? 0) * (p.warehouse_stock + p.terry_van_stock + p.jason_van_stock), 0
  );

  // 4. Operational Alerts
  const missingReports = jobs.filter(j => j.status === "Completed" && !j.report_link);
  const missingRAMS = jobs.filter(j => 
    (j.status === "Approved" || j.status === "Scheduled") && j.rams_status === "Pending"
  );
  const highPriority = jobs.filter(j => j.equipment_details?.inverter_in_production === "No");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Command Center</h1>
          <p className="text-muted-foreground mt-1">
            Global operational overview and administrative controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/jobs")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Full Kanban
          </Button>
          <Button onClick={() => navigate("/jobs")}>
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* Section 1: Job Lifecycle Summary */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stageCounts.map((stage) => (
          <StatCard
            key={stage.label}
            title={stage.label}
            value={stage.count}
            icon={Briefcase}
            trend={
              <div className="w-full bg-muted rounded-full h-1 mt-2">
                <div 
                  className={`${stage.color} h-1 rounded-full`} 
                  style={{ width: `${Math.min((stage.count / (jobs.length || 1)) * 100, 100)}%` }} 
                />
              </div>
            }
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Section 2: Scheduling & Calendar */}
        <DashboardCard 
          title="Upcoming Schedule" 
          icon={Calendar}
          navigateTo="/calendar"
        >
          <div className="space-y-4">
            {upcomingJobs.length > 0 ? (
              upcomingJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/jobs?jobId=${job.job_number}`)}>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{job.job_number}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{job.sites?.site_name}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px] mb-1">
                      {job.technician || "Unassigned"}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(job.scheduled_date!), "EEE, dd MMM")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No jobs scheduled for this week.</p>
            )}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate("/calendar")}>
              View Full Calendar <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </DashboardCard>

        {/* Section 3: Inventory visibility */}
        <DashboardCard 
          title="Inventory Assets" 
          icon={Package}
          navigateTo="/inventory"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b pb-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Stock Value</p>
                <p className="text-2xl font-bold">£{totalValue.toLocaleString()}</p>
              </div>
              <Badge className="bg-green-600">Health: Optimal</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Low Stock Alerts</span>
                <span className="font-bold text-destructive">{lowStock.length}</span>
              </div>
              <Progress value={(lowStock.length / (inventory.length || 1)) * 100} className="h-1.5" />
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 3).map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[180px]">{item.part_name}</span>
                  <Badge variant="destructive" className="py-0 h-4 text-[10px]">
                    {item.warehouse_stock + item.terry_van_stock + item.jason_van_stock} left
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Section 4: Operational Alerts */}
        <DashboardCard 
          title="Operational Bottlenecks" 
          icon={AlertTriangle}
          className="border-red-200 bg-red-50/10"
        >
          <div className="space-y-3">
            {highPriority.length > 0 && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 cursor-pointer animate-pulse"
                onClick={() => navigate("/jobs")}
              >
                <FileWarning className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-bold text-red-600">{highPriority.length} VIP Outages</p>
                  <p className="text-[10px] text-red-500">Inverters not producing! Immediate action required.</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg border bg-background flex flex-col items-center text-center">
                <Clock className="h-4 w-4 mb-1 text-amber-500" />
                <span className="text-lg font-bold">{missingReports.length}</span>
                <span className="text-[10px] text-muted-foreground">Pending Reports</span>
              </div>
              <div className="p-3 rounded-lg border bg-background flex flex-col items-center text-center">
                <FileText className="h-4 w-4 mb-1 text-blue-500" />
                <span className="text-lg font-bold">{missingRAMS.length}</span>
                <span className="text-[10px] text-muted-foreground">Pending RAMS</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Critical Actions</p>
              {missingRAMS.slice(0, 2).map(job => (
                <div key={job.id} className="flex justify-between items-center p-2 text-[11px] rounded bg-muted/50">
                  <span className="font-medium">{job.job_number}</span>
                  <span className="text-red-500">Missing RAMS</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Section 5: Administrative Shortcuts */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Management Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="ghost" className="flex flex-col h-24 gap-2 border hover:bg-primary/5 hover:border-primary/50 transition-all">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-xs">Customers</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-24 gap-2 border hover:bg-primary/5 hover:border-primary/50 transition-all" onClick={() => navigate("/inventory")}>
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-xs">Site Database</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-24 gap-2 border hover:bg-primary/5 hover:border-primary/50 transition-all">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xs">PDF Generator</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-24 gap-2 border hover:bg-primary/5 hover:border-primary/50 transition-all">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xs">Access Roles</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">API Sync Status</span>
              <Badge className="bg-success">Live</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">SafetyCulture Sync</span>
              <Badge className="bg-success">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Daily Backups</span>
              <span className="font-bold">04:00 AM</span>
            </div>
            <div className="pt-2 border-t mt-2">
              <p className="text-[10px] text-muted-foreground">Version 4.2.0-stable</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Re-using Card component directly to avoid import issues if not exported correctly
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export default AdminDashboard;
