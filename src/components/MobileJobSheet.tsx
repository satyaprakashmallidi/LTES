import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Mic,
  MicOff,
  MapPin,
  Phone,
  Package,
  AlertTriangle,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface JobSheetProps {
  jobId: string;
  onClose: () => void;
}

interface Photo {
  id: string;
  url: string;
  timestamp: string;
  note?: string;
}

interface VoiceNote {
  id: string;
  duration: string;
  timestamp: string;
  transcription?: string;
}

export const MobileJobSheet = ({ jobId, onClose }: JobSheetProps) => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [fieldNotes, setFieldNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showRAMSDialog, setShowRAMSDialog] = useState(false);
  const [ramsCompleted, setRamsCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo job data
  const jobData = {
    id: jobId,
    siteName: "Solar Farm - Great Wilbraham",
    accessCode: "Gate: #4582, Building: #7739",
    jobNumbers: ["J-2024-089", "J-2024-090"],
    contacts: [
      { name: "Site Manager", phone: "07700 900456" },
      { name: "Emergency", phone: "999" },
    ],
    partsRequired: [
      { id: "INV-001", name: "Circuit Breaker 32A", qty: 3, terryVan: 10, jasonVan: 5, warehouse: 30 },
      { id: "INV-003", name: "LED Light Panels", qty: 2, terryVan: 4, jasonVan: 0, warehouse: 8 },
    ],
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random()}`,
          url,
          timestamp: new Date().toLocaleString(),
        };
        setPhotos((prev) => [...prev, newPhoto]);
      });
      toast({
        title: "Photos captured",
        description: `${files.length} photo(s) added to job`,
      });
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Tap the microphone again to stop",
      });
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        const newVoiceNote: VoiceNote = {
          id: `voice-${Date.now()}`,
          duration: "0:45",
          timestamp: new Date().toLocaleString(),
          transcription: "Demo transcription: Inspected inverter panel, all connections secure.",
        };
        setVoiceNotes((prev) => [...prev, newVoiceNote]);
        toast({
          title: "Recording saved",
          description: "Voice note added to job",
        });
      }, 2000);
    }
  };

  const handleGenerateReport = () => {
    if (!ramsCompleted) {
      toast({
        title: "RAMS Required",
        description: "Please complete Point of Works Risk Assessment first",
        variant: "destructive",
      });
      setShowRAMSDialog(true);
      return;
    }

    toast({
      title: "Report Generation Started",
      description: "AI is creating your PDF report from photos and notes",
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* RAMS Gate */}
      {!ramsCompleted && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Point of Works Risk Assessment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You must complete the RAMS before starting work on this job.
            </p>
            <Button onClick={() => setShowRAMSDialog(true)} variant="outline" className="w-full">
              Complete RAMS Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{jobData.siteName}</span>
            <Badge variant="secondary">{jobData.id}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Job Numbers</Label>
            <div className="flex gap-2 mt-1">
              {jobData.jobNumbers.map((num) => (
                <Badge key={num} variant="outline">
                  {num}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Access Codes
            </Label>
            <p className="text-sm font-mono mt-1">{jobData.accessCode}</p>
          </div>

          <div>
            <Label className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </Label>
            {jobData.contacts.map((contact, i) => (
              <div key={i} className="flex justify-between text-sm mt-1">
                <span>{contact.name}</span>
                <a href={`tel:${contact.phone}`} className="text-primary font-medium">
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parts Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobData.partsRequired.map((part) => (
            <div key={part.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{part.name}</p>
                  <p className="text-sm text-muted-foreground">Required: {part.qty}</p>
                </div>
                <Badge variant={part.terryVan >= part.qty ? "default" : "destructive"}>
                  {part.id}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted/50 rounded p-2">
                  <div className="text-muted-foreground">Terry's Van</div>
                  <div className="font-bold text-lg">{part.terryVan}</div>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="text-muted-foreground">Jason's Van</div>
                  <div className="font-bold text-lg">{part.jasonVan}</div>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="text-muted-foreground">Warehouse</div>
                  <div className="font-bold text-lg">{part.warehouse}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>On-Site Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo Capture */}
          <div>
            <Label>Photos ({photos.length})</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handlePhotoCapture}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photos
            </Button>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded overflow-hidden border">
                    <img src={photo.url} alt="Job photo" className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Voice Notes */}
          <div>
            <Label>Voice Notes ({voiceNotes.length})</Label>
            <Button
              onClick={handleVoiceRecord}
              variant={isRecording ? "destructive" : "outline"}
              className="w-full mt-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2 animate-pulse" />
                  Recording... Tap to Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Record Voice Note
                </>
              )}
            </Button>
            {voiceNotes.length > 0 && (
              <div className="space-y-2 mt-3">
                {voiceNotes.map((note) => (
                  <div key={note.id} className="border rounded p-3 text-sm">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{note.timestamp}</span>
                      <span>{note.duration}</span>
                    </div>
                    {note.transcription && (
                      <p className="text-xs italic">{note.transcription}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Field Notes */}
          <div>
            <Label>Field Notes</Label>
            <Textarea
              placeholder="Add detailed notes about the work performed..."
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Report */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleGenerateReport} className="w-full" size="lg">
            <FileText className="h-4 w-4 mr-2" />
            Generate AI Report
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Report will be sent for human review before customer delivery
          </p>
        </CardContent>
      </Card>

      {/* RAMS Dialog */}
      <RAMSAssessmentDialog
        open={showRAMSDialog}
        onOpenChange={setShowRAMSDialog}
        onComplete={() => {
          setRamsCompleted(true);
          setShowRAMSDialog(false);
          toast({
            title: "RAMS Completed",
            description: "You can now proceed with the work",
          });
        }}
      />
    </div>
  );
};

interface RAMSAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const RAMSAssessmentDialog = ({ open, onOpenChange, onComplete }: RAMSAssessmentDialogProps) => {
  const [checks, setChecks] = useState({
    ppe: false,
    isolation: false,
    hazards: false,
    emergency: false,
    permits: false,
  });

  const allChecked = Object.values(checks).every((v) => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Point of Works Risk Assessment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Complete this assessment before starting work. All items must be checked to proceed.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 border-b pb-4">
              <Checkbox
                id="ppe"
                checked={checks.ppe}
                onCheckedChange={(checked) => setChecks({ ...checks, ppe: !!checked })}
              />
              <div className="flex-1">
                <Label htmlFor="ppe" className="font-medium cursor-pointer">
                  Personal Protective Equipment (PPE)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I have the required PPE including hard hat, safety boots, high-vis, gloves, and any
                  job-specific equipment (arc-rated suit, voltage gloves, etc.)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b pb-4">
              <Checkbox
                id="isolation"
                checked={checks.isolation}
                onCheckedChange={(checked) => setChecks({ ...checks, isolation: !!checked })}
              />
              <div className="flex-1">
                <Label htmlFor="isolation" className="font-medium cursor-pointer">
                  Electrical Isolation & Lock-Off
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I have verified the isolation procedure, tested for dead, and applied lock-off devices
                  where required
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b pb-4">
              <Checkbox
                id="hazards"
                checked={checks.hazards}
                onCheckedChange={(checked) => setChecks({ ...checks, hazards: !!checked })}
              />
              <div className="flex-1">
                <Label htmlFor="hazards" className="font-medium cursor-pointer">
                  Site Hazards Identified
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I have identified and assessed site-specific hazards including working at height,
                  confined spaces, weather conditions, and overhead/underground services
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-b pb-4">
              <Checkbox
                id="emergency"
                checked={checks.emergency}
                onCheckedChange={(checked) => setChecks({ ...checks, emergency: !!checked })}
              />
              <div className="flex-1">
                <Label htmlFor="emergency" className="font-medium cursor-pointer">
                  Emergency Procedures Known
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I know the location of first aid equipment, emergency exits, assembly points, and have
                  emergency contact numbers available
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="permits"
                checked={checks.permits}
                onCheckedChange={(checked) => setChecks({ ...checks, permits: !!checked })}
              />
              <div className="flex-1">
                <Label htmlFor="permits" className="font-medium cursor-pointer">
                  Permits & Authorizations
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I have obtained all necessary permits to work, hot work permits, confined space permits,
                  or excavation permits as required for this job
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            disabled={!allChecked}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Assessment & Start Work
          </Button>

          {!allChecked && (
            <p className="text-sm text-center text-destructive">
              All items must be checked before proceeding
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
