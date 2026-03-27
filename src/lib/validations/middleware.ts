import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { apiError } from '@/lib/api-responses';

/**
 * Validates request body against a Zod schema
 * Returns parsed data or error response
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      
      return {
        error: NextResponse.json(
          {
            success: false,
            error: 'Erreur de validation',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }
    
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Erreur de parsing JSON',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 * Returns parsed data or error response
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { data: T } | { error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const queryObject: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });
    
    const data = schema.parse(queryObject);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      
      return {
        error: NextResponse.json(
          {
            success: false,
            error: 'Erreur de validation des parametres',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }
    
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Erreur de parsing des parametres',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates both body and query parameters
 */
export async function validateRequest<TBody, TQuery>(
  request: NextRequest,
  bodySchema: ZodSchema<TBody>,
  querySchema: ZodSchema<TQuery>
): Promise<
  { body: TBody; query: TQuery } | { error: NextResponse }
> {
  const queryResult = validateQuery(request, querySchema);
  if ('error' in queryResult) {
    return queryResult;
  }
  
  const bodyResult = await validateBody(request, bodySchema);
  if ('error' in bodyResult) {
    return bodyResult;
  }
  
  return {
    body: bodyResult.data,
    query: queryResult.data,
  };
}

/**
 * Creates a validation wrapper for API route handlers
 */
export function withValidation<TBody>(
  schema: ZodSchema<TBody>,
  handler: (request: NextRequest, data: TBody) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const result = await validateBody(request, schema);
    
    if ('error' in result) {
      return result.error;
    }
    
    return handler(request, result.data);
  };
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  for (const err of error.errors) {
    const field = err.path.join('.') || '_root';
    if (!formatted[field]) {
      formatted[field] = [];
    }
    formatted[field].push(err.message);
  }
  
  return formatted;
}

/**
 * Common validation patterns
 */
export const commonValidations = {
  // CUID format for IDs
  cuid: /^[a-z0-9]{25}$/,
  
  // Phone number patterns by country
  phonePatterns: {
    CI: /^(\+225|225)?[0-9]{8,10}$/,  // Cote d'Ivoire
    SN: /^(\+221|221)?[0-9]{9}$/,      // Senegal
    ML: /^(\+223|223)?[0-9]{8}$/,      // Mali
    BF: /^(\+226|226)?[0-9]{8}$/,      // Burkina Faso
    GN: /^(\+224|224)?[0-9]{9}$/,      // Guinea
    NG: /^(\+234|234)?[0-9]{10}$/,     // Nigeria
    GH: /^(\+233|233)?[0-9]{9}$/,      // Ghana
    KE: /^(\+254|254)?[0-9]{9,10}$/,   // Kenya
  },
  
  // Email validation
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Time format (HH:mm)
  time: /^([01]\d|2[0-3]):([0-5]\d)$/,
  
  // Date format (YYYY-MM-DD)
  date: /^\d{4}-\d{2}-\d{2}$/,
};

/**
 * Validate phone number for a specific country
 */
export function validatePhoneForCountry(phone: string, countryCode: string): boolean {
  const pattern = commonValidations.phonePatterns[countryCode as keyof typeof commonValidations.phonePatterns];
  if (!pattern) {
    // Default: just check if it's 8-15 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15;
  }
  return pattern.test(phone.replace(/\s/g, ''));
}
