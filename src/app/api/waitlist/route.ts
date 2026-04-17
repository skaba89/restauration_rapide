import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WaitlistStatus } from '@prisma/client';

// GET - List waitlist entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status') as WaitlistStatus | null;

    // Real database query
    const where: any = { restaurantId };
    if (status) {
      where.status = status;
    }

    const entries = await db.waitlistEntry.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalWaiting: entries.filter(e => e.status === 'WAITING').length,
      totalNotified: entries.filter(e => e.status === 'NOTIFIED').length,
      totalSeated: entries.filter(e => e.status === 'SEATED').length,
      totalCancelled: entries.filter(e => e.status === 'CANCELLED').length,
      averageWaitTime: Math.round(
        entries
          .filter(e => e.status === 'WAITING' || e.status === 'NOTIFIED')
          .reduce((sum, e) => sum + (e.estimatedWait || 0), 0) / 
        Math.max(1, entries.filter(e => e.status === 'WAITING' || e.status === 'NOTIFIED').length)
      ),
      currentEstimatedWait: entries
        .filter(e => e.status === 'WAITING')
        .reduce((max, e) => Math.max(max, e.estimatedWait || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: entries,
      stats,
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la liste d\'attente' },
      { status: 500 }
    );
  }
}

// POST - Add to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      guestName,
      guestPhone,
      partySize,
      preferredArea,
      specialRequests,
      priority = 0,
      quotedWait,
    } = body;

    // Validation
    if (!guestName || !guestPhone || !partySize) {
      return NextResponse.json(
        { success: false, error: 'Le nom, téléphone et nombre de personnes sont requis' },
        { status: 400 }
      );
    }

    // Real database insert
    const entry = await db.waitlistEntry.create({
      data: {
        restaurantId,
        guestName,
        guestPhone,
        partySize,
        preferredArea,
        specialRequests,
        status: 'WAITING',
        priority,
        estimatedWait: quotedWait || 15,
        quotedWait: quotedWait || 15,
      },
    });

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Client ajouté à la liste d\'attente',
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout à la liste d\'attente' },
      { status: 500 }
    );
  }
}

// PUT - Update status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, tableAssigned, restaurantId } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID et statut requis' },
        { status: 400 }
      );
    }

    const validStatuses = ['WAITING', 'NOTIFIED', 'SEATED', 'CANCELLED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Real database update
    const updateData: any = { status };
    
    if (status === 'NOTIFIED') {
      updateData.notifiedAt = new Date();
    } else if (status === 'SEATED') {
      updateData.seatedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    const entry = await db.waitlistEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: entry,
      message: getStatusMessage(status),
    });
  } catch (error) {
    console.error('Error updating waitlist:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const restaurantId = searchParams.get('restaurantId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      );
    }

    // Real database delete
    await db.waitlistEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client retiré de la liste d\'attente',
    });
  } catch (error) {
    console.error('Error deleting from waitlist:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

// Helper function for status messages
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    WAITING: 'Client en attente',
    NOTIFIED: 'Client notifié',
    SEATED: 'Client installé',
    CANCELLED: 'Réservation annulée',
    EXPIRED: 'Réservation expirée',
  };
  return messages[status] || 'Statut mis à jour';
}