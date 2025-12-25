"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "@/types_db";
import { createClient } from "@/supabase/client";

interface SupabaseProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children, session: initialSession }) => {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(!initialSession);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(() => ({ supabase, session, isLoading }), [supabase, session, isLoading]);

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};

export const useSupabaseClient = () => useSupabase().supabase;
export const useSupabaseSession = () => useSupabase().session;

export default SupabaseProvider;