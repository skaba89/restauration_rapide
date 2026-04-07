import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Cancel a waitlist entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, cancelledBy } = body;

    // Get the waitlist entry
    const entry = await db.waitlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    if (entry.status === 'SEATED') {
      return NextResponse.json(
        { success: false, error: 'Cette entrée est déjà installée' },
        { status: 400 }
      );
    }

    if (entry.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Cette entrée est déjà annulée' },
        { status: 400 }
      );
    }

    // Update entry status to CANCELLED
    const updatedEntry = await db.waitlistEntry.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        internalNotes: reason 
          ? `${entry.internalNotes || ''}\nRaison annulation: ${reason}`.trim()
          : entry.internalNotes,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Entrée annulée avec succès',
    });
  } catch (error) {
    console.error('Error cancelling waitlist entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}
