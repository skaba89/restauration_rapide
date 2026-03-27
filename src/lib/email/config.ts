// ============================================
// Restaurant OS - Email Configuration
// Multi-provider email configuration with SMTP, SendGrid, and Resend support
// ============================================

/**
 * Email provider types
 */
export type EmailProvider = 'smtp' | 'sendgrid' | 'resend';

/**
 * Email configuration interface
 */
export interface EmailConfig {
  provider: EmailProvider;
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
  // SMTP Configuration
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  // SendGrid Configuration
  sendgrid?: {
    apiKey: string;
  };
  // Resend Configuration
  resend?: {
    apiKey: string;
  };
  // Feature flags
  tracking?: {
    opens: boolean;
    clicks: boolean;
  };
  // Development settings
  development?: {
    logEmails: boolean;
    saveToDisk: boolean;
    diskPath?: string;
  };
}

/**
 * Get the current email provider based on environment
 */
export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() as EmailProvider;
  
  if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    return 'sendgrid';
  }
  
  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    return 'resend';
  }
  
  // Default to SMTP for development
  return 'smtp';
}

/**
 * Get email configuration from environment variables
 */
export function getEmailConfig(): EmailConfig {
  const provider = getEmailProvider();
  
  const config: EmailConfig = {
    provider,
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Restaurant OS',
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@restaurant-os.app',
    },
    replyTo: process.env.EMAIL_REPLY_TO,
    tracking: {
      opens: process.env.EMAIL_TRACK_OPENS === 'true',
      clicks: process.env.EMAIL_TRACK_CLICKS === 'true',
    },
    development: {
      logEmails: process.env.NODE_ENV === 'development',
      saveToDisk: process.env.EMAIL_SAVE_TO_DISK === 'true',
      diskPath: process.env.EMAIL_DISK_PATH || './emails',
    },
  };
  
  // Add provider-specific configuration
  switch (provider) {
    case 'smtp':
      config.smtp = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      };
      break;
      
    case 'sendgrid':
      config.sendgrid = {
        apiKey: process.env.SENDGRID_API_KEY || '',
      };
      break;
      
    case 'resend':
      config.resend = {
        apiKey: process.env.RESEND_API_KEY || '',
      };
      break;
  }
  
  return config;
}

/**
 * SMTP configuration presets
 */
export const SMTP_PRESETS = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  },
  gmail_ssl: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true,
  },
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
  },
  sendgrid_smtp: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
  },
  amazon_ses: {
    host: 'email-smtp.region.amazonaws.com',
    port: 587,
    secure: false,
  },
} as const;

/**
 * Validate email configuration
 */
export function validateEmailConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.from.email) {
    errors.push('From email address is required');
  }
  
  if (!config.from.name) {
    errors.push('From name is required');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (config.from.email && !emailRegex.test(config.from.email)) {
    errors.push('Invalid from email address format');
  }
  
  // Provider-specific validation
  switch (config.provider) {
    case 'smtp':
      if (!config.smtp?.host) {
        errors.push('SMTP host is required');
      }
      if (!config.smtp?.port) {
        errors.push('SMTP port is required');
      }
      break;
      
    case 'sendgrid':
      if (!config.sendgrid?.apiKey) {
        errors.push('SendGrid API key is required');
      }
      break;
      
    case 'resend':
      if (!config.resend?.apiKey) {
        errors.push('Resend API key is required');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  const config = getEmailConfig();
  const { valid } = validateEmailConfig(config);
  return valid;
}

/**
 * Get default email configuration for Restaurant OS
 */
export function getDefaultEmailConfig(): Partial<EmailConfig> {
  return {
    from: {
      name: 'Restaurant OS',
      email: 'noreply@restaurant-os.app',
    },
    tracking: {
      opens: true,
      clicks: true,
    },
  };
}

// Export singleton config
export const emailConfig = getEmailConfig();
