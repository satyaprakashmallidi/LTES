import { DashboardCard } from "@/components/DashboardCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StatCard } from "@/components/StatCard";
import {
  FileText,
  FileCheck,
  Briefcase,
  Package,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RAMSReviewDialog } from "@/components/RAMSReviewDialog";
import { useState, useMemo } from "react";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { useJobs } from "@/hooks/useJobs";
import { useInventoryParts } from "@/hooks/useInventoryParts";

// Quotes - fetched from Supabase jobs table (quote_number populated)
const quotesAwaitingApproval: { id: string; client: string; value: number; project: string; date: string }[] = [];

// RAMS - no data yet
const ramsAwaitingReview: { id: string; project: string; site: string; tech: string; submitted: string }[] = [];

function MiniWeekCalendar({ navigate, jobs }: { navigate: (path: string) => void; jobs: { scheduled_date: string | null }[] }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dayCounts = weekDays.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    return {
      day,
      label: format(day, "EEE"),
      date: format(day, "d"),
      count: jobs.filter(j => j.scheduled_date && j.scheduled_date.startsWith(dateStr)).length,
      isToday: format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
    };
  });

  const maxCount = Math.max(...dayCounts.map(d => d.count), 1);

  return (
    <DashboardCard title="This Week" icon={CalendarDays} navigateTo="/calendar">
      <div className="grid grid-cols-7 gap-2">
        {dayCounts.map(d => (
          <div
            key={d.label}
            className="flex flex-col items-center gap-1 cursor-pointer hover:bg-muted/30 rounded-md p-1 transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate("/calendar"); }}
          >
            <span className={`text-[10px] font-medium ${d.isToday ? "text-primary" : "text-muted-foreground"}`}>
              {d.label}
            </span>
            <div className="w-full h-12 flex items-end justify-center">
              <div
                className={`w-5 rounded-t ${d.isToday ? "bg-primary" : "bg-muted-foreground/30"}`}
                style={{ height: `${Math.max((d.count / maxCount) * 100, 8)}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${d.isToday ? "text-primary" : ""}`}>{d.count}</span>
            <span className={`text-[10px] ${d.isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>{d.date}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRAMSId, setSelectedRAMSId] = useState<string | null>(null);

  const { data: supabaseJobs = [] } = useJobs();
  const { data: inventoryParts = [] } = useInventoryParts();

  // Compute jobs this week
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const jobsThisWeek = supabaseJobs.filter(j => {
    if (!j.scheduled_date) return false;
    const sched = new Date(j.scheduled_date);
    return isWithinInterval(sched, { start: weekStart, end: weekEnd });
  });

  const lowStockItems = inventoryParts
    .filter(p => {
      const total = p.warehouse_stock + p.terry_van_stock + p.jason_van_stock;
      return total < (p.min_stock_level ?? 5);
    })
    .map(p => ({
      id: p.id,
      item: p.part_name,
      stock: p.warehouse_stock + p.terry_van_stock + p.jason_van_stock,
      minStock: p.min_stock_level ?? 5,
      supplier: p.category,
      critical: (p.warehouse_stock + p.terry_van_stock + p.jason_van_stock) === 0,
    }));

  const completedJobs = supabaseJobs.filter(j => j.status === "Completed" || j.status === "Invoiced").length;
  const bookedJobs = supabaseJobs.filter(j => j.technician && j.scheduled_date && j.status !== "Completed" && j.status !== "Invoiced");

  const getJobStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Complete: "bg-success text-success-foreground",
      Booked: "bg-info text-info-foreground",
      "Not done": "bg-destructive text-destructive-foreground",
      "Awaiting RAMS": "bg-warning text-warning-foreground",
    };
    return (
      <Badge className={styles[status] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: "Action initiated",
      description: `${action} started successfully`,
    });
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      <Breadcrumb items={[{ label: "Dashboard" }]} />
      
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">
          Central Inverter Maintenance Operations - Quick insights and actionable items
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Jobs This Week"
          value={jobsThisWeek.length}
          icon={Briefcase}
          trend={<span className="text-muted-foreground">{bookedJobs.length} scheduled</span>}
        />
        <StatCard
          title="Total Jobs"
          value={supabaseJobs.length}
          icon={DollarSign}
          trend={<span className="text-muted-foreground">in database</span>}
        />
        <StatCard
          title="RAMS Awaiting Review"
          value={0}
          icon={FileCheck}
          description="Requires immediate attention"
        />
        <StatCard
          title="Jobs Completed"
          value={`${completedJobs}/${supabaseJobs.length}`}
          icon={CheckCircle2}
          trend={<span className="text-success">{supabaseJobs.length > 0 ? Math.round((completedJobs/supabaseJobs.length)*100) : 0}% completion rate</span>}
        />
      </div>

      {/* Mini Week Calendar */}
      <MiniWeekCalendar navigate={navigate} jobs={supabaseJobs} />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Mobile Job Sheets - NEW */}
        <DashboardCard
          title={
            <div className="flex items-center gap-2 flex-wrap">
              <span>Mobile Job Sheets</span>
              <Badge className="bg-purple-600 text-white border-0 font-semibold">
                🤖 AI Voice Notes - Phase 1
              </Badge>
            </div>
          }
          icon={FileCheck}
          count={bookedJobs.length}
          navigateTo="/mobile-job-sheets"
          className="lg:col-span-3 border-primary/20 bg-primary/5"
        >
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">📱 New Mobile Features Available</p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Point of Works Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Photo & Voice Notes Capture</span>
                  <Badge className="text-xs bg-purple-600 text-white border-0 font-semibold">🤖 AI</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Live Van Stock Levels</span>
                </div>
              </div>
            </div>
            <Button 
              variant="default" 
              size="lg" 
              className="w-full"
              onClick={() => navigate("/mobile-job-sheets")}
            >
              Open Mobile Job Sheets →
            </Button>
          </div>
        </DashboardCard>

        {/* Quotes Awaiting Approval */}
        <DashboardCard
          title={
            <div className="flex items-center gap-2 flex-wrap">
              <span>Quotes Awaiting Approval</span>
              <Badge className="bg-green-600 text-white border-0 text-xs font-semibold">
                Phase 1 (AI Templates - Phase 2)
              </Badge>
            </div>
          }
          icon={FileText}
          count={quotesAwaitingApproval.length}
          navigateTo="/quotes"
        >
          <div className="space-y-3 max-h-80 overflow-y-auto overflow-x-hidden pr-3">
            {quotesAwaitingApproval.slice(0, 4).map((quote) => (
              <div 
                key={quote.id} 
                className="space-y-1 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 active:bg-muted px-3 py-2 sm:py-3 rounded-md transition-colors min-h-[44px] flex flex-col justify-center"
                onClick={() => navigate(`/quotes?quoteId=${quote.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{quote.id}</p>
                    <p className="text-xs text-muted-foreground">{quote.client}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{quote.project}</p>
                  </div>
                  <p className="font-bold text-primary text-sm">{formatCurrency(quote.value)}</p>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {quote.date}
                </p>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/quotes");
              }}
            >
              View All {quotesAwaitingApproval.length} Quotes →
            </Button>
          </div>
        </DashboardCard>

        {/* RAMS Awaiting Review */}
        <DashboardCard
          title="RAMS Awaiting Review"
          icon={FileCheck}
          count={ramsAwaitingReview.length}
        >
          <div className="space-y-3">
            {ramsAwaitingReview.map((rams) => (
              <div 
                key={rams.id} 
                className="space-y-1 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 active:bg-muted -mx-2 px-2 py-2 sm:py-3 rounded-md transition-colors min-h-[44px] flex flex-col justify-center"
                onClick={() => setSelectedRAMSId(rams.id)}
              >
                <p className="font-semibold text-sm">{rams.id}</p>
                <p className="text-xs text-muted-foreground">{rams.project}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {rams.tech}
                  </p>
                  <p className="text-xs text-muted-foreground">{rams.submitted}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Jobs Scheduled This Week */}
        <DashboardCard
          title="Jobs Scheduled This Week"
          icon={Briefcase}
          count={bookedJobs.length}
        >
          <div className="space-y-3 max-h-80 overflow-y-auto overflow-x-hidden pr-3">
            {bookedJobs.slice(0, 5).map((job) => (
              <div 
                key={job.id} 
                className="space-y-1 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 active:bg-muted px-3 py-2 sm:py-3 rounded-md transition-colors min-h-[44px] flex flex-col justify-center"
                onClick={() => navigate(`/jobs?jobId=${job.job_number}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{job.job_number}</p>
                    <p className="text-xs text-muted-foreground">{job.sites?.site_name || "No site"}</p>
                    <p className="text-xs text-muted-foreground">{job.description || job.job_type}</p>
                  </div>
                  {getJobStatusBadge(job.status)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {job.technician || "Unassigned"}
                  </p>
                  <p className="text-xs font-medium">
                    {job.scheduled_date ? format(new Date(job.scheduled_date), "dd MMM") : "No date"}
                  </p>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/jobs");
              }}
            >
              View All {bookedJobs.length} Jobs →
            </Button>
          </div>
        </DashboardCard>

        {/* Inventory Alerts */}
        <DashboardCard
          title={
            <div className="flex items-center gap-2 flex-wrap">
              <span>Inventory Alerts</span>
              <Badge className="bg-green-600 text-white border-0 text-xs font-semibold">
                Phase 1 (🤖 AI - Phase 3)
              </Badge>
            </div>
          }
          icon={Package}
          count={lowStockItems.filter(i => i.critical).length}
          navigateTo="/inventory"
        >
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div 
                key={item.id} 
                className="space-y-1 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 active:bg-muted -mx-2 px-2 py-2 sm:py-3 rounded-md transition-colors min-h-[44px] flex flex-col justify-center"
                onClick={() => navigate(`/inventory?itemId=${item.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{item.item}</p>
                      {item.critical && <Badge variant="destructive" className="text-xs py-0">Critical</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">{item.stock}</p>
                    <p className="text-xs text-muted-foreground">/ {item.minStock}</p>
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction("Inventory Restock");
                navigate("/inventory");
              }}
            >
              Restock Items →
            </Button>
          </div>
        </DashboardCard>


        {/* Fault Insights */}
        <DashboardCard
          title={
            <div className="flex items-center gap-2 flex-wrap">
              <span>Fault Analytics & Insights</span>
              <Badge className="bg-blue-600 text-white border-0 font-semibold">
                🤖 AI Pattern Recognition - Phase 3
              </Badge>
            </div>
          }
          icon={TrendingUp}
          navigateTo="/analytics"
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2 text-foreground">AI-Detected Pattern</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">5 SMA inverter faults</span> repeated within 30 days — check supplier batch{" "}
                    <span className="font-semibold text-foreground">#483</span>. This represents a{" "}
                    <span className="font-semibold text-warning">40% increase</span> from the previous period.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-card border p-4 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-destructive">30</p>
                <p className="text-xs text-muted-foreground mt-1">Active Faults</p>
                <Badge variant="destructive" className="mt-2 text-xs">+15% this month</Badge>
              </div>
              <div className="rounded-lg bg-card border p-4 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-success">1.8</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Resolution (days)</p>
                <Badge className="bg-success text-success-foreground mt-2 text-xs">-0.6 days</Badge>
              </div>
              <div className="rounded-lg bg-card border p-4 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-warning">42%</p>
                <p className="text-xs text-muted-foreground mt-1">SMA Inverters</p>
                <Badge className="bg-warning text-warning-foreground mt-2 text-xs">Top issue</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate("/analytics")}
            >
              View Full Analytics & AI Insights →
            </Button>
          </div>
        </DashboardCard>
      </div>

      {/* RAMS Review Dialog */}
      <RAMSReviewDialog
        open={!!selectedRAMSId}
        onOpenChange={(open) => !open && setSelectedRAMSId(null)}
        ramsId={selectedRAMSId || ""}
      />
    </div>
  );
};

export default Dashboard;
