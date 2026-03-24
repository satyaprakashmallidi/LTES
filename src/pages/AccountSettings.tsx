import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, Lock, Mail, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setName(user.user_metadata?.full_name || "");
      }
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        data: { full_name: name }
      };

      if (password) {
        if (password !== confirmPassword) {
          toast({
            title: "Validation error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        updates.password = password;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account updated successfully",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error updating account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-sidebar min-h-screen p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/5 h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Account Settings</h1>
            <p className="text-sm text-slate-400">Manage your profile and security preferences</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <Card className="bg-white/5 border-white/10 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-white">Profile Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      id="email" 
                      value={email} 
                      disabled 
                      className="pl-10 bg-black/20 border-white/5 text-slate-500 cursor-not-allowed h-12" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Email cannot be changed contact admin.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input 
                      id="name" 
                      placeholder="Your full name"
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white focus:border-primary/50 h-12 font-bold" 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-white">Security & Password</h2>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pass" className="text-slate-300 text-xs font-bold uppercase tracking-wider">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="pass" 
                        type="password"
                        placeholder="••••••••"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white focus:border-primary/50 h-12" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPass" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        id="confirmPass" 
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white focus:border-primary/50 h-12" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary text-black hover:bg-primary/90 font-black px-8 h-12 shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  SAVE CHANGES
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
