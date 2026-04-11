// ============================================
// Restaurant OS - Email Templates
// Comprehensive email templates with i18n support (French/English)
// ============================================

/**
 * Supported locales
 */
export type Locale = 'fr' | 'en';

/**
 * Email recipient interface
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email attachment interface
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

/**
 * Base email options
 */
export interface BaseEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  locale?: Locale;
  attachments?: EmailAttachment[];
  trackingId?: string;
}

/**
 * Order email data
 */
export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    notes?: string;
  }>;
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
  estimatedTime?: string;
  deliveryAddress?: string;
  paymentMethod: string;
  restaurantName: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  tableNumber?: string;
  notes?: string;
}

/**
 * Invoice/Receipt email data
 */
export interface InvoiceEmailData {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate?: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  date: string;
  dueDate?: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantTaxId?: string;
}

/**
 * Reservation email data
 */
export interface ReservationEmailData {
  customerName: string;
  date: string;
  time: string;
  partySize: number;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  confirmationCode: string;
  specialRequests?: string;
  tableNumber?: string;
  occasion?: string;
}

/**
 * Password reset email data
 */
export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

/**
 * Delivery status email data
 */
export interface DeliveryStatusEmailData {
  customerName: string;
  orderNumber: string;
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVING' | 'DELIVERED';
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
  trackingUrl?: string;
  restaurantName: string;
  message?: string;
}

/**
 * Welcome email data
 */
export interface WelcomeEmailData {
  name: string;
  email: string;
  restaurantName?: string;
  loginUrl: string;
  verificationUrl?: string;
}

/**
 * Translations for email templates
 */
const translations = {
  fr: {
    common: {
      hello: 'Bonjour',
      thankYou: 'Merci',
      regards: 'Cordialement',
      team: "L'équipe",
      viewOnline: 'Voir en ligne',
      unsubscribe: 'Se désinscrire',
      support: 'Support',
      allRightsReserved: 'Tous droits réservés',
      copyright: '©',
    },
    order: {
      confirmation: 'Confirmation de commande',
      orderNumber: 'Commande N°',
      orderType: 'Type de commande',
      dineIn: 'Sur place',
      delivery: 'Livraison',
      takeaway: 'À emporter',
      estimatedTime: 'Temps estimé',
      orderSummary: 'Récapitulatif de votre commande',
      item: 'Article',
      quantity: 'Quantité',
      unitPrice: 'Prix unitaire',
      total: 'Total',
      subtotal: 'Sous-total',
      tax: 'TVA',
      deliveryFee: 'Frais de livraison',
      discount: 'Réduction',
      deliveryAddress: 'Adresse de livraison',
      paymentMethod: 'Mode de paiement',
      viewOrder: 'Voir ma commande',
      confirmed: 'Votre commande a été confirmée !',
      tableNumber: 'Table N°',
      notes: 'Remarques',
    },
    invoice: {
      title: 'Facture / Reçu',
      invoiceNumber: 'Facture N°',
      orderNumber: 'Commande N°',
      date: 'Date',
      dueDate: 'Date d\'échéance',
      billTo: 'Facturer à',
      paymentStatus: 'Statut du paiement',
      paid: 'Payé',
      pending: 'En attente',
      transactionId: 'Référence de transaction',
      downloadPdf: 'Télécharger PDF',
    },
    reservation: {
      confirmation: 'Confirmation de réservation',
      date: 'Date',
      time: 'Heure',
      partySize: 'Nombre de personnes',
      confirmationCode: 'Code de confirmation',
      specialRequests: 'Demandes spéciales',
      tableNumber: 'Table N°',
      occasion: 'Occasion',
      manageReservation: 'Gérer ma réservation',
      cancellationNotice: "En cas d'empêchement, merci de nous prévenir au moins 2 heures à l'avance.",
      confirmed: 'Votre réservation a été confirmée !',
    },
    delivery: {
      title: 'Mise à jour de livraison',
      orderNumber: 'Commande N°',
      status: 'Statut',
      pickedUp: 'Commande récupérée',
      inTransit: 'En cours de livraison',
      arriving: 'En arrivant',
      delivered: 'Livrée',
      driverName: 'Livreur',
      driverPhone: 'Contact livreur',
      estimatedTime: 'Arrivée estimée',
      trackDelivery: 'Suivre ma livraison',
      onTheWay: 'Votre commande est en route !',
      willContact: 'Votre livreur vous contactera à son arrivée.',
    },
    passwordReset: {
      title: 'Réinitialisation de mot de passe',
      greeting: 'Vous avez demandé la réinitialisation de votre mot de passe.',
      clickButton: 'Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :',
      expiresIn: 'Ce lien expire dans',
      ignoreIfNotRequested: "Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.",
      resetButton: 'Réinitialiser mon mot de passe',
    },
    welcome: {
      title: 'Bienvenue sur Restaurant OS',
      greeting: 'Merci de rejoindre Restaurant OS',
      subheading: 'La plateforme de gestion de restaurant la plus complète pour l\'Afrique.',
      yourEmail: 'Votre email',
      restaurant: 'Restaurant',
      getStarted: 'Pour commencer :',
      step1: 'Complétez votre profil',
      step2: 'Configurez votre restaurant',
      step3: 'Ajoutez votre menu',
      step4: 'Configurez les modes de paiement (Mobile Money, Carte, etc.)',
      accessAccount: 'Accéder à mon espace',
      needHelp: "Besoin d'aide ? Notre équipe support est disponible 24/7.",
    },
  },
  en: {
    common: {
      hello: 'Hello',
      thankYou: 'Thank you',
      regards: 'Best regards',
      team: 'The Team',
      viewOnline: 'View online',
      unsubscribe: 'Unsubscribe',
      support: 'Support',
      allRightsReserved: 'All rights reserved',
      copyright: '©',
    },
    order: {
      confirmation: 'Order Confirmation',
      orderNumber: 'Order #',
      orderType: 'Order Type',
      dineIn: 'Dine-in',
      delivery: 'Delivery',
      takeaway: 'Takeaway',
      estimatedTime: 'Estimated time',
      orderSummary: 'Order Summary',
      item: 'Item',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Tax',
      deliveryFee: 'Delivery Fee',
      discount: 'Discount',
      deliveryAddress: 'Delivery Address',
      paymentMethod: 'Payment Method',
      viewOrder: 'View My Order',
      confirmed: 'Your order has been confirmed!',
      tableNumber: 'Table #',
      notes: 'Notes',
    },
    invoice: {
      title: 'Invoice / Receipt',
      invoiceNumber: 'Invoice #',
      orderNumber: 'Order #',
      date: 'Date',
      dueDate: 'Due Date',
      billTo: 'Bill To',
      paymentStatus: 'Payment Status',
      paid: 'Paid',
      pending: 'Pending',
      transactionId: 'Transaction Reference',
      downloadPdf: 'Download PDF',
    },
    reservation: {
      confirmation: 'Reservation Confirmation',
      date: 'Date',
      time: 'Time',
      partySize: 'Party Size',
      confirmationCode: 'Confirmation Code',
      specialRequests: 'Special Requests',
      tableNumber: 'Table #',
      occasion: 'Occasion',
      manageReservation: 'Manage My Reservation',
      cancellationNotice: 'If you need to cancel, please notify us at least 2 hours in advance.',
      confirmed: 'Your reservation has been confirmed!',
    },
    delivery: {
      title: 'Delivery Update',
      orderNumber: 'Order #',
      status: 'Status',
      pickedUp: 'Order picked up',
      inTransit: 'In transit',
      arriving: 'Arriving soon',
      delivered: 'Delivered',
      driverName: 'Driver',
      driverPhone: 'Driver Contact',
      estimatedTime: 'Estimated arrival',
      trackDelivery: 'Track My Delivery',
      onTheWay: 'Your order is on the way!',
      willContact: 'Your driver will contact you upon arrival.',
    },
    passwordReset: {
      title: 'Password Reset',
      greeting: 'You have requested to reset your password.',
      clickButton: 'Click the button below to reset your password:',
      expiresIn: 'This link expires in',
      ignoreIfNotRequested: 'If you did not make this request, you can ignore this email.',
      resetButton: 'Reset My Password',
    },
    welcome: {
      title: 'Welcome to Restaurant OS',
      greeting: 'Thank you for joining Restaurant OS',
      subheading: 'The most comprehensive restaurant management platform for Africa.',
      yourEmail: 'Your email',
      restaurant: 'Restaurant',
      getStarted: 'To get started:',
      step1: 'Complete your profile',
      step2: 'Configure your restaurant',
      step3: 'Add your menu',
      step4: 'Set up payment methods (Mobile Money, Card, etc.)',
      accessAccount: 'Access My Account',
      needHelp: 'Need help? Our support team is available 24/7.',
    },
  },
};

/**
 * Get translations for a locale
 */
function t(locale: Locale) {
  return translations[locale] || translations.fr;
}

/**
 * Format currency
 */
function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

/**
 * Base HTML email wrapper with Restaurant OS branding
 */
function baseTemplate(content: string, title: string, locale: Locale, trackingId?: string): string {
  const tr = t(locale);
  const year = new Date().getFullYear();
  
  // Tracking pixel (1x1 transparent GIF)
  const trackingPixel = trackingId 
    ? `<img src="https://restaurant-os.app/api/email/track/${trackingId}/open" width="1" height="1" alt="" style="display:block;height:1px;width:1px;border:0;" />`
    : '';
  
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f4f4f5;
    }
    /* Client-specific styles */
    #outlook a {
      padding: 0;
    }
    .ReadMsgBody {
      width: 100%;
    }
    .ExternalClass {
      width: 100%;
    }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }
    /* Template styles */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 30px 40px;
      text-align: center;
    }
    .email-logo {
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
    }
    .email-body {
      padding: 40px;
    }
    .email-footer {
      background-color: #fafafa;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    h1 {
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 20px;
      line-height: 1.3;
    }
    h2 {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 15px;
      line-height: 1.4;
    }
    h3 {
      color: #374151;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0 10px;
      line-height: 1.4;
    }
    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px;
    }
    a {
      color: #f97316;
      text-decoration: underline;
    }
    a:hover {
      color: #ea580c;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
    }
    .button:hover {
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
    }
    .highlight-box {
      background-color: #fff7ed;
      border-left: 4px solid #f97316;
      border-radius: 0 8px 8px 0;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-radius: 0 8px 8px 0;
      padding: 20px;
      margin: 20px 0;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 0 8px 8px 0;
      padding: 20px;
      margin: 20px 0;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table.data-table th,
    table.data-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    table.data-table th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    table.data-table td {
      color: #4b5563;
      font-size: 15px;
    }
    table.data-table tfoot td {
      font-weight: 600;
      color: #1f2937;
      border-bottom: none;
    }
    .total-row td {
      font-size: 18px;
      color: #f97316;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge-orange {
      background-color: #fff7ed;
      color: #c2410c;
    }
    .badge-green {
      background-color: #dcfce7;
      color: #166534;
    }
    .badge-blue {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-gray {
      background-color: #f3f4f6;
      color: #4b5563;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 25px 0;
    }
    .text-center {
      text-align: center;
    }
    .mt-4 {
      margin-top: 25px;
    }
    .mb-4 {
      margin-bottom: 25px;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #6b7280;
      font-size: 14px;
      margin: 0 10px;
    }
    .footer-text {
      color: #9ca3af;
      font-size: 13px;
      margin: 10px 0;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .email-header,
      .email-body,
      .email-footer {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      .button {
        width: 100% !important;
        padding: 16px 20px !important;
      }
      table.data-table th,
      table.data-table td {
        padding: 10px 8px !important;
        font-size: 14px !important;
      }
    }
  </style>
</head>
<body style="background-color: #f4f4f5; margin: 0; padding: 20px;">
  ${trackingPixel}
  <center>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
      <tr>
        <td style="padding: 20px;">
          <div class="email-container">
            <div class="email-header">
              <a href="https://restaurant-os.app" class="email-logo">🍽️ Restaurant OS</a>
            </div>
            <div class="email-body">
              ${content}
            </div>
            <div class="email-footer">
              <div class="footer-links">
                <a href="https://restaurant-os.app">restaurant-os.app</a>
                <span style="color: #d1d5db;">|</span>
                <a href="https://restaurant-os.app/support">${tr.common.support}</a>
                <span style="color: #d1d5db;">|</span>
                <a href="https://restaurant-os.app/unsubscribe">${tr.common.unsubscribe}</a>
              </div>
              <p class="footer-text">
                ${tr.common.copyright} ${year} Restaurant OS. ${tr.common.allRightsReserved}
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

/**
 * Generate plain text version of emails
 */
function generatePlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// ============================================
// Email Templates
// ============================================

export const emailTemplates = {
  /**
   * Welcome email template
   */
  welcome: (data: WelcomeEmailData, locale: Locale = 'fr'): { html: string; text: string; subject: string } => {
    const tr = t(locale);
    
    const content = `
      <h1>${tr.common.hello} ${data.name}! 👋</h1>
      <p>${tr.welcome.greeting}</p>
      <p style="color: #6b7280; font-size: 15px;">${tr.welcome.subheading}</p>
      
      <div class="highlight-box">
        <p style="margin: 0;"><strong>${tr.welcome.yourEmail}:</strong> ${data.email}</p>
        ${data.restaurantName ? `<p style="margin: 10px 0 0;"><strong>${tr.welcome.restaurant}:</strong> ${data.restaurantName}</p>` : ''}
      </div>
      
      <h3>${tr.welcome.getStarted}</h3>
      <ol style="color: #4b5563; padding-left: 20px; margin: 15px 0;">
        <li style="margin-bottom: 8px;">${tr.welcome.step1}</li>
        <li style="margin-bottom: 8px;">${tr.welcome.step2}</li>
        <li style="margin-bottom: 8px;">${tr.welcome.step3}</li>
        <li>${tr.welcome.step4}</li>
      </ol>
      
      <div class="text-center mt-4">
        <a href="${data.loginUrl}" class="button">${tr.welcome.accessAccount}</a>
      </div>
      
      ${data.verificationUrl ? `
        <div class="info-box">
          <p style="margin: 0; font-size: 14px;">Please verify your email address by clicking <a href="${data.verificationUrl}">here</a>.</p>
        </div>
      ` : ''}
      
      <p class="mt-4" style="font-size: 14px; color: #6b7280;">${tr.welcome.needHelp}</p>
    `;
    
    const html = baseTemplate(content, tr.welcome.title, locale);
    
    return {
      html,
      text: generatePlainText(html),
      subject: tr.welcome.title,
    };
  },

  /**
   * Order confirmation email template
   */
  orderConfirmation: (data: OrderEmailData, locale: Locale = 'fr'): { html: string; text: string; subject: string } => {
    const tr = t(locale);
    
    const orderTypeLabel: Record<string, string> = {
      DINE_IN: tr.order.dineIn,
      DELIVERY: tr.order.delivery,
      TAKEAWAY: tr.order.takeaway,
    };
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td>
          <strong>${item.name}</strong>
          ${item.notes ? `<br><span style="font-size: 13px; color: #6b7280;">${item.notes}</span>` : ''}
        </td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price, locale)}</td>
        <td><strong>${formatCurrency(item.total, locale)}</strong></td>
      </tr>
    `).join('');
    
    const content = `
      <h1>${tr.common.hello} ${data.customerName},</h1>
      <p>${tr.order.confirmed}</p>
      
      <div class="highlight-box">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.order.orderNumber}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.order.orderType}</strong></td>
            <td style="padding: 5px 0; text-align: right;"><span class="badge badge-orange">${orderTypeLabel[data.orderType]}</span></td>
          </tr>
          ${data.estimatedTime ? `
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.order.estimatedTime}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.estimatedTime}</td>
          </tr>
          ` : ''}
          ${data.tableNumber ? `
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.order.tableNumber}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.tableNumber}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <h2>${tr.order.orderSummary}</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>${tr.order.item}</th>
            <th>${tr.order.quantity}</th>
            <th>${tr.order.unitPrice}</th>
            <th>${tr.order.total}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.subtotal}</td>
            <td>${formatCurrency(data.subtotal, locale)}</td>
          </tr>
          ${data.tax ? `
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.tax}</td>
            <td>${formatCurrency(data.tax, locale)}</td>
          </tr>
          ` : ''}
          ${data.deliveryFee ? `
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.deliveryFee}</td>
            <td>${formatCurrency(data.deliveryFee, locale)}</td>
          </tr>
          ` : ''}
          ${data.discount ? `
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.discount}</td>
            <td style="color: #22c55e;">-${formatCurrency(data.discount, locale)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">${tr.order.total}</td>
            <td>${formatCurrency(data.total, locale)}</td>
          </tr>
        </tfoot>
      </table>
      
      ${data.deliveryAddress ? `
        <h3>${tr.order.deliveryAddress}</h3>
        <p style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">${data.deliveryAddress}</p>
      ` : ''}
      
      <p><strong>${tr.order.paymentMethod}:</strong> ${data.paymentMethod}</p>
      
      ${data.notes ? `
        <div class="warning-box">
          <p style="margin: 0;"><strong>${tr.order.notes}:</strong> ${data.notes}</p>
        </div>
      ` : ''}
      
      <div class="text-center mt-4">
        <a href="https://restaurant-os.app/orders/${data.orderNumber}" class="button">${tr.order.viewOrder}</a>
      </div>
      
      <p class="mt-4" style="font-size: 14px; color: #6b7280;">
        ${data.restaurantPhone ? `Questions? Contactez-nous au ${data.restaurantPhone}.` : ''}
      </p>
    `;
    
    const html = baseTemplate(content, `${tr.order.confirmation} - ${data.orderNumber}`, locale);
    
    return {
      html,
      text: generatePlainText(html),
      subject: `${tr.order.confirmation} - ${data.orderNumber}`,
    };
  },

  /**
   * Invoice/Receipt email template
   */
  invoice: (data: InvoiceEmailData, locale: Locale = 'fr'): { html: string; text: string; subject: string } => {
    const tr = t(locale);
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price, locale)}</td>
        <td><strong>${formatCurrency(item.total, locale)}</strong></td>
      </tr>
    `).join('');
    
    const paymentStatusBadge = data.paymentStatus === 'PAID' 
      ? '<span class="badge badge-green">Payé</span>'
      : '<span class="badge badge-gray">En attente</span>';
    
    const content = `
      <h1>${tr.invoice.title}</h1>
      
      <div class="highlight-box">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.invoice.invoiceNumber}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.invoice.orderNumber}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.invoice.date}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.date}</td>
          </tr>
          ${data.dueDate ? `
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.invoice.dueDate}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.dueDate}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.invoice.paymentStatus}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${paymentStatusBadge}</td>
          </tr>
        </table>
      </div>
      
      <h3>${tr.invoice.billTo}</h3>
      <p style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <strong>${data.customerName}</strong><br>
        ${data.customerEmail}
      </p>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>${tr.order.item}</th>
            <th>${tr.order.quantity}</th>
            <th>${tr.order.unitPrice}</th>
            <th>${tr.order.total}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.subtotal}</td>
            <td>${formatCurrency(data.subtotal, locale)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.tax} ${data.taxRate ? `(${data.taxRate}%)` : ''}</td>
            <td>${formatCurrency(data.tax, locale)}</td>
          </tr>
          ${data.deliveryFee ? `
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.deliveryFee}</td>
            <td>${formatCurrency(data.deliveryFee, locale)}</td>
          </tr>
          ` : ''}
          ${data.discount ? `
          <tr>
            <td colspan="3" style="text-align: right;">${tr.order.discount}</td>
            <td style="color: #22c55e;">-${formatCurrency(data.discount, locale)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">${tr.order.total}</td>
            <td>${formatCurrency(data.total, locale)}</td>
          </tr>
        </tfoot>
      </table>
      
      ${data.transactionId ? `
        <p><strong>${tr.invoice.transactionId}:</strong> ${data.transactionId}</p>
      ` : ''}
      
      <p><strong>${tr.order.paymentMethod}:</strong> ${data.paymentMethod}</p>
      
      <div class="text-center mt-4">
        <a href="https://restaurant-os.app/invoices/${data.invoiceNumber}/pdf" class="button">${tr.invoice.downloadPdf}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-weight: 600;">${data.restaurantName}</p>
        ${data.restaurantAddress ? `<p style="margin: 5px 0; font-size: 14px; color: #6b7280;">${data.restaurantAddress}</p>` : ''}
        ${data.restaurantPhone ? `<p style="margin: 5px 0; font-size: 14px; color: #6b7280;">${data.restaurantPhone}</p>` : ''}
        ${data.restaurantTaxId ? `<p style="margin: 5px 0; font-size: 14px; color: #6b7280;">N° Fiscal: ${data.restaurantTaxId}</p>` : ''}
      </div>
    `;
    
    const html = baseTemplate(content, `${tr.invoice.title} - ${data.invoiceNumber}`, locale);
    
    return {
      html,
      text: generatePlainText(html),
      subject: `${tr.invoice.title} - ${data.invoiceNumber}`,
    };
  },

  /**
   * Reservation confirmation email template
   */
  reservationConfirmation: (data: ReservationEmailData, locale: Locale = 'fr'): { html: string; text: string; subject: string } => {
    const tr = t(locale);
    
    const content = `
      <h1>${tr.common.hello} ${data.customerName},</h1>
      <p>${tr.reservation.confirmed}</p>
      
      <div class="highlight-box">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.reservation.date}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.reservation.time}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.time}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.reservation.partySize}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.partySize} ${locale === 'fr' ? 'personnes' : 'guests'}</td>
          </tr>
          ${data.tableNumber ? `
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.reservation.tableNumber}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.tableNumber}</td>
          </tr>
          ` : ''}
          ${data.occasion ? `
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.reservation.occasion}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.occasion}</td>
          </tr>
          ` : ''}
        </table>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #fed7aa; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #9a3412;">${tr.reservation.confirmationCode}</p>
          <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #c2410c; letter-spacing: 2px;">${data.confirmationCode}</p>
        </div>
      </div>
      
      ${data.specialRequests ? `
        <h3>${tr.reservation.specialRequests}</h3>
        <p style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">${data.specialRequests}</p>
      ` : ''}
      
      <div class="info-box">
        <h3 style="margin: 0 0 10px; color: #166534;">${data.restaurantName}</h3>
        ${data.restaurantAddress ? `<p style="margin: 0; font-size: 14px;">${data.restaurantAddress}</p>` : ''}
        ${data.restaurantPhone ? `<p style="margin: 5px 0 0; font-size: 14px;">${data.restaurantPhone}</p>` : ''}
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">${tr.reservation.cancellationNotice}</p>
      
      <div class="text-center mt-4">
        <a href="https://restaurant-os.app/reservations/${data.confirmationCode}" class="button">${tr.reservation.manageReservation}</a>
      </div>
    `;
    
    const html = baseTemplate(content, `${tr.reservation.confirmation} - ${data.restaurantName}`, locale);
    
    return {
      html,
      text: generatePlainText(html),
      subject: `${tr.reservation.confirmation} - ${data.restaurantName}`,
    };
  },

  /**
   * Password reset email template
   */
  passwordReset: (data: PasswordResetEmailData, locale: Locale = 'fr'): { html: string; text: string; subject: string } => {
    const tr = t(locale);
    
    const content = `
      <h1>${tr.common.hello} ${data.name},</h1>
      <p>${tr.passwordReset.greeting}</p>
      
      <div class="highlight-box text-center">
        <p style="margin: 0;">${tr.passwordReset.clickButton}</p>
        <p style="margin: 15px 0 0; color: #c2410c; font-weight: 600;">${tr.passwordReset.expiresIn} ${data.expiresIn}</p>
      </div>
      
      <div class="text-center mt-4">
        <a href="${data.resetUrl}" class="button">${tr.passwordReset.resetButton}</a>
      </div>
      
      <p class="mt-4" style="font-size: 14px; color: #6b7280;">${tr.passwordReset.ignoreIfNotRequested}</p>
      
      <div class="warning-box">
        <p style="margin: 0; font-size: 14px;">
          <strong>Security tip:</strong> If you didn't request this change, your account may be compromised. 
          Please contact support immediately.
        </p>
      </div>
    `;
    
    const html = baseTemplate(content, tr.passwordReset.title, locale);
    
    return {
      html,
      text: generatePlainText(html),
      subject: tr.passwordReset.title,
    };
  },

  /**
   * Delivery status update email template
   */
  deliveryStatus: (data: DeliveryStatusEmailData, locale: Locale = 'fr'): { html: string; text: string; subject: string } => {
    const tr = t(locale);
    
    const statusLabels: Record<string, { label: string; badge: string }> = {
      PICKED_UP: { label: tr.delivery.pickedUp, badge: 'badge-blue' },
      IN_TRANSIT: { label: tr.delivery.inTransit, badge: 'badge-orange' },
      ARRIVING: { label: tr.delivery.arriving, badge: 'badge-orange' },
      DELIVERED: { label: tr.delivery.delivered, badge: 'badge-green' },
    };
    
    const status = statusLabels[data.status] || { label: data.status, badge: 'badge-gray' };
    
    const content = `
      <h1>${tr.common.hello} ${data.customerName},</h1>
      <p>${tr.delivery.onTheWay}</p>
      
      <div class="highlight-box">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.delivery.orderNumber}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.delivery.status}</strong></td>
            <td style="padding: 5px 0; text-align: right;"><span class="badge ${status.badge}">${status.label}</span></td>
          </tr>
          ${data.estimatedTime ? `
          <tr>
            <td style="padding: 5px 0;"><strong>${tr.delivery.estimatedTime}</strong></td>
            <td style="padding: 5px 0; text-align: right;">${data.estimatedTime}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${data.driverName ? `
        <h3>${tr.delivery.driverName}</h3>
        <div style="display: inline-block; background-color: #f9fafb; padding: 15px 20px; border-radius: 8px;">
          <p style="margin: 0; font-weight: 600;">${data.driverName}</p>
          ${data.driverPhone ? `<p style="margin: 5px 0 0; font-size: 14px;">${data.driverPhone}</p>` : ''}
        </div>
      ` : ''}
      
      <p style="margin-top: 20px;">${tr.delivery.willContact}</p>
      
      ${data.message ? `
        <div class="info-box">
          <p style="margin: 0;">${data.message}</p>
        </div>
      ` : ''}
      
      ${data.trackingUrl ? `
        <div class="text-center mt-4">
          <a href="${data.trackingUrl}" class="button">${tr.delivery.trackDelivery}</a>
        </div>
      ` : ''}
      
      <p class="mt-4" style="font-size: 14px; color: #6b7280;">
        <strong>${data.restaurantName}</strong> ${locale === 'fr' ? 'vous remercie pour votre confiance !' : 'thanks you for your trust!'}
      </p>
    `;
    
    const html = baseTemplate(content, `${tr.delivery.title} - ${data.orderNumber}`, locale);
    
    return {
      html,
      text: generatePlainText(html),
      subject: `${tr.delivery.title} - ${data.orderNumber}`,
    };
  },
};

// Export types
export type {
  Locale,
  EmailRecipient,
  EmailAttachment,
  BaseEmailOptions,
  OrderEmailData,
  InvoiceEmailData,
  ReservationEmailData,
  PasswordResetEmailData,
  DeliveryStatusEmailData,
  WelcomeEmailData,
};
