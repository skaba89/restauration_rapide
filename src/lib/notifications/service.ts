// ============================================
// Restaurant OS - Notification Service
// Multi-channel notifications: Push, In-app, SMS
// ============================================

import { prisma } from '@/lib/prisma';

export type NotificationChannel = 'push' | 'in_app' | 'sms' | 'email';
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface NotificationPayload {
  userId?: string;
  organizationId?: string;
  restaurantId?: string;
  title: string;
  message: string;
  type: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  type: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
}

// Notification templates
export const notificationTemplates: Record<string, NotificationTemplate> = {
  // Order notifications
  new_order: {
    title: 'Nouvelle commande',
    message: 'Une nouvelle commande #{orderNumber} a été reçue',
    type: 'order',
    priority: 'high',
    channels: ['push', 'in_app', 'sms'],
  },
  order_confirmed: {
    title: 'Commande confirmée',
    message: 'Votre commande #{orderNumber} a été confirmée',
    type: 'order',
    priority: 'normal',
    channels: ['push', 'in_app'],
  },
  order_preparing: {
    title: 'En préparation',
    message: 'Votre commande #{orderNumber} est en cours de préparation',
    type: 'order',
    priority: 'normal',
    channels: ['push', 'in_app'],
  },
  order_ready: {
    title: 'Commande prête',
    message: 'Votre commande #{orderNumber} est prête !',
    type: 'order',
    priority: 'high',
    channels: ['push', 'in_app', 'sms'],
  },
  order_delivered: {
    title: 'Commande livrée',
    message: 'Votre commande #{orderNumber} a été livrée',
    type: 'order',
    priority: 'normal',
    channels: ['push', 'in_app'],
  },
  
  // Delivery notifications
  driver_assigned: {
    title: 'Livreur assigné',
    message: 'Un livreur a été assigné à la commande #{orderNumber}',
    type: 'delivery',
    priority: 'normal',
    channels: ['push', 'in_app'],
  },
  delivery_pickup: {
    title: 'En route',
    message: 'Le livreur a récupéré votre commande',
    type: 'delivery',
    priority: 'normal',
    channels: ['push', 'in_app'],
  },
  delivery_nearby: {
    title: 'Arrivée imminente',
    message: 'Votre livreur arrive dans 5 minutes',
    type: 'delivery',
    priority: 'urgent',
    channels: ['push', 'in_app', 'sms'],
  },
  
  // Reservation notifications
  reservation_confirmed: {
    title: 'Réservation confirmée',
    message: 'Votre réservation pour {partySize} personnes est confirmée',
    type: 'reservation',
    priority: 'normal',
    channels: ['push', 'in_app', 'email'],
  },
  reservation_reminder: {
    title: 'Rappel réservation',
    message: 'Rendez-vous dans 1 heure chez {restaurantName}',
    type: 'reservation',
    priority: 'high',
    channels: ['push', 'sms'],
  },
  
  // Stock notifications
  low_stock: {
    title: 'Stock faible',
    message: '{itemName} est en dessous du seuil minimum',
    type: 'stock',
    priority: 'high',
    channels: ['in_app', 'email'],
  },
  out_of_stock: {
    title: 'Rupture de stock',
    message: '{itemName} n\'est plus disponible',
    type: 'stock',
    priority: 'urgent',
    channels: ['in_app', 'push'],
  },
  
  // Driver notifications
  new_delivery_request: {
    title: 'Nouvelle livraison',
    message: 'Une nouvelle livraison est disponible ({amount} FCFA)',
    type: 'driver',
    priority: 'high',
    channels: ['push', 'in_app'],
  },
  payment_received: {
    title: 'Paiement reçu',
    message: 'Vous avez reçu {amount} FCFA sur votre wallet',
    type: 'payment',
    priority: 'normal',
    channels: ['push', 'in_app'],
  },
  
  // Daily summary
  daily_summary: {
    title: 'Résumé du jour',
    message: '{ordersCount} commandes - {revenue} FCFA de chiffre d\'affaires',
    type: 'summary',
    priority: 'low',
    channels: ['in_app', 'email'],
  },
};

/**
 * Send notification through specified channels
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const { userId, organizationId, restaurantId, title, message, type, priority = 'normal', channels = ['in_app'], data, actionUrl } = payload;

  try {
    // Always create in-app notification
    if (channels.includes('in_app') || userId) {
      await createInAppNotification({
        userId,
        organizationId,
        restaurantId,
        title,
        message,
        type,
        priority,
        data,
        actionUrl,
      });
    }

    // Send push notification
    if (channels.includes('push') && userId) {
      await sendPushNotification(userId, title, message, data);
    }

    // Send SMS
    if (channels.includes('sms') && userId) {
      await sendSmsNotification(userId, message, priority);
    }

    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

/**
 * Create in-app notification
 */
async function createInAppNotification(data: {
  userId?: string;
  organizationId?: string;
  restaurantId?: string;
  title: string;
  message: string;
  type: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
  actionUrl?: string;
}) {
  try {
    // For demo, just log it
    console.log('[Notification]', {
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority,
    });
    
    // In production, save to database
    // await prisma.notification.create({
    //   data: {
    //     userId: data.userId,
    //     organizationId: data.organizationId,
    //     restaurantId: data.restaurantId,
    //     title: data.title,
    //     message: data.message,
    //     type: data.type,
    //     priority: data.priority,
    //     data: data.data || {},
    //     actionUrl: data.actionUrl,
    //   }
    // });
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
}

/**
 * Send push notification via Web Push
 */
async function sendPushNotification(userId: string, title: string, message: string, data?: Record<string, any>) {
  try {
    // Get user's push subscriptions
    // const subscriptions = await prisma.pushSubscription.findMany({
    //   where: { userId }
    // });

    // For demo, just log it
    console.log('[Push Notification]', { userId, title, message, data });
    
    // In production, use web-push library
    // import webpush from 'web-push';
    // for (const sub of subscriptions) {
    //   await webpush.sendNotification(sub, JSON.stringify({ title, body: message, data }));
    // }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

/**
 * Send SMS via Africa's Talking
 */
async function sendSmsNotification(userId: string, message: string, priority: NotificationPriority) {
  try {
    // Get user's phone
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: { phone: true }
    // });

    // For demo, just log it
    console.log('[SMS]', { userId, message, priority });
    
    // In production, use Africa's Talking API
    // const response = await fetch('https://api.africastalking.com/version1/messaging', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'apiKey': process.env.AFRICAS_TALKING_API_KEY!,
    //     'Accept': 'application/json',
    //   },
    //   body: new URLSearchParams({
    //     username: process.env.AFRICAS_TALKING_USERNAME!,
    //     to: user.phone,
    //     message: message,
    //   }),
    // });
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

/**
 * Send notification from template
 */
export async function sendNotificationFromTemplate(
  templateName: string,
  variables: Record<string, string | number>,
  context: {
    userId?: string;
    organizationId?: string;
    restaurantId?: string;
    channels?: NotificationChannel[];
  }
) {
  const template = notificationTemplates[templateName];
  if (!template) {
    throw new Error(`Notification template not found: ${templateName}`);
  }

  // Replace variables in title and message
  let title = template.title;
  let message = template.message;
  
  for (const [key, value] of Object.entries(variables)) {
    title = title.replace(`{${key}}`, String(value));
    message = message.replace(`{${key}}`, String(value));
  }

  return sendNotification({
    ...context,
    title,
    message,
    type: template.type,
    priority: template.priority,
    channels: context.channels || template.channels,
    data: variables,
  });
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
  // For demo, return mock data
  const mockNotifications = [
    {
      id: '1',
      title: 'Nouvelle commande',
      message: 'Commande #ORD-2847 reçue',
      type: 'order',
      priority: 'high',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Livraison en cours',
      message: 'Votre livreur arrive dans 10 minutes',
      type: 'delivery',
      priority: 'normal',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      title: 'Résumé quotidien',
      message: '27 commandes - 1,250,000 FCFA aujourd\'hui',
      type: 'summary',
      priority: 'low',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return mockNotifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  console.log('[Notification] Marked as read:', notificationId);
  return true;
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsRead(userId: string) {
  console.log('[Notification] Marked all as read for user:', userId);
  return true;
}

export default {
  sendNotification,
  sendNotificationFromTemplate,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  notificationTemplates,
};
