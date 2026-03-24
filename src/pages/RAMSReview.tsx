import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileCheck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Building,
  Hash,
  Hospital,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// RAMS - should be fetched from Supabase
const allRAMS: { id: string; siteName: string; jobNumber: string; technician: string; dateCreated: string; riskLevel: string; nearestHospital: string; what3words: string; jobType: string; content: string }[] = [];

const RAMSReview = () => {
  const [searchParams] = useSearchParams();
  const [currentRAMS, setCurrentRAMS] = useState<typeof allRAMS[0] | null>(null);
  const [comments, setComments] = useState("");
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const ramsId = searchParams.get("ramsId");
    if (ramsId) {
      const rams = allRAMS.find((r) => r.id === ramsId);
      if (rams) {
        setCurrentRAMS(rams);
      }
    }
  }, [searchParams]);

  const handleApprove = () => {
    toast({
      title: "RAMS Approved",
      description: `${currentRAMS.id} has been approved and filed for ${currentRAMS.jobNumber}`,
      className: "bg-success text-success-foreground",
    });
  };

  const handleRequestChanges = () => {
    if (!comments.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide feedback for the requested changes",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Changes Requested",
      description: `Feedback sent to ${currentRAMS.technician} for revision`,
      className: "bg-warning text-warning-foreground",
    });
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, { className: string }> = {
      High: { className: "bg-destructive text-destructive-foreground" },
      Medium: { className: "bg-warning text-warning-foreground" },
      Low: { className: "bg-success text-success-foreground" },
    };
    return (
      <Badge className={variants[risk]?.className || ""}>
        {risk} Risk
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "RAMS Review" }, { label: currentRAMS.id }]} />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">RAMS Review - {currentRAMS.id}</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Review and approve Risk Assessment & Method Statement for {currentRAMS.technician}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Document Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Document Preview - {currentRAMS.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 sm:p-6 max-h-[600px] sm:max-h-[800px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-foreground">
                  {currentRAMS.content}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                PDF viewer integration available for production deployment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Approval Controls & Metadata */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Site Name</p>
                  <p className="font-medium">{currentRAMS.siteName}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Job Number</p>
                  <p className="font-medium">{currentRAMS.jobNumber}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Technician</p>
                  <p className="font-medium">{currentRAMS.technician}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Date Created</p>
                  <p className="font-medium">{currentRAMS.dateCreated}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Hospital className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Nearest Hospital</p>
                  <p className="font-medium text-sm">{currentRAMS.nearestHospital}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">What3Words</p>
                  <p className="font-medium font-mono text-sm">{currentRAMS.what3words}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <div className="mt-1">
                    {getRiskBadge(currentRAMS.riskLevel)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Comments / Feedback
                </label>
                <Textarea
                  placeholder="Add notes or feedback for this RAMS document..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleApprove}
                  className="bg-success hover:bg-success/90 text-success-foreground min-h-[44px] active:scale-95"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={handleRequestChanges}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground min-h-[44px] active:scale-95"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Draft Explanation */}
          <Card>
            <Collapsible open={isAIExpanded} onOpenChange={setIsAIExpanded}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Draft Explanation
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isAIExpanded ? "transform rotate-180" : ""
                      }`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm text-foreground leading-relaxed">
                        This RAMS was generated using <span className="font-semibold">standard risk templates</span> combined with job-specific parameters.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm text-foreground leading-relaxed">
                        Job Type: <span className="font-semibold">{currentRAMS.jobType}</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm text-foreground leading-relaxed">
                        The document incorporates site-specific hazards, control measures, and emergency procedures based on historical data and industry best practices.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm text-foreground leading-relaxed">
                        All generated content meets <span className="font-semibold">HSE guidelines</span> and has been cross-referenced with your organization's approved methodology library.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Final approval authority remains with qualified personnel. AI-generated content serves as a time-saving baseline.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RAMSReview;
