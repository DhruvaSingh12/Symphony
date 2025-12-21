import { createClient as createBrowserClient } from "@/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

export function getClient(client?: SupabaseClient<Database>): SupabaseClient<Database> {
  if (client && 'from' in client) {
    return client;
  }
  return createBrowserClient();
}