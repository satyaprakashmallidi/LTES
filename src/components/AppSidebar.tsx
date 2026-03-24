import * as React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  Box,
  Users,
  Settings,
  LayoutDashboard,
  FileCheck,
  Briefcase,
  FileText,
  ShieldCheck,
  Inbox,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/admin2", icon: LayoutDashboard },
  { title: "My Jobs", url: "/jobs", icon: Briefcase },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

const lukeNavItems = [
  { title: "Dashboard", url: "/admin1", icon: LayoutGrid, key: "dashboard" },
  { title: "Calendar", url: "/admin1/calendar", icon: Calendar, key: "calendar" },
  { title: "Inventory", url: "/admin1/inventory", icon: Box, key: "inventory" },
  { title: "Team", url: "/admin1/team", icon: Users, key: "team" },
  { title: "Analytics", url: "/admin1/analytics", icon: Settings, key: "analytics" },
];

const engineerNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "My Jobs", url: "/dashboard/jobs", icon: Briefcase },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Van Stock", url: "/dashboard/inventory", icon: Box },
];

export function AppSidebar({ userRole }: { userRole?: string | null }) {
  const { open } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      }
    }
    getProfile();
  }, []);

  let isLuke = location.pathname.startsWith("/admin1");
  let isEngineer = location.pathname.startsWith("/dashboard");
  let isSimon = location.pathname.startsWith("/admin2") || (!isLuke && !isEngineer && userRole === "admin2");

  if (!isLuke && !isEngineer && !isSimon) {
    if (userRole === "admin1") isLuke = true;
    else if (userRole === "engineer") isEngineer = true;
    else isSimon = true;
  }

  let itemsToShow = mainNavItems;
  if (isLuke) itemsToShow = lukeNavItems;
  if (isEngineer) itemsToShow = engineerNavItems;

  let sidebarLabel = "MAIN MENU";
  if (isLuke) sidebarLabel = "DASHBOARD";
  if (isEngineer) sidebarLabel = "ENGINEER";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4 h-16">
        {!open ? (
          <div 
            className="flex items-center justify-center h-12 transition-all duration-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isHovered ? (
              <SidebarTrigger className="text-primary bg-transparent hover:bg-transparent active:scale-95 h-12 w-12 [&_svg]:!text-primary" />
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 32 35.76" 
                className="w-10 h-10"
                style={{ 
                  // @ts-ignore
                  "--iconFill": "hsl(var(--primary))"
                } as React.CSSProperties}
              >
                <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="15.64 0 15.65 17.88 20.85 20.86 20.86 2.98 15.64 0"></polygon>
                <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="15.65 20.86 15.65 26.82 0 17.88 0 11.92 15.65 20.86"></polygon>
                <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="23.47 16.39 23.46 22.35 31.28 17.88 31.28 11.92 23.47 16.39"></polygon>
                <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="23.46 25.33 28.68 28.31 15.64 35.76 10.44 32.79 23.46 25.33"></polygon>
              </svg>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 125.08 35.76" 
              className="w-32 h-auto"
              style={{ 
                // @ts-ignore
                "--iconFill": "hsl(var(--primary))", 
                // @ts-ignore
                "--textFill": "hsl(var(--foreground))" 
              } as React.CSSProperties}
            >
              <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="15.64 0 15.65 17.88 20.85 20.86 20.86 2.98 15.64 0"></polygon>
              <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="15.65 20.86 15.65 26.82 0 17.88 0 11.92 15.65 20.86"></polygon>
              <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="23.47 16.39 23.46 22.35 31.28 17.88 31.28 11.92 23.47 16.39"></polygon>
              <polygon className="icon" style={{ fill: "var(--iconFill, #ede937)" }} points="23.46 25.33 28.68 28.31 15.64 35.76 10.44 32.79 23.46 25.33"></polygon>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M84.4,31.7c0,.93-.81,1.35-1.67,1.35-1.21,0-1.8-.64-1.94-1.44h.55c.15.61.58.93,1.38.93.71,0,1.14-.29,1.14-.82s-.42-.61-1.31-.8c-.97-.22-1.63-.45-1.63-1.26,0-.86.76-1.33,1.64-1.33,1.07,0,1.62.53,1.78,1.22h-.55c-.17-.44-.56-.71-1.23-.71s-1.1.31-1.1.82c0,.38.29.52,1.21.73,1.09.24,1.74.45,1.74,1.31h0Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M89.48,28.91h-2.36v1.45h2.2v.52h-2.2v1.57h2.36v.52h-2.9v-4.57h2.9v.52h0Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M91.67,28.4h1.81c1.01,0,1.55.59,1.55,1.41,0,.76-.46,1.28-1.29,1.37l1.46,1.79h-.67l-1.43-1.77h-.89v1.77h-.54v-4.57ZM93.43,30.72c.73,0,1.05-.39,1.05-.91s-.33-.9-1.05-.9h-1.21v1.8h1.21Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M99.2,32.97h-.7l-1.64-4.57h.58l1.42,3.97,1.42-3.97h.58l-1.65,4.57h-.01Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M102.95,28.4h.54v4.57h-.54v-4.57Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M105.77,30.69c0-1.35,1.01-2.36,2.35-2.36,1.03,0,1.86.61,2.17,1.53h-.58c-.27-.61-.86-1.01-1.59-1.01-1.03,0-1.8.79-1.8,1.84s.76,1.84,1.8,1.84c.73,0,1.32-.4,1.59-1.01h.58c-.31.92-1.14,1.53-2.17,1.53-1.35,0-2.35-1.01-2.35-2.36Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M115.37,28.91h-2.36v1.45h2.2v.52h-2.2v1.57h2.36v.52h-2.9v-4.57h2.9v.52h0Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M120.87,31.7c0,.93-.81,1.35-1.67,1.35-1.21,0-1.8-.64-1.94-1.44h.55c.15.61.58.93,1.38.93.71,0,1.14-.29,1.14-.82s-.42-.61-1.31-.8c-.97-.22-1.63-.45-1.63-1.26,0-.86.76-1.33,1.64-1.33,1.07,0,1.62.53,1.78,1.22h-.55c-.17-.44-.56-.71-1.23-.71s-1.1.31-1.1.82c0,.38.29.52,1.21.73,1.09.24,1.74.45,1.74,1.31h0Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M38.7,21.53h5.12v2.32h-7.56v-11.94h2.44s0,9.62,0,9.62Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M52.61,14.23h-3.45v9.62h-2.44v-9.62h-3.43v-2.32h9.31v2.32h0Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M65.47,14.23h-5.58v2.4h5.12v2.32h-5.12v2.58h5.58v2.32h-8.02v-11.94h8.02v2.32Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M88.8,14.23h-5.58v2.4h5.12v2.32h-5.12v2.58h5.58v2.32h-8.02v-11.94h8.02v2.32Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M91.36,11.91h5.13c2.56,0,4.08,1.52,4.08,3.89,0,1.94-1.01,3.14-2.66,3.57l3.33,4.49h-3l-3.09-4.3h-1.35v4.3h-2.44v-11.94h0ZM96.22,17.42c1.28,0,1.88-.61,1.88-1.59s-.61-1.6-1.88-1.6h-2.42v3.19h2.42Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M113.84,17.39v6.27h-2.01v-1.95c-.53,1.24-1.95,2.14-3.89,2.14-3.22,0-5.74-2.49-5.74-5.95s2.52-5.99,5.97-5.99c2.75,0,4.9,1.65,5.57,4.02h-2.52c-.54-1.1-1.65-1.78-3.07-1.78-2.13,0-3.58,1.55-3.58,3.78,0,2.09,1.29,3.74,3.55,3.74,1.58,0,2.89-.82,3.3-2.31h-3.89v-1.98h6.32-.01Z"></path>
              <path className="text" style={{ fill: "var(--textFill, #020000)" }} d="M116.94,11.91l2.69,5.25,2.7-5.25h2.75l-4.21,7.98v3.96h-2.46l.02-3.91-4.23-8.03h2.75,0Z"></path>
              <polygon className="text" style={{ fill: "var(--textFill, #020000)" }} points="75.79 11.91 75.79 16.91 75.79 19.9 70.81 11.91 68.01 11.91 68.01 14.33 68.01 23.85 70.45 23.85 70.45 18.85 70.45 15.85 75.41 23.85 78.23 23.85 78.23 21.66 78.23 11.91 75.79 11.91"></polygon>
            </svg>
            <SidebarTrigger className="text-primary bg-transparent hover:bg-transparent [&_svg]:!text-primary" />
          </div>

        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsToShow.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        cn(
                          "transition-colors duration-200",
                          !isLuke ? "text-primary hover:text-primary/80" : (isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "")
                        )
                      }
                    >
                      <item.icon className={cn(
                        "transition-all duration-200", 
                        open ? "h-5 w-5" : "h-7 w-7",
                        !isLuke && "text-primary"
                      )} />
                      <span className={cn(!isLuke && "font-bold")}>{item.title}</span>

                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
