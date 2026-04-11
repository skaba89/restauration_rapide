import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WaitlistStatus } from '@prisma/client';

// GET - Get a single waitlist entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await db.waitlistEntry.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            phone: true,
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

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error fetching waitlist entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'entrée' },
      { status: 500 }
    );
  }
}

// PUT - Update a waitlist entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      guestName,
      guestPhone,
      partySize,
      preferredArea,
      specialRequests,
      priority,
      estimatedWait,
      quotedWait,
      internalNotes,
    } = body;

    // Check if entry exists
    const existingEntry = await db.waitlistEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (guestName !== undefined) updateData.guestName = guestName;
    if (guestPhone !== undefined) updateData.guestPhone = guestPhone;
    if (partySize !== undefined) updateData.partySize = partySize;
    if (preferredArea !== undefined) updateData.preferredArea = preferredArea;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
    if (priority !== undefined) updateData.priority = priority;
    if (estimatedWait !== undefined) updateData.estimatedWait = estimatedWait;
    if (quotedWait !== undefined) updateData.quotedWait = quotedWait;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const entry = await db.waitlistEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Entrée mise à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a waitlist entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if entry exists
    const existingEntry = await db.waitlistEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Entrée non trouvée' },
        { status: 404 }
      );
    }

    await db.waitlistEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client retiré de la liste d\'attente',
    });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
