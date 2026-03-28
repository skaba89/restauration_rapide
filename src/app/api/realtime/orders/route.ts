import { NextRequest, NextResponse } from 'next/server';
import { triggerEvent, CHANNELS, EVENTS } from '@/lib/pusher-server';

// POST /api/realtime/orders - Trigger order events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, restaurantId, orderId, data } = body;

    if (!type || !restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, restaurantId' },
        { status: 400 }
      );
    }

    let channel: string;
    let event: string;

    switch (type) {
      case 'order_created':
        channel = CHANNELS.ORDERS(restaurantId);
        event = EVENTS.ORDER_CREATED;
        break;
      
      case 'order_updated':
        channel = CHANNELS.ORDERS(restaurantId);
        event = EVENTS.ORDER_UPDATED;
        break;
      
      case 'order_status_changed':
        channel = orderId ? CHANNELS.ORDER_STATUS(orderId) : CHANNELS.ORDERS(restaurantId);
        event = EVENTS.ORDER_STATUS_CHANGED;
        break;
      
      case 'order_cancelled':
        channel = CHANNELS.ORDERS(restaurantId);
        event = EVENTS.ORDER_CANCELLED;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    const result = await triggerEvent(channel, event, {
      orderId,
      restaurantId,
      timestamp: new Date().toISOString(),
      ...data,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to trigger event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, channel, event });
  } catch (error) {
    console.error('Realtime order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
