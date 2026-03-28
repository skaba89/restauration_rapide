import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum([
  'SUPER_ADMIN',
  'ORG_ADMIN',
  'ORG_MANAGER',
  'RESTAURANT_ADMIN',
  'RESTAURANT_MANAGER',
  'STAFF',
  'KITCHEN',
  'DRIVER',
  'CUSTOMER',
  'SUPPORT',
]);

// Login schema
export const loginSchema = z.object({
  action: z.literal('login'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(8, 'Numero de telephone invalide').optional(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
}).refine(
  (data) => data.email || data.phone,
  { message: 'Email ou telephone est requis', path: ['email'] }
);

// Register schema
export const registerSchema = z.object({
  action: z.literal('register'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numero de telephone invalide').optional(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z.string().min(2, 'Le prenom doit contenir au moins 2 caracteres').optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').optional(),
  role: userRoleSchema.optional().default('CUSTOMER'),
});

// OTP request schema
export const otpRequestSchema = z.object({
  action: z.literal('request-otp'),
  type: z.enum(['LOGIN', 'REGISTER', 'VERIFY_PHONE', 'VERIFY_EMAIL', 'RESET_PASSWORD', 'VERIFY_PAYMENT']).default('LOGIN'),
  phone: z.string().min(8, 'Numero de telephone inval').optional(),
  email: z.string().email('Email invalide').optional(),
}).refine(
  (data) => data.phone || data.email,
  { message: 'Telephone ou email est requis', path: ['phone'] }
);

// OTP verify schema
export const otpVerifySchema = z.object({
  action: z.literal('verify-otp'),
  type: z.enum(['LOGIN', 'REGISTER', 'VERIFY_PHONE', 'VERIFY_EMAIL', 'RESET_PASSWORD', 'VERIFY_PAYMENT']).default('LOGIN'),
  otpCode: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
  phone: z.string().min(8, 'Numero de telephone inval').optional(),
  email: z.string().email('Email invalide').optional(),
}).refine(
  (data) => data.phone || data.email,
  { message: 'Telephone ou email est requis', path: ['phone'] }
);

// Refresh token schema
export const refreshTokenSchema = z.object({
  action: z.literal('refresh'),
  refreshToken: z.string().min(1, 'Refresh token est requis'),
});

// Update password schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Le mot de passe actuel est requis'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
});

// Combined auth action schema
export const authActionSchema = z.discriminatedUnion('action', [
  loginSchema,
  registerSchema,
  otpRequestSchema,
  otpVerifySchema,
  refreshTokenSchema,
]);

// Session validation schema
export const sessionSchema = z.object({
  token: z.string().min(1, 'Token est requis'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type AuthActionInput = z.infer<typeof authActionSchema>;
