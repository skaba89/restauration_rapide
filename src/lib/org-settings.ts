// ============================================
// Restaurant OS - Organization Settings Helper
// Get organization settings including currency
// ============================================

import { db } from './db';

export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  currencyId: string | null;
  currency?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
  } | null;
  settings?: {
    loyaltyEnabled: boolean;
    pointsPerAmount: number;
    pointValue: number;
  } | null;
}

/**
 * Get organization with currency info
 */
export async function getOrganizationWithCurrency(organizationId: string): Promise<OrganizationSettings | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      currencyId: true,
      currency: {
        select: {
          id: true,
          code: true,
          name: true,
          symbol: true,
          decimalPlaces: true,
        },
      },
      settings: {
        select: {
          loyaltyEnabled: true,
          pointsPerAmount: true,
          pointValue: true,
        },
      },
    },
  });

  return org;
}

/**
 * Get or create default currency for an organization
 * Returns the currency code to use
 */
export async function getOrganizationCurrencyCode(organizationId: string): Promise<string> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      currencyId: true,
      currency: {
        select: { code: true },
      },
    },
  });

  if (org?.currency?.code) {
    return org.currency.code;
  }

  // Check if there's a currencyId but no currency relation
  if (org?.currencyId) {
    const currency = await db.currency.findUnique({
      where: { id: org.currencyId },
      select: { code: true },
    });
    if (currency?.code) {
      return currency.code;
    }
  }

  // Default to GNF for Guinea (KFM DELICE is in Guinea)
  return 'GNF';
}

/**
 * Get currency ID for an organization, creating default if needed
 */
export async function getOrCreateCurrencyId(organizationId: string): Promise<string> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      currencyId: true,
      currency: {
        select: { id: true },
      },
    },
  });

  if (org?.currency?.id) {
    return org.currency.id;
  }

  if (org?.currencyId) {
    return org.currencyId;
  }

  // Create or get default currency (GNF for Guinea)
  let currency = await db.currency.findFirst({
    where: { code: 'GNF' },
  });

  if (!currency) {
    currency = await db.currency.create({
      data: {
        code: 'GNF',
        name: 'Franc Guinéen',
        symbol: 'GNF',
        decimalPlaces: 0,
        isActive: true,
      },
    });
  }

  // Update organization with currency
  await db.organization.update({
    where: { id: organizationId },
    data: { currencyId: currency.id },
  });

  return currency.id;
}

/**
 * Get default currency code based on environment
 */
export function getDefaultCurrencyCode(): string {
  const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || 'GN';
  
  const countryToCurrency: Record<string, string> = {
    GN: 'GNF', // Guinea
    CI: 'XOF', // Ivory Coast
    SN: 'XOF', // Senegal
    ML: 'XOF', // Mali
    BF: 'XOF', // Burkina Faso
    BJ: 'XOF', // Benin
    NE: 'XOF', // Niger
    TG: 'XOF', // Togo
    GW: 'XOF', // Guinea-Bissau
    CM: 'XAF', // Cameroon
    CF: 'XAF', // Central African Republic
    CG: 'XAF', // Congo
    GA: 'XAF', // Gabon
    GQ: 'XAF', // Equatorial Guinea
    TD: 'XAF', // Chad
    NG: 'NGN', // Nigeria
    GH: 'GHS', // Ghana
    KE: 'KES', // Kenya
    UG: 'UGX', // Uganda
    TZ: 'TZS', // Tanzania
    CD: 'CDF', // DRC
    RW: 'RWF', // Rwanda
    MA: 'MAD', // Morocco
    TN: 'TND', // Tunisia
    EG: 'EGP', // Egypt
    ZA: 'ZAR', // South Africa
  };

  return countryToCurrency[defaultCountry] || 'GNF';
}
