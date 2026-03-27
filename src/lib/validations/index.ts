// Validation schemas index
// All Zod validation schemas for API input validation

export * from './auth';
export * from './order';
export * from './menu';
export * from './reservation';
export * from './payment';

// Generic validation helpers
import { z } from 'zod';

// Phone number validation for African countries
export const africanPhoneSchema = z.string().refine(
  (val) => {
    // Remove all non-numeric characters
    const cleaned = val.replace(/\D/g, '');
    // Check if it's a valid length (8-15 digits)
    return cleaned.length >= 8 && cleaned.length <= 15;
  },
  { message: 'Numero de telephone invalide' }
);

// Email validation with common domains check
export const emailSchema = z.string().email('Email invalide');

// Password strength validation
export const strongPasswordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractere special');

// Currency amount validation
export const currencyAmountSchema = z.number().positive().multipleOf(0.01);

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ID validation
export const idSchema = z.string().min(1, 'L\'ID est requis');

// Date range schema
export const dateRangeSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  { message: 'La date de debut doit etre anterieure a la date de fin', path: ['dateFrom'] }
);

// Search query schema
export const searchSchema = z.string().min(1).max(100);

// African country codes
export const africanCountryCodes = [
  'CI', // Cote d'Ivoire
  'SN', // Senegal
  'ML', // Mali
  'BF', // Burkina Faso
  'GN', // Guinea
  'CM', // Cameroon
  'TG', // Togo
  'BJ', // Benin
  'NE', // Niger
  'CD', // DR Congo
  'MG', // Madagascar
  'KE', // Kenya
  'NG', // Nigeria
  'GH', // Ghana
  'RW', // Rwanda
  'UG', // Uganda
  'TZ', // Tanzania
  'ZA', // South Africa
  'MA', // Morocco
  'EG', // Egypt
] as const;

export const africanCountrySchema = z.enum(africanCountryCodes);

// Supported African currencies
export const africanCurrencyCodes = [
  'XOF', // CFA Franc BCEAO
  'XAF', // CFA Franc BEAC
  'GNF', // Guinean Franc
  'KES', // Kenyan Shilling
  'NGN', // Nigerian Naira
  'GHS', // Ghanaian Cedi
  'CDF', // Congolese Franc
  'MGA', // Malagasy Ariary
  'ZAR', // South African Rand
  'MAD', // Moroccan Dirham
  'EGP', // Egyptian Pound
  'RWF', // Rwandan Franc
  'UGX', // Ugandan Shilling
  'TZS', // Tanzanian Shilling
] as const;

export const africanCurrencySchema = z.enum(africanCurrencyCodes);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type AfricanCountryCode = z.infer<typeof africanCountrySchema>;
export type AfricanCurrencyCode = z.infer<typeof africanCurrencySchema>;
