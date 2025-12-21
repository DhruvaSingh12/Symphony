import { useState, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
import { signUpUser, signInWithPassword, signInWithOAuth, sendMagicLink, sendPasswordResetEmail, signOut as signOutAction, resendConfirmationEmail } from "@/lib/auth/actions";
import type { SignUpFormData, SignInFormData } from "@/lib/auth/validation";

interface UseAuthOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useAuth(
  supabase: SupabaseClient,
  options: UseAuthOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    toast.error(errorMessage);
    options.onError?.(errorMessage);
    return {
      success: false,
      error: { type: "unknown" as const, message: errorMessage },
    };
  }, [options]);

  const handleSuccess = useCallback((message?: string) => {
    if (message) toast.success(message);
    options.onSuccess?.();
  }, [options]);

  // Sign up a new user
  const signUp = useCallback(
    async (formData: SignUpFormData) => {
      setIsLoading(true);
      try {
        const result = await signUpUser(supabase, formData);

        if (!result.success) {
            return handleError(result.error, "Sign up failed");
        }

        handleSuccess(result.data?.requiresEmailConfirmation 
            ? "Account created! Please check your email for verification." 
            : "Account created successfully!");
        
        return result;
      } catch (error) {
        return handleError(error, "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, handleError, handleSuccess]
  );

  //   Sign in with email and password
  const signIn = useCallback(
    async (formData: SignInFormData) => {
      setIsLoading(true);
      try {
        const result = await signInWithPassword(supabase, formData);

        if (!result.success) {
            return handleError(result.error, "Sign in failed");
        }

        handleSuccess("Welcome back!");
        return result;
      } catch (error) {
        return handleError(error, "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, handleError, handleSuccess]
  );

  // Sign in with OAuth provider
  const signInWithProvider = useCallback(
    async (provider: "google") => {
      setIsLoading(true);
      try {
        const result = await signInWithOAuth(supabase, provider);

        if (!result.success) {
          const errorMessage =
            result.error?.message || `Failed to sign in with ${provider}`;
          toast.error(errorMessage);
          options.onError?.(errorMessage);
          setIsLoading(false);
          return result;
        }

        // OAuth will redirect, so we don't set loading to false here
        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(errorMessage);
        options.onError?.(errorMessage);
        setIsLoading(false);
        return {
          success: false,
          error: { type: "unknown" as const, message: errorMessage },
        };
      }
    },
    [supabase, options]
  );

  // Send magic link to email
  const sendMagicLinkEmail = useCallback(
    async (email: string, shouldCreateUser: boolean = false) => {
      setIsLoading(true);
      try {
        const result = await sendMagicLink(supabase, email, shouldCreateUser);

        if (!result.success) {
          const errorMessage =
            result.error?.message || "Failed to send magic link";
          toast.error(errorMessage);
          options.onError?.(errorMessage);
          return result;
        }

        toast.success("Magic link sent! Check your email.");
        options.onSuccess?.();
        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(errorMessage);
        options.onError?.(errorMessage);
        return {
          success: false,
          error: { type: "unknown" as const, message: errorMessage },
        };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, options]
  );

  // Send password reset email
  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true);
      try {
        const result = await sendPasswordResetEmail(supabase, email);

        if (!result.success) {
          const errorMessage =
            result.error?.message || "Failed to send reset email";
          toast.error(errorMessage);
          options.onError?.(errorMessage);
          return result;
        }

        toast.success("Password reset instructions sent to your email!");
        options.onSuccess?.();
        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(errorMessage);
        options.onError?.(errorMessage);
        return {
          success: false,
          error: { type: "unknown" as const, message: errorMessage },
        };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, options]
  );

  // Sign out user
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signOutAction(supabase);

      if (!result.success) {
        return handleError(result.error, "Failed to sign out");
      }

      handleSuccess("Signed out successfully");
      return result;
    } catch (error) {
       return handleError(error, "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, handleError, handleSuccess]);

  //Resend confirmation email
  const resendConfirmation = useCallback(
    async (email: string) => {
      setIsLoading(true);
      try {
        const result = await resendConfirmationEmail(supabase, email);

        if (!result.success) {
          const errorMessage =
            result.error?.message || "Failed to resend confirmation";
          toast.error(errorMessage);
          options.onError?.(errorMessage);
          return result;
        }

        toast.success("Confirmation email sent!");
        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(errorMessage);
        options.onError?.(errorMessage);
        return {
          success: false,
          error: { type: "unknown" as const, message: errorMessage },
        };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, options]
  );

  return {
    isLoading,
    signUp,
    signIn,
    signInWithProvider,
    sendMagicLinkEmail,
    resetPassword,
    signOut,
    resendConfirmation,
  };
}
