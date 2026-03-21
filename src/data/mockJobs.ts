export type JobStatus = "Logged Fault" | "Quote Sent" | "Approved" | "Scheduled" | "Completed" | "Invoiced";
export type RAMSStatus = "Approved" | "Pending" | "Not Required";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type ContractType = "Contract/SLA" | "Chargeable";
export type InverterProduction = "Yes" | "No" | "Yes Reduced Production";

export interface Job {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  siteName: string;
  siteId: string;
  address: string;
  inverterLocation: string;
  contractType: ContractType;
  inverterType: string;
  inverterModel: string;
  serialNumber: string;
  inverterInProduction: InverterProduction;
  faultCode: string;
  reportedFault: string;
  priority: Priority;
  status: JobStatus;
  ramsStatus: RAMSStatus;
  quoteNumber: string;
  quoteDate: string;
  poNumber: string;
  poReceived: boolean;
  scheduledDate: string;
  engineer: string;
  accessCode: string;
  distance: number;
  ramsSent: boolean;
  jobNotes: string;
  markComplete: boolean;
  invoiceNumber: string;
  reportLink: string;
}

// Engineers - these should be fetched from Supabase users table
export const engineers = [
  { id: "1", name: "Terry" },
  { id: "2", name: "Jason" },
  { id: "3", name: "Chris" },
  { id: "4", name: "Dave" },
];

// Fault codes - fetched from Supabase fault_codes table
export const faultCodesByBrand: Record<string, { code: string; label: string; severity: string }[]> = {
  "Solis": [
    { code: "OV-G-V", label: "Grid Overvoltage", severity: "High" },
    { code: "IGBT-OV", label: "IGBT Overcurrent", severity: "Critical" },
    { code: "UN-G-V", label: "Grid Undervoltage", severity: "Medium" },
  ],
  "Growatt": [
    { code: "Error 122", label: "Bus Overvoltage", severity: "High" },
    { code: "Error 117", label: "Relay Fault", severity: "Critical" },
  ],
};

// Sites - these should be fetched from Supabase using useSites hook
export const mockSites = [
  { id: "s1", site_name: "Amazon LHR16", address: "Tilbury RM18 7AN" },
  { id: "s2", site_name: "Tesco Distribution", address: "Reading RG2 0UR" },
  { id: "s3", site_name: "DHL Express", address: "Slough SL3 0BB" },
];

// Equipment - these should be fetched from Supabase using useSiteEquipment hook
export const mockEquipmentBySite: Record<string, { location: string; type: string; model: string; serial: string; brand: string }[]> = {
  "s1": [{ location: "Roof Section A", type: "Inverter", model: "Solis 110K", serial: "SOL123456", brand: "Solis" }],
  "s2": [{ location: "Main Plant Room", type: "Inverter", model: "Growatt MAX 80K", serial: "GW987654", brand: "Growatt" }],
};

// Jobs - these should be fetched from Supabase using useJobs hook
export const initialJobs: Job[] = [
  {
    id: "LT-8821",
    contactName: "John Smith",
    contactPhone: "07123456789",
    contactEmail: "john@example.com",
    siteName: "Appleby Solar Farm",
    siteId: "SITE-001",
    address: "Appleby, CA16 6LN",
    inverterLocation: "Inverter Station 1",
    contractType: "Contract/SLA",
    inverterType: "String",
    inverterModel: "SMA Sunny Highpower",
    serialNumber: "SMA-9921-X",
    inverterInProduction: "Yes",
    faultCode: "F012",
    reportedFault: "Ground fault detected after heavy rain.",
    priority: "HIGH",
    status: "Logged Fault",
    ramsStatus: "Pending",
    quoteNumber: "",
    quoteDate: "",
    poNumber: "",
    poReceived: false,
    scheduledDate: "",
    engineer: "",
    accessCode: "1234",
    distance: 45,
    ramsSent: false,
    jobNotes: "",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8822",
    contactName: "Sarah Jones",
    contactPhone: "07888123456",
    contactEmail: "sarah@solar.com",
    siteName: "Burton PV Plant",
    siteId: "SITE-002",
    address: "Burton-on-Trent, DE14",
    inverterLocation: "Main LV Room",
    contractType: "Chargeable",
    inverterType: "Central",
    inverterModel: "Schneider Conext Core XC",
    serialNumber: "SN-SCH-112",
    inverterInProduction: "No",
    faultCode: "Overheating",
    reportedFault: "Inverter tripping on high temperature during peak sun.",
    priority: "MEDIUM",
    status: "Quote Sent",
    ramsStatus: "Approved",
    quoteNumber: "Q-2024-001",
    quoteDate: "2024-03-20",
    poNumber: "",
    poReceived: false,
    scheduledDate: "",
    engineer: "Terry Morris",
    accessCode: "GATE-99",
    distance: 12,
    ramsSent: true,
    jobNotes: "",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8823",
    contactName: "Mike Ross",
    contactPhone: "07555666777",
    contactEmail: "mike@ross.com",
    siteName: "Coventry Rooftop",
    siteId: "SITE-003",
    address: "Coventry, CV1",
    inverterLocation: "Roof Plant Room",
    contractType: "Contract/SLA",
    inverterType: "String",
    inverterModel: "SolarEdge SE100K",
    serialNumber: "SE-881-A",
    inverterInProduction: "Yes Reduced Production",
    faultCode: "Optimiser Isolation",
    reportedFault: "Multiple optimiser errors on string 4.",
    priority: "LOW",
    status: "Scheduled",
    ramsStatus: "Approved",
    quoteNumber: "",
    quoteDate: "",
    poNumber: "PO-CV-123",
    poReceived: true,
    scheduledDate: "2026-03-21", 
    engineer: "Jason",
    accessCode: "NONE",
    distance: 85,
    ramsSent: true,
    jobNotes: "Need 12m ladder for roof access.",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8824",
    contactName: "Amy Pond",
    contactPhone: "07999000111",
    contactEmail: "amy@tardis.com",
    siteName: "Leadworth Solar Park",
    siteId: "SITE-004",
    address: "Leadworth, UK",
    inverterLocation: "Shed 4",
    contractType: "Contract/SLA",
    inverterType: "Central",
    inverterModel: "ABB PVS800",
    serialNumber: "ABB-119-Z",
    inverterInProduction: "No",
    faultCode: "Grid Loss",
    reportedFault: "Total grid disconnection at site.",
    priority: "HIGH",
    status: "Approved",
    ramsStatus: "Approved",
    quoteNumber: "Q-2024-999",
    quoteDate: "2024-03-15",
    poNumber: "PO-LEAD-001",
    poReceived: true,
    scheduledDate: "",
    engineer: "",
    accessCode: "CODE-1",
    distance: 120,
    ramsSent: false,
    jobNotes: "Critical site.",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8825",
    contactName: "Rory Williams",
    contactPhone: "07222333444",
    contactEmail: "rory@hospital.com",
    siteName: "Gloucester Gen",
    siteId: "SITE-005",
    address: "Gloucester, GL1",
    inverterLocation: "LV Room",
    contractType: "Chargeable",
    inverterType: "String",
    inverterModel: "Fronius Symo",
    serialNumber: "FR-SY-991",
    inverterInProduction: "Yes",
    faultCode: "None",
    reportedFault: "Annual inspection and cleaning.",
    priority: "LOW",
    status: "Completed",
    ramsStatus: "Approved",
    quoteNumber: "Q-GL-11",
    quoteDate: "2024-02-01",
    poNumber: "PO-GL-22",
    poReceived: true,
    scheduledDate: "2026-03-19",
    engineer: "Terry Morris",
    accessCode: "OPEN",
    distance: 30,
    ramsSent: true,
    jobNotes: "All tests passed.",
    markComplete: true,
    invoiceNumber: "",
    reportLink: "http://example.com/report/1"
  },
  {
    id: "LT-8826",
    contactName: "Clara Oswald",
    contactPhone: "07444555666",
    contactEmail: "clara@impossible.com",
    siteName: "London South PV",
    siteId: "SITE-006",
    address: "London, SE1",
    inverterLocation: "Basement",
    contractType: "Contract/SLA",
    inverterType: "Central",
    inverterModel: "Gamesa 630kW TL+",
    serialNumber: "GM-630-X1",
    inverterInProduction: "Yes",
    faultCode: "None",
    reportedFault: "Inverter board replacement.",
    priority: "MEDIUM",
    status: "Invoiced",
    ramsStatus: "Approved",
    quoteNumber: "Q-LON-100",
    quoteDate: "2024-01-10",
    poNumber: "PO-LON-200",
    poReceived: true,
    scheduledDate: "2026-03-11",
    engineer: "Jason",
    accessCode: "VIP",
    distance: 10,
    ramsSent: true,
    jobNotes: "Job finalized.",
    markComplete: true,
    invoiceNumber: "INV-2024-001",
    reportLink: "http://example.com/report/2"
  },
  {
    id: "LT-8827",
    contactName: "Martha Jones",
    contactPhone: "07111222333",
    contactEmail: "martha@hospital.co.uk",
    siteName: "Oxford PV Array",
    siteId: "SITE-007",
    address: "Oxford, OX1",
    inverterLocation: "Roof Top",
    contractType: "Contract/SLA",
    inverterType: "String",
    inverterModel: "SMA SB5000TL",
    serialNumber: "SMA-OX-001",
    inverterInProduction: "No",
    faultCode: "Isolation Fault",
    reportedFault: "System tripping intermittently on isolation error.",
    priority: "HIGH",
    status: "Logged Fault",
    ramsStatus: "Pending",
    quoteNumber: "",
    quoteDate: "",
    poNumber: "",
    poReceived: false,
    scheduledDate: "",
    engineer: "",
    accessCode: "9988",
    distance: 40,
    ramsSent: false,
    jobNotes: "Requires roof access permit.",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8828",
    contactName: "Donna Noble",
    contactPhone: "07555444333",
    contactEmail: "donna@chiswick.com",
    siteName: "Chiswick Library",
    siteId: "SITE-008",
    address: "London, W4",
    inverterLocation: "Basement LV",
    contractType: "Chargeable",
    inverterType: "String",
    inverterModel: "Fronius Primo",
    serialNumber: "FP-8821",
    inverterInProduction: "Yes",
    faultCode: "None",
    reportedFault: "Display screen is faulty, needs replacement.",
    priority: "LOW",
    status: "Quote Sent",
    ramsStatus: "Approved",
    quoteNumber: "Q-CHIS-101",
    quoteDate: "2024-03-21",
    poNumber: "",
    poReceived: false,
    scheduledDate: "",
    engineer: "",
    accessCode: "NONE",
    distance: 5,
    ramsSent: true,
    jobNotes: "Visit during library opening hours.",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8829",
    contactName: "Wilfred Mott",
    contactPhone: "07222111000",
    contactEmail: "wilf@astronomy.com",
    siteName: "Observatory Site",
    siteId: "SITE-009",
    address: "Greenwich, SE10",
    inverterLocation: "Inverter Room 1",
    contractType: "Contract/SLA",
    inverterType: "String",
    inverterModel: "Sungrow SG110CX",
    serialNumber: "SG-990-X",
    inverterInProduction: "Yes Reduced Production",
    faultCode: "SPD Fault",
    reportedFault: "SPD indicator is red. Lightning strike suspected.",
    priority: "MEDIUM",
    status: "Approved",
    ramsStatus: "Approved",
    quoteNumber: "Q-GRW-55",
    quoteDate: "2024-03-18",
    poNumber: "PO-OBS-11",
    poReceived: true,
    scheduledDate: "",
    engineer: "",
    accessCode: "KEY-12",
    distance: 15,
    ramsSent: false,
    jobNotes: "Check all DC surge protection.",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  },
  {
    id: "LT-8830",
    contactName: "Rose Tyler",
    contactPhone: "07888777666",
    contactEmail: "rose@powell.com",
    siteName: "Powell Estate PV",
    siteId: "SITE-010",
    address: "London, SE17",
    inverterLocation: "Plant Room B",
    contractType: "Contract/SLA",
    inverterType: "String",
    inverterModel: "Solaredge SE17K",
    serialNumber: "SE-17-P",
    inverterInProduction: "No",
    faultCode: "DC Isolation",
    reportedFault: "Complete system shutdown.",
    priority: "HIGH",
    status: "Scheduled",
    ramsStatus: "Approved",
    quoteNumber: "Q-POW-22",
    quoteDate: "2024-03-20",
    poNumber: "PO-POW-33",
    poReceived: true,
    scheduledDate: "2026-03-22",
    engineer: "Terry Morris",
    accessCode: "CONCIERGE",
    distance: 8,
    ramsSent: true,
    jobNotes: "Urgent fix required.",
    markComplete: false,
    invoiceNumber: "",
    reportLink: ""
  }
];

export function calculatePriority(inverterInProduction: InverterProduction, contractType: ContractType): Priority {
  if (inverterInProduction === "No" && contractType === "Contract/SLA") return "HIGH";
  if (inverterInProduction === "No" && contractType === "Chargeable") return "MEDIUM";
  if (inverterInProduction === "Yes Reduced Production") return "MEDIUM";
  return "LOW";
}

export function calculateStatus(fields: {
  siteName: string;
  reportedFault: string;
  faultCode: string;
  quoteNumber: string;
  quoteDate: string;
  contractType: string;
  poReceived: boolean;
  scheduledDate: string;
  engineer: string;
  markComplete: boolean;
  invoiceNumber: string;
}): JobStatus {
  if (fields.invoiceNumber) return "Invoiced";
  if (fields.markComplete) return "Completed";
  if (fields.scheduledDate && fields.engineer) return "Scheduled";
  if (fields.poReceived || fields.contractType === "Contract/SLA") {
    if (fields.quoteNumber && fields.quoteDate) return "Approved";
    if (fields.contractType === "Contract/SLA") return "Approved";
  }
  if ((fields.quoteNumber && fields.quoteDate) || fields.contractType === "Contract/SLA") return "Quote Sent";
  return "Logged Fault";
}

export function getEngineerJobCount(engineerId: string, date: string, jobs: Job[]): number {
  const eng = engineers.find(e => e.id === engineerId);
  if (!eng) return 0;
  return jobs.filter(j => j.scheduledDate === date && j.engineer === eng.name).length;
}

export function generateJobId(existingJobs: Job[]): string {
  const year = new Date().getFullYear();
  const maxNum = existingJobs
    .map(j => {
      const parts = j.id.split("-");
      return parts.length >= 3 ? parseInt(parts[2]) : 0;
    })
    .reduce((max, n) => Math.max(max, n), 0);
  return `J-${year}-${(maxNum + 1).toString().padStart(3, "0")}`;
}
