import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Office Manager" | "Engineer";
  phone: string;
  status: "Active" | "Inactive";
  created_at?: string;
}

export function useTeam() {
  const queryClient = useQueryClient();

  const { data: team = [], isLoading, error } = useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching team:", error);
        // Fallback to empty if table doesn't exist yet to avoid crash
        return [];
      }
      return data as TeamMember[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newMember: Omit<TeamMember, "id" | "status">) => {
      const { data, error } = await supabase
        .from("team_members")
        .insert([{ ...newMember, status: "Active" }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TeamMember> }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
    },
  });

  return {
    team,
    isLoading,
    error,
    createMutation,
    updateMutation,
    deleteMutation
  };
}
