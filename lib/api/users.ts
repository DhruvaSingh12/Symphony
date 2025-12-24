import { createClient } from "@/supabase/client";
import { UserDetails } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserDetailsSchema, validateSafe, validateArraySafe } from "@/lib/validation";

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

  return validateSafe(UserDetailsSchema, data, null);
}

// Search users by email or full_name
export async function searchUsers(
    query: string,
    limit: number = 10,
    supabaseClient?: SupabaseClient
): Promise<UserDetails[]> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!query || query.trim().length === 0) {
        return [];
    }

    // Get current user to exclude from results
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const searchTerm = `%${query}%`;

    let queryBuilder = supabase
        .from("users")
        .select(`
            id, 
            full_name, 
            avatar_url, 
            gender, 
            dateOfBirth
        `)
        .ilike('full_name', searchTerm)
        .limit(limit);

    // Exclude current user from results
    if (currentUser?.id) {
        queryBuilder = queryBuilder.neq('id', currentUser.id);
    }

    const { data, error } = await queryBuilder;

    if (error) {
        console.error("Error searching users:", error, "Query:", query);
        return [];
    }

    const validated = validateArraySafe(UserDetailsSchema, data);
    return validated;
}

// Get user by ID
export async function getUserById(
    userId: string,
    supabaseClient?: SupabaseClient
): Promise<UserDetails | null> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    const { data, error } = await supabase
        .from("users")
        .select(`
            id, 
            full_name, 
            avatar_url, 
            gender, 
            dateOfBirth
        `)
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching user:", error);
        return null;
    }

    return validateSafe(UserDetailsSchema, data, null);
}

// Get multiple users by IDs
export async function getUsersByIds(
    userIds: string[],
    supabaseClient?: SupabaseClient
): Promise<UserDetails[]> {
    const supabase = (supabaseClient && 'from' in supabaseClient) ? supabaseClient : createClient();

    if (!userIds || userIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("users")
        .select(`
            id, 
            full_name, 
            avatar_url, 
            gender, 
            dateOfBirth
        `)
        .in("id", userIds);

    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }

    return validateArraySafe(UserDetailsSchema, data);
}
