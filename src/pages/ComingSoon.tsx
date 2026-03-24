import { Construction, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
            <Construction className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              Phase 2 Feature
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              This module is currently under development. <br />
              <span className="text-primary/60">Coming Soon in Phase 2</span>
            </p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Take me back
        </Button>
      </div>
    </div>
  );
}
