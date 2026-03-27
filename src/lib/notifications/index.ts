// ============================================
// Restaurant OS - Notifications Module
// Comprehensive push notification system
// ============================================

export { 
  notificationService,
  type NotificationPayload,
  type NotificationChannel,
  type NotificationPriority,
  type NotificationType,
  type NotificationResult,
  type PushSubscription,
  type OfflineQueueItem,
} from './service';

export {
  notificationTemplates,
  getSmsTemplate,
  getPushPayload,
  type NotificationTemplateType,
  type NotificationTemplateData,
  type NotificationTemplate,
} from './templates';
