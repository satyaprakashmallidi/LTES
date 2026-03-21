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
const allRAMS: { id: string; siteName: string; jobNumber: string; technician: string; dateCreated: string; riskLevel: string; nearestHospital: string; what3words: string; jobType: string; content: string }[] = [
  {
    id: "RAMS-2024-089",
    siteName: "Warehouse A - Unit 5",
    jobNumber: "J-2024-089",
    technician: "Luke Thompson",
    dateCreated: "2025-01-18",
    riskLevel: "High",
    nearestHospital: "Addenbrooke's Hospital, 4.5 miles",
    what3words: "///crisp.glow.solar",
    jobType: "SMA Central Inverter Maintenance - 38.1MW",
    content: `RISK ASSESSMENT & METHOD STATEMENT

Project: SMA Central Inverter Maintenance - Great Wilbraham 38.1MW
Site: Great Wilbraham Solar Farm
Date: 18/01/2025

SCOPE OF WORKS:
Maintenance and inspection of SMA central inverters including power electronics, cooling systems, and safety devices.

IDENTIFIED HAZARDS:
1. High voltage electrical shock (up to 1500V DC)
2. Arc flash risk during switching operations
3. Working at height (inverter maintenance platforms)
4. Confined space entry (inverter rooms)
5. Manual handling of heavy components

CONTROL MEASURES:
1. Electrical Safety:
   - Complete isolation and lock-off procedures
   - Test voltage presence before work
   - Arc-rated PPE for switching operations
   - Minimum safe distances maintained

2. Working at Height:
   - PASMA qualified scaffold tower use
   - Safety harnesses and fall arrest systems
   - Three points of contact at all times

3. Confined Space:
   - Gas detection equipment operational
   - Forced ventilation where required
   - Buddy system with external observer

EMERGENCY PROCEDURES:
- First aid kit and AED available on site
- Nearest hospital: Addenbrooke's Hospital (4.5 miles)
- Emergency contact: Site Manager - 07700 900456
- Location reference: ///crisp.glow.solar

REQUIRED PPE:
- Arc-rated suit (minimum 40 cal/cm²)
- High voltage gloves (Class 2)
- Hard hat with face shield
- Safety boots (electrical rated)
- High-visibility clothing

COMPETENCY REQUIREMENTS:
- HV Authorised Person status
- 18th Edition Wiring Regulations
- SMA certified engineer
- Valid PASMA and confined space certification

This RAMS has been reviewed and approved for the specified works.`,
  },
  {
    id: "RAMS-2024-090",
    siteName: "Office Block 3 - Manchester",
    jobNumber: "J-2024-090",
    technician: "Sarah Mitchell",
    dateCreated: "2025-01-17",
    riskLevel: "Medium",
    nearestHospital: "Queen Elizabeth Hospital, 3.2 miles",
    what3words: "///brick.power.grid",
    jobType: "Schneider Conext CL60 Stack Replacement",
    content: `RISK ASSESSMENT & METHOD STATEMENT

Project: Schneider Conext CL60 Stack Replacement
Site: Industrial Park Birmingham
Date: 17/01/2025

SCOPE OF WORKS:
Replacement of faulty Schneider Conext CL60 inverter stack including disconnection, removal, installation of new unit.

IDENTIFIED HAZARDS:
1. Electrical shock from DC circuits (up to 1000V)
2. Manual handling of heavy equipment (45kg units)
3. Working in active industrial environment
4. Potential for arc flash during isolation

CONTROL MEASURES:
1. Electrical Safety:
   - Isolation of DC and AC circuits
   - Lockout/tagout procedures
   - Voltage testing before and after isolation
   - Insulated tools and equipment

2. Manual Handling:
   - Two-person lift for all units
   - Mechanical aids (trolley, hoist) available
   - Clear lifting route established

3. Site Safety:
   - High-visibility clothing mandatory
   - Site induction completed
   - Segregated work area with barriers
   - Coordination with site operations

EMERGENCY PROCEDURES:
- First aid trained personnel on site
- Nearest hospital: Queen Elizabeth Hospital (3.2 miles)
- Emergency contact: Site Manager - 07700 900789
- Location reference: ///brick.power.grid

REQUIRED PPE:
- Safety boots (electrical rated)
- Hard hat
- High-visibility vest
- Insulated gloves
- Safety glasses
- Anti-static wrist strap

COMPETENCY REQUIREMENTS:
- 18th Edition Wiring Regulations
- Schneider product training
- Current ECS/CSCS card
- Manual handling certificate

This RAMS has been reviewed and approved for the specified works.`,
  },
  {
    id: "RAMS-2024-091",
    siteName: "Factory Floor 2 - Birmingham",
    jobNumber: "J-2024-091",
    technician: "David Clark",
    dateCreated: "2025-01-16",
    riskLevel: "Medium",
    nearestHospital: "Various - Site Specific",
    what3words: "///refer.site.docs",
    jobType: "ACB Maintenance & Testing - Multiple Sites",
    content: `RISK ASSESSMENT & METHOD STATEMENT

Project: ACB Maintenance & Testing - Multiple Sites
Site: Nationwide Operations
Date: 16/01/2025

SCOPE OF WORKS:
Routine maintenance and testing of Air Circuit Breakers (ACBs) across multiple solar installation sites.

IDENTIFIED HAZARDS:
1. Electrical shock from high current circuits
2. Arc flash during breaker operations
3. Travel between multiple sites
4. Mechanical injury from breaker mechanisms
5. Exposure to varying site conditions

CONTROL MEASURES:
1. Electrical Safety:
   - Site-specific isolation procedures
   - Arc-rated PPE worn during all operations
   - Test equipment calibrated and certified
   - Lock-off procedures documented

2. Mechanical Safety:
   - Breaker mechanisms inspected before work
   - Operating handles checked for security
   - Spring energy released safely
   - Finger traps avoided

3. Travel Safety:
   - Vehicle checks before each journey
   - Route planning and risk assessment
   - Regular breaks on long journeys
   - Emergency contact procedures

4. Site Adaptation:
   - Site-specific induction at each location
   - Local emergency procedures reviewed
   - Site hazards identified and controlled
   - Weather conditions assessed

EMERGENCY PROCEDURES:
- Site-specific emergency contacts maintained
- Nearest hospital information for each site
- Mobile communication devices charged
- Check-in procedures with control room
- Location reference: Site-specific what3words

REQUIRED PPE:
- Arc-rated clothing (minimum 12 cal/cm²)
- Electrical safety gloves
- Hard hat
- Safety boots
- High-visibility clothing
- Safety glasses

COMPETENCY REQUIREMENTS:
- 18th Edition Wiring Regulations
- ACB maintenance certification
- Arc flash awareness training
- First aid at work certificate
- Full UK driving license

This RAMS has been reviewed and approved for the specified works.`,
  },
];

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
