// ============================================
// Restaurant OS - WhatsApp Service
// Send order confirmations and tracking via WhatsApp
// Popular in Africa, especially Guinea
// ============================================

import { db } from '@/lib/db';

// WhatsApp configuration
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || 'twilio'; // 'twilio' | 'ultramsg' | 'callmebot'
const WHATSAPP_FROM = process.env.WHATSAPP_FROM || '+224620000000'; // Restaurant WhatsApp number

// Twilio config
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

// UltraMSG config (alternative, cheaper)
const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;

// CallMeBot config (free for testing)
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY;

// Types
interface WhatsAppMessage {
  to: string;
  message: string;
  imageUrl?: string;
}

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface OrderWhatsAppData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  orderType: string;
  status: string;
  estimatedTime?: string;
  deliveryAddress?: string;
  restaurantName: string;
  restaurantPhone?: string;
  trackingUrl?: string;
}

/**
 * Format phone number for WhatsApp (Guinea format)
 */
function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If starts with 0, replace with +224 (Guinea)
  if (cleaned.startsWith('0')) {
    cleaned = '+224' + cleaned.substring(1);
  }
  
  // If doesn't start with +, add +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('fr-GN')} ${currency}`;
}

/**
 * Send WhatsApp message via Twilio
 */
async function sendViaTwilio(data: WhatsAppMessage): Promise<WhatsAppResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('Twilio credentials not configured');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const to = `whatsapp:${formatPhoneNumber(data.to)}`;
    
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_WHATSAPP_FROM);
    formData.append('To', to);
    formData.append('Body', data.message);
    
    if (data.imageUrl) {
      formData.append('MediaUrl', data.imageUrl);
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio WhatsApp error:', result);
      return { success: false, error: result.message || 'Failed to send' };
    }

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Twilio WhatsApp exception:', error);
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
}

/**
 * Send WhatsApp message via UltraMSG
 */
async function sendViaUltraMSG(data: WhatsAppMessage): Promise<WhatsAppResult> {
  if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
    console.warn('UltraMSG credentials not configured');
    return { success: false, error: 'UltraMSG not configured' };
  }

  try {
    const to = formatPhoneNumber(data.to).replace('+', '');
    
    const body: Record<string, string> = {
      token: ULTRAMSG_TOKEN,
      to: to,
      body: data.message,
    };

    if (data.imageUrl) {
      body.image = data.imageUrl;
    }

    const response = await fetch(
      `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok || result.sent === false) {
      console.error('UltraMSG error:', result);
      return { success: false, error: result.error || 'Failed to send' };
    }

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('UltraMSG exception:', error);
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
}

/**
 * Send WhatsApp message via CallMeBot (Free for testing)
 */
async function sendViaCallMeBot(data: WhatsAppMessage): Promise<WhatsAppResult> {
  if (!CALLMEBOT_API_KEY) {
    console.warn('CallMeBot API key not configured');
    return { success: false, error: 'CallMeBot not configured' };
  }

  try {
    const to = formatPhoneNumber(data.to).replace('+', '');
    const encodedMessage = encodeURIComponent(data.message);
    
    const url = `https://api.callmebot.com/whatsapp.php?phone=${to}&text=${encodedMessage}&apikey=${CALLMEBOT_API_KEY}`;
    
    const response = await fetch(url);
    const result = await response.text();

    if (!response.ok || result.includes('ERROR')) {
      console.error('CallMeBot error:', result);
      return { success: false, error: 'Failed to send via CallMeBot' };
    }

    return { success: true, messageId: `callmebot-${Date.now()}` };
  } catch (error) {
    console.error('CallMeBot exception:', error);
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
}

/**
 * Send WhatsApp message using configured provider
 */
async function sendWhatsAppMessage(data: WhatsAppMessage): Promise<WhatsAppResult> {
  // In development, just log
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 [DEV] WhatsApp would be sent:', {
      to: data.to,
      message: data.message.substring(0, 100) + '...',
    });
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  switch (WHATSAPP_PROVIDER) {
    case 'twilio':
      return sendViaTwilio(data);
    case 'ultramsg':
      return sendViaUltraMSG(data);
    case 'callmebot':
      return sendViaCallMeBot(data);
    default:
      console.error('Unknown WhatsApp provider:', WHATSAPP_PROVIDER);
      return { success: false, error: 'Unknown provider' };
  }
}

/**
 * Generate order confirmation message
 */
function generateOrderConfirmationMessage(order: OrderWhatsAppData): string {
  const itemsList = order.items
    .map(item => `  • ${item.name} x${item.quantity} - ${formatAmount(item.price * item.quantity, order.currency)}`)
    .join('\n');

  const deliveryInfo = order.orderType === 'DELIVERY' 
    ? `\n📍 *Livraison:*\n${order.deliveryAddress || 'À confirmer'}`
    : '\n🏪 *Retrait sur place*';

  const trackingSection = order.trackingUrl 
    ? `\n\n🔗 *Suivez votre commande:*\n${order.trackingUrl}`
    : '';

  return `🍽️ *KFM DELICE*
━━━━━━━━━━━━━━━━━━━

✅ *COMMANDE CONFIRMÉE!*

📋 *N° Commande:* ${order.orderNumber}

👤 *Client:* ${order.customerName}

📦 *Détails:*
${itemsList}

━━━━━━━━━━━━━━━━━━━
💰 *Sous-total:* ${formatAmount(order.subtotal, order.currency)}
🚚 *Livraison:* ${formatAmount(order.deliveryFee, order.currency)}
━━━━━━━━━━━━━━━━━━━
💵 *TOTAL:* ${formatAmount(order.total, order.currency)}

${deliveryInfo}
${order.estimatedTime ? `\n⏰ *Temps estimé:* ${order.estimatedTime}` : ''}
${trackingSection}

📞 Pour toute question, appelez le ${order.restaurantPhone || WHATSAPP_FROM}

Merci pour votre confiance! 🙏`;
}

/**
 * Generate order status update message
 */
function generateOrderStatusMessage(order: OrderWhatsAppData): string {
  const statusEmoji: Record<string, string> = {
    'PENDING': '⏳',
    'CONFIRMED': '✅',
    'PREPARING': '👨‍🍳',
    'READY': '📦',
    'OUT_FOR_DELIVERY': '🛵',
    'DELIVERED': '✅',
    'COMPLETED': '🎉',
    'CANCELLED': '❌',
  };

  const statusText: Record<string, string> = {
    'PENDING': 'En attente',
    'CONFIRMED': 'Confirmée',
    'PREPARING': 'En préparation',
    'READY': 'Prête',
    'OUT_FOR_DELIVERY': 'En livraison',
    'DELIVERED': 'Livrée',
    'COMPLETED': 'Terminée',
    'CANCELLED': 'Annulée',
  };

  const emoji = statusEmoji[order.status] || '📋';
  const text = statusText[order.status] || order.status;

  let extraInfo = '';
  
  if (order.status === 'PREPARING') {
    extraInfo = '\n\n👨‍🍳 Nos chefs préparent votre commande avec soin!';
  } else if (order.status === 'READY') {
    if (order.orderType === 'TAKEAWAY') {
      extraInfo = '\n\n🏪 Votre commande est prête! Venez la récupérer.';
    } else {
      extraInfo = '\n\n📦 Votre commande est emballée et prête à partir!';
    }
  } else if (order.status === 'OUT_FOR_DELIVERY') {
    extraInfo = '\n\n🛵 Votre livreur est en route!';
  } else if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {
    extraInfo = '\n\n🎉 Merci pour votre commande! À bientôt chez KFM DELICE!';
  }

  const trackingSection = order.trackingUrl 
    ? `\n\n🔗 *Suivez en temps réel:*\n${order.trackingUrl}`
    : '';

  return `🍽️ *KFM DELICE*
━━━━━━━━━━━━━━━━━━━

${emoji} *MISE À JOUR COMMANDE*

📋 *N°:* ${order.orderNumber}

📊 *Statut:* ${text}${extraInfo}${trackingSection}

📞 Questions? ${order.restaurantPhone || WHATSAPP_FROM}`;
}

/**
 * Generate delivery tracking message
 */
function generateDeliveryTrackingMessage(
  order: OrderWhatsAppData,
  driverName: string,
  driverPhone: string,
  estimatedArrival: string
): string {
  return `🍽️ *KFM DELICE*
━━━━━━━━━━━━━━━━━━━

🛵 *VOTRE LIVREUR EST EN ROUTE!*

📋 *N° Commande:* ${order.orderNumber}

👤 *Livreur:* ${driverName}
📞 *Tél:* ${driverPhone}

⏰ *Arrivée estimée:* ${estimatedArrival}

📍 *Votre adresse:*
${order.deliveryAddress || 'À confirmer'}

━━━━━━━━━━━━━━━━━━━

${order.trackingUrl ? `🔗 *Suivez en direct:*\n${order.trackingUrl}\n\n` : ''}📞 Appelez votre livreur si besoin!

💡 *Conseil:* Préparez le montant exact pour faciliter la livraison.

Merci pour votre patience! 🙏`;
}

/**
 * Generate payment confirmation message (for cash payments at counter)
 */
function generatePaymentConfirmationMessage(data: {
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  paymentMethod: string;
  amountReceived?: number;
  change?: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee?: number;
  restaurantName: string;
  restaurantPhone?: string;
  cashierName?: string;
  tableNumber?: string;
  receiptUrl?: string;
}): string {
  const itemsList = data.items
    .map(item => `  • ${item.name} x${item.quantity} - ${formatAmount(item.price * item.quantity, data.currency)}`)
    .join('\n');

  const methodEmoji: Record<string, string> = {
    'CASH': '💵',
    'ORANGE_MONEY': '🟠',
    'MTN_MOMO': '🟡',
    'WAVE': '🔵',
    'CARD': '💳',
    'WALLET': '👛',
  };

  const methodName: Record<string, string> = {
    'CASH': 'Espèces',
    'ORANGE_MONEY': 'Orange Money',
    'MTN_MOMO': 'MTN MoMo',
    'WAVE': 'Wave',
    'CARD': 'Carte bancaire',
    'WALLET': 'Portefeuille',
    'MOBILE_MONEY': 'Mobile Money',
  };

  const emoji = methodEmoji[data.paymentMethod] || '💰';
  const method = methodName[data.paymentMethod] || data.paymentMethod;

  let changeSection = '';
  if (data.amountReceived && data.change && data.change > 0) {
    changeSection = `
💵 *Reçu:* ${formatAmount(data.amountReceived, data.currency)}
🔄 *Monnaie:* ${formatAmount(data.change, data.currency)}`;
  }

  return `🍽️ *${data.restaurantName}*
━━━━━━━━━━━━━━━━━━━

✅ *PAIEMENT CONFIRMÉ!*

📋 *N° Ticket:* ${data.orderNumber}
${data.tableNumber ? `🪑 *Table:* ${data.tableNumber}` : ''}

👤 *Client:* ${data.customerName}

📦 *Articles:*
${itemsList}

━━━━━━━━━━━━━━━━━━━
💰 *Sous-total:* ${formatAmount(data.subtotal, data.currency)}
${data.deliveryFee ? `🚚 *Livraison:* ${formatAmount(data.deliveryFee, data.currency)}\n` : ''}━━━━━━━━━━━━━━━━━━━
💵 *TOTAL:* ${formatAmount(data.total, data.currency)}
${changeSection}

━━━━━━━━━━━━━━━━━━━
${emoji} *Paiement:* ${method}
✅ *Statut:* PAYÉ
━━━━━━━━━━━━━━━━━━━

${data.cashierName ? `👤 *Caissier:* ${data.cashierName}` : ''}
📅 ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
${data.receiptUrl ? `\n🧾 *Reçu:* ${data.receiptUrl}` : ''}

📞 Service client: ${data.restaurantPhone || WHATSAPP_FROM}

🙏 *Merci pour votre visite!*
À bientôt chez ${data.restaurantName}!`;
}

/**
 * Generate mobile money payment request message
 */
function generateMobileMoneyPaymentMessage(data: {
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  paymentMethod: string;
  ussdCode?: string;
  phoneNumber: string;
  restaurantName: string;
}): string {
  const methodName: Record<string, string> = {
    'ORANGE_MONEY': 'Orange Money',
    'MTN_MOMO': 'MTN MoMo',
    'WAVE': 'Wave',
    'MOBILE_MONEY': 'Mobile Money',
  };

  const method = methodName[data.paymentMethod] || data.paymentMethod;

  return `🍽️ *${data.restaurantName}*
━━━━━━━━━━━━━━━━━━━

📱 *PAIEMENT ${method.toUpperCase()}*

📋 *Commande:* ${data.orderNumber}
👤 *Client:* ${data.customerName}
💵 *Montant:* ${formatAmount(data.total, data.currency)}

━━━━━━━━━━━━━━━━━━━

📲 *Pour payer:*

1️⃣ Composez le code:
   *${data.ussdCode || '#144#'}*

2️⃣ Sélectionnez "Paiement marchand"

3️⃣ Entrez le montant:
   *${data.total.toLocaleString()} ${data.currency}*

4️⃣ Confirmez avec votre code PIN

━━━━━━━━━━━━━━━━━━━

⏳ Vous avez 5 minutes pour confirmer.

✅ Vous recevrez une confirmation automatique après le paiement.

📞 Problème? Appelez le ${WHATSAPP_FROM}`;
}

/**
 * Send order confirmation via WhatsApp
 */
export async function sendOrderConfirmationWhatsApp(
  order: OrderWhatsAppData
): Promise<WhatsAppResult> {
  const message = generateOrderConfirmationMessage(order);
  
  return sendWhatsAppMessage({
    to: order.customerPhone,
    message,
  });
}

/**
 * Send order status update via WhatsApp
 */
export async function sendOrderStatusWhatsApp(
  order: OrderWhatsAppData
): Promise<WhatsAppResult> {
  const message = generateOrderStatusMessage(order);
  
  return sendWhatsAppMessage({
    to: order.customerPhone,
    message,
  });
}

/**
 * Send delivery tracking via WhatsApp
 */
export async function sendDeliveryTrackingWhatsApp(
  order: OrderWhatsAppData,
  driverName: string,
  driverPhone: string,
  estimatedArrival: string
): Promise<WhatsAppResult> {
  const message = generateDeliveryTrackingMessage(order, driverName, driverPhone, estimatedArrival);
  
  return sendWhatsAppMessage({
    to: order.customerPhone,
    message,
  });
}

/**
 * Send custom WhatsApp message
 */
export async function sendCustomWhatsApp(
  to: string,
  message: string
): Promise<WhatsAppResult> {
  return sendWhatsAppMessage({ to, message });
}

/**
 * Send payment confirmation via WhatsApp (for cash payments at counter)
 */
export async function sendPaymentConfirmationWhatsApp(data: {
  customerPhone: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  paymentMethod: string;
  amountReceived?: number;
  change?: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee?: number;
  restaurantName: string;
  restaurantPhone?: string;
  cashierName?: string;
  tableNumber?: string;
  receiptUrl?: string;
}): Promise<WhatsAppResult> {
  const message = generatePaymentConfirmationMessage(data);
  
  return sendWhatsAppMessage({
    to: data.customerPhone,
    message,
  });
}

/**
 * Send mobile money payment request via WhatsApp
 */
export async function sendMobileMoneyPaymentWhatsApp(data: {
  customerPhone: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  paymentMethod: string;
  ussdCode?: string;
  restaurantName: string;
}): Promise<WhatsAppResult> {
  const message = generateMobileMoneyPaymentMessage(data);
  
  return sendWhatsAppMessage({
    to: data.customerPhone,
    message,
  });
}

/**
 * Convenience export
 */
export const whatsappService = {
  sendOrderConfirmation: sendOrderConfirmationWhatsApp,
  sendOrderStatus: sendOrderStatusWhatsApp,
  sendDeliveryTracking: sendDeliveryTrackingWhatsApp,
  sendPaymentConfirmation: sendPaymentConfirmationWhatsApp,
  sendMobileMoneyPayment: sendMobileMoneyPaymentWhatsApp,
  sendCustom: sendCustomWhatsApp,
};

export default whatsappService;
