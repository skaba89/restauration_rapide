import { NextRequest, NextResponse } from 'next/server';
import pusher from '@/lib/pusher-server';

// Pusher authentication endpoint
// Required for private and presence channels
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const socketId = body.get('socket_id') as string;
    const channel = body.get('channel_name') as string;

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Verify user authentication
    // In production, get user from session/token
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check channel authorization
    let authResponse: { auth: string; channel_data?: string };

    if (channel.startsWith('private-')) {
      // Private channel - user must be authenticated
      const auth = pusher.authorizeChannel(socketId, channel);
      authResponse = auth;
    } else if (channel.startsWith('presence-')) {
      // Presence channel - include user info
      const presenceData = {
        user_id: userId,
        user_info: {
          role: userRole,
        },
      };
      const auth = pusher.authorizeChannel(socketId, channel, presenceData);
      authResponse = auth;
    } else {
      // Public channel - no auth needed but return success
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
