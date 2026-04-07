import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-responses';

// Demo Trial Balance Data
const DEMO_TRIAL_BALANCE = {
  period: {
    start: new Date(2024, 0, 1),
    end: new Date(2024, 2, 31),
  },
  accounts: [
    { code: '57', name: 'Caisse', type: 'ASSET', debit: 2500000, credit: 1250000, balance: 1250000 },
    { code: '52', name: 'Banques', type: 'ASSET', debit: 8500000, credit: 3500000, balance: 5000000 },
    { code: '41', name: 'Clients', type: 'ASSET', debit: 450000, credit: 300000, balance: 150000 },
    { code: '31', name: 'Stocks de marchandises', type: 'ASSET', debit: 2500000, credit: 1800000, balance: 700000 },
    { code: '24', name: 'Matériel et outillage', type: 'ASSET', debit: 15000000, credit: 0, balance: 15000000 },
    { code: '25', name: 'Matériel de transport', type: 'ASSET', debit: 25000000, credit: 0, balance: 25000000 },
    { code: '40', name: 'Fournisseurs', type: 'LIABILITY', debit: 500000, credit: 1800000, balance: -1300000 },
    { code: '42', name: 'Personnel', type: 'LIABILITY', debit: 0, credit: 150000, balance: -150000 },
    { code: '4421', name: 'TVA collectée', type: 'LIABILITY', debit: 0, credit: 22482000, balance: -22482000 },
    { code: '4422', name: 'TVA déductible', type: 'ASSET', debit: 6264000, credit: 0, balance: 6264000 },
    { code: '16', name: 'Emprunts', type: 'LIABILITY', debit: 0, credit: 15000000, balance: -15000000 },
    { code: '10', name: 'Capital', type: 'EQUITY', debit: 0, credit: 50000000, balance: -50000000 },
    { code: '12', name: "Résultat de l'exercice", type: 'EQUITY', debit: 0, credit: 27600000, balance: -27600000 },
    { code: '701', name: 'Ventes de plats', type: 'REVENUE', debit: 0, credit: 87500000, balance: -87500000 },
    { code: '702', name: 'Ventes de boissons', type: 'REVENUE', debit: 0, credit: 28500000, balance: -28500000 },
    { code: '707', name: 'Frais de livraison', type: 'REVENUE', debit: 0, credit: 4500000, balance: -4500000 },
    { code: '708', name: 'Frais de service', type: 'REVENUE', debit: 0, credit: 3200000, balance: -3200000 },
    { code: '601', name: 'Achats denrées alimentaires', type: 'EXPENSE', debit: 26250000, credit: 0, balance: 26250000 },
    { code: '602', name: 'Achats boissons', type: 'EXPENSE', debit: 8550000, credit: 0, balance: 8550000 },
    { code: '64', name: 'Charges de personnel', type: 'EXPENSE', debit: 32000000, credit: 0, balance: 32000000 },
    { code: '622', name: 'Locations', type: 'EXPENSE', debit: 15000000, credit: 0, balance: 15000000 },
    { code: '624', name: 'Eau et électricité', type: 'EXPENSE', debit: 3500000, credit: 0, balance: 3500000 },
    { code: '625', name: 'Publicité', type: 'EXPENSE', debit: 4500000, credit: 0, balance: 4500000 },
    { code: '68', name: 'Dotations aux amortissements', type: 'EXPENSE', debit: 2500000, credit: 0, balance: 2500000 },
  ],
  summary: {
    totalDebit: 159659000,
    totalCredit: 159659000,
    totalAssets: 48664000,
    totalLiabilities: 38932000,
    totalEquity: 77600000,
    totalRevenue: 123700000,
    totalExpenses: 92300000,
    netIncome: 31400000,
  },
};

// Demo Balance Sheet Data
const DEMO_BALANCE_SHEET = {
  period: {
    date: new Date(2024, 2, 31),
    year: 2024,
  },
  assets: {
    currentAssets: {
      cash: 6250000,
      accountsReceivable: 150000,
      inventory: 700000,
      tvaDeductible: 6264000,
      total: 13364000,
    },
    fixedAssets: {
      equipment: 15000000,
      vehicles: 25000000,
      accumulatedDepreciation: -2500000,
      total: 37500000,
    },
    totalAssets: 50864000,
  },
  liabilities: {
    currentLiabilities: {
      accountsPayable: 1300000,
      salariesPayable: 150000,
      tvaCollected: 22482000,
      total: 23932000,
    },
    longTermLiabilities: {
      loans: 15000000,
      total: 15000000,
    },
    totalLiabilities: 38932000,
  },
  equity: {
    capital: 50000000,
    retainedEarnings: 0,
    netIncome: 27600000,
    totalEquity: 77600000,
  },
  totalLiabilitiesAndEquity: 116532000,
};

// Demo Income Statement Data
const DEMO_INCOME_STATEMENT = {
  period: {
    start: new Date(2024, 0, 1),
    end: new Date(2024, 2, 31),
  },
  revenue: {
    foodSales: 87500000,
    beverageSales: 28500000,
    deliveryFees: 4500000,
    serviceCharges: 3200000,
    otherRevenue: 1200000,
    totalRevenue: 124900000,
  },
  costOfGoodsSold: {
    foodCost: 26250000,
    beverageCost: 8550000,
    totalCOGS: 34800000,
  },
  grossProfit: 90100000,
  grossMarginPercent: 72.14,
  operatingExpenses: {
    salaries: 32000000,
    rent: 15000000,
    utilities: 3500000,
    marketing: 4500000,
    supplies: 2800000,
    maintenance: 1500000,
    insurance: 2000000,
    depreciation: 2500000,
    other: 1200000,
    totalExpenses: 65000000,
  },
  operatingIncome: 25100000,
  otherIncome: 2500000,
  earningsBeforeTax: 27600000,
  incomeTax: 0,
  netIncome: 27600000,
  netMarginPercent: 22.1,
};

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
          ...DEMO_TRIAL_BALANCE,
          period: { start: periodStart, end: periodEnd },
        },
      });

    case 'balance-sheet':
      return NextResponse.json({
        success: true,
        data: {
          ...DEMO_BALANCE_SHEET,
          period: { date: periodEnd, year: periodEnd.getFullYear() },
        },
      });

    case 'income-statement':
      return NextResponse.json({
        success: true,
        data: {
          ...DEMO_INCOME_STATEMENT,
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
        accounts: DEMO_TRIAL_BALANCE.accounts.map(acc => ({
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
