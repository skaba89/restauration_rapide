// ============================================
// Restaurant OS - Thermal Receipt Generator
// 80mm thermal printer format for POS
// ============================================

import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { formatCurrency } from '@/lib/currency';

// ============================================
// Types
// ============================================

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface ReceiptPayment {
  method: 'ORANGE_MONEY' | 'MTN_MOMO' | 'WAVE' | 'MPESA' | 'CASH' | 'CARD';
  amount: number;
  reference?: string;
  phoneNumber?: string;
}

export interface ReceiptDelivery {
  address: string;
  driverName?: string;
  driverPhone?: string;
}

export interface ReceiptData {
  // Restaurant info
  restaurant: {
    name: string;
    address?: string;
    phone?: string;
    taxId?: string;
    logo?: Buffer | string;
  };
  
  // Order info
  orderNumber: string;
  orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
  tableNumber?: string;
  
  // Customer info
  customerName?: string;
  customerPhone?: string;
  
  // Items
  items: ReceiptItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  discount?: number;
  tip?: number;
  deliveryFee?: number;
  total: number;
  currency: string;
  
  // Payment
  payment: ReceiptPayment;
  
  // Delivery
  delivery?: ReceiptDelivery;
  
  // Timestamps
  date: Date;
  
  // Additional
  notes?: string;
  
  // Localization
  language: 'fr' | 'en';
  
  // QR code for payment tracking
  qrCodeData?: string;
}

// ============================================
// Constants
// ============================================

// 80mm thermal printer width = ~226.77 points (80mm)
const RECEIPT_WIDTH = 227; // points
const MARGIN = 10; // ~3.5mm
const CONTENT_WIDTH = RECEIPT_WIDTH - (MARGIN * 2);

// ============================================
// Translations
// ============================================

const translations = {
  fr: {
    receipt: 'REÇU',
    order: 'COMMANDE',
    table: 'Table',
    orderType: 'Type',
    dineIn: 'Sur place',
    delivery: 'Livraison',
    takeaway: 'À emporter',
    item: 'Article',
    qty: 'Qté',
    price: 'Prix',
    subtotal: 'Sous-total',
    tax: 'TVA',
    discount: 'Remise',
    tip: 'Pourboire',
    deliveryFee: 'Livraison',
    total: 'TOTAL',
    paymentMethod: 'Paiement',
    paid: 'PAYÉ',
    cash: 'Espèces',
    card: 'Carte',
    orangeMoney: 'Orange Money',
    mtnMomo: 'MTN MoMo',
    wave: 'Wave',
    mpesa: 'M-Pesa',
    scanToPay: 'Scannez pour suivre',
    thankYou: 'Merci de votre visite !',
    seeYouSoon: 'À bientôt !',
    poweredBy: 'Restaurant OS',
    taxId: 'N° Fiscal',
    ref: 'Réf',
    tel: 'Tél',
    date: 'Date',
    customer: 'Client',
    deliveryAddress: 'Adresse',
    driver: 'Livreur',
    notes: 'Note',
  },
  en: {
    receipt: 'RECEIPT',
    order: 'ORDER',
    table: 'Table',
    orderType: 'Type',
    dineIn: 'Dine-in',
    delivery: 'Delivery',
    takeaway: 'Takeaway',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    subtotal: 'Subtotal',
    tax: 'VAT',
    discount: 'Discount',
    tip: 'Tip',
    deliveryFee: 'Delivery',
    total: 'TOTAL',
    paymentMethod: 'Payment',
    paid: 'PAID',
    cash: 'Cash',
    card: 'Card',
    orangeMoney: 'Orange Money',
    mtnMomo: 'MTN MoMo',
    wave: 'Wave',
    mpesa: 'M-Pesa',
    scanToPay: 'Scan to track',
    thankYou: 'Thank you for visiting!',
    seeYouSoon: 'See you soon!',
    poweredBy: 'Restaurant OS',
    taxId: 'Tax ID',
    ref: 'Ref',
    tel: 'Tel',
    date: 'Date',
    customer: 'Customer',
    deliveryAddress: 'Address',
    driver: 'Driver',
    notes: 'Note',
  },
};

// ============================================
// Payment Method Labels
// ============================================

const paymentMethodLabels = {
  ORANGE_MONEY: { fr: 'Orange Money', en: 'Orange Money' },
  MTN_MOMO: { fr: 'MTN MoMo', en: 'MTN MoMo' },
  WAVE: { fr: 'Wave', en: 'Wave' },
  MPESA: { fr: 'M-Pesa', en: 'M-Pesa' },
  CASH: { fr: 'Espèces', en: 'Cash' },
  CARD: { fr: 'Carte', en: 'Card' },
};

// ============================================
// Helper Functions
// ============================================

function formatPrice(amount: number, currency: string): string {
  return formatCurrency(amount, currency);
}

function formatDate(date: Date, language: 'fr' | 'en'): string {
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(date: Date, language: 'fr' | 'en'): string {
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// Receipt Generator Class
// ============================================

export class ReceiptGenerator {
  private doc: PDFKit.PDFDocument;
  private t: typeof translations.fr;
  private currentY: number = 0;

  constructor(private data: ReceiptData) {
    this.doc = new PDFDocument({
      size: [RECEIPT_WIDTH, 1000], // Start with estimated height, will be adjusted
      margins: {
        top: MARGIN,
        bottom: MARGIN,
        left: MARGIN,
        right: MARGIN,
      },
      bufferPages: true,
    });
    this.t = translations[data.language];
  }

  // Main generation method
  async generate(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = new PassThrough();
      
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      
      this.doc.pipe(stream);
      
      try {
        this.drawHeader();
        this.drawOrderInfo();
        this.drawItems();
        this.drawTotals();
        this.drawPayment();
        this.drawDelivery();
        this.drawQRCode();
        this.drawFooter();
        
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Draw header with restaurant info
  private drawHeader(): void {
    const { restaurant } = this.data;
    
    // Decorative line at top
    this.doc
      .moveTo(MARGIN, MARGIN)
      .lineTo(RECEIPT_WIDTH - MARGIN, MARGIN)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();
    
    this.currentY = MARGIN + 8;
    
    // Restaurant name (centered, bold)
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(restaurant.name, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'center' 
      });
    
    this.currentY += 18;
    
    // Restaurant address
    if (restaurant.address) {
      this.doc
        .fontSize(7)
        .font('Helvetica')
        .text(restaurant.address, MARGIN, this.currentY, { 
          width: CONTENT_WIDTH, 
          align: 'center' 
        });
      this.currentY += 10;
    }
    
    // Restaurant phone
    if (restaurant.phone) {
      this.doc
        .fontSize(7)
        .text(`${this.t.tel}: ${restaurant.phone}`, MARGIN, this.currentY, { 
          width: CONTENT_WIDTH, 
          align: 'center' 
        });
      this.currentY += 10;
    }
    
    // Tax ID
    if (restaurant.taxId) {
      this.doc
        .fontSize(6)
        .fillColor('#666666')
        .text(`${this.t.taxId}: ${restaurant.taxId}`, MARGIN, this.currentY, { 
          width: CONTENT_WIDTH, 
          align: 'center' 
        });
      this.currentY += 10;
    }
    
    // Divider line
    this.drawDivider();
  }

  // Draw order information
  private drawOrderInfo(): void {
    const { orderNumber, orderType, tableNumber, date, customerName } = this.data;
    
    // Receipt title
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(this.t.receipt, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'center' 
      });
    
    this.currentY += 16;
    
    // Order number and date
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .text(`${this.t.order}: ${orderNumber}`, MARGIN, this.currentY);
    
    this.doc
      .text(`${formatDate(date, this.data.language)} ${formatTime(date, this.data.language)}`, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'right' 
      });
    
    this.currentY += 12;
    
    // Order type
    const orderTypeLabel = orderType === 'DINE_IN' ? this.t.dineIn : 
                          orderType === 'DELIVERY' ? this.t.delivery : this.t.takeaway;
    
    this.doc
      .fontSize(8)
      .text(`${this.t.orderType}: ${orderTypeLabel}`, MARGIN, this.currentY);
    
    if (tableNumber) {
      this.doc
        .text(`${this.t.table}: ${tableNumber}`, MARGIN + 80, this.currentY);
    }
    
    this.currentY += 12;
    
    // Customer name
    if (customerName) {
      this.doc
        .text(`${this.t.customer}: ${customerName}`, MARGIN, this.currentY);
      this.currentY += 12;
    }
    
    // Divider
    this.drawDivider();
  }

  // Draw items list
  private drawItems(): void {
    const { items, currency } = this.data;
    
    // Items header
    this.doc
      .fontSize(7)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(this.t.item, MARGIN, this.currentY, { width: 100 });
    
    this.doc
      .text(this.t.qty, MARGIN + 100, this.currentY, { width: 30, align: 'center' });
    
    this.doc
      .text(this.t.price, MARGIN + 130, this.currentY, { width: CONTENT_WIDTH - 130, align: 'right' });
    
    this.currentY += 10;
    
    // Dotted line
    this.doc
      .moveTo(MARGIN, this.currentY)
      .lineTo(RECEIPT_WIDTH - MARGIN, this.currentY)
      .dash(2, { space: 2 })
      .strokeColor('#000000')
      .lineWidth(0.5)
      .stroke();
    
    this.doc.undash();
    this.currentY += 5;
    
    // Items
    items.forEach((item) => {
      // Item name (may wrap)
      const nameHeight = this.doc.heightOfString(item.name, { width: 100, fontSize: 8 });
      
      this.doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#000000')
        .text(item.name, MARGIN, this.currentY, { width: 100 });
      
      // Quantity
      this.doc
        .fontSize(8)
        .text(`x${item.quantity}`, MARGIN + 100, this.currentY, { width: 30, align: 'center' });
      
      // Price
      this.doc
        .fontSize(8)
        .text(formatPrice(item.total, currency), MARGIN + 130, this.currentY, { 
          width: CONTENT_WIDTH - 130, 
          align: 'right' 
        });
      
      this.currentY += Math.max(nameHeight, 10);
      
      // Item notes
      if (item.notes) {
        this.doc
          .fontSize(6)
          .fillColor('#666666')
          .font('Helvetica-Oblique')
          .text(`  ${this.t.notes}: ${item.notes}`, MARGIN, this.currentY, { width: CONTENT_WIDTH });
        this.currentY += 8;
      }
    });
    
    // Divider
    this.drawDivider();
  }

  // Draw totals section
  private drawTotals(): void {
    const { subtotal, tax, taxRate, discount, tip, deliveryFee, total, currency } = this.data;
    
    // Subtotal
    this.drawTotalLine(this.t.subtotal, formatPrice(subtotal, currency));
    
    // Tax
    this.drawTotalLine(`${this.t.tax} (${taxRate}%)`, formatPrice(tax, currency));
    
    // Discount
    if (discount && discount > 0) {
      this.doc.fillColor('#CC0000');
      this.drawTotalLine(this.t.discount, `-${formatPrice(discount, currency)}`);
      this.doc.fillColor('#000000');
    }
    
    // Delivery fee
    if (deliveryFee && deliveryFee > 0) {
      this.drawTotalLine(this.t.deliveryFee, formatPrice(deliveryFee, currency));
    }
    
    // Tip
    if (tip && tip > 0) {
      this.drawTotalLine(this.t.tip, formatPrice(tip, currency));
    }
    
    // Divider before total
    this.doc
      .moveTo(MARGIN, this.currentY)
      .lineTo(RECEIPT_WIDTH - MARGIN, this.currentY)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();
    
    this.currentY += 6;
    
    // Grand total (highlighted)
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(this.t.total, MARGIN, this.currentY);
    
    this.doc
      .fontSize(12)
      .text(formatPrice(total, currency), MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'right' 
      });
    
    this.currentY += 18;
    
    // Divider
    this.drawDivider();
  }

  // Helper to draw a total line
  private drawTotalLine(label: string, value: string): void {
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#000000')
      .text(label, MARGIN, this.currentY);
    
    this.doc
      .fontSize(8)
      .text(value, MARGIN, this.currentY, { width: CONTENT_WIDTH, align: 'right' });
    
    this.currentY += 12;
  }

  // Draw payment information
  private drawPayment(): void {
    const { payment, currency } = this.data;
    const methodLabel = paymentMethodLabels[payment.method];
    
    // Payment status
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(this.t.paid, MARGIN, this.currentY, { width: CONTENT_WIDTH, align: 'center' });
    
    this.currentY += 14;
    
    // Payment method
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .text(`${this.t.paymentMethod}:`, MARGIN, this.currentY);
    
    this.doc
      .font('Helvetica-Bold')
      .text(methodLabel[this.data.language], MARGIN + 60, this.currentY);
    
    this.currentY += 12;
    
    // Payment reference
    if (payment.reference) {
      this.doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`${this.t.ref}: ${payment.reference}`, MARGIN, this.currentY);
      this.currentY += 10;
    }
    
    // Phone number for Mobile Money
    if (payment.phoneNumber && ['ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 'MPESA'].includes(payment.method)) {
      this.doc
        .fontSize(7)
        .fillColor('#666666')
        .text(`${this.t.tel}: ${payment.phoneNumber}`, MARGIN, this.currentY);
      this.currentY += 10;
    }
    
    // Divider
    this.drawDivider();
  }

  // Draw delivery information
  private drawDelivery(): void {
    const { delivery, orderType } = this.data;
    
    if (orderType !== 'DELIVERY' || !delivery) {
      return;
    }
    
    this.doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('🚚 LIVRAISON', MARGIN, this.currentY, { width: CONTENT_WIDTH, align: 'center' });
    
    this.currentY += 12;
    
    this.doc
      .fontSize(7)
      .font('Helvetica')
      .text(`${this.t.deliveryAddress}: ${delivery.address}`, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH 
      });
    
    this.currentY += 10;
    
    if (delivery.driverName) {
      this.doc
        .text(`${this.t.driver}: ${delivery.driverName}`, MARGIN, this.currentY);
      this.currentY += 10;
    }
    
    if (delivery.driverPhone) {
      this.doc
        .text(`${this.t.tel}: ${delivery.driverPhone}`, MARGIN, this.currentY);
      this.currentY += 10;
    }
    
    // Divider
    this.drawDivider();
  }

  // Draw QR code placeholder
  private drawQRCode(): void {
    const qrSize = 50;
    const qrX = (RECEIPT_WIDTH - qrSize) / 2;
    
    // QR code box
    this.doc
      .save()
      .rect(qrX, this.currentY, qrSize, qrSize)
      .fill('#FFFFFF')
      .strokeColor('#000000')
      .lineWidth(0.5)
      .stroke();
    
    // QR code placeholder pattern
    this.drawQRPattern(qrX + 3, this.currentY + 3, qrSize - 6);
    
    this.doc.restore();
    
    this.currentY += qrSize + 5;
    
    // QR code label
    this.doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor('#666666')
      .text(this.t.scanToPay, MARGIN, this.currentY, { width: CONTENT_WIDTH, align: 'center' });
    
    this.currentY += 12;
    
    // Divider
    this.drawDivider();
  }

  // Draw QR pattern
  private drawQRPattern(x: number, y: number, size: number): void {
    const moduleCount = 9;
    const moduleSize = size / moduleCount;
    
    // Simplified QR pattern
    const pattern = [
      [1,1,1,0,0,0,1,1,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1],
      [0,0,1,1,1,1,1,0,0],
      [0,1,0,1,0,1,0,1,0],
      [0,0,1,1,1,1,1,0,0],
      [1,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,1,1,0,0,0,1,1,1],
    ];
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (pattern[row][col] === 1) {
          this.doc
            .rect(x + col * moduleSize, y + row * moduleSize, moduleSize, moduleSize)
            .fill('#000000');
        }
      }
    }
  }

  // Draw footer
  private drawFooter(): void {
    // Notes
    if (this.data.notes) {
      this.doc
        .fontSize(6)
        .font('Helvetica-Oblique')
        .fillColor('#666666')
        .text(`${this.t.notes}: ${this.data.notes}`, MARGIN, this.currentY, { 
          width: CONTENT_WIDTH 
        });
      this.currentY += 12;
    }
    
    // Thank you message
    this.doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(this.t.thankYou, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'center' 
      });
    
    this.currentY += 12;
    
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .text(this.t.seeYouSoon, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'center' 
      });
    
    this.currentY += 15;
    
    // Decorative line
    this.doc
      .moveTo(MARGIN, this.currentY)
      .lineTo(RECEIPT_WIDTH - MARGIN, this.currentY)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();
    
    this.currentY += 8;
    
    // Powered by
    this.doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor('#999999')
      .text(`Powered by ${this.t.poweredBy}`, MARGIN, this.currentY, { 
        width: CONTENT_WIDTH, 
        align: 'center' 
      });
    
    this.currentY += 10;
  }

  // Helper to draw divider line
  private drawDivider(): void {
    this.doc
      .moveTo(MARGIN, this.currentY)
      .lineTo(RECEIPT_WIDTH - MARGIN, this.currentY)
      .strokeColor('#000000')
      .lineWidth(0.5)
      .stroke();
    
    this.currentY += 6;
  }
}

// ============================================
// Demo Data Generator
// ============================================

export function getDemoReceiptData(language: 'fr' | 'en' = 'fr'): ReceiptData {
  const now = new Date();
  
  return {
    restaurant: {
      name: 'Le Savoir Africain',
      address: '123 Ave. République, Abidjan',
      phone: '+225 07 12 34 56 78',
      taxId: 'CI-ABJ-2024-12345',
    },
    
    orderNumber: `ORD-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    orderType: 'DELIVERY',
    
    customerName: 'Kouamé Jean-Baptiste',
    customerPhone: '+225 05 98 76 54 32',
    
    items: [
      { name: 'Attieké Poisson', quantity: 2, unitPrice: 4500, total: 9000 },
      { name: 'Kedjenou Poulet', quantity: 1, unitPrice: 5500, total: 5500, notes: 'Sans piment' },
      { name: 'Jus Bissap', quantity: 3, unitPrice: 800, total: 2400 },
      { name: 'Alloco', quantity: 2, unitPrice: 1000, total: 2000 },
    ],
    
    subtotal: 18900,
    tax: 3402,
    taxRate: 18,
    discount: 1000,
    deliveryFee: 1500,
    total: 22802,
    currency: 'XOF',
    
    payment: {
      method: 'ORANGE_MONEY',
      amount: 22802,
      reference: 'OM' + Date.now(),
      phoneNumber: '+225 07 12 34 56 78',
    },
    
    delivery: {
      address: '45 Rue des Jardins, Cocody',
      driverName: 'Amadou Touré',
      driverPhone: '+225 05 11 22 33 44',
    },
    
    date: now,
    notes: 'Sonner à l\'interphone',
    language,
  };
}

// ============================================
// Export convenience function
// ============================================

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const generator = new ReceiptGenerator(data);
  return generator.generate();
}

// ============================================
// Text Receipt for Thermal Printers
// ============================================

export function generateTextReceipt(data: ReceiptData): string {
  const t = translations[data.language];
  const width = 40;
  
  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };
  
  const line = '-'.repeat(width);
  const dblLine = '='.repeat(width);
  
  let receipt = '';
  
  // Header
  receipt += dblLine + '\n';
  receipt += center(data.restaurant.name) + '\n';
  if (data.restaurant.address) {
    receipt += center(data.restaurant.address) + '\n';
  }
  if (data.restaurant.phone) {
    receipt += center(`${t.tel}: ${data.restaurant.phone}`) + '\n';
  }
  receipt += dblLine + '\n\n';
  
  // Receipt title
  receipt += center(t.receipt) + '\n';
  receipt += line + '\n';
  
  // Order info
  receipt += `${t.order}: ${data.orderNumber}\n`;
  receipt += `${t.date}: ${formatDate(data.date, data.language)} ${formatTime(data.date, data.language)}\n`;
  
  const orderTypeLabel = data.orderType === 'DINE_IN' ? t.dineIn : 
                        data.orderType === 'DELIVERY' ? t.delivery : t.takeaway;
  receipt += `${t.orderType}: ${orderTypeLabel}\n`;
  
  if (data.tableNumber) {
    receipt += `${t.table}: ${data.tableNumber}\n`;
  }
  
  if (data.customerName) {
    receipt += `${t.customer}: ${data.customerName}\n`;
  }
  
  receipt += line + '\n';
  
  // Items
  for (const item of data.items) {
    receipt += `${item.name}\n`;
    receipt += `  ${item.quantity} x ${formatPrice(item.unitPrice, data.currency)}`;
    receipt += ` = ${formatPrice(item.total, data.currency)}\n`;
    if (item.notes) {
      receipt += `  (${item.notes})\n`;
    }
  }
  
  receipt += line + '\n';
  
  // Totals
  receipt += `${t.subtotal.padEnd(20)}${formatPrice(data.subtotal, data.currency).padStart(18)}\n`;
  receipt += `${t.tax} (${data.taxRate}%).padEnd(20)}${formatPrice(data.tax, data.currency).padStart(18)}\n`;
  
  if (data.discount && data.discount > 0) {
    receipt += `${t.discount.padEnd(20)}-${formatPrice(data.discount, data.currency).padStart(17)}\n`;
  }
  
  if (data.deliveryFee && data.deliveryFee > 0) {
    receipt += `${t.deliveryFee.padEnd(20)}${formatPrice(data.deliveryFee, data.currency).padStart(18)}\n`;
  }
  
  receipt += dblLine + '\n';
  receipt += `${t.total.padEnd(20)}${formatPrice(data.total, data.currency).padStart(18)}\n`;
  receipt += dblLine + '\n\n';
  
  // Payment
  const methodLabel = paymentMethodLabels[data.payment.method];
  receipt += `${t.paymentMethod}: ${methodLabel[data.language]}\n`;
  if (data.payment.reference) {
    receipt += `${t.ref}: ${data.payment.reference}\n`;
  }
  receipt += center(t.paid) + '\n\n';
  
  // Delivery
  if (data.orderType === 'DELIVERY' && data.delivery) {
    receipt += line + '\n';
    receipt += center('🚚 ' + t.delivery.toUpperCase()) + '\n';
    receipt += `${t.deliveryAddress}: ${data.delivery.address}\n`;
    if (data.delivery.driverName) {
      receipt += `${t.driver}: ${data.delivery.driverName}\n`;
    }
    receipt += line + '\n\n';
  }
  
  // Footer
  receipt += center(t.thankYou) + '\n';
  receipt += center(t.seeYouSoon) + '\n';
  receipt += dblLine + '\n';
  receipt += center('Powered by Restaurant OS') + '\n';
  
  return receipt;
}
