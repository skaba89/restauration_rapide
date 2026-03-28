// ============================================
// Restaurant OS - SMS Service
// SMS integration for African providers
// ============================================

import { logger } from '@/lib/logger';

// ============================================
// SMS Configuration Types
// ============================================

interface SMSConfig {
  // Twilio
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  // Orange SMS API
  orange?: {
    clientId: string;
    clientSecret: string;
    senderAddress: string;
  };
  // MTN SMS API
  mtn?: {
    apiKey: string;
    senderId: string;
  };
  // Generic Africa's Talking
  africasTalking?: {
    apiKey: string;
    username: string;
    senderId?: string;
  };
  // Default provider
  defaultProvider: 'twilio' | 'orange' | 'mtn' | 'africasTalking';
}

// SMS message options
interface SMSMessage {
  to: string; // Phone number in international format
  message: string;
  senderId?: string;
}

// SMS response
interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

// Provider-specific status
interface SMSStatus {
  provider: string;
  enabled: boolean;
  balance?: number;
}

// ============================================
// SMS Service Class
// ============================================

class SMSService {
  private config: SMSConfig;

  constructor() {
    this.config = {
      twilio: process.env.TWILIO_ACCOUNT_SID ? {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
      } : undefined,
      orange: process.env.ORANGE_SMS_CLIENT_ID ? {
        clientId: process.env.ORANGE_SMS_CLIENT_ID,
        clientSecret: process.env.ORANGE_SMS_CLIENT_SECRET || '',
        senderAddress: process.env.ORANGE_SENDER_ADDRESS || '',
      } : undefined,
      mtn: process.env.MTN_SMS_API_KEY ? {
        apiKey: process.env.MTN_SMS_API_KEY,
        senderId: process.env.MTN_SENDER_ID || 'RestaurantOS',
      } : undefined,
      africasTalking: process.env.AFRICAS_TALKING_API_KEY ? {
        apiKey: process.env.AFRICAS_TALKING_API_KEY,
        username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox',
        senderId: process.env.AFRICAS_TALKING_SENDER_ID,
      } : undefined,
      defaultProvider: (process.env.SMS_PROVIDER as SMSConfig['defaultProvider']) || 'africasTalking',
    };
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string, countryCode: string = '225'): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
      // Local format - add country code
      cleaned = '+' + countryCode + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
      // No country code - add it
      cleaned = '+' + countryCode + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(message: SMSMessage): Promise<SMSResponse> {
    if (!this.config.twilio) {
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const { accountSid, authToken, fromNumber } = this.config.twilio;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: this.formatPhoneNumber(message.to),
          From: message.senderId || fromNumber,
          Body: message.message,
        }).toString(),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.sid,
          cost: parseFloat(data.price || '0'),
        };
      }

      return { success: false, error: data.message };
    } catch (error) {
      logger.error('Twilio SMS error', { error });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send SMS via Orange SMS API
   */
  private async sendViaOrange(message: SMSMessage): Promise<SMSResponse> {
    if (!this.config.orange) {
      return { success: false, error: 'Orange SMS not configured' };
    }

    try {
      const { clientId, clientSecret, senderAddress } = this.config.orange;
      
      // Get access token
      const tokenResponse = await fetch('https://api.orange.com/oauth/v3/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Send SMS
      const to = this.formatPhoneNumber(message.to);
      const url = `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(senderAddress)}/requests`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outboundSMSMessageRequest: {
            address: `tel:${to}`,
            senderAddress: `tel:${senderAddress}`,
            outboundSMSTextMessage: {
              message: message.message,
            },
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.outboundSMSMessageRequest?.resourceURL,
        };
      }

      return { success: false, error: data.requestError?.serviceException?.text || 'Unknown error' };
    } catch (error) {
      logger.error('Orange SMS error', { error });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send SMS via MTN SMS API
   */
  private async sendViaMTN(message: SMSMessage): Promise<SMSResponse> {
    if (!this.config.mtn) {
      return { success: false, error: 'MTN SMS not configured' };
    }

    try {
      const { apiKey, senderId } = this.config.mtn;
      const url = 'https://api.mtn.com/sms/v1/messages';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(message.to),
          from: message.senderId || senderId,
          message: message.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messageId,
        };
      }

      return { success: false, error: data.message || 'Unknown error' };
    } catch (error) {
      logger.error('MTN SMS error', { error });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send SMS via Africa's Talking
   */
  private async sendViaAfricasTalking(message: SMSMessage): Promise<SMSResponse> {
    if (!this.config.africasTalking) {
      return { success: false, error: "Africa's Talking not configured" };
    }

    try {
      const { apiKey, username, senderId } = this.config.africasTalking;
      const isSandbox = username === 'sandbox';
      const baseUrl = isSandbox 
        ? 'https://api.sandbox.africastalking.com/version1/messaging'
        : 'https://api.africastalking.com/version1/messaging';

      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('to', this.formatPhoneNumber(message.to));
      formData.append('message', message.message);
      if (message.senderId || senderId) {
        formData.append('from', message.senderId || senderId || '');
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'apiKey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok && data.SMSMessageData?.Recipients?.length > 0) {
        const recipient = data.SMSMessageData.Recipients[0];
        return {
          success: recipient.status === 'Success',
          messageId: recipient.messageId,
          cost: parseFloat(recipient.cost || '0'),
        };
      }

      return { 
        success: false, 
        error: data.SMSMessageData?.Message || 'Unknown error' 
      };
    } catch (error) {
      logger.error("Africa's Talking SMS error", { error });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send SMS using the default provider
   */
  async send(message: SMSMessage): Promise<SMSResponse> {
    const provider = this.config.defaultProvider;

    logger.info('Sending SMS', { provider, to: message.to });

    // Development mode: log instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('--- SMS ---');
      console.log('Provider:', provider);
      console.log('To:', message.to);
      console.log('Message:', message.message);
      console.log('--- END SMS ---');
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    switch (provider) {
      case 'twilio':
        return this.sendViaTwilio(message);
      case 'orange':
        return this.sendViaOrange(message);
      case 'mtn':
        return this.sendViaMTN(message);
      case 'africasTalking':
        return this.sendViaAfricasTalking(message);
      default:
        return { success: false, error: 'Invalid provider' };
    }
  }

  /**
   * Send SMS with automatic provider fallback
   */
  async sendWithFallback(message: SMSMessage): Promise<SMSResponse> {
    const providers: Array<{ name: SMSConfig['defaultProvider']; send: () => Promise<SMSResponse> }> = [
      { name: 'africasTalking', send: () => this.sendViaAfricasTalking(message) },
      { name: 'twilio', send: () => this.sendViaTwilio(message) },
      { name: 'orange', send: () => this.sendViaOrange(message) },
      { name: 'mtn', send: () => this.sendViaMTN(message) },
    ];

    for (const provider of providers) {
      const config = this.config[provider.name];
      if (!config) continue;

      const response = await provider.send();
      if (response.success) {
        return response;
      }
    }

    return { success: false, error: 'All SMS providers failed' };
  }

  /**
   * Get provider status
   */
  async getStatus(): Promise<SMSStatus[]> {
    const statuses: SMSStatus[] = [];

    if (this.config.twilio) {
      statuses.push({ provider: 'twilio', enabled: true });
    }
    if (this.config.orange) {
      statuses.push({ provider: 'orange', enabled: true });
    }
    if (this.config.mtn) {
      statuses.push({ provider: 'mtn', enabled: true });
    }
    if (this.config.africasTalking) {
      statuses.push({ provider: 'africasTalking', enabled: true });
    }

    return statuses;
  }

  // ============================================
  // Convenience Methods for Common SMS Types
  // ============================================

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmationSMS(
    phone: string,
    data: { orderNumber: string; estimatedTime?: string; restaurantName: string }
  ): Promise<SMSResponse> {
    const message = `🍽️ ${data.restaurantName}\n\n✅ Commande ${data.orderNumber} confirmée!\n${
      data.estimatedTime ? `⏱️ Temps estimé: ${data.estimatedTime}\n` : ''
    }Merci pour votre confiance!`;
    
    return this.send({ to: phone, message });
  }

  /**
   * Send order status update SMS
   */
  async sendOrderStatusSMS(
    phone: string,
    data: { orderNumber: string; status: string; estimatedTime?: string }
  ): Promise<SMSResponse> {
    const statusMessages: Record<string, string> = {
      PREPARING: '👨‍🍳 En préparation',
      READY: '✅ Prête',
      OUT_FOR_DELIVERY: '🛵 En livraison',
      DELIVERED: '📦 Livrée',
      COMPLETED: '✨ Terminée',
      CANCELLED: '❌ Annulée',
    };

    const message = `Commande ${data.orderNumber}\n${
      statusMessages[data.status] || data.status
    }${data.estimatedTime ? `\n⏱️ ${data.estimatedTime}` : ''}`;
    
    return this.send({ to: phone, message });
  }

  /**
   * Send delivery notification SMS
   */
  async sendDeliveryNotificationSMS(
    phone: string,
    data: { orderNumber: string; driverName: string; driverPhone: string; estimatedTime: string }
  ): Promise<SMSResponse> {
    const message = `🛵 Votre livraison est en route!\n\n` +
      `Commande: ${data.orderNumber}\n` +
      `Livreur: ${data.driverName}\n` +
      `Contact: ${data.driverPhone}\n` +
      `Arrivée: ${data.estimatedTime}`;
    
    return this.send({ to: phone, message });
  }

  /**
   * Send reservation confirmation SMS
   */
  async sendReservationSMS(
    phone: string,
    data: { restaurantName: string; date: string; time: string; partySize: number; confirmationCode: string }
  ): Promise<SMSResponse> {
    const message = `🍽️ ${data.restaurantName}\n\n` +
      `📅 ${data.date} à ${data.time}\n` +
      `👥 ${data.partySize} personnes\n` +
      `🎫 Code: ${data.confirmationCode}\n\n` +
      `À bientôt!`;
    
    return this.send({ to: phone, message });
  }

  /**
   * Send OTP SMS
   */
  async sendOTPSMS(phone: string, otp: string, expiresInMinutes: number = 5): Promise<SMSResponse> {
    const message = `🔐 Restaurant OS\n\n` +
      `Votre code de vérification: ${otp}\n\n` +
      `Ce code expire dans ${expiresInMinutes} minutes.`;
    
    return this.send({ to: phone, message });
  }

  /**
   * Send promotional SMS
   */
  async sendPromotionalSMS(
    phones: string[],
    message: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const phone of phones) {
      const response = await this.send({ to: phone, message });
      if (response.success) {
        success++;
      } else {
        failed++;
      }
      
      // Rate limiting: wait between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
  }
}

// Export singleton instance
export const smsService = new SMSService();
