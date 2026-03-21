import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && window.location.pathname === "/") {
        const email = session.user?.email || "";
        if (email.toLowerCase().includes("simon")) {
          navigate("/admin2");
        } else {
          navigate("/admin1");
        }
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const email = session.user?.email || "";
        if (email.toLowerCase().includes("simon")) {
          navigate("/admin2");
        } else {
          navigate("/admin1");
        }
      }
      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/rams-review" element={<RAMSReview />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id/mobile" element={<MobileJobView />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/mobile-job-sheets" element={<MobileJobSheets />} />
            <Route path="/inbox" element={<ComingSoon />} />
            <Route path="/settings" element={<ComingSoon />} />
            <Route path="/admin1/*" element={<LukeDashboard />} />
            <Route path="/admin2" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
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
