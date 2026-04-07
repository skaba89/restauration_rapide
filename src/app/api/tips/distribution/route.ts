import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo staff data
const DEMO_STAFF = [
  { id: 'staff-001', name: 'Aïssata Traoré', role: 'waiter', hoursWorked: 168 },
  { id: 'staff-002', name: 'Moussa Bamba', role: 'waiter', hoursWorked: 168 },
  { id: 'staff-003', name: 'Mariama Sy', role: 'kitchen', hoursWorked: 84 },
  { id: 'staff-004', name: 'Ibrahim Koné', role: 'kitchen', hoursWorked: 168 },
  { id: 'staff-005', name: 'Fatoumata Diallo', role: 'delivery', hoursWorked: 126 },
  { id: 'staff-006', name: 'Seydou Konaté', role: 'delivery', hoursWorked: 126 },
  { id: 'staff-007', name: 'Amadou Keita', role: 'waiter', hoursWorked: 200 },
];

// GET - Get tip distribution preview or by employee
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const employeeId = searchParams.get('employeeId');
    const demo = searchParams.get('demo') === 'true';

    // Demo mode
    if (demo || !organizationId) {
      const distributions = DEMO_STAFF.map(staff => ({
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        hoursWorked: staff.hoursWorked,
        totalEarned: Math.round(Math.random() * 15000) + 5000,
        pendingAmount: Math.round(Math.random() * 5000),
        paidAmount: Math.round(Math.random() * 10000) + 5000,
      }));

      if (employeeId) {
        const employee = distributions.find(d => d.staffId === employeeId);
        return NextResponse.json({
          success: true,
          data: employee || null
        });
      }

      return NextResponse.json({
        success: true,
        data: distributions
      });
    }

    // Real database query
    const staff = await db.staffProfile.findMany({
      where: { organizationId, isActive: true }
    });

    const distributions = await Promise.all(
      staff.map(async (s) => {
        const tipDistributions = await db.tipDistribution.findMany({
          where: { staffId: s.id }
        });

        const totalEarned = tipDistributions.reduce((sum, d) => sum + d.amount, 0);
        const pendingAmount = tipDistributions
          .filter(d => d.status === 'pending')
          .reduce((sum, d) => sum + d.amount, 0);
        const paidAmount = tipDistributions
          .filter(d => d.status === 'paid')
          .reduce((sum, d) => sum + d.amount, 0);

        return {
          staffId: s.id,
          staffName: `${s.firstName} ${s.lastName}`,
          role: s.role,
          hoursWorked: 160,
          totalEarned,
          pendingAmount,
          paidAmount
        };
      })
    );

    if (employeeId) {
      const employee = distributions.find(d => d.staffId === employeeId);
      return NextResponse.json({
        success: true,
        data: employee || null
      });
    }

    return NextResponse.json({
      success: true,
      data: distributions
    });
  } catch (error) {
    console.error('Distribution GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des distributions'
    }, { status: 500 });
  }
}

// POST - Distribute tips to employees
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, method, periodStart, periodEnd } = body;

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
        error: 'Aucun employé actif trouvé'
      }, { status: 400 });
    }

    // Get tip policy
    const policy = await db.tipPolicy.findUnique({
      where: { organizationId }
    });

    const totalToDistribute = pendingTips.reduce((sum, t) => sum + t.amount, 0);
    const distributions: Array<{
      staffId: string;
      staffName: string;
      amount: number;
      percentage: number;
    }> = [];

    // Calculate distributions based on method
    if (method === 'equal') {
      const amountPerStaff = Math.round(totalToDistribute / staff.length);
      staff.forEach(s => {
        distributions.push({
          staffId: s.id,
          staffName: `${s.firstName} ${s.lastName}`,
          amount: amountPerStaff,
          percentage: (amountPerStaff / totalToDistribute) * 100
        });
      });
    } else if (method === 'role' && policy) {
      // Group staff by role
      const staffByRole = staff.reduce((acc, s) => {
        if (!acc[s.role]) acc[s.role] = [];
        acc[s.role].push(s);
        return acc;
      }, {} as Record<string, typeof staff>);

      Object.entries(staffByRole).forEach(([role, members]) => {
        const rolePercentage = role === 'waiter' ? policy.serverPercentage :
                              role === 'kitchen' ? policy.kitchenPercentage :
                              role === 'delivery' ? policy.busserPercentage :
                              policy.otherPercentage;
        const roleTotal = totalToDistribute * (rolePercentage / 100);
        const perMember = Math.round(roleTotal / members.length);

        members.forEach(s => {
          distributions.push({
            staffId: s.id,
            staffName: `${s.firstName} ${s.lastName}`,
            amount: perMember,
            percentage: (perMember / totalToDistribute) * 100
          });
        });
      });
    } else {
      // Default: equal distribution
      const amountPerStaff = Math.round(totalToDistribute / staff.length);
      staff.forEach(s => {
        distributions.push({
          staffId: s.id,
          staffName: `${s.firstName} ${s.lastName}`,
          amount: amountPerStaff,
          percentage: (amountPerStaff / totalToDistribute) * 100
        });
      });
    }

    // Create distributions in database
    for (const tip of pendingTips) {
      const tipDistributions = distributions.map(d => ({
        tipId: tip.id,
        staffId: d.staffId,
        amount: Math.round(tip.amount * (d.percentage / 100)),
        percentage: d.percentage,
        role: staff.find(s => s.id === d.staffId)?.role || 'other',
        periodStart: periodStart ? new Date(periodStart) : new Date(),
        periodEnd: periodEnd ? new Date(periodEnd) : new Date(),
        status: 'pending'
      }));

      await db.tipDistribution.createMany({
        data: tipDistributions
      });

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
        totalDistributed: totalToDistribute,
        distributions
      },
      message: `${pendingTips.length} pourboires distribués avec succès`
    });
  } catch (error) {
    console.error('Distribution POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la distribution des pourboires'
    }, { status: 500 });
  }
}
