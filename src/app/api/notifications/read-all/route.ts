// Notifications Read All API - Mark all notifications as read
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { getAuthUser } from '@/lib/auth-utils';

// PATCH /api/notifications/read-all - Mark all notifications as read
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('Non autorisé', 401);
    }

    // Update all unread notifications for this user
    const result = await db.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return apiSuccess({
      updated: result.count,
      message: `${result.count} notifications marquées comme lues`,
    });
  });
}
