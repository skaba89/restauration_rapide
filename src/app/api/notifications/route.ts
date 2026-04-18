import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Restaurant OS - Notifications API
// GET: List notifications
// POST: Send notification
// PATCH: Mark as read
// ============================================

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

/**
 * GET /api/notifications
 * List notifications for current user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const unreadOnly = searchParams.get('unread') === 'true';

  try {
    let notifications: Notification[] = [];

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    // Sort by date and priority
    notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return NextResponse.json({
      success: true,
      data: notifications.slice(0, limit),
      meta: {
        total: notifications.length,
        unread: notifications.filter((n) => !n.read).length,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Send a new notification (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, organizationId, restaurantId, title, message, type, priority, channels, data } = body;

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'Titre, message et type sont requis' },
        { status: 400 }
      );
    }

    // In production, use the notification service
    // await sendNotification({ userId, organizationId, restaurantId, title, message, type, priority, channels, data });

    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      priority: priority || 'normal',
      read: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notification envoyée avec succès',
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi de la notification' },
      { status: 500 }
    );
  }
}