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
} from "lucide-react";
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

const faultsByManufacturer = {
  "30": [
    { name: "SMA", value: 12, color: "hsl(var(--chart-1))" },
    { name: "Fronius", value: 8, color: "hsl(var(--chart-2))" },
    { name: "Huawei", value: 5, color: "hsl(var(--chart-3))" },
    { name: "Solis", value: 3, color: "hsl(var(--chart-4))" },
    { name: "Other", value: 2, color: "hsl(var(--chart-5))" },
  ],
  "90": [
    { name: "SMA", value: 28, color: "hsl(var(--chart-1))" },
    { name: "Fronius", value: 18, color: "hsl(var(--chart-2))" },
    { name: "Huawei", value: 12, color: "hsl(var(--chart-3))" },
    { name: "Solis", value: 8, color: "hsl(var(--chart-4))" },
    { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
  ],
  all: [
    { name: "SMA", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Fronius", value: 32, color: "hsl(var(--chart-2))" },
    { name: "Huawei", value: 24, color: "hsl(var(--chart-3))" },
    { name: "Solis", value: 15, color: "hsl(var(--chart-4))" },
    { name: "Other", value: 12, color: "hsl(var(--chart-5))" },
  ],
};

const repeatFaultsData = {
  "30": [
    { category: "Inverter Failure", count: 5 },
    { category: "DC Isolator", count: 3 },
    { category: "Communication", count: 2 },
    { category: "Power Loss", count: 1 },
  ],
  "90": [
    { category: "Inverter Failure", count: 12 },
    { category: "DC Isolator", count: 8 },
    { category: "Communication", count: 6 },
    { category: "Power Loss", count: 4 },
    { category: "Panel Issues", count: 2 },
  ],
  all: [
    { category: "Inverter Failure", count: 24 },
    { category: "DC Isolator", count: 16 },
    { category: "Communication", count: 12 },
    { category: "Power Loss", count: 9 },
    { category: "Panel Issues", count: 5 },
    { category: "Other", count: 3 },
  ],
};

const sitesWithRepeatIssues = {
  "30": [
    {
      site: "Solar Farm A - Northampton",
      faultType: "SMA Inverter Failure",
      occurrences: 3,
      lastFault: "2024-01-18",
      status: "Ongoing",
    },
    {
      site: "Industrial Park B - Birmingham",
      faultType: "DC Isolator Failure",
      occurrences: 2,
      lastFault: "2024-01-15",
      status: "Monitoring",
    },
  ],
  "90": [
    {
      site: "Solar Farm A - Northampton",
      faultType: "SMA Inverter Failure",
      occurrences: 5,
      lastFault: "2024-01-18",
      status: "Ongoing",
    },
    {
      site: "Industrial Park B - Birmingham",
      faultType: "DC Isolator Failure",
      occurrences: 4,
      lastFault: "2024-01-15",
      status: "Monitoring",
    },
    {
      site: "Warehouse Complex C - Manchester",
      faultType: "Communication Loss",
      occurrences: 3,
      lastFault: "2024-01-12",
      status: "Resolved",
    },
    {
      site: "Retail Park D - Leeds",
      faultType: "Power Output Drop",
      occurrences: 2,
      lastFault: "2024-01-10",
      status: "Monitoring",
    },
  ],
  all: [
    {
      site: "Solar Farm A - Northampton",
      faultType: "SMA Inverter Failure",
      occurrences: 8,
      lastFault: "2024-01-18",
      status: "Ongoing",
    },
    {
      site: "Industrial Park B - Birmingham",
      faultType: "DC Isolator Failure",
      occurrences: 7,
      lastFault: "2024-01-15",
      status: "Monitoring",
    },
    {
      site: "Warehouse Complex C - Manchester",
      faultType: "Communication Loss",
      occurrences: 5,
      lastFault: "2024-01-12",
      status: "Resolved",
    },
    {
      site: "Retail Park D - Leeds",
      faultType: "Power Output Drop",
      occurrences: 4,
      lastFault: "2024-01-10",
      status: "Monitoring",
    },
    {
      site: "Office Block E - Sheffield",
      faultType: "Panel Degradation",
      occurrences: 3,
      lastFault: "2024-01-08",
      status: "Ongoing",
    },
  ],
};

const aiInsights = {
  "30": [
    {
      severity: "high",
      title: "SMA Inverter Pattern Detected",
      insight:
        "5 SMA inverter faults repeated within 30 days — check supplier batch #483. All failures show identical error codes (E-0104) suggesting manufacturing defect.",
    },
    {
      severity: "high",
      title: "DC Isolator Supplier Issue",
      insight:
        "Replace DC isolator supplier; 20% failure rate last month. Current batch shows premature contact wear after 6-8 months instead of rated 10 years.",
    },
    {
      severity: "medium",
      title: "Communication Module Firmware",
      insight:
        "Update communication modules at 3 sites showing intermittent connectivity. Firmware v2.4.1 resolves the 4G dropout issue observed in version 2.3.x.",
    },
  ],
  "90": [
    {
      severity: "high",
      title: "SMA Inverter Pattern Detected",
      insight:
        "12 SMA inverter faults within 90 days concentrated in batch #483 and #487. Contact SMA technical support for batch replacement program eligibility.",
    },
    {
      severity: "high",
      title: "DC Isolator Supplier Issue",
      insight:
        "Replace DC isolator supplier; 8 failures in 90 days represents 18% failure rate. Switch to Eaton or ABB alternatives with proven field reliability.",
    },
    {
      severity: "medium",
      title: "Seasonal Communication Issues",
      insight:
        "Communication faults increase 40% during winter months. Consider upgrading to industrial-grade 4G modules with extended temperature range (-40°C to +85°C).",
    },
    {
      severity: "medium",
      title: "Geographic Clustering",
      insight:
        "Manchester and Birmingham sites show 3x higher fault rates than southern sites. Environmental factors (higher humidity, temperature swings) may require upgraded component specs.",
    },
  ],
  all: [
    {
      severity: "high",
      title: "SMA Inverter Long-term Trend",
      insight:
        "24 SMA inverter failures over 12 months, predominantly in batches manufactured Q2 2023. Consider preventive replacement for remaining units from this production run.",
    },
    {
      severity: "high",
      title: "DC Isolator Supplier Issue",
      insight:
        "16 DC isolator failures represents 15% failure rate across entire install base. Immediate supplier switch recommended. Calculate warranty claims and consider legal action.",
    },
    {
      severity: "medium",
      title: "Communication Infrastructure",
      insight:
        "Communication faults correlate with specific cellular network coverage gaps. Deploy dual-SIM modules or add local WiFi backup at 5 identified problem sites.",
    },
    {
      severity: "medium",
      title: "Maintenance Schedule Optimization",
      insight:
        "Sites with 6-month inspection intervals show 35% fewer repeat faults than those on annual schedules. ROI analysis suggests quarterly inspections for high-value installations.",
    },
    {
      severity: "low",
      title: "Weather Impact Analysis",
      insight:
        "Power output drops correlate with storm activity. 8 of 9 power loss events occurred within 72 hours of severe weather. Review surge protection and grounding at affected sites.",
    },
  ],
};

const Analytics = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

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

  const currentFaults = faultsByManufacturer[timeRange];
  const currentRepeatFaults = repeatFaultsData[timeRange];
  const currentSites = sitesWithRepeatIssues[timeRange];
  const currentInsights = aiInsights[timeRange];

  const totalFaults = currentFaults.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <>
          <Breadcrumb items={[{ label: "Fault Analytics" }]} />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Fault Analytics</h1>
                <Badge className="bg-blue-600 text-white border-0 font-semibold text-sm">
                  🤖 Phase 3: AI Pattern Recognition
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
                Management insights and AI-powered trend analysis for central inverter maintenance
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
            <div className="text-2xl font-bold">{currentFaults[0].name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentFaults[0].value} incidents
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
              <Badge className="bg-blue-600 text-white border-0 font-semibold text-xs">
                🤖 Phase 3
              </Badge>
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
              <Badge className="bg-blue-600 text-white border-0 font-semibold text-xs">
                🤖 Phase 3
              </Badge>
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
            <Badge className="bg-blue-600 text-white border-0 font-semibold">
              🤖 Phase 3
            </Badge>
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
            <Badge className="bg-blue-600 text-white border-0 font-semibold text-xs">
              🤖 Phase 3
            </Badge>
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
