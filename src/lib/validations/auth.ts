import { z } from 'zod'

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .transform(email => email.toLowerCase().trim())

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number')

// Basic password schema for less strict validation
export const basicPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(128, 'Password must be less than 128 characters')

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .transform(name => name.trim())

// OTP validation schema
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers')

// Sign up validation schema
export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: basicPasswordSchema
})

// Sign in validation schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// OTP verification schema
export const otpVerificationSchema = z.object({
  email: emailSchema,
  code: otpSchema,
  purpose: z.enum(['email_verification', 'password_reset']).optional().default('email_verification')
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema
})

// Password reset completion schema
export const passwordResetSchema = z.object({
  email: emailSchema,
  code: otpSchema,
  newPassword: basicPasswordSchema
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional()
    .transform(phone => phone?.replace(/\D/g, '')),
  dateOfBirth: z.string()
    .transform(date => new Date(date))
    .optional()
})

// Address validation schema
export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  name: z.string().min(1, 'Address name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  placeId: z.string().optional(),
  isDefault: z.boolean().optional().default(false)
})

// Change password schema (for authenticated users)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: basicPasswordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Change email schema
export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Password is required for email change')
})

// Validation helper functions
export function validateSignUp(data: unknown) {
  return signUpSchema.safeParse(data)
}

export function validateSignIn(data: unknown) {
  return signInSchema.safeParse(data)
}

export function validateOTPVerification(data: unknown) {
  return otpVerificationSchema.safeParse(data)
}

export function validatePasswordResetRequest(data: unknown) {
  return passwordResetRequestSchema.safeParse(data)
}

export function validatePasswordReset(data: unknown) {
  return passwordResetSchema.safeParse(data)
}

export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data)
}

export function validateAddress(data: unknown) {
  return addressSchema.safeParse(data)
}

export function validateChangePassword(data: unknown) {
  return changePasswordSchema.safeParse(data)
}

export function validateChangeEmail(data: unknown) {
  return changeEmailSchema.safeParse(data)
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 2
  } else if (password.length >= 6) {
    score += 1
    feedback.push('Password should be at least 8 characters long')
  } else {
    feedback.push('Password is too short')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add lowercase letters')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add uppercase letters')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Add numbers')
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add special characters (!@#$%^&*)')
  }

  const isStrong = score >= 4 && password.length >= 8

  return {
    score,
    feedback,
    isStrong
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '') // Only allow word chars, @, ., -
}

// Rate limiting types
export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
}

export const RATE_LIMITS = {
  signin: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  otpGeneration: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 OTPs per hour
  otpVerification: { maxAttempts: 10, windowMs: 10 * 60 * 1000 }, // 10 attempts per 10 minutes
} as const
