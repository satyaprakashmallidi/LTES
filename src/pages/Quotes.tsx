import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, PoundSterling, Download, Edit, CheckCircle, XCircle } from "lucide-react";

// Quotes - should be fetched from Supabase
const initialQuotes: { id: string; client: string; project: string; value: number; status: string; validUntil: string; createdDate: string }[] = [];

type Quote = (typeof initialQuotes)[0];

type CreateQuoteFormProps = {
  existingQuotes: Quote[];
  onCreate: (quote: Quote) => void;
  onCancel: () => void;
};

const generateQuoteId = (existingQuotes: Quote[]): string => {
  const year = new Date().getFullYear();
  const maxNumber = existingQuotes
    .map((q) => parseInt(q.id.split("-")[2]))
    .reduce((max, n) => (isNaN(n) ? max : Math.max(max, n)), 160);
  const next = (maxNumber + 1).toString().padStart(3, "0");
  return `Q-${year}-${next}`;
};

const CreateQuoteForm = ({ existingQuotes, onCreate, onCancel }: CreateQuoteFormProps) => {
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = Number(value);
    if (!client.trim() || !project.trim() || isNaN(numericValue) || numericValue <= 0) {
      return;
    }

    const id = generateQuoteId(existingQuotes);
    const today = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    const newQuote: Quote = {
      id,
      client: client.trim(),
      project: project.trim(),
      value: numericValue,
      status: "Draft",
      validUntil: validUntil.toISOString().split("T")[0],
      createdDate: today.toISOString().split("T")[0],
    };

    onCreate(newQuote);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Client *</label>
        <Input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="e.g., ABC Manufacturing Ltd"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Project *</label>
        <Input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="e.g., Factory Electrical Upgrade"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Estimated Value (£) *</label>
        <Input
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., 28500"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Internal Notes (optional)</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any extra context for this quote..."
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="min-h-[44px]">
          Create Quote
        </Button>
      </div>
    </form>
  );
};

const Quotes = () => {
  const [searchParams] = useSearchParams();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const quoteId = searchParams.get("quoteId");
    if (quoteId) {
      const quote = quotes.find((q) => q.id === quoteId);
      if (quote) {
        setSelectedQuote(quote);
      }
    }
  }, [searchParams, quotes]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      Sent: { className: "bg-info text-info-foreground" },
      Draft: { className: "bg-muted text-muted-foreground" },
      Accepted: { className: "bg-success text-success-foreground" },
      "Under Review": { className: "bg-warning text-warning-foreground" },
      Rejected: { className: "bg-destructive text-destructive-foreground" },
    };
    return <Badge className={variants[status]?.className}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value);
  };

  const totalValue = quotes.reduce((sum, quote) => sum + quote.value, 0);

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Quotes" }]} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1">Quotes</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
            Manage and track project quotes for central inverter maintenance
          </p>
        </div>
        <Button size="lg" className="min-h-[44px] active:scale-95" onClick={() => setIsCreateOpen(true)}>Create New Quote</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quote Value
            </CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Quotes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.filter((q) => q.status === "Sent" || q.status === "Under Review").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acceptance Rate
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id} className="hover:bg-muted/50 active:bg-muted">
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.client}</TableCell>
                  <TableCell>{quote.project}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(quote.value)}
                  </TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>{quote.validUntil}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.createdDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="min-h-[44px] active:scale-95"
                      onClick={() => setSelectedQuote(quote)}
                    >
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

      {/* Create Quote Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
            <DialogDescription>
              Quick quote generator for Phase 1 (manual, no AI yet)
            </DialogDescription>
          </DialogHeader>
          <CreateQuoteForm
            onCancel={() => setIsCreateOpen(false)}
            onCreate={(quote) => {
              setQuotes((prev) => [quote, ...prev]);
              setIsCreateOpen(false);
            }}
            existingQuotes={quotes}
          />
        </DialogContent>
      </Dialog>

      {/* Quote Details Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedQuote && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedQuote.id} - {selectedQuote.client}
                </DialogTitle>
                <DialogDescription>
                  Quote details and actions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quote Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedQuote.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedQuote.status)}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Project Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-semibold">{selectedQuote.project}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-medium">{selectedQuote.validUntil}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created Date</p>
                      <p className="font-medium">{selectedQuote.createdDate}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button className="bg-success hover:bg-success/90 text-success-foreground min-h-[44px] active:scale-95">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Quote
                  </Button>
                  <Button variant="destructive" className="min-h-[44px] active:scale-95">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Quote
                  </Button>
                  <Button variant="outline" className="min-h-[44px] active:scale-95">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Quote
                  </Button>
                  <Button variant="outline" className="min-h-[44px] active:scale-95">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
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

export default Quotes;
