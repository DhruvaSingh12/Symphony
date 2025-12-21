"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { signUpSchema, validateData, checkPasswordStrength } from "@/lib/auth/validation";

interface SignUpFormProps {
  supabaseClient: SupabaseClient;
  onClose: () => void;
}

export default function SignUpForm({ supabaseClient, onClose }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { signUp, signInWithProvider, isLoading } = useAuth(supabaseClient, {
    onSuccess: onClose,
  });

  const validateForm = (): boolean => {
    const result = validateData(signUpSchema, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      acceptedTerms: true,
    });

    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    await signUp({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      acceptedTerms: true,
    });
  };

  const handleGoogleSignIn = async () => {
    await signInWithProvider("google");
  };

  const passwordStrength = checkPasswordStrength(password);

  return (
    <form onSubmit={handleSignUp}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="signup-name">Name</FieldLabel>
          <Input
            id="signup-name"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={submitted && !!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={submitted && errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            maxLength={50}
            autoComplete="name"
          />
          {submitted && errors.name && (
            <p id="name-error" className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            placeholder="quivery@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={submitted && !!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={submitted && errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            autoComplete="email"
          />
          {submitted && errors.email && (
            <p id="email-error" className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-invalid={submitted && !!errors.password}
              aria-describedby={password && passwordStrength.isWeak ? "password-hint" : submitted && errors.password ? "password-error" : undefined}
              className={`pr-10 ${submitted && errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && passwordStrength.isWeak && !submitted && (
            <p id="password-hint" className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {passwordStrength.message}
            </p>
          )}
          {submitted && errors.password && (
            <p id="password-error" className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </Field>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-foreground" target="_blank">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground" target="_blank">
            Privacy Policy
          </Link>
        </p>

        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
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