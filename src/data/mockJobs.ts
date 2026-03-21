export type JobStatus = "Logged Fault" | "Quote Sent" | "Approved" | "In Progress" | "Completed" | "Invoiced";
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
export const engineers: { id: string; name: string }[] = [];

// Fault codes - fetched from Supabase fault_codes table
export const faultCodesByBrand: Record<string, { code: string; label: string; severity: string }[]> = {};

// Sites - these should be fetched from Supabase using useSites hook
export const mockSites: { id: string; name: string; address: string }[] = [];

// Equipment - these should be fetched from Supabase using useSiteEquipment hook
export const mockEquipmentBySite: Record<string, { location: string; type: string; model: string; serial: string; brand: string }[]> = {};

// Jobs - these should be fetched from Supabase using useJobs hook
export const initialJobs: Job[] = [];

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
  if (fields.scheduledDate && fields.engineer) return "In Progress";
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
