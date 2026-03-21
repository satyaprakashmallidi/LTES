import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useJob } from "@/hooks/useJob";
import { type Job } from "@/data/mockJobs";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  ClipboardCheck,
  Wrench,
  Package,
  FileSignature,
  Phone,
  Clock,
  User,
  Save,
  Send,
  X,
  Copy,
  Check,
  Zap,
  Loader2,
  Plus,
  Minus,
  Trash2,
  History,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Building2,
  FileText,
  Mail,
  Users,
  AlertTriangle,
  Search,
  Paperclip,
  FileUp,
} from "lucide-react";
import { SignaturePad } from "@/components/SignaturePad";
import { PhotoUploadSection } from "@/components/PhotoUploadSection";
import { EquipmentHistorySidebar } from "@/components/EquipmentHistorySidebar";
import { generateJobPdf, uploadPdfToStorage, updateJobReportLink } from "@/utils/generateJobPdf";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistState {
  items: ChecklistItem[];
  completedAt: string | null;
}

interface PartUsed {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  serialNumber: string;
  stock: number;
  stockWarning: boolean;
}

interface InventoryPart {
  name: string;
  partNumber: string;
  stock: number;
}

// Unified job data type for display
interface DisplayJobData {
  id: string;
  jobNumber: string;
  siteName: string;
  address: string;
  accessInfo: string;
  contactName: string;
  contactPhone: string;
  technician: string;
  inverterModel: string;
  serialNumber: string;
  jobType: string;
  scheduledDate: string | null;
  scheduledTime: string;
  workDescription: string;
}

const MobileJobView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [workPerformed, setWorkPerformed] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToSite, setDistanceToSite] = useState<string | null>(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(true);

  // Placeholder data for new fields (to be replaced with actual data later)
  const placeholderData = {
    fullAddress: "Solar Farm, Edinburgh Business Park, Edinburgh EH12 9DJ, United Kingdom",
    what3words: "filled.count.soap",
    accessCode: "GATE-1234-MAIN",
    siteManualUrl: "https://example.com/manuals/sma-sunny-tripower-60.pdf",
    // Placeholder site coordinates (Edinburgh Business Park area)
    siteCoordinates: { lat: 55.9425, lng: -3.3010 },
    // Site contacts
    siteContacts: [
      { name: "James McDonald", role: "Primary Contact", phone: "07700900123", phoneDisplay: "07700 900 123", email: "j.mcdonald@datacenter.com" },
      { name: "Sarah Chen", role: "Site Manager", phone: "07700900456", phoneDisplay: "07700 900 456", email: "s.chen@datacenter.com" },
      { name: "Emergency Line", role: "24/7 Emergency", phone: "08001234567", phoneDisplay: "0800 123 4567", email: "emergency@datacenter.com" }
    ],
  };

  // State for contacts section
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  // Haversine formula to calculate distance between two GPS points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setDistanceToSite("GPS not available");
      setIsLoadingDistance(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });

        // Calculate distance to site
        const distance = calculateDistance(
          userLat,
          userLng,
          placeholderData.siteCoordinates.lat,
          placeholderData.siteCoordinates.lng
        );
        
        // Format distance
        if (distance < 1) {
          setDistanceToSite(`${Math.round(distance * 1000)} m away`);
        } else {
          setDistanceToSite(`${distance.toFixed(2)} km away`);
        }
        setIsLoadingDistance(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDistanceToSite("Location unavailable");
        setIsLoadingDistance(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Sample equipment history data (to be replaced with actual data later)
  const equipmentHistory = [
    {
      jobNumber: "JOB-2024-085",
      date: "2024-11-15",
      issue: "DC Overvoltage Error 3501",
      status: "Complete" as const,
      technician: "John Smith",
    },
    {
      jobNumber: "JOB-2024-072",
      date: "2024-10-03",
      issue: "Routine Maintenance",
      status: "Complete" as const,
      technician: "Emma Wilson",
    },
  ];
  
  // Fetch job data from database
  const { data: dbJobData, isLoading, error } = useJob(id);

  // Job data from database
  const jobData: DisplayJobData | null = useMemo(() => {
    if (dbJobData) {
      // Map database fields to display format
      return {
        id: dbJobData.id,
        jobNumber: dbJobData.job_number,
        siteName: dbJobData.sites?.site_name || "Unknown Site",
        address: dbJobData.sites
          ? `${dbJobData.sites.address}${dbJobData.sites.postcode ? `, ${dbJobData.sites.postcode}` : ""}`
          : "No address available",
        accessInfo: [dbJobData.sites?.access_codes, dbJobData.sites?.access_instructions]
          .filter(Boolean)
          .join(" • ") || "No access information",
        contactName: dbJobData.sites?.site_contact_name || "No contact",
        contactPhone: dbJobData.sites?.site_contact_phone || "",
        technician: dbJobData.technician || "Unassigned",
        inverterModel: dbJobData.equipment_details?.inverter_model || "Not specified",
        serialNumber: dbJobData.equipment_details?.serial_number || "Not specified",
        jobType: dbJobData.job_type,
        scheduledDate: dbJobData.scheduled_date,
        scheduledTime: dbJobData.scheduled_date
          ? new Date(dbJobData.scheduled_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : "",
        workDescription: dbJobData.description || dbJobData.fault_description || "No description",
      };
    }
    return null;
  }, [dbJobData, fallbackJob]);

  // Set job type when data loads
  useEffect(() => {
    if (jobData?.jobType) {
      setSelectedJobType(jobData.jobType);
    }
  }, [jobData]);

  // Handle error/not found - only redirect if both database and fallback fail
  useEffect(() => {
    if (error && !fallbackJob && !isLoading) {
      toast({
        title: "Job not found",
        description: "Redirecting to jobs list",
        variant: "destructive",
      });
      navigate("/jobs");
    }
  }, [error, fallbackJob, isLoading, navigate, toast]);

  const [openSections, setOpenSections] = useState({
    siteInfo: true,
    booking: true,
    preWork: true,
    workDetails: false,
    photos: false,
    parts: false,
    signOff: false,
  });

  // Booking information state
  const [quoteNumber, setQuoteNumber] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [ramsCompleted, setRamsCompleted] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  });
  // Team members from job data (assigned by office)

  // Format date for display (e.g., "Monday, 5 December 2024")
  const formatScheduledDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr + 'T00:00:00'); // Ensure local timezone
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const defaultChecklist: ChecklistItem[] = [
    { id: "site-access", label: "Site access obtained", checked: false },
    { id: "ppe", label: "Safety gear worn (PPE)", checked: false },
    { id: "isolation", label: "Equipment isolated", checked: false },
    { id: "customer-notified", label: "Customer notified of arrival", checked: false },
  ];

  // Load checklist from localStorage
  const getStoredChecklist = (): ChecklistState => {
    if (!id) return { items: defaultChecklist, completedAt: null };
    const stored = localStorage.getItem(`checklist-${id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { items: defaultChecklist, completedAt: null };
      }
    }
    return { items: defaultChecklist, completedAt: null };
  };

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => getStoredChecklist().items);
  const [checklistCompletedAt, setChecklistCompletedAt] = useState<string | null>(() => getStoredChecklist().completedAt);

  const [workNotes, setWorkNotes] = useState("");
  const [findings, setFindings] = useState("");
  const [selectedFindingChips, setSelectedFindingChips] = useState<string[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureTimestamp, setSignatureTimestamp] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  
  // Error code dropdown state
  const [selectedErrorCode, setSelectedErrorCode] = useState<string | null>(null);
  const [errorCodeSearch, setErrorCodeSearch] = useState("");
  const [isErrorDropdownOpen, setIsErrorDropdownOpen] = useState(false);
  const [isCustomIssue, setIsCustomIssue] = useState(false);
  const [customIssueText, setCustomIssueText] = useState("");
  
  // Customer report attachments
  const [reportAttachments, setReportAttachments] = useState<{
    id: string;
    name: string;
    size: number;
    dataUrl: string;
  }[]>([]);

  // Completion tracking state
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [reportComplete, setReportComplete] = useState(false);

  // Parts autocomplete state
  const [partSearchQueries, setPartSearchQueries] = useState<Record<string, string>>({});
  const [activePartDropdown, setActivePartDropdown] = useState<string | null>(null);
  const [isSearchingParts, setIsSearchingParts] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddSelections, setQuickAddSelections] = useState<Record<string, boolean>>({});

  // Sample inventory parts data
  const inventoryParts: InventoryPart[] = [
    { name: "DC Isolator Switch", partNumber: "P-1001", stock: 15 },
    { name: "AC Contactor 40A", partNumber: "P-1002", stock: 3 },
    { name: "Surge Protection Device", partNumber: "P-1003", stock: 0 },
    { name: "Cable Gland M20", partNumber: "P-1004", stock: 50 },
    { name: "Terminal Block 10mm", partNumber: "P-1005", stock: 8 },
    { name: "Fuses 10A", partNumber: "P-1006", stock: 25 },
    { name: "MC4 Connector Male", partNumber: "P-1007", stock: 40 },
    { name: "MC4 Connector Female", partNumber: "P-1008", stock: 38 },
    { name: "Solar Cable 6mm Black", partNumber: "P-1009", stock: 100 },
    { name: "Solar Cable 6mm Red", partNumber: "P-1010", stock: 95 },
  ];

  // Common parts for quick add
  const commonParts = [
    { name: "DC Isolator Switch", partNumber: "P-1001", typicalQty: 1 },
    { name: "Fuses 10A", partNumber: "P-1006", typicalQty: 2 },
    { name: "Cable Gland M20", partNumber: "P-1004", typicalQty: 4 },
    { name: "MC4 Connector Male", partNumber: "P-1007", typicalQty: 4 },
    { name: "MC4 Connector Female", partNumber: "P-1008", typicalQty: 4 },
  ];

  // Debounced part search
  const getFilteredParts = (query: string): InventoryPart[] => {
    if (query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return inventoryParts.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.partNumber.toLowerCase().includes(lowerQuery)
    );
  };

  const getStockColor = (stock: number): string => {
    if (stock === 0) return "text-red-600 dark:text-red-400";
    if (stock <= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStockBgColor = (stock: number): string => {
    if (stock === 0) return "bg-red-100 dark:bg-red-900/30";
    if (stock <= 10) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-green-100 dark:bg-green-900/30";
  };

  const handlePartSearch = (partId: string, query: string) => {
    setPartSearchQueries((prev) => ({ ...prev, [partId]: query }));
    if (query.length >= 2) {
      setActivePartDropdown(partId);
      setIsSearchingParts(true);
      // Simulate debounce
      setTimeout(() => setIsSearchingParts(false), 300);
    } else {
      setActivePartDropdown(null);
    }
  };

  const selectPart = (partId: string, inventoryPart: InventoryPart) => {
    setPartsUsed((prev) =>
      prev.map((p) =>
        p.id === partId
          ? {
              ...p,
              partName: inventoryPart.name,
              partNumber: inventoryPart.partNumber,
              stock: inventoryPart.stock,
              stockWarning: p.quantity > inventoryPart.stock,
            }
          : p
      )
    );
    setPartSearchQueries((prev) => ({ ...prev, [partId]: "" }));
    setActivePartDropdown(null);
  };

  const checkStockWarning = (partId: string, quantity: number) => {
    setPartsUsed((prev) =>
      prev.map((p) =>
        p.id === partId ? { ...p, stockWarning: quantity > p.stock && p.stock > 0 } : p
      )
    );
  };

  const handleQuickAddParts = () => {
    const selectedParts = commonParts.filter((cp) => quickAddSelections[cp.partNumber]);
    selectedParts.forEach((cp) => {
      const inventoryPart = inventoryParts.find((ip) => ip.partNumber === cp.partNumber);
      if (inventoryPart) {
        setPartsUsed((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${cp.partNumber}`,
            partName: cp.name,
            partNumber: cp.partNumber,
            quantity: cp.typicalQty,
            serialNumber: "",
            stock: inventoryPart.stock,
            stockWarning: cp.typicalQty > inventoryPart.stock,
          },
        ]);
      }
    });
    setQuickAddSelections({});
    setShowQuickAddModal(false);
    toast({
      title: "Parts added",
      description: `${selectedParts.length} part(s) added to the list`,
    });
  };

  // Error codes data
  const errorCodes = [
    { code: "Error 3501", description: "DC Overvoltage String 1", severity: "High" as const },
    { code: "Error 1105", description: "Insulation Fault", severity: "Critical" as const },
    { code: "Error 2302", description: "Grid Voltage Too High", severity: "Medium" as const },
    { code: "Error 6801", description: "Communication Error", severity: "Low" as const },
    { code: "Routine", description: "Routine Maintenance - No Issues", severity: "Low" as const },
  ];

  const getSeverityBadgeClass = (severity: "Low" | "Medium" | "High" | "Critical") => {
    switch (severity) {
      case "Low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "High": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  const filteredErrorCodes = errorCodes.filter(
    (ec) =>
      ec.code.toLowerCase().includes(errorCodeSearch.toLowerCase()) ||
      ec.description.toLowerCase().includes(errorCodeSearch.toLowerCase())
  );

  const handleSelectErrorCode = (code: string) => {
    setSelectedErrorCode(code);
    setIsErrorDropdownOpen(false);
    setErrorCodeSearch("");
    setIsCustomIssue(false);
  };

  const handleCustomIssue = () => {
    setIsCustomIssue(true);
    setSelectedErrorCode(null);
    setIsErrorDropdownOpen(false);
  };

  const handleAttachReport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (reportAttachments.length >= 3) {
        toast({
          title: "Maximum attachments reached",
          description: "You can only attach up to 3 files",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setReportAttachments((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            size: file.size,
            dataUrl: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setReportAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const findingChips = ["No Issues", "Minor Fault", "Major Fault", "Parts Needed"];
  const WORK_PERFORMED_MAX_CHARS = 2000;

  // Load work performed and findings from localStorage
  useEffect(() => {
    if (!id) return;
    const storedWorkPerformed = localStorage.getItem(`workPerformed-${id}`);
    const storedFindings = localStorage.getItem(`findings-${id}`);
    const storedChips = localStorage.getItem(`findingChips-${id}`);
    
    if (storedWorkPerformed) setWorkPerformed(storedWorkPerformed);
    if (storedFindings) setFindings(storedFindings);
    if (storedChips) {
      try {
        setSelectedFindingChips(JSON.parse(storedChips));
      } catch {}
    }
  }, [id]);

  // Auto-save work performed every 30 seconds
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      if (workPerformed) {
        localStorage.setItem(`workPerformed-${id}`, workPerformed);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [id, workPerformed]);

  // Auto-save findings immediately on change
  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`findings-${id}`, findings);
    localStorage.setItem(`findingChips-${id}`, JSON.stringify(selectedFindingChips));
  }, [id, findings, selectedFindingChips]);

  const toggleFindingChip = (chip: string) => {
    setSelectedFindingChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  // Save checklist to localStorage when it changes
  useEffect(() => {
    if (!id) return;
    const allChecked = checklist.every(item => item.checked);
    const newCompletedAt = allChecked && !checklistCompletedAt 
      ? new Date().toISOString() 
      : allChecked ? checklistCompletedAt : null;
    
    if (newCompletedAt !== checklistCompletedAt) {
      setChecklistCompletedAt(newCompletedAt);
    }
    
    const state: ChecklistState = { items: checklist, completedAt: newCompletedAt };
    localStorage.setItem(`checklist-${id}`, JSON.stringify(state));
  }, [checklist, id, checklistCompletedAt]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRamsToggle = (checked: boolean) => {
    setRamsCompleted(checked);
    if (checked) {
      toast({
        title: "RAMS completed!",
        description: "Pre-work checklist is now unlocked.",
      });
    }
  };

  const handleChecklistChange = (itemId: string) => {
    if (!ramsCompleted) return; // Prevent changes if RAMS not completed
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  const addPart = () => {
    setPartsUsed((prev) => [
      ...prev,
      { id: `${Date.now()}`, partName: "", partNumber: "", quantity: 1, serialNumber: "", stock: 0, stockWarning: false },
    ]);
  };

  const updatePart = (id: string, field: keyof Omit<PartUsed, "id">, value: string | number | boolean) => {
    setPartsUsed((prev) =>
      prev.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
  };

  const incrementQuantity = (id: string) => {
    setPartsUsed((prev) =>
      prev.map((part) => {
        if (part.id === id) {
          const newQty = part.quantity + 1;
          return { ...part, quantity: newQty, stockWarning: newQty > part.stock && part.stock > 0 };
        }
        return part;
      })
    );
  };

  const decrementQuantity = (id: string) => {
    setPartsUsed((prev) =>
      prev.map((part) => {
        if (part.id === id && part.quantity > 1) {
          const newQty = part.quantity - 1;
          return { ...part, quantity: newQty, stockWarning: newQty > part.stock && part.stock > 0 };
        }
        return part;
      })
    );
  };

  const removePart = (id: string) => {
    setPartsUsed((prev) => prev.filter((p) => p.id !== id));
  };

  const getValidPartsCount = () => partsUsed.filter(p => p.partName.trim() && p.quantity > 0).length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    let completed = 0;
    let total = 6; // 6 sections

    if (checklist.every((item) => item.checked)) completed++;
    if (workPerformed.trim().length > 0) completed++;
    // Check photos from localStorage
    const storedPhotos = localStorage.getItem(`photos-${id}`);
    const photosCount = storedPhotos ? JSON.parse(storedPhotos).length : 0;
    if (photosCount > 0) completed++;
    if (partsUsed.length > 0 && partsUsed.every((p) => p.partName)) completed++;
    if (signature && customerName.trim()) completed++;
    completed++; // Site info is always "complete"

    return Math.round((completed / total) * 100);
  };

  const handleSaveDraft = () => {
    if (!id) return;
    
    // Save all form data to localStorage
    const draftData = {
      workPerformed,
      findings,
      selectedFindingChips,
      partsUsed,
      customerName,
      signature,
      signatureTimestamp,
      selectedJobType,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`jobDraft-${id}`, JSON.stringify(draftData));
    localStorage.setItem(`workPerformed-${id}`, workPerformed);
    localStorage.setItem(`findings-${id}`, findings);
    localStorage.setItem(`findingChips-${id}`, JSON.stringify(selectedFindingChips));
    
    toast({
      title: "Draft saved successfully",
      description: "Your progress has been saved. You can leave and return later.",
    });
  };

  // Validate invoice number format
  const validateInvoiceNumber = (value: string): boolean => {
    if (!value.trim()) {
      setInvoiceError("Invoice number is required");
      return false;
    }
    if (!value.trim().toUpperCase().startsWith("INV-")) {
      setInvoiceError("Invoice number must start with 'INV-'");
      return false;
    }
    setInvoiceError("");
    return true;
  };

  const handleSubmit = async () => {
    // Validate checklist
    if (!checklist.every((item) => item.checked)) {
      toast({
        title: "Pre-work checklist incomplete",
        description: "Please complete all checklist items before submitting",
        variant: "destructive",
      });
      return;
    }

    // Validate work performed
    if (!workPerformed.trim()) {
      toast({
        title: "Work description required",
        description: "Please describe the work performed before submitting",
        variant: "destructive",
      });
      return;
    }

    // Validate signature and customer name
    if (!signature || !customerName.trim()) {
      toast({
        title: "Customer sign-off required",
        description: "Please obtain customer name and signature before submitting",
        variant: "destructive",
      });
      return;
    }

    // Show completion details section if not already shown
    if (!showCompletionDetails) {
      setShowCompletionDetails(true);
      toast({
        title: "Complete final details",
        description: "Please enter invoice number to complete job",
      });
      return;
    }

    // Validate invoice number
    if (!validateInvoiceNumber(invoiceNumber)) {
      toast({
        title: "Please enter invoice number to complete job",
        description: "Invoice number is required and must start with 'INV-'",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Load photos from localStorage
      const storedPhotos = localStorage.getItem(`job_photos_${id}`);
      const photos = storedPhotos ? JSON.parse(storedPhotos) : [];

      // Generate PDF report
      toast({
        title: "Generating report...",
        description: "Creating PDF document",
      });

      const pdfBlob = await generateJobPdf({
        jobNumber: jobData?.jobNumber || id || "",
        siteName: jobData?.siteName || "Unknown Site",
        address: jobData?.address || "",
        technician: jobData?.technician || "Unassigned",
        scheduledDate: jobData?.scheduledDate
          ? new Date(jobData.scheduledDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
        completionDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        duration: "N/A",
        jobType: selectedJobType || jobData?.jobType || "",
        inverterModel: jobData?.inverterModel || "Not specified",
        serialNumber: jobData?.serialNumber || "Not specified",
        checklist: checklist.map((item) => ({
          id: item.id,
          label: item.label,
          checked: item.checked,
        })),
        workPerformed,
        findings,
        partsUsed: partsUsed
          .filter((p) => p.partName && p.quantity > 0)
          .map((p) => ({
            partName: p.partName,
            quantity: p.quantity,
            serialNumber: p.serialNumber,
          })),
        photos: photos.map((p: { dataUrl: string; category: string; caption: string }) => ({
          dataUrl: p.dataUrl,
          category: p.category,
          caption: p.caption,
        })),
        customerSignature: signature,
        customerName,
        signOffTimestamp: signatureTimestamp
          ? new Date(signatureTimestamp).toLocaleString("en-GB")
          : new Date().toLocaleString("en-GB"),
      });

      // Upload PDF to storage
      toast({
        title: "Uploading report...",
        description: "Saving PDF to storage",
      });

      const pdfUrl = await uploadPdfToStorage(pdfBlob, jobData?.jobNumber || id || "unknown");

      // Auto-check report complete after PDF generation
      setReportComplete(true);

      // Collect all job sheet data
      const jobSheetData = {
        job_id: id,
        checklist: checklist,
        checklistCompletedAt,
        workPerformed,
        findings,
        findingChips: selectedFindingChips,
        partsUsed,
        customerName,
        signature,
        signatureTimestamp,
        jobType: selectedJobType,
        submittedAt: new Date().toISOString(),
        reportUrl: pdfUrl,
      };

      // Update job status to "Complete" in database
      const updateData: {
        status: string;
        completion_date: string;
        notes: string;
        report_link?: string;
        invoice_number?: string;
      } = {
        status: "complete",
        completion_date: new Date().toISOString(),
        notes: JSON.stringify(jobSheetData),
        invoice_number: invoiceNumber.trim(),
      };

      if (pdfUrl) {
        updateData.report_link = pdfUrl;
      }

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating job:", error);
        throw error;
      }

      // Clear localStorage draft data after successful submission
      localStorage.removeItem(`jobDraft-${id}`);
      localStorage.removeItem(`workPerformed-${id}`);
      localStorage.removeItem(`findings-${id}`);
      localStorage.removeItem(`findingChips-${id}`);
      localStorage.removeItem(`checklist-${id}`);
      localStorage.removeItem(`job_photos_${id}`);

      toast({
        title: "Job sheet submitted successfully!",
        description: pdfUrl 
          ? "PDF report generated and saved." 
          : "The job has been marked as complete.",
      });

      // Redirect to jobs list after 2 seconds
      setTimeout(() => navigate("/jobs"), 2000);
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting the job sheet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = calculateProgress();

  // Show loading only if no fallback available
  if (isLoading && !fallbackJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading job data...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="max-w-[640px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => navigate("/jobs")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg leading-tight">{jobData.siteName}</h1>
              <p className="text-sm text-muted-foreground">{jobData.jobNumber}</p>
            </div>
            <Badge className="bg-info text-info-foreground">Mobile</Badge>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        {/* Site Info Section */}
        <Collapsible open={openSections.siteInfo} onOpenChange={() => toggleSection("siteInfo")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Site Information</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.siteInfo ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Site Name */}
                <div>
                  <h2 className="text-xl font-bold text-foreground">{jobData.siteName}</h2>
                </div>

                {/* Address with Copy Button */}
                <div>
                  <Label className="text-muted-foreground text-base">Full Address</Label>
                  <div className="flex items-start gap-2 mt-1">
                    <p className="font-medium text-base flex-1">{jobData.address}</p>
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-[44px] min-w-[44px] shrink-0"
                      onClick={() => copyToClipboard(jobData.address)}
                    >
                      {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Access Codes - Highlighted in Yellow */}
                <div>
                  <Label className="text-muted-foreground text-base">Access Codes / Instructions</Label>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-700 p-3 rounded-md mt-1">
                    <p className="font-mono text-base font-semibold text-yellow-900 dark:text-yellow-100">
                      {jobData.accessInfo}
                    </p>
                  </div>
                </div>

                {/* Customer Contact - Click to Call */}
                {jobData.contactPhone && (
                  <div>
                    <Label className="text-muted-foreground text-base">Customer Contact</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-base">{jobData.contactName}</p>
                        <a
                          href={`tel:${jobData.contactPhone}`}
                          className="text-primary text-lg font-semibold hover:underline"
                        >
                          {jobData.contactPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Technician */}
                <div>
                  <Label className="text-muted-foreground text-base">Assigned Technician</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-base">{jobData.technician}</p>
                  </div>
                </div>

                {/* Equipment Details */}
                <div className="bg-muted/50 p-3 rounded-md">
                  <Label className="text-muted-foreground text-base flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Equipment Details
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Inverter Model</p>
                      <p className="font-semibold text-base">{jobData.inverterModel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <button
                        onClick={() => setIsHistorySidebarOpen(true)}
                        className="flex items-center gap-2 font-mono text-base font-medium text-blue-600 underline cursor-pointer hover:text-blue-700 transition-colors min-h-[44px]"
                      >
                        {jobData.serialNumber}
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job Type Dropdown */}
                <div>
                  <Label className="text-base">Job Type</Label>
                  <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                    <SelectTrigger className="min-h-[44px] text-base mt-1">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine Maintenance">Routine Maintenance</SelectItem>
                      <SelectItem value="Fault Repair">Fault Repair</SelectItem>
                      <SelectItem value="Installation">Installation</SelectItem>
                      <SelectItem value="Inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Address - Multi-line read-only */}
                <div className="space-y-1 border-b border-gray-200 pb-3">
                  <Label className="text-muted-foreground font-medium text-base mb-1">Full Address</Label>
                  <div className="flex items-start gap-2">
                    <Textarea
                      value={placeholderData.fullAddress}
                      readOnly
                      className="min-h-[80px] text-base bg-muted/50 resize-none"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-[44px] min-w-[44px] shrink-0"
                      onClick={() => copyToClipboard(placeholderData.fullAddress)}
                    >
                      {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* What3Words Location */}
                <div className="space-y-1 border-b border-gray-200 pb-3">
                  <Label className="text-muted-foreground font-medium text-base mb-1">What3Words Location</Label>
                  <a
                    href={`https://what3words.com/${placeholderData.what3words}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-h-[44px] text-blue-600 font-mono text-lg hover:underline transition-colors"
                  >
                    ///{placeholderData.what3words}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {/* Site Access Codes */}
                <div className="space-y-1 border-b border-gray-200 pb-3">
                  <Label className="text-muted-foreground font-medium text-base mb-1 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Site Access Codes
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={showAccessCode ? placeholderData.accessCode : "••••••••"}
                      readOnly
                      className={`flex-1 min-h-[44px] text-base font-mono ${
                        showAccessCode 
                          ? "bg-yellow-100 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-700" 
                          : "bg-muted/50"
                      }`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="min-h-[44px] min-w-[44px] shrink-0"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      title={showAccessCode ? "Hide access code" : "Show access code"}
                    >
                      {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Confidential - Gate codes and access information</p>
                </div>

                {/* Get Directions to Site */}
                <div className="space-y-2 border-b border-gray-200 pb-3">
                  <Label className="text-muted-foreground font-medium text-base mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Site Location
                  </Label>
                  <button
                    onClick={() => {
                      const addressQuery = encodeURIComponent(placeholderData.fullAddress);
                      window.open(`https://maps.google.com/?q=${addressQuery}`, '_blank');
                    }}
                    className="w-full flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors min-h-[44px] dark:bg-blue-950/30 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-blue-700 dark:text-blue-400">{jobData.siteName}</p>
                        <p className="text-sm text-blue-600/80 dark:text-blue-400/70">
                          {isLoadingDistance ? "Calculating distance..." : distanceToSite}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </button>
                  <p className="text-xs text-muted-foreground">Tap to open directions in Google Maps</p>
                </div>

                {/* Site Documentation Section - Hidden until database connection */}


                {/* Scheduled Date and Time */}
                {jobData.scheduledDate && (
                  <div>
                    <Label className="text-muted-foreground text-base">Scheduled Date & Time</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium text-base">
                        {new Date(jobData.scheduledDate).toLocaleDateString("en-GB", {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {jobData.scheduledTime && ` • ${jobData.scheduledTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Work Summary */}
                <div>
                  <Label className="text-muted-foreground text-base">Work Summary</Label>
                  <p className="mt-1 text-base leading-relaxed">{jobData.workDescription}</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Site Contacts Section */}
        <Collapsible open={isContactsOpen} onOpenChange={setIsContactsOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Site Contacts</span>
                    <Badge variant="secondary" className="text-xs">
                      {placeholderData.siteContacts.length}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isContactsOpen ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 pt-0">
                {placeholderData.siteContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-base">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, '')}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 transition-colors min-h-[44px] font-medium"
                      >
                        <Phone className="h-4 w-4" />
                        {contact.phoneDisplay || contact.phone}
                      </a>
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors min-h-[44px] font-medium"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Booking Information Section */}
        <Collapsible open={openSections.booking} onOpenChange={() => toggleSection("booking")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <span>Booking Information</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openSections.booking ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Team Members */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-foreground">Team Members</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg min-h-[48px]">
                    <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-base font-medium">{jobData?.technician || "Unassigned"}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">Assigned</Badge>
                  </div>
                </div>

                {/* Scheduled Date */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="scheduled-date" className="text-base font-semibold text-foreground">
                      Scheduled Date
                    </Label>
                    <span className="text-destructive">*</span>
                  </div>
                  <div className="space-y-1">
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={getTodayDate()}
                      required
                      className="min-h-[48px] text-base"
                    />
                    {scheduledDate && (
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatScheduledDate(scheduledDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quote Number */}
                <div className="space-y-2">
                  <Label htmlFor="quote-number" className="text-base font-semibold text-foreground">
                    Quote Number
                  </Label>
                  <Input
                    id="quote-number"
                    placeholder="Enter quote number (e.g., QUOTE-1234)"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="min-h-[48px] text-base"
                  />
                </div>

                {/* Purchase Order Number */}
                <div className="space-y-2">
                  <Label htmlFor="po-number" className="text-base font-semibold text-foreground">
                    Purchase Order Number
                  </Label>
                  <Input
                    id="po-number"
                    placeholder="Enter PO number (optional)"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="min-h-[48px] text-base"
                  />
                </div>

                {/* RAMS Completed Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-base font-semibold text-foreground">
                      Risk Assessment & Method Statement
                    </Label>
                    <span className="text-destructive">*</span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg border-2 min-h-[56px] transition-all ${
                      ramsCompleted
                        ? "bg-green-50 border-green-500 dark:bg-green-950/30 dark:border-green-600"
                        : "bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {!ramsCompleted && <span className="text-xl">⚠️</span>}
                      {ramsCompleted && <Check className="h-6 w-6 text-green-600" />}
                      <span className={`font-medium ${ramsCompleted ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}`}>
                        {ramsCompleted ? "RAMS Completed" : "RAMS Required"}
                      </span>
                    </div>
                    <Switch
                      checked={ramsCompleted}
                      onCheckedChange={handleRamsToggle}
                      className="data-[state=checked]:bg-green-600 scale-125"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete RAMS before starting the pre-work checklist
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* RAMS Warning Banner */}
        {!ramsCompleted && (
          <div className="flex items-center gap-3 p-4 bg-orange-100 border-2 border-orange-300 rounded-lg dark:bg-orange-950/30 dark:border-orange-600 animate-fade-in">
            <span className="text-xl">⚠️</span>
            <span className="font-medium text-orange-700 dark:text-orange-400">
              Complete RAMS before starting checklist
            </span>
          </div>
        )}

        {/* Pre-Work Checklist Section */}
        <Collapsible open={openSections.preWork} onOpenChange={() => ramsCompleted && toggleSection("preWork")}>
          <Card className={`transition-opacity ${!ramsCompleted ? "opacity-50" : ""} ${checklist.every((i) => i.checked) ? "border-success" : ramsCompleted ? "border-warning" : "border-muted"}`}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className={`h-5 w-5 ${ramsCompleted ? "text-primary" : "text-muted-foreground"}`} />
                    <span>Pre-Work Checklist</span>
                    {!ramsCompleted && (
                      <Badge variant="secondary" className="text-xs">Locked</Badge>
                    )}
                    {ramsCompleted && checklist.every((i) => i.checked) && (
                      <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.preWork ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {!ramsCompleted && (
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Checklist Locked</p>
                    <p className="text-sm">Complete RAMS in Booking Information to unlock</p>
                  </div>
                )}
                
                {ramsCompleted && checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      item.checked 
                        ? "bg-success/10 border-success" 
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleChecklistChange(item.id)}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => handleChecklistChange(item.id)}
                      className="h-8 w-8 rounded-md border-2 data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <Label 
                      htmlFor={item.id} 
                      className={`flex-1 cursor-pointer text-base font-medium ${
                        item.checked ? "text-success" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </Label>
                    {item.checked && <Check className="h-5 w-5 text-success" />}
                  </div>
                ))}
                
                {/* Completion Timestamp */}
                {checklistCompletedAt && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-success">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Completed at {new Date(checklistCompletedAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} on {new Date(checklistCompletedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                
                {!checklist.every((i) => i.checked) && (
                  <p className="text-sm text-warning bg-warning/10 p-3 rounded-lg">
                    ⚠️ All items must be checked before submitting
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Work Details Section */}
        <Collapsible
          open={openSections.workDetails}
          onOpenChange={() => toggleSection("workDetails")}
        >
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span>Work Details & Notes</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.workDetails ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Work Performed Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="work-performed" className="text-base font-semibold">
                      Work Performed
                    </Label>
                  </div>
                  <Textarea
                    id="work-performed"
                    placeholder="Describe the work completed, steps taken, and time spent..."
                    value={workPerformed}
                    onChange={(e) => {
                      if (e.target.value.length <= WORK_PERFORMED_MAX_CHARS) {
                        setWorkPerformed(e.target.value);
                      }
                    }}
                    className="min-h-[180px] text-base"
                    rows={6}
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Auto-saves every 30 seconds
                    </span>
                    <span className={`font-medium ${
                      workPerformed.length > WORK_PERFORMED_MAX_CHARS * 0.9 
                        ? "text-warning" 
                        : "text-muted-foreground"
                    }`}>
                      {workPerformed.length} / {WORK_PERFORMED_MAX_CHARS}
                    </span>
                  </div>
                </div>

                {/* Issue Reported / Error Code Section */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Issue Reported / Error Code
                  </Label>
                  
                  {isCustomIssue ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe the custom issue..."
                        value={customIssueText}
                        onChange={(e) => setCustomIssueText(e.target.value)}
                        className="min-h-[100px] text-base"
                        rows={3}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => {
                          setIsCustomIssue(false);
                          setCustomIssueText("");
                        }}
                      >
                        ← Back to Error Codes
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Selected Error Display */}
                      {selectedErrorCode && !isErrorDropdownOpen && (
                        <div 
                          className="flex items-center justify-between p-3 bg-muted/50 border-2 border-primary/30 rounded-lg mb-2 cursor-pointer min-h-[48px]"
                          onClick={() => setIsErrorDropdownOpen(true)}
                        >
                          <div className="flex-1">
                            <span className="font-bold">{errorCodes.find(e => e.code === selectedErrorCode)?.code}</span>
                            <span className="text-muted-foreground"> - {errorCodes.find(e => e.code === selectedErrorCode)?.description}</span>
                          </div>
                          <Badge className={getSeverityBadgeClass(errorCodes.find(e => e.code === selectedErrorCode)?.severity || "Low")}>
                            {errorCodes.find(e => e.code === selectedErrorCode)?.severity}
                          </Badge>
                        </div>
                      )}

                      {/* Search Input */}
                      <div 
                        className="relative"
                        onClick={() => setIsErrorDropdownOpen(true)}
                      >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Search or select error code..."
                          value={errorCodeSearch}
                          onChange={(e) => {
                            setErrorCodeSearch(e.target.value);
                            setIsErrorDropdownOpen(true);
                          }}
                          onFocus={() => setIsErrorDropdownOpen(true)}
                          className="pl-10 min-h-[48px] text-base"
                        />
                      </div>

                      {/* Dropdown */}
                      {isErrorDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-card border-2 border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                          {filteredErrorCodes.map((ec) => (
                            <button
                              key={ec.code}
                              type="button"
                              onClick={() => handleSelectErrorCode(ec.code)}
                              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left min-h-[48px] border-b border-border last:border-b-0"
                            >
                              <div className="flex-1">
                                <span className="font-bold">{ec.code}</span>
                                <span className="text-muted-foreground"> - {ec.description}</span>
                              </div>
                              <Badge className={`ml-2 ${getSeverityBadgeClass(ec.severity)}`}>
                                {ec.severity}
                              </Badge>
                            </button>
                          ))}

                          {filteredErrorCodes.length === 0 && (
                            <div className="p-3 text-center text-muted-foreground">
                              No matching error codes found
                            </div>
                          )}

                          {/* Custom Issue Option */}
                          <button
                            type="button"
                            onClick={handleCustomIssue}
                            className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors text-left min-h-[48px] border-t-2 border-primary/20 text-primary font-medium"
                          >
                            <Plus className="h-5 w-5" />
                            Report Custom Issue
                          </button>
                        </div>
                      )}

                      {/* Click outside to close */}
                      {isErrorDropdownOpen && (
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsErrorDropdownOpen(false)}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Attach Customer Report Section */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Customer Report Attachments
                  </Label>

                  {/* Attachments List */}
                  {reportAttachments.length > 0 && (
                    <div className="space-y-2">
                      {reportAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {attachment.dataUrl.startsWith("data:image") ? (
                              <img
                                src={attachment.dataUrl}
                                alt={attachment.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {reportAttachments.length < 3 && (
                    <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors min-h-[48px]">
                      <FileUp className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">
                        + Attach Customer Report
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={handleAttachReport}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, or PNG • Max 10MB per file • Up to 3 attachments
                  </p>
                </div>

                {/* Additional Notes Section */}
                <div className="space-y-3">
                  <Label htmlFor="findings" className="text-base font-semibold">
                    Additional Notes
                  </Label>
                  
                  {/* Quick-select chips */}
                  <div className="flex flex-wrap gap-2">
                    {findingChips.map((chip) => (
                      <Button
                        key={chip}
                        type="button"
                        variant={selectedFindingChips.includes(chip) ? "default" : "outline"}
                        size="sm"
                        className={`min-h-[40px] transition-all ${
                          selectedFindingChips.includes(chip)
                            ? chip === "No Issues"
                              ? "bg-success hover:bg-success/90 text-success-foreground"
                              : chip === "Minor Fault"
                              ? "bg-warning hover:bg-warning/90 text-warning-foreground"
                              : chip === "Major Fault"
                              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              : "bg-info hover:bg-info/90 text-info-foreground"
                            : ""
                        }`}
                        onClick={() => toggleFindingChip(chip)}
                      >
                        {chip}
                      </Button>
                    ))}
                  </div>
                  
                  <Textarea
                    id="findings"
                    placeholder="Additional notes, recommendations, or observations..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="min-h-[100px] text-base"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">Auto-saves on change</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Photos Section */}
        <PhotoUploadSection
          jobId={id || ""}
          isOpen={openSections.photos}
          onToggle={() => toggleSection("photos")}
        />

        {/* Parts Used Section */}
        <Collapsible open={openSections.parts} onOpenChange={() => toggleSection("parts")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span>Parts Used</span>
                    {partsUsed.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {getValidPartsCount()}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.parts ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Quick Add Common Parts Button */}
                <Button
                  onClick={() => setShowQuickAddModal(true)}
                  variant="outline"
                  className="w-full min-h-[48px] text-base border-dashed border-primary/50 text-primary hover:bg-primary/5"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Add Common Parts
                </Button>

                {partsUsed.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No parts added yet
                  </p>
                ) : (
                  partsUsed.map((part, index) => (
                    <div 
                      key={part.id} 
                      className="p-4 border rounded-lg space-y-3 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Part #{index + 1}
                          </span>
                          {part.partNumber && (
                            <Badge variant="outline" className="text-xs">
                              {part.partNumber}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 text-destructive hover:bg-destructive/10"
                          onClick={() => removePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Part Name with Autocomplete */}
                      <div className="relative">
                        <Label className="text-sm">Part Name / Description *</Label>
                        <Input
                          placeholder="Type to search parts (min 2 chars)..."
                          value={partSearchQueries[part.id] ?? part.partName}
                          onChange={(e) => {
                            handlePartSearch(part.id, e.target.value);
                            if (e.target.value.length < 2) {
                              updatePart(part.id, "partName", e.target.value);
                            }
                          }}
                          onFocus={() => {
                            if ((partSearchQueries[part.id] || part.partName).length >= 2) {
                              setActivePartDropdown(part.id);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown
                            setTimeout(() => setActivePartDropdown(null), 200);
                          }}
                          className="mt-1 min-h-[48px] text-base"
                        />
                        
                        {/* Autocomplete Dropdown */}
                        {activePartDropdown === part.id && (
                          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
                            {isSearchingParts ? (
                              <div className="flex items-center justify-center p-4 text-muted-foreground">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Searching...
                              </div>
                            ) : getFilteredParts(partSearchQueries[part.id] || "").length > 0 ? (
                              getFilteredParts(partSearchQueries[part.id] || "").map((invPart) => (
                                <button
                                  key={invPart.partNumber}
                                  type="button"
                                  className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 flex items-center justify-between"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectPart(part.id, invPart);
                                  }}
                                >
                                  <div>
                                    <p className="font-semibold text-base">{invPart.name}</p>
                                    <p className="text-sm text-muted-foreground">{invPart.partNumber}</p>
                                  </div>
                                  <div className={`text-sm font-medium px-2 py-1 rounded ${getStockBgColor(invPart.stock)} ${getStockColor(invPart.stock)}`}>
                                    Stock: {invPart.stock}
                                  </div>
                                </button>
                              ))
                            ) : (partSearchQueries[part.id] || "").length >= 2 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No parts found
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Stock Warning */}
                      {part.stockWarning && (
                        <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-600 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                              Only {part.stock} in stock. Requested: {part.quantity}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
                            onClick={() => updatePart(part.id, "stockWarning", false)}
                          >
                            Proceed (Backorder)
                          </Button>
                        </div>
                      )}
                      
                      {/* Quantity with +/- buttons */}
                      <div>
                        <Label className="text-sm">Quantity *</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="min-h-[48px] min-w-[48px]"
                            onClick={() => decrementQuantity(part.id)}
                            disabled={part.quantity <= 1}
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                          <Input
                            type="number"
                            value={part.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0) {
                                updatePart(part.id, "quantity", val);
                                checkStockWarning(part.id, val);
                              }
                            }}
                            className="w-20 min-h-[48px] text-center text-lg font-semibold"
                            min="1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="min-h-[48px] min-w-[48px]"
                            onClick={() => incrementQuantity(part.id)}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                          {part.stock > 0 && (
                            <span className={`text-sm ${getStockColor(part.stock)}`}>
                              ({part.stock} available)
                            </span>
                          )}
                        </div>
                        {part.quantity < 1 && (
                          <p className="text-destructive text-xs mt-1">Quantity must be greater than 0</p>
                        )}
                      </div>
                      
                      {/* Serial Number (optional) */}
                      <div>
                        <Label className="text-sm">Serial Number (optional)</Label>
                        <Input
                          placeholder="Enter serial number if applicable"
                          value={part.serialNumber}
                          onChange={(e) => updatePart(part.id, "serialNumber", e.target.value)}
                          className="mt-1 min-h-[48px] text-base"
                        />
                      </div>
                    </div>
                  ))
                )}
                <Button
                  onClick={addPart}
                  variant="outline"
                  className="w-full min-h-[48px] text-base"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Part
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Quick Add Common Parts Modal */}
        {showQuickAddModal && (
          <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/50"
            onClick={() => {
              setQuickAddSelections({});
              setShowQuickAddModal(false);
            }}
          >
            <Card 
              className="w-full max-w-md max-h-[70vh] flex flex-col animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <CardHeader className="flex-shrink-0 border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Common Parts for this Site
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setQuickAddSelections({});
                      setShowQuickAddModal(false);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              {/* Scrollable Parts List */}
              <CardContent className="flex-1 overflow-y-auto space-y-3 py-4">
                {commonParts.map((cp) => {
                  const invPart = inventoryParts.find((ip) => ip.partNumber === cp.partNumber);
                  return (
                    <label
                      key={cp.partNumber}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 min-h-[56px]"
                    >
                      <Checkbox
                        checked={quickAddSelections[cp.partNumber] || false}
                        onCheckedChange={(checked) =>
                          setQuickAddSelections((prev) => ({
                            ...prev,
                            [cp.partNumber]: !!checked,
                          }))
                        }
                        className="h-6 w-6"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{cp.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Typical qty: {cp.typicalQty} • Stock: {invPart?.stock ?? 0}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </CardContent>
              
              {/* Sticky Footer */}
              <div className="flex-shrink-0 p-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[48px]"
                  onClick={() => {
                    setQuickAddSelections({});
                    setShowQuickAddModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 min-h-[48px]"
                  onClick={handleQuickAddParts}
                  disabled={Object.values(quickAddSelections).filter(Boolean).length === 0}
                >
                  Add Selected ({Object.values(quickAddSelections).filter(Boolean).length})
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Customer Sign-Off Section */}
        <Collapsible open={openSections.signOff} onOpenChange={() => toggleSection("signOff")}>
          <Card className={signature && customerName.trim() ? "border-success" : ""}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="min-h-[44px]">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-primary" />
                    <span>Customer Sign-Off</span>
                    {signature && customerName.trim() && (
                      <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openSections.signOff ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Customer Name - Required */}
                <div>
                  <Label htmlFor="customer-name" className="text-base font-semibold flex items-center gap-1">
                    Customer Name
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="Enter customer's full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-2 min-h-[48px] text-base"
                    required
                  />
                  {!customerName.trim() && (
                    <p className="text-xs text-muted-foreground mt-1">Required for job completion</p>
                  )}
                </div>

                {/* Signature Pad */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-1">
                    Customer Signature
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-2">
                    <SignaturePad
                      onSignatureChange={(sig, timestamp) => {
                        setSignature(sig);
                        setSignatureTimestamp(timestamp);
                      }}
                      signature={signature}
                      signatureTimestamp={signatureTimestamp}
                    />
                  </div>
                </div>

                {/* Completion Status */}
                {signature && customerName.trim() && (
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-success" />
                      <span className="font-medium text-success">
                        Sign-off complete - Ready to submit
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        {/* Completion Details Section - Only visible when triggered */}
        {showCompletionDetails && (
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Completion Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Complete Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <Checkbox
                  id="report-complete"
                  checked={reportComplete}
                  onCheckedChange={(checked) => setReportComplete(!!checked)}
                  className="h-6 w-6 min-h-[44px] min-w-[44px] border-2"
                  disabled={reportComplete}
                />
                <Label 
                  htmlFor="report-complete" 
                  className="text-base font-medium cursor-pointer flex-1"
                >
                  Final report generated and approved
                </Label>
                {reportComplete && (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <Label htmlFor="invoice-number" className="text-base font-semibold flex items-center gap-1">
                  Invoice Number
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoice-number"
                  placeholder="Enter invoice number (e.g., INV-1234)"
                  value={invoiceNumber}
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value);
                    if (invoiceError) validateInvoiceNumber(e.target.value);
                  }}
                  className={`min-h-[48px] text-lg ${invoiceError ? 'border-destructive ring-1 ring-destructive' : ''}`}
                  required
                />
                {invoiceError && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {invoiceError}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
        <div className="max-w-[640px] mx-auto px-4 py-3 flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 min-h-[44px]"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            size="lg"
            className="flex-1 min-h-[44px] bg-success hover:bg-success/90 text-success-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting || !ramsCompleted || !checklist.every((i) => i.checked) || !signature || !customerName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Job Sheet
              </>
            )}
          </Button>
        </div>
      </footer>

      {/* Equipment History Sidebar */}
      <EquipmentHistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
        serialNumber={jobData.serialNumber}
        history={equipmentHistory}
      />
    </div>
  );
};

export default MobileJobView;
