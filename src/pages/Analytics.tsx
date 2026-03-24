import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Calendar,
  MapPin,
  Package,
  Bot,
  Zap,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  History,
  Activity,
  BarChart3
} from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { format, subDays, isAfter } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type TimeRange = "30" | "90" | "all";

// Real data processing will happen inside the component

const Analytics = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const { data: dbJobs = [], isLoading } = useJobs();
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

  const filteredByTime = dbJobs.filter(job => {
    if (timeRange === "all") return true;
    const dateToUse = job.scheduledDate || job.createdAt;
    if (!dateToUse) return false;
    const jobDate = new Date(dateToUse);
    const cutoff = subDays(new Date(), parseInt(timeRange));
    return isAfter(jobDate, cutoff);
  });

  // Calculate Faults by Manufacturer
  const manufacturers: Record<string, number> = {};
  filteredByTime.forEach(job => {
    const name = job.inverterType || "Other";
    manufacturers[name] = (manufacturers[name] || 0) + 1;
  });

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const currentFaults = Object.entries(manufacturers)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length]
    }));

  // Calculate Repeat Faults by Category
  const categories: Record<string, number> = {};
  filteredByTime.forEach(job => {
    const cat = job.reportedFault || "General Fault";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const currentRepeatFaults = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Sites with Repeat Issues
  const sites: Record<string, { site: string, type: string, count: number, last: string }> = {};
  filteredByTime.forEach(job => {
    const key = job.siteName;
    if (!sites[key]) {
      sites[key] = { site: job.siteName, type: job.reportedFault, count: 0, last: job.scheduledDate };
    }
    sites[key].count += 1;
    if (job.scheduledDate > sites[key].last) sites[key].last = job.scheduledDate;
  });

  const currentSites = Object.values(sites)
    .filter(s => s.count > 1)
    .sort((a, b) => b.count - a.count)
    .map(s => ({
      site: s.site,
      faultType: s.type,
      occurrences: s.count,
      lastFault: s.last,
      status: s.count > 3 ? "Ongoing" : "Monitoring"
    }));

  // AI Insights mock (based on real data results)
  const currentInsights = [
    ...(currentFaults[0]?.value > 5 ? [{
      severity: "high",
      title: `${currentFaults[0].name} Pattern Detected`,
      insight: `${currentFaults[0].value} ${currentFaults[0].name} faults detected in selected period. Pattern suggests common batch failure or environment trigger.`
    }] : []),
    {
      severity: "medium",
      title: "Site Density Alert",
      insight: `${filteredByTime.length} total faults analyzed. Active monitoring of ${currentSites.length} repeat-issue sites is recommended.`
    }
  ];

  const totalFaults = filteredByTime.length;

  if (isLoading) return <div className="p-8 text-slate-400">Analyzing fault data...</div>;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Ongoing: "bg-destructive text-destructive-foreground",
      Monitoring: "bg-warning text-warning-foreground",
      Resolved: "bg-success text-success-foreground",
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      high: "bg-destructive text-destructive-foreground",
      medium: "bg-warning text-warning-foreground",
      low: "bg-info text-info-foreground",
    };
    return (
      <Badge className={styles[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <>
          <Breadcrumb items={[{ label: "Fault Analytics" }]} />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Fault Analytics</h1>
              </div>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg italic">
                Dynamic management insights powered by real-time maintenance data.
              </p>
            </div>
            <Button variant="outline" size="lg" className="min-h-[44px] active:scale-95">
              <TrendingUp className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </>
      )}

      {/* Time Range Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Range:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={timeRange === "30" ? "default" : "outline"}
                size="sm"
                className="min-h-[44px] active:scale-95"
                onClick={() => setTimeRange("30")}
              >
                Last 30 Days
              </Button>
              <Button
                variant={timeRange === "90" ? "default" : "outline"}
                size="sm"
                className="min-h-[44px] active:scale-95"
                onClick={() => setTimeRange("90")}
              >
                Last 90 Days
              </Button>
              <Button
                variant={timeRange === "all" ? "default" : "outline"}
                size="sm"
                className="min-h-[44px] active:scale-95"
                onClick={() => setTimeRange("all")}
              >
                All Time
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Faults
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFaults}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {timeRange === "30"
                ? "Last 30 days"
                : timeRange === "90"
                ? "Last 90 days"
                : "All time"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Repeat Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSites.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sites with recurring faults
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Issue
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentFaults[0]?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentFaults[0]?.value || 0} incidents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Faults by Manufacturer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <span>Faults by Manufacturer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentFaults}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentFaults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repeat Faults Within Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <span>Repeat Faults by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={currentRepeatFaults}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span>AI Insights Summary</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Automated pattern detection and actionable recommendations powered by machine learning
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentInsights.map((insight, index) => (
            <div
              key={index}
              className="rounded-xl border-2 bg-card p-5 space-y-3 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(insight.severity)}
                    <h3 className="font-bold text-base">{insight.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {insight.insight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sites with Repeat Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <MapPin className="h-5 w-5" />
            <span>Sites with Repeat Issues</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Fault Type</TableHead>
                  <TableHead>Occurrences</TableHead>
                  <TableHead>Last Fault</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSites.map((site, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 active:bg-muted">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {site.site}
                      </div>
                    </TableCell>
                    <TableCell>{site.faultType}</TableCell>
                    <TableCell>
                      <Badge
                        variant="destructive"
                        className="font-semibold"
                      >
                        {site.occurrences}x
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {site.lastFault}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(site.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="min-h-[44px] active:scale-95">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
