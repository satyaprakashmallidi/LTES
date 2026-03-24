import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RAMSWorkflow {
  id: string;
  job_id: string;
  status: string;
  assigned_to: string | null;
  rams_document_url: string | null;
  uploaded_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  sent_to_customer_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useRAMSWorkflows() {
  return useQuery({
    queryKey: ["rams_workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rams_workflows")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as RAMSWorkflow[];
    },
  });
}

export function useCreateRAMSWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workflow: Omit<RAMSWorkflow, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("rams_workflows")
        .insert([workflow])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rams_workflows"] });
      toast({
        title: "RAMS workflow created",
        description: "New RAMS workflow has been initiated.",
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

export function useUpdateRAMSWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RAMSWorkflow> }) => {
      const { data, error } = await supabase
        .from("rams_workflows")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rams_workflows"] });
      toast({
        title: "RAMS workflow updated",
        description: "RAMS workflow has been updated successfully.",
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
