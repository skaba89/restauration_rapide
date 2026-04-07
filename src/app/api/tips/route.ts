import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Types
interface TipResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: string;
  distributionStatus: string;
  distributions: TipDistributionResponse[];
  createdAt: Date;
  staffId?: string;
  staffName?: string;
}

interface TipDistributionResponse {
  id: string;
  tipId: string;
  staffId: string;
  staffName: string;
  amount: number;
  percentage: number;
  hoursWorked?: number;
  distributedAt?: Date;
  status: string;
}

interface DistributionRule {
  id: string;
  method: 'hours' | 'role' | 'equal' | 'custom';
  rolePercentages?: {
    waiter: number;
    kitchen: number;
    delivery: number;
    other: number;
  };
  isActive: boolean;
}

interface StaffTipEarnings {
  staffId: string;
  staffName: string;
  role: string;
  hoursWorked: number;
  tipsEarned: number;
  pendingTips: number;
  paidTips: number;
  tipsPerHour: number;
}

// Demo Data for fallback
const DEMO_TIPS: TipResponse[] = [
  {
    id: 'tip-001',
    orderId: 'ord-001',
    orderNumber: 'ORD-2024-0145',
    amount: 5000,
    method: 'cash',
    distributionStatus: 'distributed',
    distributions: [
      { id: 'dist-001', tipId: 'tip-001', staffId: 'staff-001', staffName: 'Aïssata Traoré', amount: 2500, percentage: 50, hoursWorked: 8, status: 'paid', distributedAt: new Date() },
      { id: 'dist-002', tipId: 'tip-001', staffId: 'staff-002', staffName: 'Moussa Bamba', amount: 2500, percentage: 50, hoursWorked: 8, status: 'paid', distributedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'tip-002',
    orderId: 'ord-002',
    orderNumber: 'ORD-2024-0144',
    amount: 10000,
    method: 'mobile_money',
    distributionStatus: 'pending',
    distributions: [],
    createdAt: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: 'tip-003',
    orderId: 'ord-003',
    orderNumber: 'ORD-2024-0143',
    amount: 7500,
    method: 'cash',
    distributionStatus: 'distributed',
    distributions: [
      { id: 'dist-003', tipId: 'tip-003', staffId: 'staff-003', staffName: 'Mariama Sy', amount: 5000, percentage: 67, hoursWorked: 4, status: 'paid', distributedAt: new Date() },
      { id: 'dist-004', tipId: 'tip-003', staffId: 'staff-004', staffName: 'Ibrahim Koné', amount: 2500, percentage: 33, hoursWorked: 8, status: 'paid', distributedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'tip-004',
    orderId: 'ord-004',
    orderNumber: 'ORD-2024-0142',
    amount: 15000,
    method: 'cash',
    distributionStatus: 'pending',
    distributions: [],
    staffId: 'staff-001',
    staffName: 'Aïssata Traoré',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: 'tip-005',
    orderId: 'ord-005',
    orderNumber: 'ORD-2024-0141',
    amount: 8000,
    method: 'mobile_money',
    distributionStatus: 'distributed',
    distributions: [
      { id: 'dist-005', tipId: 'tip-005', staffId: 'staff-005', staffName: 'Fatoumata Diallo', amount: 4000, percentage: 50, hoursWorked: 6, status: 'paid', distributedAt: new Date() },
      { id: 'dist-006', tipId: 'tip-005', staffId: 'staff-006', staffName: 'Seydou Konaté', amount: 4000, percentage: 50, hoursWorked: 6, status: 'paid', distributedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 'tip-006',
    orderId: 'ord-006',
    orderNumber: 'ORD-2024-0140',
    amount: 12000,
    method: 'card',
    distributionStatus: 'pending',
    distributions: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: 'tip-007',
    orderId: 'ord-007',
    orderNumber: 'ORD-2024-0139',
    amount: 6500,
    method: 'cash',
    distributionStatus: 'distributed',
    distributions: [
      { id: 'dist-007', tipId: 'tip-007', staffId: 'staff-007', staffName: 'Amadou Keita', amount: 6500, percentage: 100, hoursWorked: 10, status: 'paid', distributedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: 'tip-008',
    orderId: 'ord-008',
    orderNumber: 'ORD-2024-0138',
    amount: 9000,
    method: 'cash',
    distributionStatus: 'pending',
    distributions: [],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: 'tip-009',
    orderId: 'ord-009',
    orderNumber: 'ORD-2024-0137',
    amount: 20000,
    method: 'mobile_money',
    distributionStatus: 'distributed',
    distributions: [
      { id: 'dist-008', tipId: 'tip-009', staffId: 'staff-001', staffName: 'Aïssata Traoré', amount: 6667, percentage: 33.3, hoursWorked: 8, status: 'paid', distributedAt: new Date() },
      { id: 'dist-009', tipId: 'tip-009', staffId: 'staff-002', staffName: 'Moussa Bamba', amount: 6667, percentage: 33.3, hoursWorked: 8, status: 'paid', distributedAt: new Date() },
      { id: 'dist-010', tipId: 'tip-009', staffId: 'staff-003', staffName: 'Mariama Sy', amount: 6666, percentage: 33.3, hoursWorked: 4, status: 'paid', distributedAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 'tip-010',
    orderId: 'ord-010',
    orderNumber: 'ORD-2024-0136',
    amount: 3500,
    method: 'cash',
    distributionStatus: 'pending',
    distributions: [],
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000)
  },
];

const DEMO_DISTRIBUTION_RULES: DistributionRule[] = [
  {
    id: 'rule-001',
    method: 'role',
    rolePercentages: {
      waiter: 50,
      kitchen: 25,
      delivery: 20,
      other: 5
    },
    isActive: true
  },
  {
    id: 'rule-002',
    method: 'hours',
    isActive: false
  },
  {
    id: 'rule-003',
    method: 'equal',
    isActive: false
  }
];

const DEMO_STAFF_EARNINGS: StaffTipEarnings[] = [
  { staffId: 'staff-001', staffName: 'Aïssata Traoré', role: 'waiter', hoursWorked: 168, tipsEarned: 13917, pendingTips: 0, paidTips: 13917, tipsPerHour: 83 },
  { staffId: 'staff-002', staffName: 'Moussa Bamba', role: 'waiter', hoursWorked: 168, tipsEarned: 17167, pendingTips: 0, paidTips: 17167, tipsPerHour: 102 },
  { staffId: 'staff-003', staffName: 'Mariama Sy', role: 'kitchen', hoursWorked: 84, tipsEarned: 11416, pendingTips: 0, paidTips: 11416, tipsPerHour: 136 },
  { staffId: 'staff-004', staffName: 'Ibrahim Koné', role: 'kitchen', hoursWorked: 168, tipsEarned: 12500, pendingTips: 0, paidTips: 12500, tipsPerHour: 74 },
  { staffId: 'staff-005', staffName: 'Fatoumata Diallo', role: 'delivery', hoursWorked: 126, tipsEarned: 9500, pendingTips: 0, paidTips: 9500, tipsPerHour: 75 },
  { staffId: 'staff-006', staffName: 'Seydou Konaté', role: 'delivery', hoursWorked: 126, tipsEarned: 9500, pendingTips: 0, paidTips: 9500, tipsPerHour: 75 },
  { staffId: 'staff-007', staffName: 'Amadou Keita', role: 'waiter', hoursWorked: 200, tipsEarned: 15000, pendingTips: 0, paidTips: 15000, tipsPerHour: 75 },
];

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
  const demo = searchParams.get('demo') === 'true';

  try {
    // Use demo data if demo=true or no organizationId
    if (demo || !organizationId) {
      return getDemoResponse(type, staffId, status, startDate, endDate, limit);
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

// Demo response helper
function getDemoResponse(
  type: string,
  staffId: string | null,
  status: string | null,
  startDate: string | null,
  endDate: string | null,
  limit: number
) {
  switch (type) {
    case 'tips': {
      let filteredTips = [...DEMO_TIPS];

      if (status && status !== 'all') {
        filteredTips = filteredTips.filter(t => t.distributionStatus === status);
      }
      if (staffId) {
        filteredTips = filteredTips.filter(t =>
          t.staffId === staffId || t.distributions.some(d => d.staffId === staffId)
        );
      }
      if (startDate) {
        const start = new Date(startDate);
        filteredTips = filteredTips.filter(t => t.createdAt >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        filteredTips = filteredTips.filter(t => t.createdAt <= end);
      }

      const totalTips = filteredTips.reduce((sum, t) => sum + t.amount, 0);
      const pendingTips = filteredTips.filter(t => t.distributionStatus === 'pending').reduce((sum, t) => sum + t.amount, 0);
      const distributedTips = filteredTips.filter(t => t.distributionStatus === 'distributed').reduce((sum, t) => sum + t.amount, 0);

      return NextResponse.json({
        success: true,
        data: filteredTips.slice(0, limit),
        stats: {
          total: totalTips,
          pending: pendingTips,
          distributed: distributedTips,
          count: filteredTips.length,
          pendingCount: filteredTips.filter(t => t.distributionStatus === 'pending').length,
          distributedCount: filteredTips.filter(t => t.distributionStatus === 'distributed').length
        }
      });
    }

    case 'distributions': {
      const allDistributions = DEMO_TIPS.flatMap(t => t.distributions);
      return NextResponse.json({
        success: true,
        data: allDistributions
      });
    }

    case 'policy': {
      return NextResponse.json({
        success: true,
        data: {
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
      let earnings = [...DEMO_STAFF_EARNINGS];

      const pendingDistributions = DEMO_TIPS
        .filter(t => t.distributionStatus === 'pending')
        .flatMap(t => {
          const staffCount = DEMO_STAFF_EARNINGS.length;
          return DEMO_STAFF_EARNINGS.map(s => ({
            staffId: s.staffId,
            amount: Math.round(t.amount / staffCount)
          }));
        });

      const pendingByStaff = pendingDistributions.reduce((acc, d) => {
        acc[d.staffId] = (acc[d.staffId] || 0) + d.amount;
        return acc;
      }, {} as Record<string, number>);

      earnings = earnings.map(e => ({
        ...e,
        pendingTips: pendingByStaff[e.staffId] || 0
      }));

      if (staffId) {
        earnings = earnings.filter(e => e.staffId === staffId);
      }

      return NextResponse.json({
        success: true,
        data: earnings,
        totalPending: Object.values(pendingByStaff).reduce((sum, v) => sum + v, 0)
      });
    }

    case 'stats': {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonthTips = DEMO_TIPS.filter(t => t.createdAt >= startOfMonth);
      const lastMonthTips = DEMO_TIPS.filter(t => {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return t.createdAt >= lastMonth && t.createdAt <= endOfLastMonth;
      });

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
          byMethod: {
            cash: DEMO_TIPS.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.amount, 0),
            mobile_money: DEMO_TIPS.filter(t => t.method === 'mobile_money').reduce((sum, t) => sum + t.amount, 0),
            card: DEMO_TIPS.filter(t => t.method === 'card').reduce((sum, t) => sum + t.amount, 0)
          },
          pendingDistribution: DEMO_TIPS.filter(t => t.distributionStatus === 'pending').reduce((sum, t) => sum + t.amount, 0)
        }
      });
    }

    default:
      return NextResponse.json({
        success: false,
        error: 'Type non valide. Utilisez: tips, distributions, policy, earnings, stats'
      }, { status: 400 });
  }
}

// POST - Record new tip or distribute tips
export async function POST(request: NextRequest) {
  try {
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
        // Return demo response
        const pendingTips = DEMO_TIPS.filter(t => t.distributionStatus === 'pending');

        if (pendingTips.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Aucun pourboire en attente de distribution'
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            distributedCount: pendingTips.length,
            totalDistributed: pendingTips.reduce((sum, t) => sum + t.amount, 0)
          },
          message: `${pendingTips.length} pourboires distribués avec succès`
        });
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
