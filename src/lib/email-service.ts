// ============================================
// Restaurant OS - Email Service
// Handles all email communications
// ============================================

import { Resend } from 'resend';

// Email configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@kfm-delice.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'KFM DELICE';

// Initialize Resend client (if API key is available)
let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

// Email templates
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Type definitions
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: 'otp' | 'welcome' | 'password-reset' | 'order-confirmation' | 'order-status' | 'delivery-update';
  templateData?: Record<string, unknown>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generate OTP email template
 */
function generateOTPEmail(otpCode: string, type: string): EmailTemplate {
  const typeLabels: Record<string, string> = {
    LOGIN: 'connexion',
    VERIFY_EMAIL: 'vérification d\'email',
    VERIFY_PHONE: 'vérification de téléphone',
    PASSWORD_RESET: 'réinitialisation de mot de passe',
  };

  const label = typeLabels[type] || 'vérification';

  return {
    subject: `Votre code de ${label} - KFM DELICE`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code OTP - KFM DELICE</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #2E7D32 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">KFM DELICE</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Code de ${label}</h2>
            <p style="color: #666; font-size: 16px;">Bonjour,</p>
            <p style="color: #666; font-size: 16px;">Voici votre code de ${label} :</p>
            <div style="background: #fff; border: 2px dashed #FF6B35; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">${otpCode}</span>
            </div>
            <p style="color: #999; font-size: 14px;">Ce code expire dans 5 minutes.</p>
            <p style="color: #999; font-size: 14px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} KFM DELICE - Tous droits réservés<br>
              Conakry, Guinée
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
KFM DELICE

Code de ${label}

Bonjour,

Voici votre code de ${label} : ${otpCode}

Ce code expire dans 5 minutes.

Si vous n'avez pas demandé ce code, ignorez cet email.

© ${new Date().getFullYear()} KFM DELICE - Tous droits réservés
Conakry, Guinée
    `,
  };
}

/**
 * Generate welcome email template
 */
function generateWelcomeEmail(firstName: string, restaurantName?: string): EmailTemplate {
  return {
    subject: 'Bienvenue chez KFM DELICE !',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue - KFM DELICE</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #2E7D32 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🍽️ Bienvenue !</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Bonjour ${firstName || 'cher client'},</h2>
            <p style="color: #666; font-size: 16px;">Bienvenue sur la plateforme KFM DELICE${restaurantName ? ` - ${restaurantName}` : ''} !</p>
            <p style="color: #666; font-size: 16px;">Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
            <ul style="color: #666; font-size: 16px;">
              <li>Passer des commandes en ligne</li>
              <li>Suivre vos livraisons en temps réel</li>
              <li>Profiter de nos offres exclusives</li>
              <li>Accumuler des points de fidélité</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}" 
                 style="background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Découvrir notre menu
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} KFM DELICE - Tous droits réservés<br>
              Conakry, Guinée
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Bienvenue chez KFM DELICE !

Bonjour ${firstName || 'cher client'},

Votre compte a été créé avec succès. Vous pouvez maintenant :
- Passer des commandes en ligne
- Suivre vos livraisons en temps réel
- Profiter de nos offres exclusives
- Accumuler des points de fidélité

Découvrir notre menu: ${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}

© ${new Date().getFullYear()} KFM DELICE - Tous droits réservés
Conakry, Guinée
    `,
  };
}

/**
 * Generate password reset email template
 */
function generatePasswordResetEmail(resetLink: string, otpCode: string): EmailTemplate {
  return {
    subject: 'Réinitialisation de votre mot de passe - KFM DELICE',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation - KFM DELICE</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #2E7D32 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🔐 Réinitialisation</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Mot de passe oublié ?</h2>
            <p style="color: #666; font-size: 16px;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p style="color: #666; font-size: 16px;">Utilisez le code ci-dessous :</p>
            <div style="background: #fff; border: 2px dashed #FF6B35; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">${otpCode}</span>
            </div>
            <p style="color: #666; font-size: 16px; text-align: center;">ou cliquez sur le bouton :</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" 
                 style="background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">Ce lien expire dans 1 heure.</p>
            <p style="color: #999; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} KFM DELICE - Tous droits réservés<br>
              Conakry, Guinée
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Réinitialisation de mot de passe - KFM DELICE

Vous avez demandé la réinitialisation de votre mot de passe.

Votre code: ${otpCode}

Ou utilisez ce lien: ${resetLink}

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

© ${new Date().getFullYear()} KFM DELICE - Tous droits réservés
Conakry, Guinée
    `,
  };
}

/**
 * Generate order confirmation email
 */
function generateOrderConfirmationEmail(
  orderNumber: string,
  customerName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  currency: string,
  orderType: string,
  estimatedTime?: string
): EmailTemplate {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} ${currency}</td>
    </tr>
  `).join('');

  return {
    subject: `Confirmation de commande #${orderNumber} - KFM DELICE`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Commande confirmée - KFM DELICE</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #2E7D32 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">✅ Commande confirmée</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Bonjour ${customerName},</h2>
            <p style="color: #666; font-size: 16px;">Votre commande <strong>#${orderNumber}</strong> a été confirmée !</p>
            ${estimatedTime ? `<p style="color: #666; font-size: 16px;">⏰ Temps estimé: ${estimatedTime}</p>` : ''}
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #FF6B35; color: white;">
                  <th style="padding: 10px; text-align: left;">Article</th>
                  <th style="padding: 10px; text-align: center;">Qté</th>
                  <th style="padding: 10px; text-align: right;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="background: #eee; font-weight: bold;">
                  <td style="padding: 10px;" colspan="2">Total</td>
                  <td style="padding: 10px; text-align: right;">${total.toLocaleString()} ${currency}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}/tracking/${orderNumber}" 
                 style="background: #2E7D32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Suivre ma commande
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} KFM DELICE - Tous droits réservés<br>
              Conakry, Guinée
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Commande confirmée - KFM DELICE

Bonjour ${customerName},

Votre commande #${orderNumber} a été confirmée !

Articles:
${items.map(i => `- ${i.name} x${i.quantity}: ${i.price.toLocaleString()} ${currency}`).join('\n')}

Total: ${total.toLocaleString()} ${currency}

Suivre ma commande: ${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}/tracking/${orderNumber}

© ${new Date().getFullYear()} KFM DELICE - Tous droits réservés
Conakry, Guinée
    `,
  };
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, text, template, templateData } = options;

  // Generate template content if specified
  let emailContent: EmailTemplate;

  if (template && templateData) {
    switch (template) {
      case 'otp':
        emailContent = generateOTPEmail(
          templateData.code as string,
          templateData.type as string
        );
        break;
      case 'welcome':
        emailContent = generateWelcomeEmail(
          templateData.firstName as string,
          templateData.restaurantName as string
        );
        break;
      case 'password-reset':
        emailContent = generatePasswordResetEmail(
          templateData.resetLink as string,
          templateData.otpCode as string
        );
        break;
      case 'order-confirmation':
        emailContent = generateOrderConfirmationEmail(
          templateData.orderNumber as string,
          templateData.customerName as string,
          templateData.items as Array<{ name: string; quantity: number; price: number }>,
          templateData.total as number,
          templateData.currency as string,
          templateData.orderType as string,
          templateData.estimatedTime as string
        );
        break;
      default:
        emailContent = { subject, html: html || '', text: text || '' };
    }
  } else {
    emailContent = { subject, html: html || '', text: text || '' };
  }

  // If no Resend API key, log in development
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Email would be sent:', {
        to,
        subject: emailContent.subject,
        preview: emailContent.text.substring(0, 100),
      });
      return { success: true, messageId: `dev-${Date.now()}` };
    }
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Convenience methods for common emails
 */
export const emailService = {
  sendOTP: (to: string, code: string, type: string) =>
    sendEmail({
      to,
      template: 'otp',
      templateData: { code, type },
    }),

  sendWelcome: (to: string, firstName: string, restaurantName?: string) =>
    sendEmail({
      to,
      template: 'welcome',
      templateData: { firstName, restaurantName },
    }),

  sendPasswordReset: (to: string, resetLink: string, otpCode: string) =>
    sendEmail({
      to,
      template: 'password-reset',
      templateData: { resetLink, otpCode },
    }),

  sendOrderConfirmation: (
    to: string,
    orderNumber: string,
    customerName: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    total: number,
    currency: string,
    orderType: string,
    estimatedTime?: string
  ) =>
    sendEmail({
      to,
      template: 'order-confirmation',
      templateData: {
        orderNumber,
        customerName,
        items,
        total,
        currency,
        orderType,
        estimatedTime,
      },
    }),
};

export default emailService;
