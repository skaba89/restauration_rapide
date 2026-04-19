/**
 * Accounting Export Service for KFM DELICE
 * Supports CSV, Excel, QuickBooks, and Sage formats
 */

// Types
export interface AccountingExport {
  id: string;
  type: 'csv' | 'excel' | 'quickbooks' | 'sage';
  dateRange: { start: Date; end: Date };
  status: 'pending' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  mapping?: string; // Restaurant category mapping
  parentId?: string;
  isActive: boolean;
}

export interface TaxSummary {
  period: { start: Date; end: Date };
  tvaCollected: number;
  tvaPaid: number;
  netTva: number;
  taxableRevenue: number;
  exemptRevenue: number;
  tvaRate: number;
}

export interface ProfitLossData {
  period: { start: Date; end: Date };
  revenue: {
    foodSales: number;
    beverageSales: number;
    deliveryFees: number;
    serviceCharges: number;
    otherRevenue: number;
    totalRevenue: number;
  };
  costOfGoodsSold: {
    foodCost: number;
    beverageCost: number;
    totalCOGS: number;
  };
  grossProfit: number;
  operatingExpenses: {
    rent: number;
    utilities: number;
    salaries: number;
    marketing: number;
    supplies: number;
    maintenance: number;
    insurance: number;
    other: number;
    totalExpenses: number;
  };
  netProfit: number;
  previousPeriod?: ProfitLossData;
}

export interface BalanceSheetData {
  period: { start: Date; end: Date };
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      total: number;
    };
    fixedAssets: {
      equipment: number;
      furniture: number;
      vehicles: number;
      accumulatedDepreciation: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      accruedExpenses: number;
      shortTermDebt: number;
      total: number;
    };
    longTermLiabilities: {
      longTermDebt: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    ownerEquity: number;
    retainedEarnings: number;
    totalEquity: number;
  };
}

// Standard African Chart of Accounts (OHADA compatible)
export const DEFAULT_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // Assets (Classes 1-2-3)
  { id: '1', code: '10', name: 'Capital', type: 'equity', isActive: true },
  { id: '2', code: '12', name: 'Résultat de l\'exercice', type: 'equity', isActive: true },
  { id: '3', code: '16', name: 'Emprunts et dettes assimilées', type: 'liability', isActive: true },
  { id: '4', code: '21', name: 'Immobilisations incorporelles', type: 'asset', isActive: true },
  { id: '5', code: '22', name: 'Terrains', type: 'asset', isActive: true },
  { id: '6', code: '23', name: 'Bâtiments', type: 'asset', isActive: true },
  { id: '7', code: '24', name: 'Matériel et outillage', type: 'asset', isActive: true },
  { id: '8', code: '25', name: 'Matériel de transport', type: 'asset', isActive: true },
  { id: '9', code: '26', name: 'Mobilier et matériel de bureau', type: 'asset', isActive: true },
  { id: '10', code: '28', name: 'Amortissements', type: 'asset', isActive: true },
  { id: '11', code: '31', name: 'Stocks de marchandises', type: 'asset', isActive: true },
  { id: '12', code: '32', name: 'Stocks de matières premières', type: 'asset', isActive: true },
  { id: '13', code: '40', name: 'Fournisseurs', type: 'liability', isActive: true },
  { id: '14', code: '41', name: 'Clients', type: 'asset', isActive: true },
  { id: '15', code: '42', name: 'Personnel', type: 'liability', isActive: true },
  { id: '16', code: '44', name: 'État et collectivités publiques', type: 'liability', isActive: true },
  { id: '17', code: '48', name: 'Comptes de régularisation', type: 'liability', isActive: true },
  { id: '18', code: '52', name: 'Banques', type: 'asset', isActive: true },
  { id: '19', code: '57', name: 'Caisse', type: 'asset', isActive: true },
  { id: '20', code: '58', name: 'Ajustements et virements internes', type: 'asset', isActive: true },
  // Revenue & Expenses (Classes 6-7-8)
  { id: '21', code: '60', name: 'Achats et variations de stocks', type: 'expense', isActive: true },
  { id: '22', code: '61', name: 'Transports', type: 'expense', isActive: true },
  { id: '23', code: '62', name: 'Services extérieurs', type: 'expense', isActive: true },
  { id: '24', code: '63', name: 'Impôts et taxes', type: 'expense', isActive: true },
  { id: '25', code: '64', name: 'Charges de personnel', type: 'expense', isActive: true },
  { id: '26', code: '65', name: 'Autres charges', type: 'expense', isActive: true },
  { id: '27', code: '66', name: 'Charges financières', type: 'expense', isActive: true },
  { id: '28', code: '67', name: 'Charges exceptionnelles', type: 'expense', isActive: true },
  { id: '29', code: '68', name: 'Dotations aux amortissements', type: 'expense', isActive: true },
  { id: '30', code: '70', name: 'Ventes de marchandises', type: 'revenue', isActive: true, mapping: 'food_sales' },
  { id: '31', code: '701', name: 'Ventes de plats', type: 'revenue', isActive: true, mapping: 'food_sales' },
  { id: '32', code: '702', name: 'Ventes de boissons', type: 'revenue', isActive: true, mapping: 'beverage_sales' },
  { id: '33', code: '706', name: 'Services rendus', type: 'revenue', isActive: true, mapping: 'delivery_fees' },
  { id: '34', code: '707', name: 'Frais de livraison', type: 'revenue', isActive: true, mapping: 'delivery_fees' },
  { id: '35', code: '708', name: 'Frais de service', type: 'revenue', isActive: true, mapping: 'service_charges' },
  { id: '36', code: '71', name: 'Production stockée', type: 'revenue', isActive: true },
  { id: '37', code: '72', name: 'Production immobilisée', type: 'revenue', isActive: true },
  { id: '38', code: '74', name: 'Subventions d\'exploitation', type: 'revenue', isActive: true },
  { id: '39', code: '75', name: 'Autres produits', type: 'revenue', isActive: true },
  { id: '40', code: '76', name: 'Produits financiers', type: 'revenue', isActive: true },
  { id: '41', code: '77', name: 'Produits exceptionnels', type: 'revenue', isActive: true },
  { id: '42', code: '78', name: 'Transferts de charges', type: 'revenue', isActive: true },
  // TVA Accounts
  { id: '43', code: '4421', name: 'TVA collectée', type: 'liability', isActive: true },
  { id: '44', code: '4422', name: 'TVA déductible', type: 'asset', isActive: true },
  { id: '45', code: '4427', name: 'TVA à payer', type: 'liability', isActive: true },
];

// Restaurant category mappings
export const CATEGORY_MAPPINGS = {
  'food_sales': { accountCode: '701', accountName: 'Ventes de plats' },
  'beverage_sales': { accountCode: '702', accountName: 'Ventes de boissons' },
  'delivery_fees': { accountCode: '707', accountName: 'Frais de livraison' },
  'service_charges': { accountCode: '708', accountName: 'Frais de service' },
  'food_cost': { accountCode: '601', accountName: 'Achats de denrées alimentaires' },
  'beverage_cost': { accountCode: '602', accountName: 'Achats de boissons' },
  'salaries': { accountCode: '641', accountName: 'Rémunérations du personnel' },
  'rent': { accountCode: '622', accountName: 'Locations' },
  'utilities': { accountCode: '624', accountName: 'Eau et électricité' },
  'marketing': { accountCode: '625', accountName: 'Publicité' },
  'supplies': { accountCode: '604', accountName: 'Fournitures' },
  'tips': { accountCode: '658', accountName: 'Pourboires' },
};

export const defaultProfitLoss: ProfitLossData = {
  period: { 
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  },
  revenue: {
    foodSales: 87500000,
    beverageSales: 28500000,
    deliveryFees: 4500000,
    serviceCharges: 3200000,
    otherRevenue: 1200000,
    totalRevenue: 124900000
  },
  costOfGoodsSold: {
    foodCost: 26250000,
    beverageCost: 8550000,
    totalCOGS: 34800000
  },
  grossProfit: 90100000,
  operatingExpenses: {
    rent: 15000000,
    utilities: 3500000,
    salaries: 32000000,
    marketing: 4500000,
    supplies: 2800000,
    maintenance: 1500000,
    insurance: 2000000,
    other: 1200000,
    totalExpenses: 62500000
  },
  netProfit: 27600000,
  previousPeriod: {
    period: { 
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 0)
    },
    revenue: {
      foodSales: 82000000,
      beverageSales: 26800000,
      deliveryFees: 3800000,
      serviceCharges: 2900000,
      otherRevenue: 1000000,
      totalRevenue: 116500000
    },
    costOfGoodsSold: {
      foodCost: 24600000,
      beverageCost: 8040000,
      totalCOGS: 32640000
    },
    grossProfit: 83860000,
    operatingExpenses: {
      rent: 15000000,
      utilities: 3200000,
      salaries: 30000000,
      marketing: 3800000,
      supplies: 2500000,
      maintenance: 1200000,
      insurance: 2000000,
      other: 1000000,
      totalExpenses: 58700000
    },
    netProfit: 25160000
  }
};

export const defaultTaxSummary: TaxSummary = {
  period: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  },
  tvaCollected: 22482000,
  tvaPaid: 6264000,
  netTva: 16218000,
  taxableRevenue: 124900000,
  exemptRevenue: 0,
  tvaRate: 18
};

export const defaultExports: AccountingExport[] = [
  {
    id: 'exp-001',
    type: 'csv',
    dateRange: { start: new Date(2024, 0, 1), end: new Date(2024, 2, 31) },
    status: 'completed',
    downloadUrl: '/exports/accounting-q1-2024.csv',
    createdAt: new Date(2024, 3, 5)
  },
  {
    id: 'exp-002',
    type: 'excel',
    dateRange: { start: new Date(2024, 0, 1), end: new Date(2024, 2, 31) },
    status: 'completed',
    downloadUrl: '/exports/accounting-q1-2024.xlsx',
    createdAt: new Date(2024, 3, 3)
  },
  {
    id: 'exp-003',
    type: 'quickbooks',
    dateRange: { start: new Date(2024, 0, 1), end: new Date(2024, 2, 31) },
    status: 'failed',
    createdAt: new Date(2024, 3, 1)
  },
];

// Format currency with dynamic currency code
export const formatGNF = (amount: number, currency: string = 'GNF'): string => {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
};

// Format date for exports
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate CSV content
export function generateCSV(data: ProfitLossData | TaxSummary, type: 'pnl' | 'tax' = 'pnl'): string {
  const rows: string[][] = [];
  
  if (type === 'pnl') {
    const pnl = data as ProfitLossData;
    rows.push(['Compte de Résultat - KFM DELICE']);
    rows.push(['Période', `${formatDate(pnl.period.start)} - ${formatDate(pnl.period.end)}`]);
    rows.push([]);
    rows.push(['REVENUS']);
    rows.push(['Ventes de plats', pnl.revenue.foodSales]);
    rows.push(['Ventes de boissons', pnl.revenue.beverageSales]);
    rows.push(['Frais de livraison', pnl.revenue.deliveryFees]);
    rows.push(['Frais de service', pnl.revenue.serviceCharges]);
    rows.push(['Autres revenus', pnl.revenue.otherRevenue]);
    rows.push(['Total Revenus', pnl.revenue.totalRevenue]);
    rows.push([]);
    rows.push(['COÛT DES MARCHANDISES VENDUES']);
    rows.push(['Coût des aliments', pnl.costOfGoodsSold.foodCost]);
    rows.push(['Coût des boissons', pnl.costOfGoodsSold.beverageCost]);
    rows.push(['Total COGS', pnl.costOfGoodsSold.totalCOGS]);
    rows.push([]);
    rows.push(['MARGE BRUTE', pnl.grossProfit]);
    rows.push([]);
    rows.push(['CHARGES D\'EXPLOITATION']);
    rows.push(['Loyer', pnl.operatingExpenses.rent]);
    rows.push(['Services publics', pnl.operatingExpenses.utilities]);
    rows.push(['Salaires', pnl.operatingExpenses.salaries]);
    rows.push(['Marketing', pnl.operatingExpenses.marketing]);
    rows.push(['Fournitures', pnl.operatingExpenses.supplies]);
    rows.push(['Maintenance', pnl.operatingExpenses.maintenance]);
    rows.push(['Assurance', pnl.operatingExpenses.insurance]);
    rows.push(['Autres', pnl.operatingExpenses.other]);
    rows.push(['Total Charges', pnl.operatingExpenses.totalExpenses]);
    rows.push([]);
    rows.push(['RÉSULTAT NET', pnl.netProfit]);
  } else {
    const tax = data as TaxSummary;
    rows.push(['Résumé Fiscal - KFM DELICE']);
    rows.push(['Période', `${formatDate(tax.period.start)} - ${formatDate(tax.period.end)}`]);
    rows.push([]);
    rows.push(['TVA COLLECTÉE', tax.tvaCollected]);
    rows.push(['TVA DÉDUCTIBLE', tax.tvaPaid]);
    rows.push(['TVA NETTE À PAYER', tax.netTva]);
    rows.push([]);
    rows.push(['Chiffre d\'affaires taxable', tax.taxableRevenue]);
    rows.push(['Chiffre d\'affaires exonéré', tax.exemptRevenue]);
    rows.push(['Taux TVA', `${tax.tvaRate}%`]);
  }
  
  return rows.map(row => row.join(',')).join('\n');
}

// Generate Excel-compatible XML (for basic Excel support without libraries)
export function generateExcelXML(data: ProfitLossData | TaxSummary, type: 'pnl' | 'tax' = 'pnl'): string {
  const csvContent = generateCSV(data, type);
  const rows = csvContent.split('\n');
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Comptabilité">
    <Table>
`;
  
  for (const row of rows) {
    xml += '      <Row>\n';
    const cells = row.split(',');
    for (const cell of cells) {
      const isNumber = !isNaN(parseFloat(cell)) && cell.trim() !== '';
      if (isNumber) {
        xml += `        <Cell><Data ss:Type="Number">${cell}</Data></Cell>\n`;
      } else {
        xml += `        <Cell><Data ss:Type="String">${cell}</Data></Cell>\n`;
      }
    }
    xml += '      </Row>\n';
  }
  
  xml += `    </Table>
  </Worksheet>
</Workbook>`;
  
  return xml;
}

// Generate QuickBooks IIF format
export function generateQuickBooksIIF(data: ProfitLossData): string {
  const pnl = data as ProfitLossData;
  const lines: string[] = [];
  
  // Header
  lines.push('!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  lines.push('!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  lines.push('!ENDTRNS');
  
  // Revenue transaction
  const today = formatDate(new Date());
  lines.push(`TRNS\t1\tGENERAL JOURNAL\t${today}\t701\t\t\t${pnl.revenue.totalRevenue}\t\tRevenus période`);
  
  // Split lines for each revenue category
  lines.push(`SPL\t1\tGENERAL JOURNAL\t${today}\t701\t\t\t-${pnl.revenue.foodSales}\t\tVentes de plats`);
  lines.push(`SPL\t2\tGENERAL JOURNAL\t${today}\t702\t\t\t-${pnl.revenue.beverageSales}\t\tVentes de boissons`);
  lines.push(`SPL\t3\tGENERAL JOURNAL\t${today}\t707\t\t\t-${pnl.revenue.deliveryFees}\t\tFrais de livraison`);
  lines.push(`SPL\t4\tGENERAL JOURNAL\t${today}\t708\t\t\t-${pnl.revenue.serviceCharges}\t\tFrais de service`);
  
  // COGS
  lines.push(`SPL\t5\tGENERAL JOURNAL\t${today}\t601\t\t\t${pnl.costOfGoodsSold.foodCost}\t\tCoût des aliments`);
  lines.push(`SPL\t6\tGENERAL JOURNAL\t${today}\t602\t\t\t${pnl.costOfGoodsSold.beverageCost}\t\tCoût des boissons`);
  
  // Expenses
  lines.push(`SPL\t7\tGENERAL JOURNAL\t${today}\t622\t\t\t${pnl.operatingExpenses.rent}\t\tLoyer`);
  lines.push(`SPL\t8\tGENERAL JOURNAL\t${today}\t624\t\t\t${pnl.operatingExpenses.utilities}\t\tServices publics`);
  lines.push(`SPL\t9\tGENERAL JOURNAL\t${today}\t641\t\t\t${pnl.operatingExpenses.salaries}\t\tSalaires`);
  lines.push(`SPL\t10\tGENERAL JOURNAL\t${today}\t625\t\t\t${pnl.operatingExpenses.marketing}\t\tMarketing`);
  
  lines.push('ENDTRNS');
  
  return lines.join('\n');
}

// Generate Sage export format
export function generateSageExport(data: ProfitLossData): string {
  const pnl = data as ProfitLossData;
  const lines: string[] = [];
  
  // Sage header
  lines.push('J;1;' + formatDate(new Date()) + ';E;KFM DELICE;;;');
  
  // Revenue entries
  lines.push(`E;701;Ventes de plats;;${pnl.revenue.foodSales};;;`);
  lines.push(`E;702;Ventes de boissons;;${pnl.revenue.beverageSales};;;`);
  lines.push(`E;707;Frais de livraison;;${pnl.revenue.deliveryFees};;;`);
  lines.push(`E;708;Frais de service;;${pnl.revenue.serviceCharges};;;`);
  
  // COGS entries
  lines.push(`E;601;Achats alimentaires;${pnl.costOfGoodsSold.foodCost};;;;`);
  lines.push(`E;602;Achats boissons;${pnl.costOfGoodsSold.beverageCost};;;;`);
  
  // Expense entries
  lines.push(`E;622;Loyer;${pnl.operatingExpenses.rent};;;;`);
  lines.push(`E;624;Services publics;${pnl.operatingExpenses.utilities};;;;`);
  lines.push(`E;641;Salaires;${pnl.operatingExpenses.salaries};;;;`);
  lines.push(`E;625;Marketing;${pnl.operatingExpenses.marketing};;;;`);
  
  return lines.join('\n');
}

// Calculate tax
export function calculateTax(amount: number, rate: number = 18): number {
  return Math.round(amount * (rate / 100));
}

// Calculate net VAT
export function calculateNetVAT(tvaCollected: number, tvaPaid: number): number {
  return tvaCollected - tvaPaid;
}

// Get file extension for export type
export function getFileExtension(type: 'csv' | 'excel' | 'quickbooks' | 'sage'): string {
  const extensions: Record<string, string> = {
    csv: '.csv',
    excel: '.xml',
    quickbooks: '.iif',
    sage: '.txt'
  };
  return extensions[type] || '.txt';
}

// Get MIME type for export
export function getMimeType(type: 'csv' | 'excel' | 'quickbooks' | 'sage'): string {
  const mimeTypes: Record<string, string> = {
    csv: 'text/csv',
    excel: 'application/vnd.ms-excel',
    quickbooks: 'application/octet-stream',
    sage: 'text/plain'
  };
  return mimeTypes[type] || 'application/octet-stream';
}

// Accounting service class
export class AccountingService {
  private chartOfAccounts: ChartOfAccount[] = DEFAULT_CHART_OF_ACCOUNTS;
  
  getChartOfAccounts(): ChartOfAccount[] {
    return this.chartOfAccounts;
  }
  
  getAccountByCode(code: string): ChartOfAccount | undefined {
    return this.chartOfAccounts.find(a => a.code === code);
  }
  
  getAccountByMapping(mapping: string): ChartOfAccount | undefined {
    return this.chartOfAccounts.find(a => a.mapping === mapping);
  }
  
  addAccount(account: Omit<ChartOfAccount, 'id'>): ChartOfAccount {
    const newAccount: ChartOfAccount = {
      ...account,
      id: `acc-${Date.now()}`
    };
    this.chartOfAccounts.push(newAccount);
    return newAccount;
  }
  
  updateAccountMapping(id: string, mapping: string): ChartOfAccount | undefined {
    const account = this.chartOfAccounts.find(a => a.id === id);
    if (account) {
      account.mapping = mapping;
    }
    return account;
  }
  
  generateExport(type: 'csv' | 'excel' | 'quickbooks' | 'sage', data: ProfitLossData | TaxSummary, dataType: 'pnl' | 'tax'): string {
    switch (type) {
      case 'csv':
        return generateCSV(data, dataType);
      case 'excel':
        return generateExcelXML(data, dataType);
      case 'quickbooks':
        return generateQuickBooksIIF(data as ProfitLossData);
      case 'sage':
        return generateSageExport(data as ProfitLossData);
      default:
        return generateCSV(data, dataType);
    }
  }
  
  calculateProfitLoss(orders: Array<{ subtotal: number; tip: number; deliveryFee: number; serviceCharge: number }>): Omit<ProfitLossData, 'period' | 'previousPeriod'> {
    const foodSales = orders.reduce((sum, o) => sum + o.subtotal * 0.75, 0);
    const beverageSales = orders.reduce((sum, o) => sum + o.subtotal * 0.25, 0);
    const deliveryFees = orders.reduce((sum, o) => sum + o.deliveryFee, 0);
    const serviceCharges = orders.reduce((sum, o) => sum + o.serviceCharge, 0);
    
    const totalRevenue = foodSales + beverageSales + deliveryFees + serviceCharges;
    
    // Typical restaurant COGS percentages
    const foodCost = foodSales * 0.30;
    const beverageCost = beverageSales * 0.28;
    const totalCOGS = foodCost + beverageCost;
    
    const grossProfit = totalRevenue - totalCOGS;
    
    return {
      revenue: {
        foodSales,
        beverageSales,
        deliveryFees,
        serviceCharges,
        otherRevenue: 0,
        totalRevenue
      },
      costOfGoodsSold: {
        foodCost,
        beverageCost,
        totalCOGS
      },
      grossProfit,
      operatingExpenses: {
        rent: 0,
        utilities: 0,
        salaries: 0,
        marketing: 0,
        supplies: 0,
        maintenance: 0,
        insurance: 0,
        other: 0,
        totalExpenses: 0
      },
      netProfit: grossProfit
    };
  }
}

// Export singleton instance
export const accountingService = new AccountingService();