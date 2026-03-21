import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Job as FrontendJob } from "@/data/mockJobs";
import { initialJobs } from "@/data/mockJobs";

export interface Job {
  id: string;
  job_number: string;
  site_id: string | null;
  customer_id: string | null;
  job_type: string;
  status: string;
  rams_status: string;
  scheduled_date: string | null;
  completion_date: string | null;
  technician: string | null;
  description: string | null;
  fault_description: string | null;
  equipment_details: any;
  quote_number: string | null;
  report_link: string | null;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithSite extends Job {
  sites?: {
    site_name: string;
    address: string;
    access_codes: string | null;
    site_contact_name: string | null;
    site_contact_phone: string | null;
  };
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          sites (
            site_name,
            address,
            access_codes,
            site_contact_name,
            site_contact_phone
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      if (!data || data.length === 0) {
        return initialJobs;
      }
      
      // Map DB schema to frontend Job structure
      return (data as JobWithSite[]).map(job => {
        const eq = job.equipment_details || {};
        return {
          id: job.job_number,
          contactName: eq.contact_name || job.sites?.site_contact_name || "",
          contactPhone: eq.contact_phone || job.sites?.site_contact_phone || "",
          contactEmail: eq.contact_email || "",
          siteName: job.sites?.site_name || "Unknown Site",
          siteId: job.site_id || "",
          address: job.sites?.address || "",
          inverterLocation: eq.inverter_location || "N/A",
          contractType: job.job_type as any,
          inverterType: eq.inverter_type || "",
          inverterModel: eq.inverter_model || "",
          serialNumber: eq.serial_number || "",
          inverterInProduction: eq.inverter_production || "No",
          faultCode: eq.fault_code || "",
          reportedFault: job.description || "",
          priority: eq.priority || "MEDIUM",
          status: job.status as any,
          ramsStatus: job.rams_status as any,
          quoteNumber: job.quote_number || "",
          quoteDate: eq.quote_date || "",
          poNumber: eq.po_number || "",
          poReceived: eq.po_received || false,
          scheduledDate: job.scheduled_date || "",
          engineer: job.technician || "",
          accessCode: job.sites?.access_codes || eq.access_code || "",
          distance: eq.distance || 0,
          ramsSent: eq.rams_sent || false,
          jobNotes: job.notes || "",
          markComplete: !!job.completion_date,
          invoiceNumber: job.invoice_number || "",
          reportLink: job.report_link || ""
        } as FrontendJob;
      });
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: any) => {
      // Map local Job format to Supabase table schema
      const supabaseJob = {
        job_number: job.id,
        site_id: job.siteId,
        status: job.status,
        rams_status: job.ramsStatus,
        scheduled_date: job.scheduledDate || null,
        technician: job.engineer || null,
        description: job.reportedFault || null,
        notes: job.jobNotes || null,
        invoice_number: job.invoiceNumber || null,
        quote_number: job.quoteNumber || null,
        report_link: job.reportLink || null,
        job_type: job.contractType || "Chargeable",
        equipment_details: {
          inverter_location: job.inverterLocation,
          inverter_type: job.inverterType,
          inverter_model: job.inverterModel,
          serial_number: job.serialNumber,
          inverter_in_production: job.inverterInProduction,
          fault_code: job.faultCode,
          contact_name: job.contactName,
          contact_phone: job.contactPhone,
          contact_email: job.contactEmail,
          contract_type: job.contractType,
          access_code: job.accessCode,
          distance: job.distance,
          po_number: job.poNumber,
          po_received: job.poReceived,
          quote_date: job.quoteDate,
          rams_sent: job.ramsSent,
          mark_complete: job.markComplete
        }
      };

      const { data, error } = await supabase
        .from("jobs")
        .insert([supabaseJob])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Job created",
        description: "New job has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Map updates to Supabase format if they come from the flat Job structure
      const supabaseUpdates: any = {};
      
      if (updates.id) supabaseUpdates.job_number = updates.id;
      if (updates.siteId) supabaseUpdates.site_id = updates.siteId;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.ramsStatus) supabaseUpdates.rams_status = updates.ramsStatus;
      if (updates.scheduledDate !== undefined) supabaseUpdates.scheduled_date = updates.scheduledDate || null;
      if (updates.engineer !== undefined) supabaseUpdates.technician = updates.engineer || null;
      if (updates.reportedFault !== undefined) supabaseUpdates.description = updates.reportedFault || null;
      if (updates.jobNotes !== undefined) supabaseUpdates.notes = updates.jobNotes || null;
      if (updates.invoiceNumber !== undefined) supabaseUpdates.invoice_number = updates.invoiceNumber || null;
      if (updates.quoteNumber !== undefined) supabaseUpdates.quote_number = updates.quoteNumber || null;
      if (updates.reportLink !== undefined) supabaseUpdates.report_link = updates.reportLink || null;
      if (updates.contractType !== undefined) supabaseUpdates.job_type = updates.contractType || "Chargeable";

      // Handle nested equipment_details
      if (updates.inverterLocation !== undefined || updates.serialNumber !== undefined || updates.faultCode !== undefined) {
        supabaseUpdates.equipment_details = {
          inverter_location: updates.inverterLocation,
          inverter_type: updates.inverterType,
          inverter_model: updates.inverterModel,
          serial_number: updates.serialNumber,
          inverter_in_production: updates.inverterInProduction,
          fault_code: updates.faultCode,
          contact_name: updates.contactName,
          contact_phone: updates.contactPhone,
          contact_email: updates.contactEmail,
          contract_type: updates.contractType,
          access_code: updates.accessCode,
          distance: updates.distance,
          po_number: updates.poNumber,
          po_received: updates.poReceived,
          quote_date: updates.quoteDate,
          rams_sent: updates.ramsSent,
          mark_complete: updates.markComplete
        };
      }

      const { data, error } = await supabase
        .from("jobs")
        .update(supabaseUpdates)
        .eq("job_number", id) // Use job_number if that's what we use as id in the frontend
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Job updated",
        description: "Job has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
