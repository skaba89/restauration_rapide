import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TipMethod, TipDistributionStatus } from '@prisma/client';

// POST - Add tip to an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { amount, method, staffId, notes, organizationId, restaurantId } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Le montant du pourboire doit être supérieur à 0'
      }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'ID organisation requis'
      }, { status: 400 });
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Commande non trouvée'
      }, { status: 404 });
    }

    // Check if tip already exists for this order
    const existingTip = await db.tip.findFirst({
      where: { orderId }
    });

    if (existingTip) {
      return NextResponse.json({
        success: false,
        error: 'Un pourboire existe déjà pour cette commande'
      }, { status: 400 });
    }

    // Create the tip
    const tip = await db.tip.create({
      data: {
        organizationId,
        restaurantId: restaurantId || order.restaurantId,
        orderId,
        staffId: staffId || order.serverId,
        amount,
        currency: 'GNF',
        method: method || 'cash',
        status: 'pending',
        notes
      },
      include: {
        distributions: true
      }
    });

    // Update the order's tip amount
    await db.order.update({
      where: { id: orderId },
      data: {
        tip: amount,
        total: order.total + amount
      }
    });

    return NextResponse.json({
      success: true,
      data: tip,
      message: 'Pourboire ajouté avec succès'
    });
  } catch (error) {
    console.error('Error adding tip:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'ajout du pourboire'
    }, { status: 500 });
  }
}

// GET - Get tip for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const tip = await db.tip.findFirst({
      where: { orderId },
      include: {
        distributions: true
      }
    });

    if (!tip) {
      return NextResponse.json({
        success: false,
        error: 'Aucun pourboire trouvé pour cette commande'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: tip
    });
  } catch (error) {
    console.error('Error fetching tip:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération du pourboire'
    }, { status: 500 });
  }
}
