import { createClient } from "@/supabase/client";
import { UserDetails } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserDetails(supabaseClient?: SupabaseClient): Promise<UserDetails | null> {
  const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user details:', error);
    return null;
  }

  return data as UserDetails;
}