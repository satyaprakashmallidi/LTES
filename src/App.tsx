import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Dashboard from "./pages/Dashboard";
import RAMSReview from "./pages/RAMSReview";
import Jobs from "./pages/Jobs";
import Quotes from "./pages/Quotes";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import MobileJobSheets from "./pages/MobileJobSheets";
import MobileJobView from "./pages/MobileJobView";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 sm:h-16 lg:h-20 items-center gap-2 sm:gap-4 border-b bg-card px-4 sm:px-6 lg:px-8 shadow-sm">
            <SidebarTrigger className="active:scale-95" />
            <div className="flex items-center gap-2 sm:gap-4">
              <div>
                <h1 className="text-sm sm:text-base lg:text-xl font-bold text-foreground">LTES Operations Portal</h1>
                <p className="text-xs text-muted-foreground hidden lg:block">Central Inverter Maintenance & Management</p>
              </div>
            </div>
            <div className="flex-1" />
          </header>
          <div className="p-4 sm:p-6 lg:p-8 bg-background">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rams-review" element={<RAMSReview />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id/mobile" element={<MobileJobView />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/mobile-job-sheets" element={<MobileJobSheets />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
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
