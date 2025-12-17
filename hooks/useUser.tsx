import { UserDetails } from "@/types";
import { User } from "@supabase/supabase-js";
import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: UserDetails | null;
    isLoading: boolean;
    refreshUserDetails: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    children: React.ReactNode;
};

export const MyUserContextProvider = (props: Props) => {
    const { supabase, session, isLoading: isLoadingSession } = useSupabase();
    const user = session?.user ?? null;
    const accessToken = session?.access_token ?? null;
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    const getUserDetails = () => supabase.from('users').select('*').single();

    const refreshUserDetails = async () => {
        const result = await getUserDetails();
        if (result.data) {
            setUserDetails(result.data as UserDetails);
        }
    };

    useEffect(() => {
        if (user && !isLoadingData && !userDetails) {
            setIsLoadingData(true);
            Promise.allSettled([getUserDetails()]).then((results) => {
                const userDetailsPromise = results[0];
                if (userDetailsPromise.status === 'fulfilled') {
                    setUserDetails(userDetailsPromise.value.data as UserDetails);
                }
                setIsLoadingData(false);
            });
        }
        else if (!user && !isLoadingSession && !isLoadingData) {
            setUserDetails(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoadingSession]);

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingSession || isLoadingData,
        refreshUserDetails
    };

    return <UserContext.Provider value={value} {...props} />
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a MyUserContextProvider");
    }
    return context;
};