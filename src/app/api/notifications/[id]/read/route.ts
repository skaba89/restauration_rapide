import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Restaurant OS - Mark Notification as Read
// PATCH /api/notifications/[id]/read
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In production, update in database
    // await prisma.notification.update({
    //   where: { id },
    //   data: { read: true }
    // });

    console.log(`[Notification] Marked as read: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Notification marquée comme lue',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
