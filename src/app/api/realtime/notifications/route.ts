import { NextRequest, NextResponse } from 'next/server';
import { triggerEvent, CHANNELS, EVENTS } from '@/lib/pusher-server';

// POST /api/realtime/notifications - Send real-time notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notification } = body;

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, notification' },
        { status: 400 }
      );
    }

    const channel = CHANNELS.USER_NOTIFICATIONS(userId);
    const event = EVENTS.NOTIFICATION_NEW;

    const result = await triggerEvent(channel, event, {
      id: notification.id || crypto.randomUUID(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      data: notification.data || {},
      timestamp: new Date().toISOString(),
      read: false,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Realtime notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
