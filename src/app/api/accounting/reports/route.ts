import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-responses';

// GET - Get accounting reports
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'trial-balance';
  const organizationId = searchParams.get('organizationId') || 'kfm-delice';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const periodStart = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
  const periodEnd = endDate ? new Date(endDate) : new Date();

  switch (type) {
    case 'trial-balance':
      return NextResponse.json({
        success: true,
        data: {
          period: { start: periodStart, end: periodEnd },
        },
      });

    case 'balance-sheet':
      return NextResponse.json({
        success: true,
        data: {
          period: { date: periodEnd, year: periodEnd.getFullYear() },
        },
      });

    case 'income-statement':
      return NextResponse.json({
        success: true,
        data: {
          period: { start: periodStart, end: periodEnd },
        },
      });

    case 'tax-summary':
      const taxData = {
        period: { start: periodStart, end: periodEnd },
        tvaCollected: 22482000,
        tvaDeductible: 6264000,
        netTva: 16218000,
        tvaRate: 18,
        taxableRevenue: 124900000,
        exemptRevenue: 0,
        breakdown: [
          { rate: 18, description: 'TVA normale', taxableAmount: 120000000, taxAmount: 21600000 },
          { rate: 9, description: 'TVA réduite', taxableAmount: 4900000, taxAmount: 882000 },
          { rate: 0, description: 'Exonéré', taxableAmount: 0, taxAmount: 0 },
        ],
        payments: [
          { month: 'Janvier', amount: 5200000, status: 'paid' },
          { month: 'Février', amount: 5400000, status: 'paid' },
          { month: 'Mars', amount: 5618000, status: 'pending' },
        ],
      };
      return NextResponse.json({
        success: true,
        data: taxData,
      });

    case 'general-ledger':
      // General Ledger with account movements
      const ledgerData = {
        period: { start: periodStart, end: periodEnd },
        accounts: [].map((acc: any) => ({
          ...acc,
          openingBalance: acc.type === 'ASSET' ? acc.balance * 0.8 : acc.balance * 0.8,
          movements: {
            debit: acc.debit,
            credit: acc.credit,
          },
          closingBalance: acc.balance,
        })),
      };
      return NextResponse.json({
        success: true,
        data: ledgerData,
      });

    case 'aged-receivables':
      const agedReceivables = {
        asOf: periodEnd,
        customers: [
          { name: 'Entreprise ABC', total: 450000, current: 200000, days30: 150000, days60: 100000, days90: 0, over90: 0 },
          { name: 'Hôtel XYZ', total: 350000, current: 350000, days30: 0, days60: 0, days90: 0, over90: 0 },
          { name: 'Société 123', total: 200000, current: 0, days30: 0, days60: 100000, days90: 100000, over90: 0 },
        ],
        summary: {
          total: 1000000,
          current: 550000,
          days30: 150000,
          days60: 200000,
          days90: 100000,
          over90: 0,
        },
      };
      return NextResponse.json({
        success: true,
        data: agedReceivables,
      });

    case 'aged-payables':
      const agedPayables = {
        asOf: periodEnd,
        suppliers: [
          { name: 'Fournisseur Alimentaire SA', total: 800000, current: 500000, days30: 300000, days60: 0, days90: 0, over90: 0 },
          { name: 'Brasserie Locale', total: 500000, current: 300000, days30: 200000, days60: 0, days90: 0, over90: 0 },
          { name: 'Producteur Légumes', total: 200000, current: 0, days30: 100000, days60: 100000, days90: 0, over90: 0 },
        ],
        summary: {
          total: 1500000,
          current: 800000,
          days30: 600000,
          days60: 100000,
          days90: 0,
          over90: 0,
        },
      };
      return NextResponse.json({
        success: true,
        data: agedPayables,
      });

    default:
      return NextResponse.json(
        { success: false, error: 'Type de rapport non valide' },
        { status: 400 }
      );
  }
});