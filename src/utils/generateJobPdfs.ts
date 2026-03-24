import jsPDF from "jspdf";
import type { Job } from "@/data/mockJobs";

function getFaultShortDesc(job: Job): string {
  const fault = job.reportedFault || "Issue";
  return fault.split(".")[0].substring(0, 40).trim() || "Issue";
}

function formatDateDDMMMYYYY(dateStr: string): string {
  if (!dateStr) {
    const d = new Date();
    return `${d.getDate()}-${d.toLocaleString("en-GB", { month: "short" })}-${d.getFullYear()}`;
  }
  const d = new Date(dateStr);
  return `${d.getDate()}-${d.toLocaleString("en-GB", { month: "short" })}-${d.getFullYear()}`;
}

function formatDateForDoc(dateStr: string): string {
  if (!dateStr) return new Date().toLocaleDateString("en-GB");
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const h = doc.internal.pageSize.getHeight();
  const w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(180);
  doc.line(15, h - 15, w - 15, h - 15);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text("LT Energy Services Ltd | Confidential", 15, h - 10);
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 15, h - 10, { align: "right" });
  doc.setTextColor(0);
}

function addHeader(doc: jsPDF, title: string) {
  const w = doc.internal.pageSize.getWidth();
  // Company name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LT ENERGY SERVICES LTD", w / 2, 20, { align: "center" });
  // Document title
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text(title, w / 2, 28, { align: "center" });
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(15, 32, w - 15, 32);
}

function drawTable(
  doc: jsPDF,
  startY: number,
  headers: string[],
  rows: string[][],
  colWidths: number[]
): number {
  const x0 = 15;
  let y = startY;
  const rowH = 7;
  const pageH = doc.internal.pageSize.getHeight();

  // Header row
  doc.setFillColor(230, 230, 230);
  doc.rect(x0, y, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  let cx = x0;
  headers.forEach((h, i) => {
    doc.text(h, cx + 2, y + 5);
    cx += colWidths[i];
  });
  doc.setDrawColor(180);
  doc.rect(x0, y, colWidths.reduce((a, b) => a + b, 0), rowH);
  y += rowH;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  rows.forEach(row => {
    // Calculate row height based on content
    let maxLines = 1;
    row.forEach((cell, i) => {
      const lines = doc.splitTextToSize(cell, colWidths[i] - 4);
      maxLines = Math.max(maxLines, lines.length);
    });
    const thisRowH = Math.max(rowH, maxLines * 4 + 3);

    if (y + thisRowH > pageH - 25) {
      doc.addPage();
      y = 20;
    }

    cx = x0;
    row.forEach((cell, i) => {
      const lines = doc.splitTextToSize(cell, colWidths[i] - 4);
      doc.text(lines, cx + 2, y + 4);
      doc.rect(cx, y, colWidths[i], thisRowH);
      cx += colWidths[i];
    });
    y += thisRowH;
  });

  return y;
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 40) { doc.addPage(); y = 20; }
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, y);
  y += 2;
  doc.setDrawColor(0);
  doc.line(15, y, doc.internal.pageSize.getWidth() - 15, y);
  return y + 5;
}

function fieldRow(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(label + ":", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(value || "—", 60, y);
  return y + 5;
}

// ============ RISK ASSESSMENT ============
export function generateRA(job: Job): string {
  const doc = new jsPDF("p", "mm", "a4");
  const w = doc.internal.pageSize.getWidth();
  const faultShort = getFaultShortDesc(job);
  const date = formatDateForDoc(job.scheduledDate);

  addHeader(doc, "Risk Assessment");

  let y = 38;
  // Doc info
  y = fieldRow(doc, y, "Document Ref", `${job.id}-RA`);
  y = fieldRow(doc, y, "Date", date);
  y = fieldRow(doc, y, "Site", job.siteName);
  y = fieldRow(doc, y, "Engineer", job.engineer || "TBC");
  y = fieldRow(doc, y, "Revision", "01");

  y = sectionTitle(doc, y + 3, "SCOPE OF WORKS");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const scopeLines = doc.splitTextToSize(job.reportedFault || "As per job requirements", w - 30);
  doc.text(scopeLines, 15, y);
  y += scopeLines.length * 4 + 2;
  y = fieldRow(doc, y, "Inverter", `${job.inverterType} ${job.inverterModel}`);
  y = fieldRow(doc, y, "Location", job.inverterLocation);
  y = fieldRow(doc, y, "Serial No", job.serialNumber);

  y = sectionTitle(doc, y + 3, "HAZARD IDENTIFICATION");
  const hazardHeaders = ["Hazard", "Risk", "Likelihood", "Control Measures"];
  const hazardRows = [
    ["Electrical exposure", "Electric shock / death", "Medium", "Isolate inverter before work, use insulated tools, test dead before touch"],
    ["Working at height", "Falls from height", "Low", "Use appropriate access equipment, harness if required"],
    ["Manual handling", "Musculoskeletal injury", "Low", "Team lift for heavy components, use mechanical aids"],
    ["Slips / trips", "Injury", "Low", "Keep work area tidy, use appropriate footwear"],
    ["Hot surfaces", "Burns", "Medium", "Allow cooling time, use thermal gloves"],
    ["Stored energy (capacitors)", "Electric shock", "High", "Wait discharge time per manufacturer spec before opening"],
  ];
  const hazardWidths = [35, 35, 25, w - 15 - 15 - 95];
  y = drawTable(doc, y, hazardHeaders, hazardRows, hazardWidths);

  y = sectionTitle(doc, y + 5, "PPE REQUIREMENTS");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const ppe = ["✓ Safety boots", "✓ Hard hat", "✓ Hi-vis vest", "✓ Electrical gloves", "✓ Safety glasses", "✓ Arc flash protection"];
  for (let i = 0; i < ppe.length; i += 2) {
    doc.text(ppe[i], 20, y);
    if (ppe[i + 1]) doc.text(ppe[i + 1], w / 2 + 10, y);
    y += 5;
  }

  y = sectionTitle(doc, y + 3, "EMERGENCY PROCEDURES");
  y = fieldRow(doc, y, "Emergency Contact", `${job.contactName} ${job.contactPhone}`);
  y = fieldRow(doc, y, "Site Address", `${job.siteName}, ${job.address}`);
  y = fieldRow(doc, y, "Nearest Hospital", "To be confirmed on site");

  y = sectionTitle(doc, y + 5, "SIGNATURES");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Engineer: ________________________________    Date: _______________", 15, y);
  y += 8;
  doc.text("Supervisor: ______________________________    Date: _______________", 15, y);

  addFooter(doc, 1, 1);

  const filename = `${job.id} LTES ${job.siteName} ${faultShort} RA.pdf`;
  doc.save(filename);
  return filename;
}

// ============ METHOD STATEMENT ============
function getFaultSpecificSteps(job: Job): string {
  const fault = (job.reportedFault + " " + job.faultCode).toLowerCase();
  if (fault.includes("communication") || fault.includes("comms") || fault.includes("communication"))
    return "Check communication cables and terminations, verify RS485/Ethernet settings";
  if (fault.includes("earth") || fault.includes("ground") || fault.includes("insulation"))
    return "Perform insulation resistance test on DC strings, identify fault string";
  if (fault.includes("temperature") || fault.includes("overtemp") || fault.includes("thermal") || fault.includes("fan"))
    return "Check cooling fans, clean filters, verify ambient temperature within spec";
  if (fault.includes("ac") || fault.includes("grid") || fault.includes("frequency"))
    return "Verify grid voltage and frequency within inverter acceptance range";
  if (fault.includes("dc") || fault.includes("string") || fault.includes("overcurrent"))
    return "Test individual string VOC and ISC values, identify underperforming strings";
  return "Carry out full diagnostic using manufacturer software, review fault log history";
}

export function generateMS(job: Job): string {
  const doc = new jsPDF("p", "mm", "a4");
  const w = doc.internal.pageSize.getWidth();
  const faultShort = getFaultShortDesc(job);
  const date = formatDateForDoc(job.scheduledDate);

  addHeader(doc, "Method Statement");

  let y = 38;
  y = fieldRow(doc, y, "Document Ref", `${job.id}-MS`);
  y = fieldRow(doc, y, "Date", date);
  y = fieldRow(doc, y, "Site", job.siteName);
  y = fieldRow(doc, y, "Engineer", job.engineer || "TBC");
  y = fieldRow(doc, y, "Contract Type", job.contractType);
  y = fieldRow(doc, y, "Revision", "01");

  y = sectionTitle(doc, y + 3, "SCOPE OF WORKS");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const scopeLines = doc.splitTextToSize(job.reportedFault || "As per job requirements", w - 30);
  doc.text(scopeLines, 15, y);
  y += scopeLines.length * 4 + 2;

  y = sectionTitle(doc, y + 3, "INVERTER DETAILS");
  y = fieldRow(doc, y, "Type", job.inverterType);
  y = fieldRow(doc, y, "Model", job.inverterModel);
  y = fieldRow(doc, y, "Location", job.inverterLocation);
  y = fieldRow(doc, y, "Serial Number", job.serialNumber);
  y = fieldRow(doc, y, "In Production", job.inverterInProduction);

  y = sectionTitle(doc, y + 3, "SEQUENCE OF WORKS");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const steps = [
    `Arrive on site, sign in at reception. Report to: ${job.contactName} (${job.contactPhone})`,
    "Conduct site induction if required",
    "Don appropriate PPE before entering electrical areas",
    `Identify and locate ${job.inverterModel} at ${job.inverterLocation}`,
    "Isolate inverter from AC and DC supplies — Lock Out / Tag Out (LOTO) procedure",
    "Test all terminals DEAD before commencing work — use calibrated test equipment",
    "Allow capacitor discharge time per manufacturer specification",
    getFaultSpecificSteps(job),
    "Carry out functional test on completion",
    "Restore supplies in correct sequence",
    "Monitor inverter for correct operation",
    "Complete job sheet documentation",
    "Obtain site sign-off",
    "Remove all tools and waste from site",
  ];
  steps.forEach((step, i) => {
    const pageH = doc.internal.pageSize.getHeight();
    if (y > pageH - 25) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(`${i + 1}. ${step}`, w - 35);
    doc.text(lines, 18, y);
    y += lines.length * 4 + 1;
  });

  y = sectionTitle(doc, y + 3, "TOOLS & EQUIPMENT REQUIRED");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const tools = [
    "Insulated electrical toolkit",
    "Calibrated multimeter / test equipment",
    "Laptop with inverter diagnostic software",
    "Thermal imaging camera (if available)",
    "LOTO kit (padlocks + tags)",
    `Manufacturer documentation for ${job.inverterModel}`,
  ];
  tools.forEach(t => {
    const pageH = doc.internal.pageSize.getHeight();
    if (y > pageH - 25) { doc.addPage(); y = 20; }
    doc.text(`• ${t}`, 18, y);
    y += 5;
  });

  y = sectionTitle(doc, y + 3, "WASTE MANAGEMENT");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("All waste to be removed from site and disposed in accordance with Environmental regulations.", 15, y);
  y += 8;

  y = sectionTitle(doc, y + 3, "SIGNATURES");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Engineer: ________________________________    Date: _______________", 15, y);
  y += 8;
  doc.text("Client Rep: ______________________________    Date: _______________", 15, y);

  // Add footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  const filename = `${job.id} LTES ${job.siteName} ${faultShort} MS.pdf`;
  doc.save(filename);
  return filename;
}

// ============ JOB SHEET ============
export function generateJobSheet(job: Job): string {
  const doc = new jsPDF("p", "mm", "a4");
  const w = doc.internal.pageSize.getWidth();
  const faultShort = getFaultShortDesc(job);
  const date = formatDateForDoc(job.scheduledDate);

  addHeader(doc, "Job Sheet & Fault Report");

  let y = 38;
  // Job info row
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Job Ref: ${job.id}`, 15, y);
  doc.text(`Date: ${date}`, w / 2 + 10, y);
  y += 5;
  doc.text(`Priority: ${job.priority}`, 15, y);
  doc.text(`Status: ${job.status}`, w / 2 + 10, y);
  y += 3;

  y = sectionTitle(doc, y + 3, "CLIENT & SITE INFORMATION");
  y = fieldRow(doc, y, "Site Name", job.siteName);
  y = fieldRow(doc, y, "Address", job.address);
  y = fieldRow(doc, y, "Contact", job.contactName);
  y = fieldRow(doc, y, "Phone", job.contactPhone);
  y = fieldRow(doc, y, "Email", job.contactEmail);
  y = fieldRow(doc, y, "Access Code", job.accessCode);
  y = fieldRow(doc, y, "Contract Type", job.contractType);

  y = sectionTitle(doc, y + 3, "INVERTER DETAILS");
  y = fieldRow(doc, y, "Type / Brand", job.inverterType);
  y = fieldRow(doc, y, "Model", job.inverterModel);
  y = fieldRow(doc, y, "Location", job.inverterLocation);
  y = fieldRow(doc, y, "Serial Number", job.serialNumber);
  y = fieldRow(doc, y, "In Production", job.inverterInProduction);
  y = fieldRow(doc, y, "Fault Code", job.faultCode || "N/A");

  y = sectionTitle(doc, y + 3, "REPORTED FAULT");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const faultLines = doc.splitTextToSize(job.reportedFault || "N/A", w - 30);
  doc.text(faultLines, 15, y);
  y += faultLines.length * 4 + 2;

  y = sectionTitle(doc, y + 3, "ENGINEER DETAILS");
  y = fieldRow(doc, y, "Name", job.engineer || "TBC");
  y = fieldRow(doc, y, "Scheduled", date);
  y = fieldRow(doc, y, "Distance", job.distance ? `${job.distance} km` : "N/A");

  y = sectionTitle(doc, y + 3, "WORKS CARRIED OUT");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < 5; i++) {
    doc.setDrawColor(200);
    doc.line(15, y, w - 15, y);
    y += 7;
  }

  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 80) { doc.addPage(); y = 20; }

  y = sectionTitle(doc, y + 3, "PARTS USED");
  const partsHeaders = ["Part Description", "Qty", "Part No.", "Cost"];
  const partsWidths = [70, 20, 45, w - 15 - 15 - 135];
  const emptyRows = [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]];
  y = drawTable(doc, y, partsHeaders, emptyRows, partsWidths);

  y = sectionTitle(doc, y + 5, "QUOTE / PO DETAILS");
  y = fieldRow(doc, y, "Quote Number", job.quoteNumber || "N/A");
  y = fieldRow(doc, y, "PO Number", job.poNumber || "N/A");
  y = fieldRow(doc, y, "Invoice Number", job.invoiceNumber || "N/A");

  if (job.jobNotes) {
    y = sectionTitle(doc, y + 3, "JOB NOTES");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(job.jobNotes, w - 30);
    doc.text(noteLines, 15, y);
    y += noteLines.length * 4 + 2;
  }

  if (y > pageH - 55) { doc.addPage(); y = 20; }

  y = sectionTitle(doc, y + 3, "JOB OUTCOME");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const outcomes = ["Fault Resolved", "Parts Required", "Return Visit Needed", "Monitoring Required"];
  let ox = 15;
  outcomes.forEach(o => {
    doc.circle(ox + 2, y - 1, 1.5);
    doc.text(o, ox + 6, y);
    ox += 45;
  });
  y += 8;

  y = sectionTitle(doc, y + 3, "TIME ON SITE");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Arrived: ________________    Departed: ________________    Total Hours: ________________", 15, y);
  y += 10;

  y = sectionTitle(doc, y + 3, "SIGNATURES");
  doc.text("Engineer: ________________________________    Date: _______________", 15, y);
  y += 8;
  doc.text("Client Rep: ______________________________    Date: _______________", 15, y);
  y += 8;
  doc.text("Print Name: ______________________________", 15, y);

  // Add footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  const dateStr = formatDateDDMMMYYYY(job.scheduledDate);
  const siteSafe = job.siteName.replace(/ /g, "-");
  const faultSafe = faultShort.replace(/ /g, "-");
  const filename = `${dateStr}-${job.id}-${siteSafe}-${faultSafe}.pdf`;
  doc.save(filename);
  return filename;
}

export function generateAllPdfs(job: Job): string[] {
  return [generateRA(job), generateMS(job), generateJobSheet(job)];
}

export function getRAFilename(job: Job): string {
  return `${job.id} LTES ${job.siteName} ${getFaultShortDesc(job)} RA.pdf`;
}

export function getMSFilename(job: Job): string {
  return `${job.id} LTES ${job.siteName} ${getFaultShortDesc(job)} MS.pdf`;
}

export function getJobSheetFilename(job: Job): string {
  const dateStr = formatDateDDMMMYYYY(job.scheduledDate);
  const siteSafe = job.siteName.replace(/ /g, "-");
  const faultSafe = getFaultShortDesc(job).replace(/ /g, "-");
  return `${dateStr}-${job.id}-${siteSafe}-${faultSafe}.pdf`;
}
