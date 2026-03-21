import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface PartUsed {
  partName: string;
  quantity: number;
  serialNumber: string;
}

interface Photo {
  dataUrl: string;
  category: string;
  caption: string;
}

interface JobReportData {
  jobNumber: string;
  siteName: string;
  address: string;
  technician: string;
  scheduledDate: string;
  completionDate: string;
  duration: string;
  jobType: string;
  inverterModel: string;
  serialNumber: string;
  checklist: ChecklistItem[];
  workPerformed: string;
  findings: string;
  partsUsed: PartUsed[];
  photos: Photo[];
  customerSignature: string | null;
  customerName: string;
  signOffTimestamp: string;
}

const COLORS = {
  primary: [30, 64, 175] as [number, number, number], // Blue
  secondary: [100, 116, 139] as [number, number, number], // Slate
  accent: [34, 197, 94] as [number, number, number], // Green
  border: [226, 232, 240] as [number, number, number], // Light gray
  text: [30, 41, 59] as [number, number, number], // Dark slate
  lightBg: [248, 250, 252] as [number, number, number], // Very light
};

export async function generateJobPdf(data: JobReportData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper functions
  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const drawSectionHeader = (title: string) => {
    addNewPageIfNeeded(15);
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPos, contentWidth, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 3, yPos + 5.5);
    yPos += 10;
    doc.setTextColor(...COLORS.text);
  };

  const drawKeyValue = (key: string, value: string, width: number = contentWidth) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(key + ":", margin + 2, yPos);
    doc.setFont("helvetica", "normal");
    const keyWidth = doc.getTextWidth(key + ": ");
    const valueLines = doc.splitTextToSize(value || "N/A", width - keyWidth - 5);
    doc.text(valueLines, margin + 2 + keyWidth, yPos);
    yPos += valueLines.length * 4 + 2;
  };

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Logo placeholder (circle)
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 10, 17.5, 8, "F");
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("LTES", margin + 10, 18, { align: "center" });
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LTES Job Sheet Report", margin + 25, 15);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Job #${data.jobNumber}`, margin + 25, 22);
  doc.text(`${data.jobType}`, margin + 25, 28);
  
  yPos = 45;

  // ========== JOB DETAILS SECTION ==========
  drawSectionHeader("Job Details");
  
  // Two column layout for job details
  doc.setFillColor(...COLORS.lightBg);
  doc.rect(margin, yPos, contentWidth, 35, "F");
  doc.setDrawColor(...COLORS.border);
  doc.rect(margin, yPos, contentWidth, 35, "S");
  
  yPos += 4;
  const col1X = margin + 3;
  const col2X = margin + contentWidth / 2 + 3;
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  
  // Column 1
  let tempY = yPos;
  doc.setFont("helvetica", "bold");
  doc.text("Site:", col1X, tempY);
  doc.setFont("helvetica", "normal");
  doc.text(data.siteName, col1X + 20, tempY);
  
  tempY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Address:", col1X, tempY);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(data.address, contentWidth / 2 - 25);
  doc.text(addressLines, col1X + 20, tempY);
  
  tempY += Math.max(addressLines.length * 4, 6);
  doc.setFont("helvetica", "bold");
  doc.text("Technician:", col1X, tempY);
  doc.setFont("helvetica", "normal");
  doc.text(data.technician, col1X + 25, tempY);
  
  tempY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Equipment:", col1X, tempY);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.inverterModel} (S/N: ${data.serialNumber})`, col1X + 25, tempY);
  
  // Column 2
  tempY = yPos;
  doc.setFont("helvetica", "bold");
  doc.text("Scheduled:", col2X, tempY);
  doc.setFont("helvetica", "normal");
  doc.text(data.scheduledDate, col2X + 25, tempY);
  
  tempY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Completed:", col2X, tempY);
  doc.setFont("helvetica", "normal");
  doc.text(data.completionDate, col2X + 25, tempY);
  
  tempY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Duration:", col2X, tempY);
  doc.setFont("helvetica", "normal");
  doc.text(data.duration, col2X + 25, tempY);
  
  yPos += 38;

  // ========== PRE-WORK CHECKLIST ==========
  drawSectionHeader("Pre-Work Checklist");
  
  doc.setFillColor(...COLORS.lightBg);
  const checklistHeight = Math.ceil(data.checklist.length / 2) * 6 + 4;
  doc.rect(margin, yPos, contentWidth, checklistHeight, "F");
  doc.setDrawColor(...COLORS.border);
  doc.rect(margin, yPos, contentWidth, checklistHeight, "S");
  
  yPos += 4;
  data.checklist.forEach((item, index) => {
    const colX = index % 2 === 0 ? col1X : col2X;
    if (index % 2 === 0 && index > 0) yPos += 6;
    
    // Checkbox
    doc.setDrawColor(...COLORS.border);
    doc.rect(colX, yPos - 3, 4, 4, "S");
    if (item.checked) {
      doc.setFillColor(...COLORS.accent);
      doc.rect(colX + 0.5, yPos - 2.5, 3, 3, "F");
    }
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text(item.label, colX + 6, yPos);
  });
  
  yPos += 8;

  // ========== WORK PERFORMED ==========
  drawSectionHeader("Work Performed");
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  const workLines = doc.splitTextToSize(data.workPerformed || "No work description provided.", contentWidth - 6);
  
  doc.setFillColor(...COLORS.lightBg);
  doc.rect(margin, yPos, contentWidth, workLines.length * 4 + 6, "F");
  doc.setDrawColor(...COLORS.border);
  doc.rect(margin, yPos, contentWidth, workLines.length * 4 + 6, "S");
  
  doc.text(workLines, margin + 3, yPos + 5);
  yPos += workLines.length * 4 + 10;

  // ========== FINDINGS ==========
  if (data.findings) {
    drawSectionHeader("Findings & Recommendations");
    
    const findingsLines = doc.splitTextToSize(data.findings, contentWidth - 6);
    
    doc.setFillColor(...COLORS.lightBg);
    doc.rect(margin, yPos, contentWidth, findingsLines.length * 4 + 6, "F");
    doc.setDrawColor(...COLORS.border);
    doc.rect(margin, yPos, contentWidth, findingsLines.length * 4 + 6, "S");
    
    doc.setFontSize(9);
    doc.text(findingsLines, margin + 3, yPos + 5);
    yPos += findingsLines.length * 4 + 10;
  }

  // ========== PARTS USED ==========
  if (data.partsUsed.length > 0) {
    addNewPageIfNeeded(30);
    drawSectionHeader("Parts Used");
    
    // Table header
    doc.setFillColor(...COLORS.secondary);
    doc.rect(margin, yPos, contentWidth, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Part Name", margin + 3, yPos + 5);
    doc.text("Qty", margin + contentWidth * 0.6, yPos + 5);
    doc.text("Serial Number", margin + contentWidth * 0.7, yPos + 5);
    yPos += 7;
    
    // Table rows
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "normal");
    data.partsUsed.forEach((part, index) => {
      addNewPageIfNeeded(7);
      if (index % 2 === 0) {
        doc.setFillColor(...COLORS.lightBg);
        doc.rect(margin, yPos, contentWidth, 6, "F");
      }
      doc.setDrawColor(...COLORS.border);
      doc.line(margin, yPos + 6, margin + contentWidth, yPos + 6);
      
      doc.text(part.partName, margin + 3, yPos + 4);
      doc.text(String(part.quantity), margin + contentWidth * 0.6, yPos + 4);
      doc.text(part.serialNumber || "-", margin + contentWidth * 0.7, yPos + 4);
      yPos += 6;
    });
    
    yPos += 5;
  }

  // ========== PHOTOS ==========
  if (data.photos.length > 0) {
    addNewPageIfNeeded(50);
    drawSectionHeader("Site Photos");
    
    const photoWidth = (contentWidth - 10) / 2;
    const photoHeight = 45;
    
    for (let i = 0; i < data.photos.length; i += 2) {
      addNewPageIfNeeded(photoHeight + 15);
      
      for (let j = 0; j < 2 && i + j < data.photos.length; j++) {
        const photo = data.photos[i + j];
        const xOffset = j === 0 ? margin : margin + photoWidth + 10;
        
        try {
          doc.addImage(photo.dataUrl, "JPEG", xOffset, yPos, photoWidth, photoHeight);
          doc.setDrawColor(...COLORS.border);
          doc.rect(xOffset, yPos, photoWidth, photoHeight, "S");
          
          // Category badge
          doc.setFillColor(...COLORS.primary);
          doc.roundedRect(xOffset + 2, yPos + 2, 20, 5, 1, 1, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6);
          doc.text(photo.category, xOffset + 4, yPos + 5.5);
          
          // Caption
          if (photo.caption) {
            doc.setTextColor(...COLORS.text);
            doc.setFontSize(7);
            doc.text(photo.caption, xOffset + 2, yPos + photoHeight + 4);
          }
        } catch (e) {
          console.error("Failed to add photo to PDF:", e);
        }
      }
      
      yPos += photoHeight + 10;
    }
  }

  // ========== SIGN-OFF ==========
  addNewPageIfNeeded(50);
  drawSectionHeader("Customer Sign-Off");
  
  doc.setFillColor(...COLORS.lightBg);
  doc.rect(margin, yPos, contentWidth, 40, "F");
  doc.setDrawColor(...COLORS.border);
  doc.rect(margin, yPos, contentWidth, 40, "S");
  
  // Signature
  if (data.customerSignature) {
    try {
      doc.addImage(data.customerSignature, "PNG", margin + 5, yPos + 3, 50, 20);
    } catch (e) {
      console.error("Failed to add signature:", e);
    }
  }
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Name:", margin + 5, yPos + 28);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName || "N/A", margin + 40, yPos + 28);
  
  doc.setFont("helvetica", "bold");
  doc.text("Signed:", margin + 5, yPos + 34);
  doc.setFont("helvetica", "normal");
  doc.text(data.signOffTimestamp || "N/A", margin + 40, yPos + 34);
  
  yPos += 45;

  // ========== FOOTER on each page ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    doc.text("LTES Energy Solutions", pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  return doc.output("blob");
}

export async function uploadPdfToStorage(
  blob: Blob,
  jobNumber: string
): Promise<string | null> {
  const fileName = `report_${jobNumber}_${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from("job-reports")
    .upload(fileName, blob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Failed to upload PDF:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("job-reports")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function updateJobReportLink(
  jobId: string,
  reportUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from("jobs")
    .update({ report_link: reportUrl })
    .eq("id", jobId);

  if (error) {
    console.error("Failed to update job report link:", error);
    return false;
  }

  return true;
}
