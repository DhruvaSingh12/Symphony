"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/hooks/auth/useAuth";
import { signInSchema, emailSchema, validateData } from "@/lib/auth/validation";

interface SignInFormProps {
  supabaseClient: SupabaseClient;
  onClose: () => void;
}

import { useSearchParams } from "next/navigation";

export default function SignInForm({
  supabaseClient,
  onClose,
}: SignInFormProps) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const {
    signIn,
    signInWithProvider,
    sendMagicLinkEmail,
    resetPassword,
    isLoading,
  } = useAuth(supabaseClient, {
    onSuccess: () => {
      if (!showPasswordReset) {
        onClose();
      }
    },
  });

  const validateForm = (): boolean => {
    const result = validateData(signInSchema, {
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  };

  const validateEmailOnly = (): boolean => {
    const result = validateData(emailSchema, {
      email: email.trim().toLowerCase(),
    });

    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    await signIn({
      email: email.trim().toLowerCase(),
      password: password,
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateEmailOnly()) {
      return;
    }

    await sendMagicLinkEmail(email.trim().toLowerCase(), false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateEmailOnly()) {
      return;
    }

    const result = await resetPassword(email.trim().toLowerCase());

    if (result.success) {
      setShowPasswordReset(false);
      setEmail("");
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithProvider("google", {
      redirectTo: nextPath || undefined
    });
  };

  if (showPasswordReset) {
    return (
      <form onSubmit={handlePasswordReset}>
        <FieldGroup>
          <div className="flex flex-col gap-2 text-center mb-2">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground text-balance text-sm">
              Enter your email to receive password reset instructions
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="reset-email">Email</FieldLabel>
            <Input
              id="reset-email"
              type="email"
              placeholder="quivery@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
              autoComplete="email"
              aria-describedby="reset-description"
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </Field>

          <button
            type="button"
            onClick={() => {
              setShowPasswordReset(false);
              setErrors({});
              setSubmitted(false);
            }}
            className="text-sm text-muted-foreground hover:text-foreground text-center w-full underline-offset-2 hover:underline transition-colors"
            disabled={isLoading}
            aria-label="Go back to sign in form"
          >
            Back to sign in
          </button>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignIn}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="signin-email">Email</FieldLabel>
          <Input
            id="signin-email"
            type="email"
            placeholder="quivery@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={submitted && !!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={
              submitted && errors.email
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
            autoComplete="email"
            autoFocus
          />
          {submitted && errors.email && (
            <p
              id="email-error"
              className="text-xs text-red-500 mt-0.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </Field>

        <Field>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel htmlFor="signin-password">Password</FieldLabel>
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              disabled={isLoading}
              aria-label="Reset your password"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-invalid={submitted && !!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`pr-10 ${submitted && errors.password
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
                }`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {submitted && errors.password && (
            <p
              id="password-error"
              className="text-xs text-red-500 mt-0.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </Field>

        <Field>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              "Send Magic Link"
            )}
          </Button>
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}