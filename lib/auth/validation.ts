import { z } from "zod";

// Sign Up Schema
export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and privacy policy"),
});

// Sign In Schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

// Email Only Schema (for password reset, magic link)
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((val) => val.trim().toLowerCase()),
});

// Password Reset Schema
export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type EmailData = z.infer<typeof emailSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (path) {
          fieldErrors[path] = issue.message;
        }
      });
      return { success: false, errors: fieldErrors };
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
}

export function checkPasswordStrength(password: string): {
  isWeak: boolean;
  message: string;
} {
  if (password.length < 8) {
    return {
      isWeak: true,
      message: "Password is too short (minimum 8 characters)",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isWeak: true,
      message: "Weak password - use uppercase, lowercase, and numbers",
    };
  }

  return { isWeak: false, message: "" };
}