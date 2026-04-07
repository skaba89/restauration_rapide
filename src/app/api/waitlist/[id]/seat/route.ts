import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Mark waitlist entry as seated
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tableId, tableNumber, serverId, notes } = body;

    // Get the waitlist entry
    const entry = await db.waitlistEntry.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    if (entry.status === 'SEATED' || entry.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: `Cette entrée est déjà ${entry.status === 'SEATED' ? 'installée' : 'annulée'}` },
        { status: 400 }
      );
    }

    // Calculate actual wait time
    const createdAt = new Date(entry.createdAt);
    const seatedAt = new Date();
    const actualWaitMinutes = Math.round((seatedAt.getTime() - createdAt.getTime()) / (1000 * 60));

    // Update entry status to SEATED
    const updatedEntry = await db.waitlistEntry.update({
      where: { id },
      data: {
        status: 'SEATED',
        seatedAt,
        internalNotes: notes ? `${entry.internalNotes || ''}\n${notes}`.trim() : entry.internalNotes,
      },
    });

    // If table is provided, update table status
    if (tableId) {
      try {
        await db.table.update({
          where: { id: tableId },
          data: {
            status: 'OCCUPIED',
            currentPartySize: entry.partySize,
            serverId: serverId || null,
          },
        });
      } catch (tableError) {
        console.error('Error updating table:', tableError);
        // Don't fail the whole request if table update fails
      }
    }

    // Create audit log
    try {
      await db.auditLog.create({
        data: {
          organizationId: entry.restaurant.id,
          action: 'SEAT_WAITLIST',
          entity: 'WaitlistEntry',
          entityId: id,
          newValue: JSON.stringify({
            guestName: entry.guestName,
            partySize: entry.partySize,
            actualWaitMinutes,
            tableId,
            tableNumber,
          }),
        },
      });
    } catch {
      // Ignore audit log errors
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedEntry,
        actualWaitMinutes,
        tableNumber,
      },
      message: 'Client installé avec succès',
    });
  } catch (error) {
    console.error('Error seating waitlist entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'installation du client' },
      { status: 500 }
    );
  }
}
