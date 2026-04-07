import { NextRequest, NextResponse } from 'next/server';
import { 
  accountingService,
  DEMO_PROFIT_LOSS,
  DEMO_TAX_SUMMARY,
  DEMO_EXPORT_HISTORY,
  DEFAULT_CHART_OF_ACCOUNTS,
  type AccountingExport,
  type ChartOfAccount,
  type ProfitLossData,
  type TaxSummary
} from '@/lib/accounting-export';

// GET - Get accounting data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'pnl'; // pnl, tax, accounts, exports
  const demo = searchParams.get('demo') === 'true';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    switch (type) {
      case 'pnl':
        // Return Profit & Loss data
        const pnlData: ProfitLossData = {
          ...DEMO_PROFIT_LOSS,
          period: {
            start: startDate ? new Date(startDate) : DEMO_PROFIT_LOSS.period.start,
            end: endDate ? new Date(endDate) : DEMO_PROFIT_LOSS.period.end
          }
        };
        
        return NextResponse.json({
          success: true,
          data: pnlData
        });

      case 'tax':
        // Return Tax Summary
        const taxData: TaxSummary = {
          ...DEMO_TAX_SUMMARY,
          period: {
            start: startDate ? new Date(startDate) : DEMO_TAX_SUMMARY.period.start,
            end: endDate ? new Date(endDate) : DEMO_TAX_SUMMARY.period.end
          }
        };
        
        return NextResponse.json({
          success: true,
          data: taxData
        });

      case 'accounts':
        // Return Chart of Accounts
        return NextResponse.json({
          success: true,
          data: DEFAULT_CHART_OF_ACCOUNTS
        });

      case 'exports':
        // Return Export History
        return NextResponse.json({
          success: true,
          data: DEMO_EXPORT_HISTORY
        });

      case 'balance':
        // Return Balance Sheet (simplified for demo)
        return NextResponse.json({
          success: true,
          data: {
            period: {
              start: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1),
              end: endDate ? new Date(endDate) : new Date()
            },
            assets: {
              currentAssets: {
                cash: 45000000,
                accountsReceivable: 8500000,
                inventory: 12500000,
                prepaidExpenses: 2000000,
                total: 68000000
              },
              fixedAssets: {
                equipment: 35000000,
                furniture: 20000000,
                vehicles: 25000000,
                accumulatedDepreciation: -15000000,
                total: 65000000
              },
              totalAssets: 133000000
            },
            liabilities: {
              currentLiabilities: {
                accountsPayable: 12000000,
                accruedExpenses: 5000000,
                shortTermDebt: 8000000,
                total: 25000000
              },
              longTermLiabilities: {
                longTermDebt: 15000000,
                total: 15000000
              },
              totalLiabilities: 40000000
            },
            equity: {
              ownerEquity: 70000000,
              retainedEarnings: 23000000,
              totalEquity: 93000000
            }
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Type non valide. Utilisez: pnl, tax, accounts, exports, balance'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Accounting API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des données comptables'
    }, { status: 500 });
  }
}

// POST - Export data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, dataType, data, startDate, endDate } = body;

    if (!type || !['csv', 'excel', 'quickbooks', 'sage'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Type d\'export non valide. Utilisez: csv, excel, quickbooks, sage'
      }, { status: 400 });
    }

    // Use provided data or demo data
    const exportData = data || (dataType === 'tax' ? DEMO_TAX_SUMMARY : DEMO_PROFIT_LOSS);
    
    // Generate export content
    const content = accountingService.generateExport(type, exportData, dataType || 'pnl');
    
    // Create export record
    const exportRecord: AccountingExport = {
      id: `exp-${Date.now()}`,
      type: type as 'csv' | 'excel' | 'quickbooks' | 'sage',
      dateRange: {
        start: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1),
        end: endDate ? new Date(endDate) : new Date()
      },
      status: 'completed',
      downloadUrl: `/exports/accounting-${type}-${Date.now()}.${type === 'excel' ? 'xml' : type === 'quickbooks' ? 'iif' : type === 'sage' ? 'txt' : 'csv'}`,
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: {
        export: exportRecord,
        content,
        filename: `comptabilite-kfm-delice-${type}-${new Date().toISOString().split('T')[0]}`,
        mimeType: type === 'csv' ? 'text/csv' : type === 'excel' ? 'application/vnd.ms-excel' : 'application/octet-stream'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'export des données'
    }, { status: 500 });
  }
}

// PUT - Update chart of accounts mapping
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, mapping, action } = body;

    if (action === 'add') {
      // Add new account
      const newAccount = accountingService.addAccount({
        code: body.code,
        name: body.name,
        type: body.accountType,
        mapping: body.mapping,
        isActive: true
      });

      return NextResponse.json({
        success: true,
        data: newAccount,
        message: 'Compte ajouté avec succès'
      });
    }

    if (action === 'update' && accountId) {
      // Update account mapping
      const updatedAccount = accountingService.updateAccountMapping(accountId, mapping);

      if (!updatedAccount) {
        return NextResponse.json({
          success: false,
          error: 'Compte non trouvé'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: updatedAccount,
        message: 'Mapping mis à jour avec succès'
      });
    }

    if (action === 'bulk_update' && body.mappings) {
      // Bulk update mappings
      const updatedAccounts: ChartOfAccount[] = [];
      
      for (const mapping of body.mappings) {
        const account = accountingService.updateAccountMapping(mapping.accountId, mapping.mapping);
        if (account) {
          updatedAccounts.push(account);
        }
      }

      return NextResponse.json({
        success: true,
        data: updatedAccounts,
        message: `${updatedAccounts.length} comptes mis à jour`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Action non valide'
    }, { status: 400 });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 });
  }
}
