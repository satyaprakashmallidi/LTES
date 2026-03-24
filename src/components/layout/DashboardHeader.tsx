import { useState, useEffect } from "react";
import { User, LogOut, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  title?: string;
  role?: string;
  userName?: string;
}

export function DashboardHeader({ 
  title, 
  role,
  userName
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; email: string }>({ 
    name: userName || "", 
    email: "" 
  });

  useEffect(() => {
    async function getProfile() {
      // If we already have a userName as a prop, we use it as the base
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || userName || "Team Member",
          email: user.email || ""
        });
      } else if (userName) {
        setUser(prev => ({ ...prev, name: userName }));
      }
    }
    getProfile();
  }, [userName]);

  const displayRole = role || "Member";
  
  // Dynamic title based on path if not provided
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === "/admin2") return "Dashboard";
    if (path === "/jobs") return "My Jobs";
    if (path === "/calendar") return "Calendar";
    if (path === "/inbox") return "Inbox";
    if (path === "/settings") return "Settings";
    if (path === "/account") return "Account Settings";
    return "LT ENERGY SERVICES";
  };

  const displayTitle = getPageTitle();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-sidebar border-b border-sidebar-border px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20 h-16 shrink-0">
      <div className="flex items-center gap-3 md:gap-4">
        <SidebarTrigger className="flex lg:hidden text-primary hover:bg-white/5 p-2 rounded-md transition-colors [&_svg]:h-6 [&_svg]:w-6">
           <Menu />
        </SidebarTrigger>
        <h1 className="text-base md:text-lg font-black tracking-tighter text-white uppercase truncate max-w-[150px] md:max-w-none">{displayTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
          <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{displayRole}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="h-9 w-9 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-sidebar border-sidebar-border text-white w-48 shadow-2xl">
            <DropdownMenuItem 
              className="text-white focus:text-white focus:bg-white/5 cursor-pointer flex items-center gap-2 font-bold"
              onClick={() => navigate("/account")}
            >
              <User className="h-4 w-4" />
              My Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="text-red-400 focus:text-red-300 focus:bg-white/5 cursor-pointer flex items-center gap-2"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
