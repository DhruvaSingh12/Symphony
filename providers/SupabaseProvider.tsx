"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "@/types_db";
import { createClient } from "@/supabase/client";

interface SupabaseProviderProps {
  children: React.ReactNode;
}

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setupSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (isMounted) setSession(null);
        } else {
          if (isMounted) setSession(session);
        }
      }

      if (isMounted) setIsLoading(false);
    };

    setupSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
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