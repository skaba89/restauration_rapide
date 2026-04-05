import { NextRequest, NextResponse } from 'next/server';
import { triggerEvent, CHANNELS, EVENTS } from '@/lib/pusher-server';

// POST /api/realtime/delivery - Trigger delivery tracking events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, deliveryId, driverId, data } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    let channel: string;
    let event: string;

    switch (type) {
      case 'driver_assigned':
        if (!deliveryId) {
          return NextResponse.json({ error: 'Missing deliveryId' }, { status: 400 });
        }
        channel = CHANNELS.DELIVERY(deliveryId);
        event = EVENTS.DRIVER_ASSIGNED;
        break;
      
      case 'location_update':
        if (!driverId) {
          return NextResponse.json({ error: 'Missing driverId' }, { status: 400 });
        }
        channel = CHANNELS.DRIVER_LOCATION(driverId);
        event = EVENTS.DRIVER_LOCATION_UPDATE;
        break;
      
      case 'delivery_status_changed':
        if (!deliveryId) {
          return NextResponse.json({ error: 'Missing deliveryId' }, { status: 400 });
        }
        channel = CHANNELS.DELIVERY(deliveryId);
        event = EVENTS.DELIVERY_STATUS_CHANGED;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    const result = await triggerEvent(channel, event, {
      deliveryId,
      driverId,
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
    console.error('Realtime delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
