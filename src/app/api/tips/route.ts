import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// GET - List tips with filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'tips';
  const organizationId = searchParams.get('organizationId');
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    // Use database
    switch (type) {
      case 'tips': {
        const where: Record<string, unknown> = { organizationId };
        
        if (status && status !== 'all') {
          where.status = status;
        }
        if (staffId) {
          where.staffId = staffId;
        }
        if (startDate) {
          where.collectedAt = { ...(where.collectedAt as object), gte: new Date(startDate) };
        }
        if (endDate) {
          where.collectedAt = { ...(where.collectedAt as object), lte: new Date(endDate) };
        }

        const tips = await db.tip.findMany({
          where,
          include: {
            distributions: true
          },
          orderBy: { collectedAt: 'desc' },
          take: limit
        });

        // Get order numbers for tips
        const tipsWithOrderNumbers = await Promise.all(
          tips.map(async (tip) => {
            let orderNumber = 'N/A';
            if (tip.orderId) {
              const order = await db.order.findUnique({
                where: { id: tip.orderId },
                select: { orderNumber: true }
              });
              orderNumber = order?.orderNumber || 'N/A';
            }
            return {
              ...tip,
              orderNumber,
              distributionStatus: tip.status
            };
          })
        );

        // Calculate stats
        const totalTips = tips.reduce((sum, t) => sum + t.amount, 0);
        const pendingTips = tips.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
        const distributedTips = tips.filter(t => t.status === 'distributed' || t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);

        return NextResponse.json({
          success: true,
          data: tipsWithOrderNumbers,
          stats: {
            total: totalTips,
            pending: pendingTips,
            distributed: distributedTips,
            count: tips.length,
            pendingCount: tips.filter(t => t.status === 'pending').length,
            distributedCount: tips.filter(t => t.status !== 'pending').length
          }
        });
      }

      case 'distributions': {
        const distributions = await db.tipDistribution.findMany({
          where: staffId ? { staffId } : undefined,
          include: {
            tip: {
              select: {
                organizationId: true,
                amount: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        return NextResponse.json({
          success: true,
          data: distributions
        });
      }

      case 'policy': {
        const policy = await db.tipPolicy.findUnique({
          where: { organizationId }
        });

        return NextResponse.json({
          success: true,
          data: policy || {
            type: 'pool',
            serverPercentage: 60,
            kitchenPercentage: 25,
            busserPercentage: 10,
            otherPercentage: 5,
            payoutSchedule: 'weekly',
            payoutDay: 5,
            includeInPayroll: true,
            autoDistribute: false,
            minimumTipAmount: 1000,
            cashTipsOnly: false
          }
        });
      }

      case 'earnings': {
        // Get all staff for the organization
        const staff = await db.staffProfile.findMany({
          where: { organizationId, isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        });

        // Get distributions for each staff
        const earnings = await Promise.all(
          staff.map(async (s) => {
            const distributions = await db.tipDistribution.findMany({
              where: { staffId: s.id }
            });

            const paidTips = distributions
              .filter(d => d.status === 'paid')
              .reduce((sum, d) => sum + d.amount, 0);

            const pendingTips = distributions
              .filter(d => d.status === 'pending')
              .reduce((sum, d) => sum + d.amount, 0);

            return {
              staffId: s.id,
              staffName: `${s.firstName} ${s.lastName}`,
              role: s.role,
              hoursWorked: 160, // Default for now
              tipsEarned: paidTips,
              pendingTips,
              paidTips,
              tipsPerHour: Math.round(paidTips / 160)
            };
          })
        );

        return NextResponse.json({
          success: true,
          data: earnings
        });
      }

      case 'stats': {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthTips = await db.tip.findMany({
          where: {
            organizationId,
            collectedAt: { gte: startOfMonth }
          }
        });

        const lastMonthTips = await db.tip.findMany({
          where: {
            organizationId,
            collectedAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          }
        });

        const allTips = await db.tip.findMany({
          where: { organizationId }
        });

        const byMethod = {
          cash: allTips.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.amount, 0),
          mobile_money: allTips.filter(t => t.method === 'mobile_money').reduce((sum, t) => sum + t.amount, 0),
          card: allTips.filter(t => t.method === 'card').reduce((sum, t) => sum + t.amount, 0)
        };

        return NextResponse.json({
          success: true,
          data: {
            thisMonth: {
              total: thisMonthTips.reduce((sum, t) => sum + t.amount, 0),
              count: thisMonthTips.length,
              average: thisMonthTips.length > 0
                ? Math.round(thisMonthTips.reduce((sum, t) => sum + t.amount, 0) / thisMonthTips.length)
                : 0
            },
            lastMonth: {
              total: lastMonthTips.reduce((sum, t) => sum + t.amount, 0),
              count: lastMonthTips.length,
              average: lastMonthTips.length > 0
                ? Math.round(lastMonthTips.reduce((sum, t) => sum + t.amount, 0) / lastMonthTips.length)
                : 0
            },
            byMethod,
            pendingDistribution: allTips.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)
          }
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Type non valide. Utilisez: tips, distributions, policy, earnings, stats'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Tips API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des données'
    }, { status: 500 });
  }
}

// POST - Record new tip or distribute tips
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, organizationId, restaurantId, orderId, amount, method, staffId, notes, distributionMethod } = body;

    if (action === 'record') {
      if (!organizationId) {
        return NextResponse.json({
          success: false,
          error: 'ID organisation requis'
        }, { status: 400 });
      }

      if (!amount || amount <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Le montant du pourboire doit être supérieur à 0'
        }, { status: 400 });
      }

      // Create tip in database
      const tip = await db.tip.create({
        data: {
          organizationId,
          restaurantId,
          orderId,
          staffId,
          amount,
          method: method || 'cash',
          status: 'pending',
          notes
        }
      });

      // Update order tip if orderId provided
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { tip: amount }
        });
      }

      return NextResponse.json({
        success: true,
        data: tip,
        message: 'Pourboire enregistré avec succès'
      });
    }

    if (action === 'distribute') {
      if (!organizationId) {
        return NextResponse.json({
          success: false,
          error: 'ID organisation requis'
        }, { status: 400 });
      }

      // Get pending tips
      const pendingTips = await db.tip.findMany({
        where: {
          organizationId,
          status: 'pending'
        }
      });

      if (pendingTips.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Aucun pourboire en attente de distribution'
        }, { status: 400 });
      }

      // Get staff
      const staff = await db.staffProfile.findMany({
        where: { organizationId, isActive: true }
      });

      if (staff.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Aucun personnel disponible pour la distribution'
        }, { status: 400 });
      }

      // Get tip policy
      const policy = await db.tipPolicy.findUnique({
        where: { organizationId }
      });

      const totalToDistribute = pendingTips.reduce((sum, t) => sum + t.amount, 0);

      // Create distributions
      for (const tip of pendingTips) {
        const amountPerStaff = Math.round(tip.amount / staff.length);

        for (const s of staff) {
          let distributionAmount = amountPerStaff;

          if (distributionMethod === 'role' && policy) {
            const roleMultiplier = s.role === 'waiter' ? policy.serverPercentage / 100 :
                                  s.role === 'kitchen' ? policy.kitchenPercentage / 100 :
                                  s.role === 'delivery' ? policy.busserPercentage / 100 :
                                  policy.otherPercentage / 100;
            distributionAmount = Math.round(tip.amount * roleMultiplier / staff.filter(st => st.role === s.role).length || 1);
          }

          await db.tipDistribution.create({
            data: {
              tipId: tip.id,
              staffId: s.id,
              amount: distributionAmount,
              percentage: (distributionAmount / tip.amount) * 100,
              role: s.role,
              status: 'pending'
            }
          });
        }

        // Update tip status
        await db.tip.update({
          where: { id: tip.id },
          data: {
            status: 'distributed',
            distributedAt: new Date()
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          distributedCount: pendingTips.length,
          totalDistributed: totalToDistribute
        },
        message: `${pendingTips.length} pourboires distribués avec succès`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Action non valide. Utilisez: record, distribute'
    }, { status: 400 });
  } catch (error) {
    console.error('Tips POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement'
    }, { status: 500 });
  }
}

// PUT - Update tip distribution or settings
export async function PUT(request: NextRequest) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, tipId, distributionId, organizationId, staffId, amount, policyUpdates } = body;

    if (action === 'update_distribution') {
      if (!distributionId || !amount) {
        return NextResponse.json({
          success: false,
          error: 'ID distribution et montant requis'
        }, { status: 400 });
      }

      const distribution = await db.tipDistribution.update({
        where: { id: distributionId },
        data: { amount }
      });

      return NextResponse.json({
        success: true,
        data: distribution,
        message: 'Distribution mise à jour avec succès'
      });
    }

    if (action === 'update_policy') {
      if (!organizationId) {
        return NextResponse.json({
          success: false,
          error: 'ID organisation requis'
        }, { status: 400 });
      }

      const existingPolicy = await db.tipPolicy.findUnique({
        where: { organizationId }
      });

      let policy;
      if (existingPolicy) {
        policy = await db.tipPolicy.update({
          where: { organizationId },
          data: policyUpdates
        });
      } else {
        policy = await db.tipPolicy.create({
          data: {
            organizationId,
            ...policyUpdates
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: policy,
        message: 'Politique mise à jour avec succès'
      });
    }

    if (action === 'mark_paid') {
      if (!staffId && !distributionId) {
        return NextResponse.json({
          success: false,
          error: 'ID staff ou distribution requis'
        }, { status: 400 });
      }

      const where = distributionId
        ? { id: distributionId }
        : { staffId, status: 'pending' };

      const result = await db.tipDistribution.updateMany({
        where,
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} distributions marquées comme payées`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Action non valide'
    }, { status: 400 });
  } catch (error) {
    console.error('Tips PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 });
  }
}
