import { supabase } from "./src/integrations/supabase/client";

async function test() {
  const { data: profiles, error: pe } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles:", { profiles, pe });
  const { data: team, error: te } = await supabase.from('team').select('*').limit(1);
  const { data: teamMembers, error: tme } = await supabase.from('team_members').select('*').limit(1);
  console.log("Team:", { team, te });
  console.log("Team Members:", { teamMembers, tme });
  process.exit(0);
}
test();
