// ============================================
// Restaurant OS - Notification Templates
// Africa-First notification templates
// ============================================

// ============================================
// Types
// ============================================

export type NotificationTemplateType =
  | 'new_order'
  | 'order_status'
  | 'order_cancelled'
  | 'delivery_update'
  | 'driver_assigned'
  | 'reservation_reminder'
  | 'reservation_confirmed'
  | 'daily_summary'
  | 'low_stock'
  | 'payment_received'
  | 'payment_failed';

export interface NotificationTemplateData {
  // Order related
  orderId?: string;
  orderNumber?: string;
  orderType?: string;
  customerName?: string;
  total?: number;
  itemCount?: number;
  tableNumber?: string;
  deliveryAddress?: string;
  status?: string;
  estimatedTime?: number;

  // Delivery related
  driverName?: string;
  driverPhone?: string;

  // Reservation related
  restaurantName?: string;
  date?: string;
  time?: string;
  partySize?: number;
  confirmationCode?: string;

  // Daily summary
  orderCount?: number;
  revenue?: number;
  topProducts?: Array<{ name: string; count: number }>;
  deliveryCount?: number;
  avgDeliveryTime?: number;

  // Low stock
  items?: Array<{ name: string; current: number; minimum: number }>;

  // Payment
  amount?: number;
  method?: string;
  transactionId?: string;

  // Cancellation
  reason?: string;
  refunded?: boolean;

  // Contact
  phone?: string;
  email?: string;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
}

// ============================================
// Template Functions
// ============================================

export const notificationTemplates: Record<
  NotificationTemplateType,
  (data: NotificationTemplateData) => NotificationTemplate
> = {
  /**
   * New Order Notification (for restaurant staff)
   */
  new_order: (data) => {
    const orderTypeLabels: Record<string, string> = {
      DINE_IN: 'Sur place',
      TAKEAWAY: 'À emporter',
      DELIVERY: 'Livraison',
      DRIVE_THRU: 'Drive',
    };

    let message = `Nouvelle commande #${data.orderNumber}\n`;
    message += `Type: ${orderTypeLabels[data.orderType || ''] || data.orderType}\n`;
    message += `Client: ${data.customerName}\n`;
    message += `${data.itemCount} articles - ${formatCurrency(data.total || 0)}`;

    if (data.tableNumber) {
      message += `\nTable: ${data.tableNumber}`;
    }
    if (data.deliveryAddress) {
      message += `\nAdresse: ${data.deliveryAddress}`;
    }

    return {
      title: '🍽️ Nouvelle Commande',
      message,
      type: 'new_order',
      actionUrl: `/orders/${data.orderId}`,
      actionLabel: 'Voir la commande',
      icon: '/icons/order-new.png',
    };
  },

  /**
   * Order Status Update (for customers)
   */
  order_status: (data) => {
    const statusMessages: Record<string, { label: string; icon: string }> = {
      PENDING: { label: 'En attente', icon: '⏳' },
      CONFIRMED: { label: 'Confirmée', icon: '✅' },
      PREPARING: { label: 'En préparation', icon: '👨‍🍳' },
      READY: { label: 'Prête', icon: '✨' },
      OUT_FOR_DELIVERY: { label: 'En livraison', icon: '🛵' },
      DELIVERED: { label: 'Livrée', icon: '📦' },
      COMPLETED: { label: 'Terminée', icon: '🎉' },
      CANCELLED: { label: 'Annulée', icon: '❌' },
    };

    const statusInfo = statusMessages[data.status || ''] || { label: data.status, icon: '📋' };
    
    let message = `Votre commande #${data.orderNumber} est ${statusInfo.label.toLowerCase()}`;
    
    if (data.estimatedTime) {
      message += `\n⏱️ Temps estimé: ${data.estimatedTime} min`;
    }

    return {
      title: `${statusInfo.icon} Commande ${statusInfo.label}`,
      message,
      type: 'order_status',
      actionUrl: `/orders/${data.orderId}`,
      actionLabel: 'Suivre la commande',
    };
  },

  /**
   * Order Cancelled Notification
   */
  order_cancelled: (data) => {
    let message = `La commande #${data.orderNumber} a été annulée`;
    
    if (data.reason) {
      message += `\nMotif: ${data.reason}`;
    }
    
    if (data.refunded) {
      message += '\n💰 Vous serez remboursé sous 24-48h';
    }

    return {
      title: '❌ Commande Annulée',
      message,
      type: 'order_cancelled',
      actionUrl: `/orders/${data.orderId}`,
    };
  },

  /**
   * Delivery Update (for driver and customer)
   */
  delivery_update: (data) => {
    const statusMessages: Record<string, string> = {
      DRIVER_ASSIGNED: 'Un livreur a été assigné',
      DRIVER_ARRIVED_PICKUP: 'Le livreur est au restaurant',
      PICKED_UP: 'Votre commande est en route',
      DRIVER_ARRIVED_DROPOFF: 'Le livreur est arrivé',
      DELIVERED: 'Commande livrée!',
    };

    let message = `Commande #${data.orderNumber}\n`;
    message += statusMessages[data.status || ''] || data.status;

    if (data.driverName && data.status !== 'DELIVERED') {
      message += `\nLivreur: ${data.driverName}`;
    }
    if (data.driverPhone && data.status !== 'DELIVERED') {
      message += `\n📞 ${data.driverPhone}`;
    }
    if (data.estimatedTime) {
      message += `\n⏱️ Arrivée estimée: ${data.estimatedTime} min`;
    }

    return {
      title: '🛵 Mise à jour Livraison',
      message,
      type: 'delivery_update',
      actionUrl: `/orders/${data.orderId}`,
      actionLabel: 'Suivre la livraison',
    };
  },

  /**
   * Driver Assigned Notification
   */
  driver_assigned: (data) => {
    let message = `Nouvelle livraison assignée!\n`;
    message += `Commande #${data.orderNumber}\n`;
    
    if (data.estimatedTime) {
      message += `Temps estimé: ${data.estimatedTime} min`;
    }

    return {
      title: '🚀 Nouvelle Livraison',
      message,
      type: 'driver_assigned',
      actionUrl: `/deliveries/${data.orderId}`,
      actionLabel: 'Voir les détails',
    };
  },

  /**
   * Reservation Reminder
   */
  reservation_reminder: (data) => {
    let message = `Restaurant: ${data.restaurantName}\n`;
    message += `📅 ${data.date} à ${data.time}\n`;
    message += `👥 ${data.partySize} personne(s)\n`;
    message += `🎫 Code: ${data.confirmationCode}`;

    return {
      title: '📅 Rappel de Réservation',
      message,
      type: 'reservation_reminder',
      actionUrl: `/reservations/${data.confirmationCode}`,
      actionLabel: 'Voir la réservation',
    };
  },

  /**
   * Reservation Confirmed
   */
  reservation_confirmed: (data) => {
    let message = `Votre réservation est confirmée!\n`;
    message += `📍 ${data.restaurantName}\n`;
    message += `📅 ${data.date} à ${data.time}\n`;
    message += `👥 ${data.partySize} personne(s)\n`;
    message += `🎫 Code: ${data.confirmationCode}`;

    return {
      title: '✅ Réservation Confirmée',
      message,
      type: 'reservation_confirmed',
      actionUrl: `/reservations/${data.confirmationCode}`,
    };
  },

  /**
   * Daily Summary (for restaurant owners)
   */
  daily_summary: (data) => {
    let message = `📊 Résumé du ${data.date}\n\n`;
    message += `💰 Chiffre d'affaires: ${formatCurrency(data.revenue || 0)}\n`;
    message += `📦 Commandes: ${data.orderCount}\n`;
    message += `🛵 Livraisons: ${data.deliveryCount}\n`;
    
    if (data.avgDeliveryTime) {
      message += `⏱️ Temps livraison moyen: ${data.avgDeliveryTime} min\n`;
    }
    
    if (data.topProducts && data.topProducts.length > 0) {
      message += `\n🏆 Top ventes:\n`;
      data.topProducts.slice(0, 3).forEach((item, i) => {
        message += `${i + 1}. ${item.name} (${item.count})\n`;
      });
    }

    return {
      title: '📊 Résumé Journalier',
      message,
      type: 'daily_summary',
      actionUrl: '/analytics',
      actionLabel: 'Voir les détails',
    };
  },

  /**
   * Low Stock Alert
   */
  low_stock: (data) => {
    const itemsList = data.items?.slice(0, 5).map(item => 
      `• ${item.name}: ${item.current}/${item.minimum}`
    ).join('\n') || '';

    const more = (data.items?.length || 0) > 5 
      ? `\n...et ${data.items!.length - 5} autres` 
      : '';

    const message = `⚠️ Stock faible!\n\n${itemsList}${more}\n\nPassez commande rapidement.`;

    return {
      title: '⚠️ Alerte Stock',
      message,
      type: 'low_stock',
      actionUrl: '/inventory',
      actionLabel: 'Voir le stock',
    };
  },

  /**
   * Payment Received
   */
  payment_received: (data) => {
    let message = `Paiement reçu!\n`;
    message += `💰 Montant: ${formatCurrency(data.amount || 0)}\n`;
    message += `💳 Méthode: ${data.method}\n`;
    
    if (data.transactionId) {
      message += `Réf: ${data.transactionId}`;
    }

    return {
      title: '💰 Paiement Reçu',
      message,
      type: 'payment_received',
    };
  },

  /**
   * Payment Failed
   */
  payment_failed: (data) => {
    let message = `Le paiement a échoué\n`;
    message += `💰 Montant: ${formatCurrency(data.amount || 0)}\n`;
    message += `💳 Méthode: ${data.method}\n`;
    message += `Veuillez réessayer ou contacter le support.`;

    return {
      title: '❌ Paiement Échoué',
      message,
      type: 'payment_failed',
      actionUrl: '/orders',
      actionLabel: 'Réessayer',
    };
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format currency (FCFA by default)
 */
function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
}

/**
 * Get SMS template (shorter version)
 */
export function getSmsTemplate(
  type: NotificationTemplateType,
  data: NotificationTemplateData
): string {
  switch (type) {
    case 'new_order':
      return `🍽️ Nouvelle commande #${data.orderNumber} - ${data.itemCount} articles - ${formatCurrency(data.total || 0)}`;

    case 'order_status': {
      const statusLabels: Record<string, string> = {
        PREPARING: 'en préparation',
        READY: 'prête',
        OUT_FOR_DELIVERY: 'en livraison',
        DELIVERED: 'livrée',
      };
      return `Commande #${data.orderNumber} ${statusLabels[data.status || ''] || data.status}${data.estimatedTime ? ` - ${data.estimatedTime} min` : ''}`;
    }

    case 'delivery_update':
      if (data.driverName) {
        return `🛵 Votre commande #${data.orderNumber} est en route avec ${data.driverName}. Contact: ${data.driverPhone}`;
      }
      return `🛵 Mise à jour livraison commande #${data.orderNumber}`;

    case 'reservation_reminder':
      return `📅 Rappel: Réservation ${data.restaurantName} le ${data.date} à ${data.time}. Code: ${data.confirmationCode}`;

    case 'reservation_confirmed':
      return `✅ Réservation confirmée: ${data.restaurantName} le ${data.date} à ${data.time}. Code: ${data.confirmationCode}`;

    case 'daily_summary':
      return `📊 Résumé ${data.date}: ${formatCurrency(data.revenue || 0)} CA, ${data.orderCount} commandes, ${data.deliveryCount} livraisons`;

    case 'low_stock':
      return `⚠️ Alerte: ${data.items?.length || 0} articles en stock faible. Vérifiez votre inventaire.`;

    case 'payment_received':
      return `💰 Paiement de ${formatCurrency(data.amount || 0)} reçu via ${data.method}`;

    case 'payment_failed':
      return `❌ Paiement de ${formatCurrency(data.amount || 0)} échoué. Veuillez réessayer.`;

    case 'order_cancelled':
      return `❌ Commande #${data.orderNumber} annulée${data.refunded ? ' - Remboursement en cours' : ''}`;

    case 'driver_assigned':
      return `🚀 Nouvelle livraison: Commande #${data.orderNumber}${data.estimatedTime ? ` - ${data.estimatedTime} min` : ''}`;

    default:
      return '';
  }
}

/**
 * Get push notification payload
 */
export function getPushPayload(
  type: NotificationTemplateType,
  data: NotificationTemplateData
): {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
} {
  const template = notificationTemplates[type](data);
  
  return {
    title: template.title,
    body: template.message,
    icon: template.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `${type}-${data.orderId || data.confirmationCode || Date.now()}`,
  };
}
