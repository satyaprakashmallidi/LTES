import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, Lock, Mail, Loader2 } from "lucide-react";

interface MyAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyAccountDialog({ open, onOpenChange }: MyAccountDialogProps) {
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
    if (open) {
      getProfile();
    }
  }, [open]);

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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-sidebar border-sidebar-border text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            My Account Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage your personal information and security.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                  className="pl-9 bg-white/5 border-white/10 text-slate-400 cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="name" 
                  placeholder="Your full name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Security</Label>
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="pass" className="text-slate-300">New Password (optional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="pass" 
                      type="password"
                      placeholder="Enter new password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPass" className="text-slate-300">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="confirmPass" 
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-black hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
