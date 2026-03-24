import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  User,
  MoreVertical,
  Edit,
  Search,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTeam, TeamMember } from "@/hooks/useTeam";
import { useToast } from "@/hooks/use-toast";

// TeamMember interface is now imported from @/hooks/useTeam


const INITIAL_TEAM: TeamMember[] = [];

export function TeamManagement() {
  const { team, isLoading, createMutation, updateMutation, deleteMutation } = useTeam();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<Omit<TeamMember, "id" | "status">>({
    name: "",
    email: "",
    role: "Engineer",
    phone: ""
  });

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (editMember) {
        await updateMutation.mutateAsync({ id: editMember.id, updates: form });
        toast({ title: "Updated", description: "Team member updated successfully." });
      } else {
        await createMutation.mutateAsync(form);
        toast({ title: "Added", description: "New team member added successfully." });
      }
      setOpen(false);
      setEditMember(null);
      setForm({ name: "", email: "", role: "Engineer", phone: "" });
    } catch (e: any) {
      toast({ 
        title: "Error", 
        description: "Make sure the 'team_members' table exists in Supabase. " + e.message,
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Removed", description: "Team member removed from codebase." });
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
  };

  const openEdit = (member: TeamMember) => {
    setEditMember(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || ""
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
          <Input 
            placeholder="Search team members..." 
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border text-white placeholder:text-sidebar-foreground/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-black font-black uppercase tracking-widest hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-white/20 italic">Loading team data...</div>
        ) : filteredTeam.length > 0 ? filteredTeam.map(member => (
          <Card key={member.id} className="bg-white/5 border-white/10 p-5 hover:border-primary/30 transition-all group">
            {/* ... card content remains same but use member properties ... */}
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  member.role === "Admin" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                  member.role === "Office Manager" ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                  "bg-blue-500/20 text-blue-500 border-blue-500/30"
                )}>
                  {member.role}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/40 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1e293b] border-sidebar-border text-white">
                    <DropdownMenuItem onClick={() => openEdit(member)} className="cursor-pointer hover:bg-white/5">
                      <Edit className="h-4 w-4 mr-2" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(member.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black text-white tracking-tight leading-none">{member.name}</h3>
              
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{member.phone || "No phone added"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  {member.status}
                </div>
              </div>
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-12 text-center text-white/20 italic">No team members found. Click 'Add Member' to begin.</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-sidebar border-sidebar-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              {editMember ? "Edit Team Member" : "Add New Team Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Full Name</label>
              <Input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="bg-sidebar-accent/50 border-sidebar-border text-white"
                placeholder="e.g. Luke Morris"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Email Address</label>
              <Input 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
                className="bg-sidebar-accent/50 border-sidebar-border text-white"
                placeholder="e.g. luke@ltes.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Role</label>
                <select 
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value as any})}
                  className="w-full h-10 px-3 bg-sidebar-accent/50 border border-sidebar-border rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Admin">Admin</option>
                  <option value="Office Manager">Office Manager</option>
                  <option value="Engineer">Engineer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-sidebar-foreground/40 tracking-widest">Phone Number</label>
                <Input 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="bg-sidebar-accent/50 border-sidebar-border text-white"
                  placeholder="07xxx xxxxxx"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-black font-black uppercase tracking-widest">
              {editMember ? "Update Member" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
