import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { smsService } from '@/lib/sms';

// POST - Send SMS notification to waitlist entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, customMessage } = body;

    // Get the waitlist entry with restaurant info
    const entry = await db.waitlistEntry.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            name: true,
            phone: true,
            waitlistSettings: true,
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

    if (entry.status !== 'WAITING') {
      return NextResponse.json(
        { success: false, error: 'Seules les entrées en attente peuvent être notifiées' },
        { status: 400 }
      );
    }

    // Prepare SMS message
    const smsMessage = customMessage || message || 
      `🍽️ ${entry.restaurant.name}\n\n` +
      `Bonjour ${entry.guestName},\n\n` +
      `Votre table est presque prête !\n` +
      `Temps d'attente estimé: ${entry.quotedWait || entry.estimatedWait || 15} minutes\n\n` +
      `Merci de votre patience!`;

    // Send SMS
    const smsResponse = await smsService.send({
      to: entry.guestPhone,
      message: smsMessage,
    });

    if (!smsResponse.success) {
      console.error('SMS failed:', smsResponse.error);
      // Still mark as notified even if SMS fails (for demo purposes)
    }

    // Update entry status to NOTIFIED
    const updatedEntry = await db.waitlistEntry.update({
      where: { id },
      data: {
        status: 'NOTIFIED',
        notifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      sms: {
        sent: smsResponse.success,
        messageId: smsResponse.messageId,
        error: smsResponse.error,
      },
      message: 'Client notifié avec succès',
    });
  } catch (error) {
    console.error('Error notifying waitlist entry:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la notification' },
      { status: 500 }
    );
  }
}
