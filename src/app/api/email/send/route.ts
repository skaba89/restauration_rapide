// ============================================
// Restaurant OS - Email API Endpoint
// POST /api/email/send - Send email with rate limiting and validation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService, type SendEmailOptions } from '@/lib/email/service';
import { emailTemplates, type Locale, type EmailRecipient, type OrderEmailData, type InvoiceEmailData, type ReservationEmailData, type PasswordResetEmailData, type DeliveryStatusEmailData, type WelcomeEmailData } from '@/lib/email/templates';
import { withErrorHandler } from '@/lib/api-responses';
import { getRateLimitHeaders, checkRateLimit } from '@/lib/rate-limit';

// ============================================
// Validation Schemas
// ============================================

const EmailRecipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

const EmailAttachmentSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  content: z.union([z.string(), z.instanceof(Buffer)]),
  contentType: z.string().optional(),
  encoding: z.string().optional(),
});

const SendEmailRequestSchema = z.object({
  // Direct email sending
  to: z.union([EmailRecipientSchema, z.array(EmailRecipientSchema)]).optional(),
  subject: z.string().min(1, 'Subject is required').optional(),
  html: z.string().min(1, 'HTML content is required').optional(),
  text: z.string().optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  replyTo: z.string().email().optional(),
  headers: z.record(z.string()).optional(),
  tags: z.record(z.string()).optional(),
  
  // Template-based sending
  template: z.enum([
    'welcome',
    'orderConfirmation',
    'invoice',
    'reservationConfirmation',
    'passwordReset',
    'deliveryStatus',
  ]).optional(),
  
  // Template data (used when template is specified)
  templateData: z.record(z.unknown()).optional(),
  
  // Locale for templates
  locale: z.enum(['fr', 'en']).default('fr'),
});

// ============================================
// Rate Limiting Configuration
// ============================================

const EMAIL_RATE_LIMITS = {
  // General email sending
  standard: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 emails per minute
  },
  // Stricter limit for password resets
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset emails per hour
  },
  // Bulk email limit
  bulk: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 bulk emails per hour
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1';
}

/**
 * Get rate limit key based on template type
 */
function getRateLimitKey(request: NextRequest, template?: string): string {
  const ip = getClientIp(request);
  const limitType = template === 'passwordReset' ? 'passwordReset' : 'standard';
  return `email:${limitType}:${ip}`;
}

/**
 * Validate template data for specific template
 */
function validateTemplateData(
  template: string, 
  data: Record<string, unknown>
): { valid: boolean; error?: string } {
  try {
    switch (template) {
      case 'welcome':
        z.object({
          name: z.string(),
          email: z.string().email(),
          loginUrl: z.string().url(),
          restaurantName: z.string().optional(),
          verificationUrl: z.string().url().optional(),
        }).parse(data);
        break;
        
      case 'orderConfirmation':
        z.object({
          orderNumber: z.string(),
          customerName: z.string(),
          items: z.array(z.object({
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
            total: z.number(),
            notes: z.string().optional(),
          })),
          subtotal: z.number(),
          tax: z.number().optional(),
          deliveryFee: z.number().optional(),
          discount: z.number().optional(),
          total: z.number(),
          orderType: z.enum(['DINE_IN', 'DELIVERY', 'TAKEAWAY']),
          estimatedTime: z.string().optional(),
          deliveryAddress: z.string().optional(),
          paymentMethod: z.string(),
          restaurantName: z.string(),
          restaurantPhone: z.string().optional(),
          restaurantAddress: z.string().optional(),
          tableNumber: z.string().optional(),
          notes: z.string().optional(),
        }).parse(data);
        break;
        
      case 'invoice':
        z.object({
          invoiceNumber: z.string(),
          orderNumber: z.string(),
          customerName: z.string(),
          customerEmail: z.string().email(),
          items: z.array(z.object({
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
            total: z.number(),
          })),
          subtotal: z.number(),
          tax: z.number(),
          taxRate: z.number().optional(),
          deliveryFee: z.number().optional(),
          discount: z.number().optional(),
          total: z.number(),
          paymentMethod: z.string(),
          paymentStatus: z.string(),
          transactionId: z.string().optional(),
          date: z.string(),
          dueDate: z.string().optional(),
          restaurantName: z.string(),
          restaurantAddress: z.string().optional(),
          restaurantPhone: z.string().optional(),
          restaurantTaxId: z.string().optional(),
        }).parse(data);
        break;
        
      case 'reservationConfirmation':
        z.object({
          customerName: z.string(),
          date: z.string(),
          time: z.string(),
          partySize: z.number(),
          restaurantName: z.string(),
          restaurantAddress: z.string().optional(),
          restaurantPhone: z.string().optional(),
          confirmationCode: z.string(),
          specialRequests: z.string().optional(),
          tableNumber: z.string().optional(),
          occasion: z.string().optional(),
        }).parse(data);
        break;
        
      case 'passwordReset':
        z.object({
          name: z.string(),
          resetUrl: z.string().url(),
          expiresIn: z.string(),
        }).parse(data);
        break;
        
      case 'deliveryStatus':
        z.object({
          customerName: z.string(),
          orderNumber: z.string(),
          status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'ARRIVING', 'DELIVERED']),
          driverName: z.string().optional(),
          driverPhone: z.string().optional(),
          estimatedTime: z.string().optional(),
          trackingUrl: z.string().url().optional(),
          restaurantName: z.string(),
          message: z.string().optional(),
        }).parse(data);
        break;
        
      default:
        return { valid: false, error: `Unknown template: ${template}` };
    }
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { valid: false, error: errors };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Get template email options
 */
function getTemplateEmailOptions(
  template: string,
  data: Record<string, unknown>,
  to: EmailRecipient,
  locale: Locale,
  attachments?: SendEmailOptions['attachments']
): SendEmailOptions {
  let html: string;
  let text: string;
  let subject: string;
  
  switch (template) {
    case 'welcome':
      const welcomeResult = emailTemplates.welcome(data as WelcomeEmailData, locale);
      html = welcomeResult.html;
      text = welcomeResult.text;
      subject = welcomeResult.subject;
      break;
      
    case 'orderConfirmation':
      const orderResult = emailTemplates.orderConfirmation(data as OrderEmailData, locale);
      html = orderResult.html;
      text = orderResult.text;
      subject = orderResult.subject;
      break;
      
    case 'invoice':
      const invoiceResult = emailTemplates.invoice(data as InvoiceEmailData, locale);
      html = invoiceResult.html;
      text = invoiceResult.text;
      subject = invoiceResult.subject;
      break;
      
    case 'reservationConfirmation':
      const reservationResult = emailTemplates.reservationConfirmation(data as ReservationEmailData, locale);
      html = reservationResult.html;
      text = reservationResult.text;
      subject = reservationResult.subject;
      break;
      
    case 'passwordReset':
      const resetResult = emailTemplates.passwordReset(data as PasswordResetEmailData, locale);
      html = resetResult.html;
      text = resetResult.text;
      subject = resetResult.subject;
      break;
      
    case 'deliveryStatus':
      const deliveryResult = emailTemplates.deliveryStatus(data as DeliveryStatusEmailData, locale);
      html = deliveryResult.html;
      text = deliveryResult.text;
      subject = deliveryResult.subject;
      break;
      
    default:
      throw new Error(`Unknown template: ${template}`);
  }
  
  return {
    to,
    subject,
    html,
    text,
    attachments,
    tags: { template, locale },
  };
}

// ============================================
// API Handler
// ============================================

async function handler(request: NextRequest) {
  // Check rate limit
  const rateLimitKey = getRateLimitKey(request);
  const rateLimitConfig = EMAIL_RATE_LIMITS.standard;
  
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    windowMs: rateLimitConfig.windowMs,
    maxRequests: rateLimitConfig.max,
  });
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }
  
  // Parse and validate request body
  let body: z.infer<typeof SendEmailRequestSchema>;
  
  try {
    const rawBody = await request.json();
    body = SendEmailRequestSchema.parse(rawBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
  
  // Determine email options
  let emailOptions: SendEmailOptions;
  
  if (body.template) {
    // Template-based email
    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient (to) is required for template emails' },
        { status: 400 }
      );
    }
    
    if (!body.templateData) {
      return NextResponse.json(
        { success: false, error: 'Template data is required for template emails' },
        { status: 400 }
      );
    }
    
    // Validate template data
    const { valid, error } = validateTemplateData(body.template, body.templateData);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: `Invalid template data: ${error}` },
        { status: 400 }
      );
    }
    
    try {
      emailOptions = getTemplateEmailOptions(
        body.template,
        body.templateData,
        Array.isArray(body.to) ? body.to[0] : body.to,
        body.locale as Locale,
        body.attachments
      );
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to generate email from template' 
        },
        { status: 400 }
      );
    }
  } else {
    // Direct email sending
    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient (to) is required' },
        { status: 400 }
      );
    }
    
    if (!body.subject) {
      return NextResponse.json(
        { success: false, error: 'Subject is required' },
        { status: 400 }
      );
    }
    
    if (!body.html) {
      return NextResponse.json(
        { success: false, error: 'HTML content is required' },
        { status: 400 }
      );
    }
    
    emailOptions = {
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
      attachments: body.attachments,
      replyTo: body.replyTo,
      headers: body.headers,
      tags: body.tags,
    };
  }
  
  // Send email
  const result = await emailService.sendEmail(emailOptions);
  
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Failed to send email',
      },
      { 
        status: 500,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }
  
  return NextResponse.json(
    {
      success: true,
      messageId: result.messageId,
      provider: result.provider,
    },
    {
      status: 200,
      headers: getRateLimitHeaders(rateLimitResult),
    }
  );
}

// Export handler directly
export const POST = handler;

// ============================================
// GET Endpoint for Service Status
// ============================================

export async function GET(request: NextRequest) {
  const rateLimitKey = getRateLimitKey(request);
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    windowMs: 60 * 1000,
    maxRequests: 60,
  });
  
  return NextResponse.json(
    {
      success: true,
      service: 'email',
      status: 'operational',
      templates: [
        'welcome',
        'orderConfirmation',
        'invoice',
        'reservationConfirmation',
        'passwordReset',
        'deliveryStatus',
      ],
      locales: ['fr', 'en'],
      features: {
        attachments: true,
        tracking: true,
        rateLimit: true,
        i18n: true,
      },
    },
    {
      headers: getRateLimitHeaders(rateLimitResult),
    }
  );
}
