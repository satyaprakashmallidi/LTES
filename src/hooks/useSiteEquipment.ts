import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteEquipment {
  id: string;
  site_id: string;
  equipment_type: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  installation_date: string | null;
  warranty_expiry: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useSiteEquipment(siteId?: string) {
  return useQuery({
    queryKey: ["site_equipment", siteId],
    queryFn: async () => {
      let query = supabase
        .from("site_equipment")
        .select("*")
        .order("manufacturer");
      
      if (siteId) {
        query = query.eq("site_id", siteId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SiteEquipment[];
    },
    enabled: !!siteId,
  });
}

export function useAllEquipment() {
  return useQuery({
    queryKey: ["all_site_equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_equipment")
        .select("*")
        .order("manufacturer");
      
      if (error) throw error;
      return data as SiteEquipment[];
    },
  });
}
