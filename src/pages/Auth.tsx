import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back to LTES Portal");
      
      // Simple routing logic: if email contains "simon", go to admin2, else admin1
      if (email.toLowerCase().includes("simon")) {
        navigate("/admin2");
      } else {
        navigate("/admin1");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      toast.success("Account created! Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-2xl">
             <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 32 35.76" 
                className="w-10 h-10"
                style={{ fill: "hsl(var(--primary))" }}
              >
                <polygon points="15.64 0 15.65 17.88 20.85 20.86 20.86 2.98 15.64 0"></polygon>
                <polygon points="15.65 20.86 15.65 26.82 0 17.88 0 11.92 15.65 20.86"></polygon>
                <polygon points="23.47 16.39 23.46 22.35 31.28 17.88 31.28 11.92 23.47 16.39"></polygon>
                <polygon points="23.46 25.33 28.68 28.31 15.64 35.76 10.44 32.79 23.46 25.33"></polygon>
              </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">LTES PORTAL</h1>
            <p className="text-slate-400 font-medium">Central Inverter Maintenance System</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full shadow-2xl">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 backdrop-blur-xl p-1 rounded-xl">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold">
              <LogIn className="w-4 h-4 mr-2" /> Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold">
              <UserPlus className="w-4 h-4 mr-2" /> Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Welcome Back</CardTitle>
                <CardDescription className="text-slate-400">Enter your credentials to access the admin panel.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@ltes.co.uk" 
                      className="bg-white/5 border-white/10 text-white" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass" className="text-slate-300">Password</Label>
                    <Input 
                      id="pass" 
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-white/5 border-white/10 text-white" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Login to Dashboard"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Create Account</CardTitle>
                <CardDescription className="text-slate-400">Join the LTES maintenance team.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first" className="text-slate-300">First Name</Label>
                      <Input 
                        id="first" 
                        placeholder="Luke" 
                        className="bg-white/5 border-white/10 text-white" 
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last" className="text-slate-300">Last Name</Label>
                      <Input 
                        id="last" 
                        placeholder="Morris" 
                        className="bg-white/5 border-white/10 text-white" 
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-sg" className="text-slate-300">Email</Label>
                    <Input 
                      id="email-sg" 
                      type="email" 
                      placeholder="luke@ltes.co.uk" 
                      className="bg-white/5 border-white/10 text-white" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pass-sg" className="text-slate-300">Password</Label>
                    <Input 
                      id="pass-sg" 
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-white/5 border-white/10 text-white" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Secure Maintenance Portal
        </div>
      </div>
    </div>
  );
}
