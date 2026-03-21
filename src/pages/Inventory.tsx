import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  AlertCircle,
  TrendingUp,
  Calendar,
  Building2,
  Shield,
  PoundSterling,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useInventoryParts, type InventoryPart } from "@/hooks/useInventoryParts";

interface InventoryItem {
  id: string;
  partName: string;
  partNumber: string;
  manufacturerSKU: string;
  quantity: number;
  minStock: number;
  supplier: string;
  warrantyPeriod: string;
  warrantyExpiry: string;
  lastUsed: string;
  notes: string;
  purchasePrice: number;
  customsCharges?: number;
  salePrice: number;
  dateArrived: string;
  serialNumber?: string;
  locations: {
    warehouse: number;
    terryVan: number;
    jasonVan: number;
  };
  recentJobs: {
    jobId: string;
    siteName: string;
    date: string;
    quantityUsed: number;
  }[];
}

function toInventoryItem(p: InventoryPart) {
  const total = p.warehouse_stock + p.terry_van_stock + p.jason_van_stock;
  return {
    id: p.id,
    partName: p.part_name,
    partNumber: p.part_number || "-",
    manufacturerSKU: p.part_number || "-",
    quantity: total,
    minStock: p.min_stock_level ?? 5,
    supplier: p.category || "General",
    warrantyPeriod: "N/A",
    warrantyExpiry: "N/A",
    lastUsed: "-",
    notes: p.notes || "-",
    purchasePrice: 0,
    salePrice: p.unit_price ?? 0,
    dateArrived: "-",
    locations: {
      warehouse: p.warehouse_stock,
      terryVan: p.terry_van_stock,
      jasonVan: p.jason_van_stock,
    },
    recentJobs: [],
  };
}

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { data: parts = [], isLoading } = useInventoryParts();
  const inventoryData: InventoryItem[] = parts.map(toInventoryItem);

  // Compute stock value by category
  const totalStockValue = inventoryData.reduce(
    (sum, item) => sum + (item.salePrice || 0) * (item.locations.warehouse || 0),
    0
  );

  const stockValueByCategory = Object.entries(
    inventoryData.reduce<Record<string, number>>((acc, item) => {
      const cat = item.supplier || "General";
      acc[cat] = (acc[cat] || 0) + (item.salePrice || 0) * (item.locations.warehouse || 0);
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const inventoryOverTime: { month: string; value: number }[] = [];

  const categoryColors: Record<string, string> = {
    "ABB PVS800": "#1d4ed8",
    "SMA SC-xxxCP-10": "#d97706",
    "SMA SC-xxxx": "#ea580c",
    "Gamesa 630kW TL+": "#16a34a",
    "Schneider Conext Core XC": "#7c3aed",
    "Schneider Xantrex GT": "#9333ea",
    "General": "#6b7280",
  };

  useEffect(() => {
    const itemId = searchParams.get("itemId");
    if (itemId && parts.length > 0) {
      const item = inventoryData.find((i) => i.id === itemId);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, parts]);

  const isLowStock = (quantity: number, minStock: number) => {
    return quantity < minStock;
  };

  const getStockBadge = (quantity: number, minStock: number) => {
    if (quantity < minStock * 0.5) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Critical
        </Badge>
      );
    }
    if (quantity < minStock) {
      return (
        <Badge className="bg-warning text-warning-foreground gap-1">
          <AlertCircle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    }
    return <Badge className="bg-success text-success-foreground">In Stock</Badge>;
  };

  const getWarrantyBadge = (expiryDate: string) => {
    if (expiryDate === "N/A") {
      return <Badge variant="outline">No Warranty</Badge>;
    }
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 180) {
      return <Badge variant="destructive">Expiring Soon</Badge>;
    }
    if (daysUntilExpiry < 365) {
      return <Badge className="bg-warning text-warning-foreground">Expires in 1 year</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">Valid</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Inventory" }]} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Inventory</h1>
            <Badge className="bg-green-600 text-white border-0 text-xs font-semibold">
              Phase 1
            </Badge>
            <Badge className="bg-purple-600 text-white border-0 text-xs font-semibold">
              🤖 AI Predictions - Phase 3
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
            Track parts, equipment, and stock levels for solar inverter maintenance
          </p>
        </div>
        <Button className="min-h-[44px] active:scale-95">
          <Package className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Summary Cards & Charts */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Total Stock Value & Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PoundSterling className="h-5 w-5" />
              Stock Value by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalStockValue)}</p>
              </div>
              {stockValueByCategory.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stockValueByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {stockValueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || "#6b7280"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {stockValueByCategory.map(entry => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColors[entry.name] || "#6b7280" }} />
                        <span className="text-muted-foreground truncate max-w-[120px]">{entry.name}</span>
                        <span className="font-medium">{((entry.value / totalStockValue) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No stock value data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inventory Value Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Stock Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalStockValue)}</p>
                <p className="text-sm text-muted-foreground">{inventoryData.length} items tracked</p>
              </div>
              {inventoryOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={inventoryOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  No historical data available — tracked from future job usage
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Locations</TableHead>
                  <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                  <TableHead className="hidden lg:table-cell">Warranty</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Used</TableHead>
                  <TableHead className="hidden xl:table-cell">Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : inventoryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No inventory items found. Import your stock list to get started.
                    </TableCell>
                  </TableRow>
                ) : inventoryData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-muted/50 active:bg-muted ${
                      isLowStock(item.quantity, item.minStock)
                        ? "bg-destructive/5"
                        : ""
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{item.partName}</div>
                          <div className="text-xs text-muted-foreground">{item.partNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className={`font-semibold ${
                            isLowStock(item.quantity, item.minStock)
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Min: {item.minStock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Warehouse</div>
                          <div className="font-bold">{item.locations.warehouse}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Terry</div>
                          <div className="font-bold text-primary">{item.locations.terryVan}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Jason</div>
                          <div className="font-bold text-primary">{item.locations.jasonVan}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{item.supplier}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{item.warrantyPeriod}</span>
                        {getWarrantyBadge(item.warrantyExpiry)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {item.lastUsed}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs hidden xl:table-cell">
                      <p className="text-sm text-muted-foreground truncate">
                        {item.notes}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(item.quantity, item.minStock)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                      >
                        View History
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedItem.partName}
                </DialogTitle>
                <DialogDescription>
                  {selectedItem.id} - Usage history and details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Stock</p>
                    <p className="text-2xl font-bold">{selectedItem.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Stock Level</p>
                    <p className="text-2xl font-bold text-warning">{selectedItem.minStock}</p>
                  </div>
                </div>

                {/* Stock Locations */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Stock by Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Warehouse</p>
                        <p className="text-2xl font-bold">{selectedItem.locations.warehouse}</p>
                      </div>
                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Terry's Van</p>
                        <p className="text-2xl font-bold text-primary">{selectedItem.locations.terryVan}</p>
                      </div>
                      <div className="bg-background rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Jason's Van</p>
                        <p className="text-2xl font-bold text-primary">{selectedItem.locations.jasonVan}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Part Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Part Number</Label>
                    <p className="font-mono text-sm mt-1">{selectedItem.partNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Manufacturer SKU</Label>
                    <p className="font-mono text-sm mt-1">{selectedItem.manufacturerSKU}</p>
                  </div>
                  {selectedItem.serialNumber && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Serial Number</Label>
                      <p className="font-mono text-sm mt-1">{selectedItem.serialNumber}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Date Arrived</Label>
                    <p className="text-sm mt-1">{new Date(selectedItem.dateArrived).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Used</Label>
                    <p className="text-sm mt-1">{new Date(selectedItem.lastUsed).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PoundSterling className="h-4 w-4" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Purchase Price</p>
                        <p className="font-bold">{formatCurrency(selectedItem.purchasePrice)}</p>
                      </div>
                      {selectedItem.customsCharges && (
                        <div>
                          <p className="text-xs text-muted-foreground">Customs</p>
                          <p className="font-bold">{formatCurrency(selectedItem.customsCharges)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Sale Price</p>
                        <p className="font-bold text-primary">{formatCurrency(selectedItem.salePrice)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Supplier & Warranty */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Supplier
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="text-base">
                        {selectedItem.supplier}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Warranty
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{selectedItem.warrantyPeriod}</p>
                      {getWarrantyBadge(selectedItem.warrantyExpiry)}
                      {selectedItem.warrantyExpiry !== "N/A" && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {selectedItem.warrantyExpiry}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="font-semibold mb-2">Notes / Condition</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedItem.notes}
                  </p>
                </div>

                {/* Recent Jobs */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Jobs Using This Part</h3>
                  <div className="space-y-2">
                    {selectedItem.recentJobs.map((job, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{job.jobId}</p>
                              <p className="text-sm text-muted-foreground">
                                {job.siteName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {job.quantityUsed} used
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {job.date}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">Restock Item</Button>
                  <Button variant="outline" className="flex-1">
                    Edit Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
