import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RAMSReview from "./pages/RAMSReview";
import Jobs from "./pages/Jobs";
import Quotes from "./pages/Quotes";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import MobileJobSheets from "./pages/MobileJobSheets";
import MobileJobView from "./pages/MobileJobView";
import CalendarPage from "./pages/CalendarPage";
import LukeDashboard from "./pages/LukeDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import AccountSettings from "./pages/AccountSettings";
import ComingSoon from "./pages/ComingSoon";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const queryClient = new QueryClient();

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<"admin1" | "admin2" | "engineer" | null>(null);
  const isAuthPage = location.pathname === "/";

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const email = session.user?.email || "";
        const emailLower = email.toLowerCase();
        
        const admin1Emails = [
          "luke@ltenergyservices.co.uk", 
          "terry@ltenergyservices.co.uk", 
          "rish@25terawatts.com"
        ];
        
        let role: "admin1" | "admin2" | "engineer" = "engineer";
        if (admin1Emails.includes(emailLower)) {
          role = "admin1";
        } else if (emailLower === "simon@ltenergyservices.co.uk") {
          role = "admin2";
        }
        
        setUserRole(role);

        if (window.location.pathname === "/") {
          if (role === "admin2") navigate("/admin2");
          else if (role === "engineer") navigate("/dashboard");
          else navigate("/admin1");
        }
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const email = session.user?.email || "";
        const emailLower = email.toLowerCase();
        
        const admin1Emails = [
          "luke@ltenergyservices.co.uk", 
          "terry@ltenergyservices.co.uk", 
          "rish@25terawatts.com"
        ];
        
        let role: "admin1" | "admin2" | "engineer" = "engineer";
        if (admin1Emails.includes(emailLower)) {
          role = "admin1";
        } else if (emailLower === "simon@ltenergyservices.co.uk") {
          role = "admin2";
        }
        
        setUserRole(role);

        if (window.location.pathname === "/") {
          if (role === "admin2") navigate("/admin2");
          else if (role === "engineer") navigate("/dashboard");
          else navigate("/admin1");
        }
      }
      if (event === "SIGNED_OUT") {
        setUserRole(null);
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {!isAuthPage && <AppSidebar userRole={userRole} />}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Auth /></PageTransition>} />
              <Route path="/rams-review" element={<PageTransition><RAMSReview /></PageTransition>} />
              <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
              <Route path="/jobs/:id/mobile" element={<PageTransition><MobileJobView /></PageTransition>} />
              <Route path="/calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
              <Route path="/quotes" element={<PageTransition><Quotes /></PageTransition>} />
              <Route path="/inventory" element={<PageTransition><Inventory /></PageTransition>} />
              <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
              <Route path="/mobile-job-sheets" element={<PageTransition><MobileJobSheets /></PageTransition>} />
              <Route path="/account" element={<PageTransition><AccountSettings /></PageTransition>} />
              <Route path="/team" element={<PageTransition><Team /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><ComingSoon /></PageTransition>} />
              <Route path="/admin1/*" element={<PageTransition><LukeDashboard /></PageTransition>} />
              <Route path="/admin2" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/dashboard/*" element={<PageTransition><EngineerDashboard /></PageTransition>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
        <div style={{ position: 'fixed', right: '4px', bottom: '2px', fontSize: '6px', fontWeight: '300', color: 'rgba(228, 228, 231, 0.6)', zIndex: 9999, pointerEvents: 'none', userSelect: 'none', letterSpacing: '0' }}>VRK</div>
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
