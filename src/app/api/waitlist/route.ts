import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WaitlistStatus } from '@prisma/client';

// Demo data for waitlist
const DEMO_WAITLIST = [
  {
    id: 'demo-1',
    guestName: 'Koné Ibrahim',
    guestPhone: '+224 62 345 67 89',
    partySize: 4,
    preferredArea: 'Terrasse',
    specialRequests: 'Table près de la fenêtre',
    status: 'WAITING',
    priority: 0,
    estimatedWait: 15,
    quotedWait: 20,
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    notifiedAt: null,
    seatedAt: null,
    cancelledAt: null,
  },
  {
    id: 'demo-2',
    guestName: 'Diallo Fatou',
    guestPhone: '+224 62 234 56 78',
    partySize: 2,
    preferredArea: 'Intérieur',
    specialRequests: null,
    status: 'WAITING',
    priority: 0,
    estimatedWait: 25,
    quotedWait: 30,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    notifiedAt: null,
    seatedAt: null,
    cancelledAt: null,
  },
  {
    id: 'demo-3',
    guestName: 'Touré Amadou',
    guestPhone: '+224 62 123 45 67',
    partySize: 6,
    preferredArea: 'VIP',
    specialRequests: 'Anniversaire - gâteau à apporter',
    status: 'NOTIFIED',
    priority: 1,
    estimatedWait: 35,
    quotedWait: 40,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    notifiedAt: new Date(Date.now() - 5 * 60 * 1000),
    seatedAt: null,
    cancelledAt: null,
  },
  {
    id: 'demo-4',
    guestName: 'Bamba Seydou',
    guestPhone: '+224 62 456 78 90',
    partySize: 3,
    preferredArea: null,
    specialRequests: null,
    status: 'WAITING',
    priority: 0,
    estimatedWait: 10,
    quotedWait: 15,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    notifiedAt: null,
    seatedAt: null,
    cancelledAt: null,
  },
  {
    id: 'demo-5',
    guestName: 'Sylla Aïssata',
    guestPhone: '+224 62 567 89 01',
    partySize: 5,
    preferredArea: 'Terrasse',
    specialRequests: 'Chaise haute pour bébé',
    status: 'WAITING',
    priority: 1,
    estimatedWait: 45,
    quotedWait: 50,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    notifiedAt: null,
    seatedAt: null,
    cancelledAt: null,
  },
  {
    id: 'demo-6',
    guestName: 'Kouassi Yao',
    guestPhone: '+224 62 678 90 12',
    partySize: 2,
    preferredArea: 'Intérieur',
    specialRequests: null,
    status: 'SEATED',
    priority: 0,
    estimatedWait: 0,
    quotedWait: 15,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    notifiedAt: new Date(Date.now() - 30 * 60 * 1000),
    seatedAt: new Date(Date.now() - 10 * 60 * 1000),
    cancelledAt: null,
  },
  {
    id: 'demo-7',
    guestName: 'Traoré Moussa',
    guestPhone: '+224 62 789 01 23',
    partySize: 4,
    preferredArea: null,
    specialRequests: 'Végétarien',
    status: 'CANCELLED',
    priority: 0,
    estimatedWait: 0,
    quotedWait: 25,
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    notifiedAt: null,
    seatedAt: null,
    cancelledAt: new Date(Date.now() - 50 * 60 * 1000),
  },
  {
    id: 'demo-8',
    guestName: 'Kone Mariam',
    guestPhone: '+224 62 890 12 34',
    partySize: 8,
    preferredArea: 'VIP',
    specialRequests: 'Réunion d\'affaires, espace privé',
    status: 'WAITING',
    priority: 2,
    estimatedWait: 20,
    quotedWait: 25,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    notifiedAt: null,
    seatedAt: null,
    cancelledAt: null,
  },
];

// GET - List waitlist entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const demo = searchParams.get('demo') === 'true';
    const status = searchParams.get('status') as WaitlistStatus | null;

    // Return demo data if requested or no restaurantId
    if (demo || !restaurantId) {
      let filteredData = [...DEMO_WAITLIST];
      
      if (status) {
        filteredData = filteredData.filter(entry => entry.status === status);
      }

      // Sort by createdAt
      filteredData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Calculate stats
      const stats = {
        totalWaiting: filteredData.filter(e => e.status === 'WAITING').length,
        totalNotified: filteredData.filter(e => e.status === 'NOTIFIED').length,
        totalSeated: filteredData.filter(e => e.status === 'SEATED').length,
        totalCancelled: filteredData.filter(e => e.status === 'CANCELLED').length,
        averageWaitTime: Math.round(
          filteredData
            .filter(e => e.status === 'WAITING' || e.status === 'NOTIFIED')
            .reduce((sum, e) => sum + (e.estimatedWait || 0), 0) / 
          Math.max(1, filteredData.filter(e => e.status === 'WAITING' || e.status === 'NOTIFIED').length)
        ),
        currentEstimatedWait: filteredData
          .filter(e => e.status === 'WAITING')
          .reduce((max, e) => Math.max(max, e.estimatedWait || 0), 0),
      };

      return NextResponse.json({
        success: true,
        data: filteredData,
        stats,
      });
    }

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
      demo = false,
    } = body;

    // Validation
    if (!guestName || !guestPhone || !partySize) {
      return NextResponse.json(
        { success: false, error: 'Le nom, téléphone et nombre de personnes sont requis' },
        { status: 400 }
      );
    }

    // Demo mode - return mock response
    if (demo || !restaurantId) {
      const newEntry = {
        id: `demo-${Date.now()}`,
        guestName,
        guestPhone,
        partySize,
        preferredArea,
        specialRequests,
        status: 'WAITING',
        priority,
        estimatedWait: quotedWait || 15,
        quotedWait: quotedWait || 15,
        createdAt: new Date(),
        notifiedAt: null,
        seatedAt: null,
        cancelledAt: null,
      };

      return NextResponse.json({
        success: true,
        data: newEntry,
        message: 'Client ajouté à la liste d\'attente',
      });
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
    const { id, status, tableAssigned, demo = false, restaurantId } = body;

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

    // Demo mode
    if (demo || !restaurantId) {
      const now = new Date();
      const updates: any = { status };
      
      if (status === 'NOTIFIED') {
        updates.notifiedAt = now;
      } else if (status === 'SEATED') {
        updates.seatedAt = now;
      } else if (status === 'CANCELLED') {
        updates.cancelledAt = now;
      }

      return NextResponse.json({
        success: true,
        data: { id, ...updates },
        message: getStatusMessage(status),
      });
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
    const demo = searchParams.get('demo') === 'true';
    const restaurantId = searchParams.get('restaurantId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      );
    }

    // Demo mode
    if (demo || !restaurantId) {
      return NextResponse.json({
        success: true,
        message: 'Client retiré de la liste d\'attente',
      });
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
