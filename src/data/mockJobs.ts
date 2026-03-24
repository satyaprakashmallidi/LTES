export type JobStatus = "Logged Fault" | "Quote Sent" | "Approved" | "Scheduled" | "Completed" | "Invoiced" | "In Progress";
export type RAMSStatus = "Approved" | "Pending" | "Not Required";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type ContractType = "Contract/SLA" | "Chargeable";
export type InverterProduction = "Yes" | "No" | "Yes Reduced Production";

export interface Job {
  id: string;        // Supabase database id (UUID)
  jobNumber: string; // Display job number (e.g. J-2026-001)
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
  quoteDocument: string;
  poNumber: string;
  poReceived: boolean;
  poAttachment: string;
  scheduledDate: string;
  engineer: string;
  accessCode: string;
  distance: number;
  ramsSent: boolean;
  ramsAttachment: string;
  jobNotes: string;
  jobSheet: string;
  markComplete: boolean;
  siteInduction: string;
  invoiceNumber: string;
  invoiceAttachment: string;
  reportLink: string;
  scheduledTime?: string;
  createdAt?: string;
}

// Engineers - these should be fetched from Supabase users table
export const engineers: { id: string; name: string }[] = [];

// Fault codes - fetched from Supabase fault_codes table

// Jobs - fetched from Supabase using useJobs hook
export const initialJobs: Job[] = [];

export function calculatePriority(inverterInProduction: InverterProduction, contractType: ContractType): Priority {
  if (inverterInProduction === "No" && contractType === "Contract/SLA") return "HIGH";
  if (inverterInProduction === "No" && contractType === "Chargeable") return "MEDIUM";
  if (inverterInProduction === "Yes Reduced Production") return "MEDIUM";
  return "LOW";
}

export function calculateStatus(fields: {
  quoteNumber: string;
  quoteDate: string;
  contractType: string;
  poNumber: string;
  poReceived: boolean;
  scheduledDate: string;
  engineer: string;
  jobSheetUploaded: boolean;
  markComplete: boolean;
  invoiceNumber: string;
}): JobStatus {
  if (fields.invoiceNumber) return "Invoiced";
  if (fields.jobSheetUploaded || fields.markComplete) return "Completed";
  if (fields.scheduledDate && fields.engineer) return "Scheduled";
  if (fields.poNumber && (fields.poReceived || fields.contractType === "Contract/SLA")) return "Approved";
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
      if (!j.jobNumber) return 0;
      const parts = j.jobNumber.split("-");
      return parts.length >= 3 ? parseInt(parts[2]) : 0;
    })
    .reduce((max, n) => Math.max(max, n), 0);
  return `J-${year}-${(maxNum + 1).toString().padStart(3, "0")}`;
}
