// ============================================
// Restaurant OS - Email Service
// Comprehensive email sending service with multi-provider support
// ============================================

import { 
  getEmailConfig, 
  validateEmailConfig, 
  type EmailConfig, 
  type EmailProvider 
} from './config';
import { 
  emailTemplates, 
  type EmailRecipient, 
  type EmailAttachment,
  type OrderEmailData,
  type InvoiceEmailData,
  type ReservationEmailData,
  type PasswordResetEmailData,
  type DeliveryStatusEmailData,
  type WelcomeEmailData,
  type Locale,
} from './templates';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: EmailProvider;
}

/**
 * Email options for sending
 */
export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
  headers?: Record<string, string>;
  tags?: Record<string, string>;
  trackingId?: string;
}

/**
 * Bulk email options
 */
export interface BulkEmailOptions extends SendEmailOptions {
  recipients: EmailRecipient[];
  batchSize?: number;
  delayBetweenBatches?: number;
}

/**
 * Email queue item for background processing
 */
export interface EmailQueueItem {
  id: string;
  options: SendEmailOptions;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}

// ============================================
// Email Service Class
// ============================================

/**
 * Main email service class
 */
export class EmailService {
  private config: EmailConfig;
  private initialized: boolean = false;

  constructor() {
    this.config = getEmailConfig();
    this.initialized = this.validateConfiguration();
  }

  /**
   * Validate email configuration
   */
  private validateConfiguration(): boolean {
    const { valid, errors } = validateEmailConfig(this.config);
    
    if (!valid) {
      logger.warn('Email service configuration invalid', { errors });
      return false;
    }
    
    return true;
  }

  /**
   * Format recipient for email headers
   */
  private formatRecipient(recipient: EmailRecipient): string {
    return recipient.name 
      ? `${recipient.name} <${recipient.email}>`
      : recipient.email;
  }

  /**
   * Format multiple recipients
   */
  private formatRecipients(recipients: EmailRecipient | EmailRecipient[]): string {
    if (Array.isArray(recipients)) {
      return recipients.map(r => this.formatRecipient(r)).join(', ');
    }
    return this.formatRecipient(recipients);
  }

  /**
   * Send email using SMTP
   */
  private async sendViaSMTP(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      // Dynamic import for nodemailer (optional dependency)
      const nodemailer = await import('nodemailer').catch(() => null);
      
      if (!nodemailer || !this.config.smtp) {
        // Development mode: log email instead of sending
        if (this.config.development?.logEmails) {
          logger.info('Email (development mode)', {
            to: this.formatRecipients(options.to),
            subject: options.subject,
            htmlLength: options.html.length,
          });
          
          return {
            success: true,
            messageId: `dev-${Date.now()}`,
            provider: 'smtp',
          };
        }
        
        return {
          success: false,
          error: 'SMTP not configured or nodemailer not installed',
          provider: 'smtp',
        };
      }

      const transporter = nodemailer.default.createTransport({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: this.config.smtp.auth,
      });

      const mailOptions = {
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: this.formatRecipients(options.to),
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.config.replyTo,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
          encoding: a.encoding,
        })),
        headers: options.headers,
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info('Email sent via SMTP', {
        messageId: result.messageId,
        to: this.formatRecipients(options.to),
        subject: options.subject,
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: 'smtp',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send email via SMTP', { error: errorMessage, options });
      
      return {
        success: false,
        error: errorMessage,
        provider: 'smtp',
      };
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      // Dynamic import for @sendgrid/mail (optional dependency)
      const sgMail = await import('@sendgrid/mail').catch(() => null);
      
      if (!sgMail || !this.config.sendgrid?.apiKey) {
        return {
          success: false,
          error: 'SendGrid not configured or package not installed',
          provider: 'sendgrid',
        };
      }

      sgMail.default.setApiKey(this.config.sendgrid.apiKey);

      const msg = {
        to: Array.isArray(options.to) 
          ? options.to.map(r => ({ email: r.email, name: r.name }))
          : { email: options.to.email, name: options.to.name },
        from: {
          email: this.config.from.email,
          name: this.config.from.name,
        },
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.config.replyTo,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: Buffer.isBuffer(a.content) 
            ? a.content.toString('base64') 
            : Buffer.from(a.content).toString('base64'),
          type: a.contentType,
          disposition: 'attachment',
        })),
        trackingSettings: {
          openTracking: { enable: this.config.tracking?.opens ?? true },
          clickTracking: { enable: this.config.tracking?.clicks ?? true },
        },
        customArgs: options.tags,
        headers: options.headers,
      };

      const [response] = await sgMail.default.send(msg);

      logger.info('Email sent via SendGrid', {
        messageId: response.headers['x-message-id'],
        to: this.formatRecipients(options.to),
        subject: options.subject,
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        provider: 'sendgrid',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send email via SendGrid', { error: errorMessage, options });
      
      return {
        success: false,
        error: errorMessage,
        provider: 'sendgrid',
      };
    }
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      // Dynamic import for resend (optional dependency)
      const { Resend } = await import('resend').catch(() => ({ Resend: null }));
      
      if (!Resend || !this.config.resend?.apiKey) {
        return {
          success: false,
          error: 'Resend not configured or package not installed',
          provider: 'resend',
        };
      }

      const resend = new Resend(this.config.resend.apiKey);

      const { data, error } = await resend.emails.send({
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: Array.isArray(options.to) 
          ? options.to.map(r => r.email)
          : options.to.email,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo || this.config.replyTo,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: Buffer.isBuffer(a.content) 
            ? a.content.toString('base64') 
            : Buffer.from(a.content).toString('base64'),
        })),
        tags: options.tags ? Object.entries(options.tags).map(([name, value]) => ({ name, value })) : undefined,
      });

      if (error) {
        logger.error('Resend API error', { error, options });
        return {
          success: false,
          error: error.message,
          provider: 'resend',
        };
      }

      logger.info('Email sent via Resend', {
        messageId: data?.id,
        to: this.formatRecipients(options.to),
        subject: options.subject,
      });

      return {
        success: true,
        messageId: data?.id,
        provider: 'resend',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send email via Resend', { error: errorMessage, options });
      
      return {
        success: false,
        error: errorMessage,
        provider: 'resend',
      };
    }
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    if (!this.initialized) {
      logger.warn('Email service not properly initialized');
    }

    // Development logging
    if (this.config.development?.logEmails) {
      console.log('\n📧 EMAIL DEBUG');
      console.log('═'.repeat(60));
      console.log('To:', this.formatRecipients(options.to));
      console.log('Subject:', options.subject);
      console.log('Provider:', this.config.provider);
      console.log('HTML Length:', options.html.length, 'characters');
      console.log('Attachments:', options.attachments?.length || 0);
      console.log('═'.repeat(60) + '\n');
    }

    // Route to appropriate provider
    switch (this.config.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(options);
      case 'resend':
        return this.sendViaResend(options);
      case 'smtp':
      default:
        return this.sendViaSMTP(options);
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(options: BulkEmailOptions): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];
    const batchSize = options.batchSize || 50;
    const delay = options.delayBetweenBatches || 1000;

    for (let i = 0; i < options.recipients.length; i += batchSize) {
      const batch = options.recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(recipient => 
        this.sendEmail({
          ...options,
          to: recipient,
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Delay between batches to avoid rate limits
      if (i + batchSize < options.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  // ============================================
  // Convenience Methods using Templates
  // ============================================

  /**
   * Send welcome email
   */
  async sendWelcome(
    to: EmailRecipient, 
    data: WelcomeEmailData, 
    locale: Locale = 'fr'
  ): Promise<EmailSendResult> {
    const { html, text, subject } = emailTemplates.welcome(data, locale);
    
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      tags: { type: 'welcome', locale },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: EmailRecipient, 
    data: OrderEmailData, 
    locale: Locale = 'fr',
    attachments?: EmailAttachment[]
  ): Promise<EmailSendResult> {
    const { html, text, subject } = emailTemplates.orderConfirmation(data, locale);
    
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      attachments,
      tags: { type: 'order-confirmation', orderNumber: data.orderNumber, locale },
    });
  }

  /**
   * Send invoice/receipt email
   */
  async sendInvoice(
    to: EmailRecipient, 
    data: InvoiceEmailData, 
    locale: Locale = 'fr',
    attachments?: EmailAttachment[]
  ): Promise<EmailSendResult> {
    const { html, text, subject } = emailTemplates.invoice(data, locale);
    
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      attachments,
      tags: { type: 'invoice', invoiceNumber: data.invoiceNumber, locale },
    });
  }

  /**
   * Send reservation confirmation email
   */
  async sendReservationConfirmation(
    to: EmailRecipient, 
    data: ReservationEmailData, 
    locale: Locale = 'fr'
  ): Promise<EmailSendResult> {
    const { html, text, subject } = emailTemplates.reservationConfirmation(data, locale);
    
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      tags: { type: 'reservation', confirmationCode: data.confirmationCode, locale },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    to: EmailRecipient, 
    data: PasswordResetEmailData, 
    locale: Locale = 'fr'
  ): Promise<EmailSendResult> {
    const { html, text, subject } = emailTemplates.passwordReset(data, locale);
    
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      tags: { type: 'password-reset', locale },
    });
  }

  /**
   * Send delivery status update email
   */
  async sendDeliveryStatusUpdate(
    to: EmailRecipient, 
    data: DeliveryStatusEmailData, 
    locale: Locale = 'fr'
  ): Promise<EmailSendResult> {
    const { html, text, subject } = emailTemplates.deliveryStatus(data, locale);
    
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      tags: { type: 'delivery-status', orderNumber: data.orderNumber, status: data.status, locale },
    });
  }
}

// ============================================
// Singleton Instance
// ============================================

export const emailService = new EmailService();

// ============================================
// Helper Functions
// ============================================

/**
 * Quick send email function
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  return emailService.sendEmail(options);
}

/**
 * Check if email service is available
 */
export function isEmailServiceAvailable(): boolean {
  const config = getEmailConfig();
  const { valid } = validateEmailConfig(config);
  return valid;
}

/**
 * Generate a unique tracking ID for emails
 */
export function generateTrackingId(): string {
  return `eml_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Re-export types
export type {
  EmailConfig,
  EmailProvider,
};
