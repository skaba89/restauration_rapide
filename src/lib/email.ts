// ============================================
// Restaurant OS - Email Service
// Email notification system with templates
// ============================================

import { logger } from '@/lib/logger';

// Email configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

// Get email configuration from environment
const getEmailConfig = (): EmailConfig => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Restaurant OS',
    email: process.env.EMAIL_FROM_ADDRESS || 'noreply@restaurant-os.app',
  },
});

// Email recipient
interface EmailRecipient {
  email: string;
  name?: string;
}

// Email attachment
interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

// Base email options
interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

// Email template data types
interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
  estimatedTime?: string;
  deliveryAddress?: string;
  paymentMethod: string;
  restaurantName: string;
  restaurantPhone?: string;
}

interface ReservationEmailData {
  customerName: string;
  date: string;
  time: string;
  partySize: number;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  confirmationCode: string;
  specialRequests?: string;
}

interface DeliveryEmailData {
  customerName: string;
  orderNumber: string;
  driverName: string;
  driverPhone: string;
  estimatedTime: string;
  trackingUrl: string;
  restaurantName: string;
}

interface PaymentEmailData {
  customerName: string;
  orderNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  date: string;
  restaurantName: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  restaurantName?: string;
  loginUrl: string;
}

interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

// ============================================
// Email Templates
// ============================================

const emailTemplates = {
  // Base HTML wrapper
  base: (content: string, title: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-content {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 30px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f97316;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #f97316;
      margin: 0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #f97316;
    }
    .content {
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #f97316;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .button:hover {
      background-color: #ea580c;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      margin-top: 20px;
      font-size: 12px;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }
    th {
      background-color: #f8f8f8;
      font-weight: bold;
    }
    .total-row {
      font-weight: bold;
      font-size: 18px;
    }
    .highlight {
      background-color: #fff7ed;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }
    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .text-center {
      text-align: center;
    }
    .mt-4 {
      margin-top: 20px;
    }
    .mb-4 {
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-content">
      <div class="header">
        <div class="logo">🍽️ Restaurant OS</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Restaurant OS. Tous droits réservés.</p>
        <p>
          <a href="https://restaurant-os.app">restaurant-os.app</a> | 
          <a href="https://restaurant-os.app/support">Support</a> |
          <a href="https://restaurant-os.app/unsubscribe">Se désinscrire</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `,

  // Order confirmation email
  orderConfirmation: (data: OrderEmailData) => {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toLocaleString()} FCFA</td>
        <td>${item.total.toLocaleString()} FCFA</td>
      </tr>
    `).join('');

    const orderTypeLabel = {
      DINE_IN: 'Sur place',
      DELIVERY: 'Livraison',
      TAKEAWAY: 'À emporter',
    }[data.orderType];

    return emailTemplates.base(`
      <h2>Bonjour ${data.customerName},</h2>
      <p>Votre commande a été confirmée !</p>
      
      <div class="highlight">
        <p><strong>Commande N°:</strong> ${data.orderNumber}</p>
        <p><strong>Type:</strong> <span class="badge badge-info">${orderTypeLabel}</span></p>
        ${data.estimatedTime ? `<p><strong>Temps estimé:</strong> ${data.estimatedTime}</p>` : ''}
      </div>

      <h3>Récapitulatif de votre commande</h3>
      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">Sous-total</td>
            <td>${data.subtotal.toLocaleString()} FCFA</td>
          </tr>
          ${data.tax ? `
          <tr>
            <td colspan="3">TVA</td>
            <td>${data.tax.toLocaleString()} FCFA</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td>${data.total.toLocaleString()} FCFA</td>
          </tr>
        </tfoot>
      </table>

      ${data.deliveryAddress ? `
      <div class="highlight">
        <p><strong>Adresse de livraison:</strong></p>
        <p>${data.deliveryAddress}</p>
      </div>
      ` : ''}

      <p><strong>Mode de paiement:</strong> ${data.paymentMethod}</p>

      <p class="mt-4">
        Vous avez des questions ? Contactez-nous au ${data.restaurantPhone || 'votre restaurant'}.
      </p>
      
      <div class="text-center mt-4">
        <a href="https://restaurant-os.app/orders/${data.orderNumber}" class="button">
          Voir ma commande
        </a>
      </div>
    `, `Confirmation de commande - ${data.orderNumber}`);
  },

  // Reservation confirmation email
  reservationConfirmation: (data: ReservationEmailData) => emailTemplates.base(`
    <h2>Bonjour ${data.customerName},</h2>
    <p>Votre réservation a été confirmée !</p>
    
    <div class="highlight">
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Heure:</strong> ${data.time}</p>
      <p><strong>Nombre de personnes:</strong> ${data.partySize}</p>
      <p><strong>Code de confirmation:</strong> <span class="badge badge-success">${data.confirmationCode}</span></p>
    </div>

    ${data.specialRequests ? `
    <p><strong>Demandes spéciales:</strong></p>
    <p>${data.specialRequests}</p>
    ` : ''}

    <h3>${data.restaurantName}</h3>
    ${data.restaurantAddress ? `<p>${data.restaurantAddress}</p>` : ''}
    ${data.restaurantPhone ? `<p>Tél: ${data.restaurantPhone}</p>` : ''}

    <p class="mt-4">
      En cas d'empêchement, merci de nous prévenir au moins 2 heures à l'avance.
    </p>
    
    <div class="text-center mt-4">
      <a href="https://restaurant-os.app/reservations/${data.confirmationCode}" class="button">
        Gérer ma réservation
      </a>
    </div>
  `, `Confirmation de réservation - ${data.restaurantName}`),

  // Delivery notification email
  deliveryNotification: (data: DeliveryEmailData) => emailTemplates.base(`
    <h2>Bonjour ${data.customerName},</h2>
    <p>Votre commande est en route !</p>
    
    <div class="highlight">
      <p><strong>Commande N°:</strong> ${data.orderNumber}</p>
      <p><strong>Livreur:</strong> ${data.driverName}</p>
      <p><strong>Contact livreur:</strong> ${data.driverPhone}</p>
      <p><strong>Arrivée estimée:</strong> ${data.estimatedTime}</p>
    </div>

    <p>Votre livreur vous contactera à son arrivée.</p>

    <div class="text-center mt-4">
      <a href="${data.trackingUrl}" class="button">
        Suivre ma livraison
      </a>
    </div>

    <p class="mt-4">
      <strong>${data.restaurantName}</strong> vous remercie pour votre confiance !
    </p>
  `, `Votre livraison est en route - ${data.orderNumber}`),

  // Payment confirmation email
  paymentConfirmation: (data: PaymentEmailData) => emailTemplates.base(`
    <h2>Bonjour ${data.customerName},</h2>
    <p>Votre paiement a été confirmé !</p>
    
    <div class="highlight">
      <p><strong>Commande N°:</strong> ${data.orderNumber}</p>
      <p><strong>Montant:</strong> ${data.amount.toLocaleString()} ${data.currency}</p>
      <p><strong>Mode de paiement:</strong> ${data.paymentMethod}</p>
      <p><strong>Référence:</strong> ${data.transactionId}</p>
      <p><strong>Date:</strong> ${data.date}</p>
    </div>

    <span class="badge badge-success">Paiement confirmé</span>

    <p class="mt-4">
      Merci pour votre achat chez <strong>${data.restaurantName}</strong> !
    </p>
  `, `Confirmation de paiement - ${data.orderNumber}`),

  // Welcome email
  welcome: (data: WelcomeEmailData) => emailTemplates.base(`
    <h2>Bienvenue ${data.name} !</h2>
    <p>Merci de rejoindre Restaurant OS, la plateforme de gestion de restaurant la plus complète pour l'Afrique.</p>
    
    <div class="highlight">
      <p><strong>Votre email:</strong> ${data.email}</p>
      ${data.restaurantName ? `<p><strong>Restaurant:</strong> ${data.restaurantName}</p>` : ''}
    </div>

    <h3>Pour commencer :</h3>
    <ol>
      <li>Complétez votre profil</li>
      <li>Configurez votre restaurant</li>
      <li>Ajoutez votre menu</li>
      <li>Configurez les modes de paiement (Mobile Money, Carte, etc.)</li>
    </ol>

    <div class="text-center mt-4">
      <a href="${data.loginUrl}" class="button">
        Accéder à mon espace
      </a>
    </div>

    <p class="mt-4">
      Besoin d'aide ? Notre équipe support est disponible 24/7.
    </p>
  `, `Bienvenue sur Restaurant OS`),

  // Password reset email
  passwordReset: (data: PasswordResetEmailData) => emailTemplates.base(`
    <h2>Bonjour ${data.name},</h2>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    
    <div class="highlight text-center">
      <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
      <p><strong>Ce lien expire dans ${data.expiresIn}</strong></p>
    </div>

    <div class="text-center mt-4">
      <a href="${data.resetUrl}" class="button">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <p class="mt-4">
      Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.
    </p>
  `, `Réinitialisation de mot de passe`),

  // Order status update email
  orderStatusUpdate: (data: { customerName: string; orderNumber: string; status: string; estimatedTime?: string; message?: string }) => {
    const statusLabels: Record<string, string> = {
      CONFIRMED: 'Confirmée',
      PREPARING: 'En préparation',
      READY: 'Prête',
      OUT_FOR_DELIVERY: 'En livraison',
      DELIVERED: 'Livrée',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    };

    return emailTemplates.base(`
      <h2>Bonjour ${data.customerName},</h2>
      <p>Le statut de votre commande a été mis à jour.</p>
      
      <div class="highlight">
        <p><strong>Commande N°:</strong> ${data.orderNumber}</p>
        <p><strong>Nouveau statut:</strong> <span class="badge badge-info">${statusLabels[data.status] || data.status}</span></p>
        ${data.estimatedTime ? `<p><strong>Temps estimé:</strong> ${data.estimatedTime}</p>` : ''}
      </div>

      ${data.message ? `<p>${data.message}</p>` : ''}

      <div class="text-center mt-4">
        <a href="https://restaurant-os.app/orders/${data.orderNumber}" class="button">
          Voir ma commande
        </a>
      </div>
    `, `Mise à jour de votre commande - ${data.orderNumber}`);
  },
};

// ============================================
// Email Service Class
// ============================================

class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = getEmailConfig();
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<boolean> {
    try {
      // In production, use a proper email library like nodemailer
      // For now, we log the email
      logger.info('Sending email', {
        to: Array.isArray(options.to) ? options.to.map(r => r.email) : options.to.email,
        subject: options.subject,
      });

      // Development mode: log email content
      if (process.env.NODE_ENV === 'development') {
        console.log('--- EMAIL ---');
        console.log('To:', Array.isArray(options.to) ? options.to.map(r => r.email).join(', ') : options.to.email);
        console.log('Subject:', options.subject);
        console.log('HTML length:', options.html.length);
        console.log('--- END EMAIL ---');
      }

      // TODO: Implement actual email sending with nodemailer
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransport(this.config);
      // await transporter.sendMail({
      //   from: `${this.config.from.name} <${this.config.from.email}>`,
      //   to: Array.isArray(options.to) 
      //     ? options.to.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(', ')
      //     : options.to.name ? `${options.to.name} <${options.to.email}>` : options.to.email,
      //   subject: options.subject,
      //   html: options.html,
      //   text: options.text,
      //   attachments: options.attachments,
      // });

      return true;
    } catch (error) {
      logger.error('Failed to send email', { error, options });
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(to: EmailRecipient, data: OrderEmailData): Promise<boolean> {
    return this.send({
      to,
      subject: `Confirmation de commande - ${data.orderNumber}`,
      html: emailTemplates.orderConfirmation(data),
    });
  }

  /**
   * Send reservation confirmation email
   */
  async sendReservationConfirmation(to: EmailRecipient, data: ReservationEmailData): Promise<boolean> {
    return this.send({
      to,
      subject: `Confirmation de réservation - ${data.restaurantName}`,
      html: emailTemplates.reservationConfirmation(data),
    });
  }

  /**
   * Send delivery notification email
   */
  async sendDeliveryNotification(to: EmailRecipient, data: DeliveryEmailData): Promise<boolean> {
    return this.send({
      to,
      subject: `Votre livraison est en route - ${data.orderNumber}`,
      html: emailTemplates.deliveryNotification(data),
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(to: EmailRecipient, data: PaymentEmailData): Promise<boolean> {
    return this.send({
      to,
      subject: `Confirmation de paiement - ${data.orderNumber}`,
      html: emailTemplates.paymentConfirmation(data),
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcome(to: EmailRecipient, data: WelcomeEmailData): Promise<boolean> {
    return this.send({
      to,
      subject: 'Bienvenue sur Restaurant OS',
      html: emailTemplates.welcome(data),
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: EmailRecipient, data: PasswordResetEmailData): Promise<boolean> {
    return this.send({
      to,
      subject: 'Réinitialisation de mot de passe',
      html: emailTemplates.passwordReset(data),
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    to: EmailRecipient,
    data: { customerName: string; orderNumber: string; status: string; estimatedTime?: string; message?: string }
  ): Promise<boolean> {
    return this.send({
      to,
      subject: `Mise à jour de votre commande - ${data.orderNumber}`,
      html: emailTemplates.orderStatusUpdate(data),
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export { emailTemplates };
