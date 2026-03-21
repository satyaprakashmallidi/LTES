import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      return data as JobWithSite[];
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: Omit<Job, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("jobs")
        .insert([job])
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
      const { data, error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", id)
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
