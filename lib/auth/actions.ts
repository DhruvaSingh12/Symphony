import { SupabaseClient, AuthError, User, Session } from "@supabase/supabase-js";
import type { SignUpFormData, SignInFormData } from "@/lib/auth/validation";

export type AuthErrorType =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "user_already_exists"
  | "weak_password"
  | "rate_limit"
  | "network_error"
  | "invalid_email"
  | "user_not_found"
  | "session_expired"
  | "unknown";

export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    type: AuthErrorType;
    message: string;
  };
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  requiresEmailConfirmation: boolean;
}

export interface SignInResult {
  user: User | null;
  session: Session | null;
}

// Parse Supabase Auth errors into categorized error types
export function parseAuthError(error: AuthError | Error | unknown): {
  type: AuthErrorType;
  message: string;
} {
  const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message.toLowerCase()
    : "";

  // Rate limiting
  if (
    errorMessage.includes("rate") ||
    errorMessage.includes("too many") ||
    (error && typeof error === 'object' && 'status' in error && error.status === 429)
  ) {
    return {
      type: "rate_limit",
      message: "Too many attempts. Please try again later.",
    };
  }

  // Invalid credentials
  if (
    errorMessage.includes("invalid login credentials") ||
    errorMessage.includes("invalid password") ||
    errorMessage.includes("email or password")
  ) {
    return {
      type: "invalid_credentials",
      message: "Invalid email or password. Please try again.",
    };
  }

  // Email not confirmed
  if (
    errorMessage.includes("email not confirmed") ||
    errorMessage.includes("confirm your email")
  ) {
    return {
      type: "email_not_confirmed",
      message: "Please verify your email before signing in.",
    };
  }

  // User already exists
  if (
    errorMessage.includes("already registered") ||
    errorMessage.includes("user already exists") ||
    errorMessage.includes("duplicate")
  ) {
    return {
      type: "user_already_exists",
      message:
        "An account with this email already exists. Please sign in instead.",
    };
  }

  // Weak password
  if (errorMessage.includes("password") && errorMessage.includes("weak")) {
    return {
      type: "weak_password",
      message: "Password is too weak. Please choose a stronger password.",
    };
  }

  // Invalid email
  if (
    errorMessage.includes("invalid email") ||
    errorMessage.includes("email format")
  ) {
    return {
      type: "invalid_email",
      message: "Please enter a valid email address.",
    };
  }

  // User not found
  if (errorMessage.includes("user not found")) {
    return {
      type: "user_not_found",
      message: "No account found with this email.",
    };
  }

  // Session expired
  if (errorMessage.includes("session") && errorMessage.includes("expired")) {
    return {
      type: "session_expired",
      message: "Your session has expired. Please sign in again.",
    };
  }

  // Network error
  if (
    errorMessage.includes("failed to fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("timeout")
  ) {
    return {
      type: "network_error",
      message: "Network error. Please check your connection and try again.",
    };
  }

  // Default unknown error
  return {
    type: "unknown",
    message:
      error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : "An unexpected error occurred. Please try again.",
  };
}

// Sign up a new user
export async function signUpUser(
  supabase: SupabaseClient,
  formData: SignUpFormData
): Promise<AuthResult<SignUpResult>> {
  try {
    const { error, data } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    // If user was created successfully, upsert their details into the users table
    if (data.user) {
      const { error: upsertError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          full_name: formData.name,
        });

      if (upsertError) {
        console.error("Error upserting user details:", upsertError);
      }
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation = !!(data.user && !data.session);
    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
        requiresEmailConfirmation,
      },
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Sign in with email and password
export async function signInWithPassword(
  supabase: SupabaseClient,
  formData: SignInFormData
): Promise<AuthResult<SignInResult>> {
  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Sign in with OAuth provider (Google)
export async function signInWithOAuth(
  supabase: SupabaseClient,
  provider: "google",
  options?: { redirectTo?: string }
): Promise<AuthResult> {
  try {
    const redirectTo = options?.redirectTo 
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(options.redirectTo)}`
      : `${window.location.origin}/auth/callback`;

    const { error, data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Send magic link to email
export async function sendMagicLink(
  supabase: SupabaseClient,
  email: string,
  shouldCreateUser: boolean = false
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser,
      },
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data: { email },
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  supabase: SupabaseClient,
  email: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data: { email },
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Update user password (when logged in)
export async function updatePassword(
  supabase: SupabaseClient,
  newPassword: string
): Promise<AuthResult> {
  try {
    const { error, data } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Sign out user
export async function signOut(supabase: SupabaseClient): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Resend email confirmation
export async function resendConfirmationEmail(
  supabase: SupabaseClient,
  email: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data: { email },
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}

// Verify OTP (for email confirmation or phone verification)
export async function verifyOTP(
  supabase: SupabaseClient,
  email: string,
  token: string,
  type: "signup" | "recovery" | "email_change" = "signup"
): Promise<AuthResult> {
  try {
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      const parsedError = parseAuthError(error);
      return {
        success: false,
        error: parsedError,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    const parsedError = parseAuthError(error);
    return {
      success: false,
      error: parsedError,
    };
  }
}