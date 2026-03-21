import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryPart {
  id: string;
  part_name: string;
  part_number: string | null;
  category: string;
  manufacturer: string | null;
  unit_price: number | null;
  warehouse_stock: number;
  terry_van_stock: number;
  jason_van_stock: number;
  min_stock_level: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useInventoryParts() {
  return useQuery({
    queryKey: ["inventory_parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_parts")
        .select("*")
        .order("category")
        .order("part_name");
      
      if (error) throw error;
      return data as InventoryPart[];
    },
  });
}

export function useInventoryPartsByCategory(category?: string) {
  return useQuery({
    queryKey: ["inventory_parts", category],
    queryFn: async () => {
      let query = supabase
        .from("inventory_parts")
        .select("*")
        .order("part_name");
      
      if (category) {
        query = query.eq("category", category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as InventoryPart[];
    },
  });
}
