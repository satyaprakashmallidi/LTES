import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobWithSite {
  id: string;
  job_number: string;
  job_type: string;
  status: string;
  technician: string | null;
  description: string | null;
  fault_description: string | null;
  scheduled_date: string | null;
  completion_date: string | null;
  equipment_details: {
    inverter_model?: string;
    serial_number?: string;
  } | null;
  notes: string | null;
  site_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
  sites: {
    site_name: string;
    address: string;
    postcode: string | null;
    access_codes: string | null;
    access_instructions: string | null;
    site_contact_name: string | null;
    site_contact_phone: string | null;
    site_contact_email: string | null;
    notes: string | null;
  } | null;
}

// Helper to check if a string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("Job ID is required");

      // Build query - use job_number for non-UUID IDs, id for UUIDs
      let query = supabase
        .from("jobs")
        .select(`
          *,
          sites (
            site_name,
            address,
            postcode,
            access_codes,
            access_instructions,
            site_contact_name,
            site_contact_phone,
            site_contact_email,
            notes
          )
        `);

      // Check if jobId is a UUID or a job_number
      if (isUUID(jobId)) {
        query = query.eq("id", jobId);
      } else {
        query = query.eq("job_number", jobId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching job:", error);
        throw error;
      }
      
      // Return null if no data found (will be handled by fallback in component)
      if (!data) {
        return null;
      }

      // Parse equipment_details if it's a string
      let equipmentDetails = data.equipment_details;
      if (typeof equipmentDetails === "string") {
        try {
          equipmentDetails = JSON.parse(equipmentDetails);
        } catch {
          equipmentDetails = null;
        }
      }

      return {
        ...data,
        equipment_details: equipmentDetails as JobWithSite["equipment_details"],
        sites: data.sites,
      } as JobWithSite;
    },
    enabled: !!jobId,
    retry: false,
  });
}
