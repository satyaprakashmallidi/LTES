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
  station: string | null;
  location: string | null;
  power: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Ensures a location identifier is available.
 * Prioritizes the database 'location' column, then parses 'notes', 
 * then falls back to serial number.
 */
export function resolveLocation(e: any): string {
  // 1. Use database 'location' column if present and not empty
  if (e.location && e.location.trim()) {
    return e.location;
  }

  // 2. Try parsing from notes field
  if (e.notes) {
    const match = e.notes.match(/Location:\s*([^|]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // 3. Fallback to serial number or ID
  return e.serial_number || e.id;
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
      
      return (data as any[]).map(e => ({
        ...e,
        location: resolveLocation(e)
      })) as SiteEquipment[];
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
      
      return (data as any[]).map(e => ({
        ...e,
        location: resolveLocation(e)
      })) as SiteEquipment[];
    },
  });
}
