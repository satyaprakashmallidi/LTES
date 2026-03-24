import { Users } from "lucide-react";
import { TeamManagement } from "@/components/TeamManagement";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Team() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Team Member");
      }
    }
    getProfile();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar">
      <DashboardHeader title="TEAM" role="Management" userName={userName} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <div className="pt-6">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              TEAM MANAGEMENT
            </h2>
            <p className="text-sidebar-foreground/40 font-bold uppercase tracking-widest pt-2">Manage engineers, office managers and administrative access.</p>
          </div>
          <TeamManagement />
        </div>
      </div>
    </div>
  );
}
