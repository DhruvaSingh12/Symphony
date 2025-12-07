import { UserDetails } from "@/types";
import { Subscription } from "@/types";
import { User } from "@supabase/supabase-js";
import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";

type UserContextType = {
accessToken: string | null;
user: User | null;
userDetails: UserDetails | null;
isLoading: boolean;
subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
undefined
);

export interface Props {
[propName: string]: any;
};

export const MyUserContextProvider = (props: Props) => {
const { supabase, session, isLoading: isLoadingSession } = useSupabase();
const user = session?.user ?? null;
const accessToken = session?.access_token ?? null;
const [isLoadingData, setIsLoadingData]= useState(false);
const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
const [subscription, setSubscription] = useState<Subscription | null>(null);

const getUserDetails = () => supabase.from('users').select('*').single();
const getSubscription = () => supabase.from('subscriptions').select('*,prices(*, products(*))').in('status', ['trialing', 'active']).single();

useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
            setIsLoadingData(true);
            Promise.allSettled([getUserDetails(), getSubscription()]).then((results) => {
                const userDetailsPromise = results[0];
                const subscriptionPromise = results[1];
                if (userDetailsPromise.status === 'fulfilled') {
                    setUserDetails(userDetailsPromise.value.data as UserDetails);
                }
                if (subscriptionPromise.status === 'fulfilled') {
                    setSubscription(subscriptionPromise.value.data as Subscription);
                }
                setIsLoadingData(false);
            });
    }
    else if (!user && !isLoadingSession && !isLoadingData ) {
        setUserDetails(null);
        setSubscription(null);
    }
}, [user, isLoadingSession, isLoadingData, userDetails, subscription]);

const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingSession || isLoadingData,
    subscription
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