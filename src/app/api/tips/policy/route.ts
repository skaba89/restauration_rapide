import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Default policy
const DEFAULT_POLICY = {
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
};

// GET - Get tip policy for organization
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    const policy = await db.tipPolicy.findUnique({
      where: { organizationId }
    });

    return NextResponse.json({
      success: true,
      data: policy || DEFAULT_POLICY
    });
  } catch (error) {
    console.error('Policy GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de la politique'
    }, { status: 500 });
  }
}

// PUT - Update or create tip policy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, ...policyData } = body;

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'ID organisation requis'
      }, { status: 400 });
    }

    // Validate percentages
    const total = (policyData.serverPercentage || 0) +
                  (policyData.kitchenPercentage || 0) +
                  (policyData.busserPercentage || 0) +
                  (policyData.otherPercentage || 0);

    if (total !== 100) {
      return NextResponse.json({
        success: false,
        error: `Le total des pourcentages doit être égal à 100% (actuellement ${total}%)`
      }, { status: 400 });
    }

    // Check if policy exists
    const existingPolicy = await db.tipPolicy.findUnique({
      where: { organizationId }
    });

    let policy;
    if (existingPolicy) {
      policy = await db.tipPolicy.update({
        where: { organizationId },
        data: policyData
      });
    } else {
      policy = await db.tipPolicy.create({
        data: {
          organizationId,
          ...policyData
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: policy,
      message: 'Politique de pourboires mise à jour avec succès'
    });
  } catch (error) {
    console.error('Policy PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour de la politique'
    }, { status: 500 });
  }
}

// POST - Create initial policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, ...policyData } = body;

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'ID organisation requis'
      }, { status: 400 });
    }

    // Check if policy already exists
    const existingPolicy = await db.tipPolicy.findUnique({
      where: { organizationId }
    });

    if (existingPolicy) {
      return NextResponse.json({
        success: false,
        error: 'Une politique existe déjà pour cette organisation'
      }, { status: 400 });
    }

    const policy = await db.tipPolicy.create({
      data: {
        organizationId,
        ...DEFAULT_POLICY,
        ...policyData
      }
    });

    return NextResponse.json({
      success: true,
      data: policy,
      message: 'Politique de pourboires créée avec succès'
    });
  } catch (error) {
    console.error('Policy POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la politique'
    }, { status: 500 });
  }
}