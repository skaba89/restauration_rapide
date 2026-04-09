// Seed Reference Data API - Ensures currency and country data exists
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Reference data for Guinea
const REFERENCE_DATA = {
  currencies: [
    { code: 'GNF', name: 'Franc Guinéen', symbol: 'GNF', decimalPlaces: 0 },
    { code: 'XOF', name: 'Franc CFA BCEAO', symbol: 'FCFA', decimalPlaces: 0 },
    { code: 'XAF', name: 'Franc CFA BEAC', symbol: 'FCFA', decimalPlaces: 0 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
    { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  ],
  countries: [
    { code: 'GN', name: 'Guinée', dialCode: '+224', currencyCode: 'GNF' },
    { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', currencyCode: 'XOF' },
    { code: 'SN', name: 'Sénégal', dialCode: '+221', currencyCode: 'XOF' },
    { code: 'ML', name: 'Mali', dialCode: '+223', currencyCode: 'XOF' },
    { code: 'BF', name: 'Burkina Faso', dialCode: '+226', currencyCode: 'XOF' },
  ],
};

// POST - Seed reference data
export async function POST() {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    const results = {
      currencies: { created: 0, existing: 0 },
      countries: { created: 0, existing: 0 },
    };

    // Seed currencies
    for (const currency of REFERENCE_DATA.currencies) {
      const existing = await db.currency.findUnique({ where: { code: currency.code } });
      if (!existing) {
        await db.currency.create({ data: currency });
        results.currencies.created++;
      } else {
        results.currencies.existing++;
      }
    }

    // Seed countries
    for (const country of REFERENCE_DATA.countries) {
      const existing = await db.country.findUnique({ where: { code: country.code } });
      if (!existing) {
        const currency = await db.currency.findUnique({ where: { code: country.currencyCode } });
        await db.country.create({
          data: {
            code: country.code,
            name: country.name,
            dialCode: country.dialCode,
            currencyId: currency?.id || null,
            isActive: true,
          },
        });
        results.countries.created++;
      } else {
        results.countries.existing++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Données de référence initialisées',
      results,
    });
  } catch (error) {
    console.error('Error seeding reference data:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'initialisation',
    }, { status: 500 });
  }
}

// GET - Check reference data status
export async function GET() {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    const currencyCount = await db.currency.count();
    const countryCount = await db.country.count();
    const gnfCurrency = await db.currency.findUnique({ where: { code: 'GNF' } });
    const gnCountry = await db.country.findUnique({ where: { code: 'GN' } });

    return NextResponse.json({
      success: true,
      data: {
        currencies: currencyCount,
        countries: countryCount,
        hasGnfCurrency: !!gnfCurrency,
        hasGnCountry: !!gnCountry,
        needsSeed: currencyCount === 0 || countryCount === 0,
      },
    });
  } catch (error) {
    console.error('Error checking reference data:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la vérification',
    }, { status: 500 });
  }
}
