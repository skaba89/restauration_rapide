// ============================================
// Restaurant OS - Email Module
// Comprehensive email service for Restaurant OS
// ============================================

// Configuration
export {
  getEmailConfig,
  getEmailProvider,
  validateEmailConfig,
  isEmailConfigured,
  getDefaultEmailConfig,
  SMTP_PRESETS,
  emailConfig,
  type EmailConfig,
  type EmailProvider,
} from './config';

// Templates
export {
  emailTemplates,
  formatCurrency,
  type Locale,
  type EmailRecipient,
  type EmailAttachment,
  type BaseEmailOptions,
  type OrderEmailData,
  type InvoiceEmailData,
  type ReservationEmailData,
  type PasswordResetEmailData,
  type DeliveryStatusEmailData,
  type WelcomeEmailData,
} from './templates';

// Service
export {
  EmailService,
  emailService,
  sendEmail,
  isEmailServiceAvailable,
  generateTrackingId,
  type EmailSendResult,
  type SendEmailOptions,
  type BulkEmailOptions,
  type EmailQueueItem,
} from './service';
