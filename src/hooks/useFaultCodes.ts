import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FaultCode {
  id: string;
  brand: string;
  code: string;
  label: string;
  severity: string;
}

export function useFaultCodes() {
  return useQuery({
    queryKey: ["faultCodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fault_codes")
        .select("*")
        .order("brand", { ascending: true })
        .order("code", { ascending: true });

      if (error) throw error;

      // Group by brand
      const grouped: Record<string, { code: string; label: string; severity: string }[]> = {};
      data.forEach((fc: FaultCode) => {
        if (!grouped[fc.brand]) {
          grouped[fc.brand] = [];
        }
        grouped[fc.brand].push({
          code: fc.code,
          label: fc.label,
          severity: fc.severity,
        });
      });

      return grouped;
    },
  });
}
