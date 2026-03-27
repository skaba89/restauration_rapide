// ============================================
// Restaurant OS - Professional Invoice Generator
// PDF invoice generation with African features
// ============================================

import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { formatCurrency, CURRENCIES } from '@/lib/currency';

// ============================================
// Types
// ============================================

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface InvoicePayment {
  method: 'ORANGE_MONEY' | 'MTN_MOMO' | 'WAVE' | 'MPESA' | 'CASH' | 'CARD' | 'BANK_TRANSFER';
  amount: number;
  reference?: string;
  phoneNumber?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export interface InvoiceCustomer {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface InvoiceDelivery {
  address: string;
  fee: number;
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
}

export interface InvoiceData {
  // Invoice info
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  
  // Restaurant info
  restaurant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    logo?: Buffer | string;
    website?: string;
  };
  
  // Customer info
  customer?: InvoiceCustomer;
  
  // Order details
  orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
  tableNumber?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  discount?: number;
  discountReason?: string;
  tip?: number;
  deliveryFee?: number;
  total: number;
  currency: string;
  
  // Payment
  payment: InvoicePayment;
  
  // Delivery
  delivery?: InvoiceDelivery;
  
  // Additional
  notes?: string;
  terms?: string;
  
  // Localization
  language: 'fr' | 'en';
}

// ============================================
// Translations
// ============================================

const translations = {
  fr: {
    invoice: 'FACTURE',
    invoiceNumber: 'N° Facture',
    orderNumber: 'N° Commande',
    date: 'Date',
    dueDate: 'Date d\'échéance',
    billTo: 'Facturer à',
    table: 'Table',
    orderType: 'Type de commande',
    dineIn: 'Sur place',
    delivery: 'Livraison',
    takeaway: 'À emporter',
    description: 'Description',
    quantity: 'Qté',
    unitPrice: 'Prix Unit.',
    total: 'Total',
    subtotal: 'Sous-total',
    tax: 'TVA',
    discount: 'Remise',
    tip: 'Pourboire',
    deliveryFee: 'Frais de livraison',
    grandTotal: 'TOTAL À PAYER',
    paymentMethod: 'Mode de paiement',
    paymentStatus: 'Statut du paiement',
    paymentReference: 'Référence',
    paid: 'PAYÉ',
    pending: 'EN ATTENTE',
    failed: 'ÉCHOUÉ',
    refunded: 'REMBOURSÉ',
    deliveryAddress: 'Adresse de livraison',
    driver: 'Livreur',
    contact: 'Contact',
    notes: 'Notes',
    terms: 'Conditions',
    thankYou: 'Merci de votre confiance !',
    qrCode: 'Scannez pour payer',
    mobileMoney: 'Paiement Mobile Money',
    orangeMoney: 'Orange Money',
    mtnMomo: 'MTN MoMo',
    wave: 'Wave',
    mpesa: 'M-Pesa',
    cash: 'Espèces',
    card: 'Carte',
    bankTransfer: 'Virement bancaire',
    page: 'Page',
    of: 'sur',
    taxId: 'N° Fiscal',
    phone: 'Tél',
    email: 'Email',
  },
  en: {
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice No.',
    orderNumber: 'Order No.',
    date: 'Date',
    dueDate: 'Due Date',
    billTo: 'Bill To',
    table: 'Table',
    orderType: 'Order Type',
    dineIn: 'Dine-in',
    delivery: 'Delivery',
    takeaway: 'Takeaway',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'VAT',
    discount: 'Discount',
    tip: 'Tip',
    deliveryFee: 'Delivery Fee',
    grandTotal: 'TOTAL DUE',
    paymentMethod: 'Payment Method',
    paymentStatus: 'Payment Status',
    paymentReference: 'Reference',
    paid: 'PAID',
    pending: 'PENDING',
    failed: 'FAILED',
    refunded: 'REFUNDED',
    deliveryAddress: 'Delivery Address',
    driver: 'Driver',
    contact: 'Contact',
    notes: 'Notes',
    terms: 'Terms',
    thankYou: 'Thank you for your business!',
    qrCode: 'Scan to pay',
    mobileMoney: 'Mobile Money Payment',
    orangeMoney: 'Orange Money',
    mtnMomo: 'MTN MoMo',
    wave: 'Wave',
    mpesa: 'M-Pesa',
    cash: 'Cash',
    card: 'Card',
    bankTransfer: 'Bank Transfer',
    page: 'Page',
    of: 'of',
    taxId: 'Tax ID',
    phone: 'Phone',
    email: 'Email',
  },
};

// ============================================
// Payment Method Labels
// ============================================

const paymentMethodLabels = {
  ORANGE_MONEY: { fr: 'Orange Money', en: 'Orange Money', color: '#FF6600' },
  MTN_MOMO: { fr: 'MTN MoMo', en: 'MTN MoMo', color: '#FFCC00' },
  WAVE: { fr: 'Wave', en: 'Wave', color: '#1DC8F2' },
  MPESA: { fr: 'M-Pesa', en: 'M-Pesa', color: '#00A651' },
  CASH: { fr: 'Espèces', en: 'Cash', color: '#4CAF50' },
  CARD: { fr: 'Carte', en: 'Card', color: '#2196F3' },
  BANK_TRANSFER: { fr: 'Virement', en: 'Bank Transfer', color: '#9C27B0' },
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date, language: 'fr' | 'en'): string {
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
    case 'PAID':
      return '#22C55E';
    case 'PENDING':
      return '#F59E0B';
    case 'FAILED':
      return '#EF4444';
    case 'REFUNDED':
      return '#6B7280';
    default:
      return '#6B7280';
  }
}

// Generate QR code data URL for Mobile Money
function generateMobileMoneyQRData(payment: InvoicePayment, total: number): string {
  if (!['ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 'MPESA'].includes(payment.method)) {
    return '';
  }
  
  // Generate QR payload based on payment method
  const payload = {
    provider: payment.method,
    amount: total,
    reference: payment.reference || '',
    phone: payment.phoneNumber || '',
    timestamp: new Date().toISOString(),
  };
  
  return JSON.stringify(payload);
}

// ============================================
// Invoice Generator Class
// ============================================

export class InvoiceGenerator {
  private doc: PDFKit.PDFDocument;
  private t: typeof translations.fr;
  private currentY: number = 0;
  private pageHeight: number = 792; // Letter size
  private margin: number = 50;
  private contentWidth: number = 512; // 612 - 2*50

  constructor(private data: InvoiceData) {
    this.doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      bufferPages: true,
    });
    this.t = translations[data.language];
    this.contentWidth = 612 - 2 * this.margin;
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
        this.drawInvoiceInfo();
        this.drawCustomerInfo();
        this.drawItemsTable();
        this.drawTotals();
        this.drawPaymentInfo();
        this.drawDeliveryInfo();
        this.drawNotes();
        this.drawFooter();
        
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Draw header with restaurant branding
  private drawHeader(): void {
    const { restaurant } = this.data;
    
    // Restaurant logo placeholder (orange gradient box with text)
    this.doc
      .save()
      .roundedRect(this.margin, 50, 80, 80, 8)
      .fill('#FF6B00');
    
    this.doc
      .fillColor('#FFFFFF')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('RESTAURANT', this.margin + 10, 75, { width: 60, align: 'center' });
    
    this.doc
      .fontSize(10)
      .text('OS', this.margin + 10, 90, { width: 60, align: 'center' });
    
    this.doc.restore();
    
    // Restaurant name and info
    this.doc
      .fillColor('#1F2937')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(restaurant.name, this.margin + 100, 55);
    
    if (restaurant.address) {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(restaurant.address, this.margin + 100, 85);
    }
    
    if (restaurant.phone || restaurant.email) {
      let infoY = 100;
      if (restaurant.phone) {
        this.doc
          .fontSize(9)
          .text(`${this.t.phone}: ${restaurant.phone}`, this.margin + 100, infoY);
        infoY += 12;
      }
      if (restaurant.email) {
        this.doc
          .fontSize(9)
          .text(`${this.t.email}: ${restaurant.email}`, this.margin + 100, infoY);
      }
    }
    
    // Invoice title (right side)
    this.doc
      .fontSize(32)
      .font('Helvetica-Bold')
      .fillColor('#FF6B00')
      .text(this.t.invoice, 400, 50, { align: 'right', width: 162 });
    
    // Decorative line
    this.doc
      .moveTo(this.margin, 140)
      .lineTo(612 - this.margin, 140)
      .strokeColor('#FF6B00')
      .lineWidth(2)
      .stroke();
    
    this.currentY = 160;
  }

  // Draw invoice information
  private drawInvoiceInfo(): void {
    const { invoiceNumber, orderNumber, invoiceDate, dueDate, orderType, tableNumber } = this.data;
    
    // Left column
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(`${this.t.invoiceNumber}:`, this.margin, this.currentY);
    
    this.doc
      .font('Helvetica')
      .fillColor('#1F2937')
      .text(invoiceNumber, this.margin + 100, this.currentY);
    
    this.currentY += 15;
    
    this.doc
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(`${this.t.orderNumber}:`, this.margin, this.currentY);
    
    this.doc
      .font('Helvetica')
      .fillColor('#1F2937')
      .text(orderNumber, this.margin + 100, this.currentY);
    
    this.currentY += 15;
    
    this.doc
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(`${this.t.date}:`, this.margin, this.currentY);
    
    this.doc
      .font('Helvetica')
      .fillColor('#1F2937')
      .text(`${formatDate(invoiceDate, this.data.language)} ${formatTime(invoiceDate, this.data.language)}`, this.margin + 100, this.currentY);
    
    // Right column - Order type
    const orderTypeLabel = orderType === 'DINE_IN' ? this.t.dineIn : 
                          orderType === 'DELIVERY' ? this.t.delivery : this.t.takeaway;
    
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(`${this.t.orderType}:`, 350, this.currentY - 30);
    
    // Order type badge
    const badgeWidth = 100;
    const badgeX = 462 - badgeWidth;
    
    this.doc
      .save()
      .roundedRect(badgeX, this.currentY - 32, badgeWidth, 20, 4)
      .fill(orderType === 'DELIVERY' ? '#DBEAFE' : 
            orderType === 'TAKEAWAY' ? '#FEF3C7' : '#D1FAE5');
    
    this.doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(orderType === 'DELIVERY' ? '#1E40AF' : 
                orderType === 'TAKEAWAY' ? '#92400E' : '#065F46')
      .text(orderTypeLabel, badgeX, this.currentY - 28, { width: badgeWidth, align: 'center' });
    
    this.doc.restore();
    
    if (tableNumber) {
      this.currentY += 15;
      this.doc
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(`${this.t.table}:`, this.margin, this.currentY);
      
      this.doc
        .font('Helvetica')
        .fillColor('#1F2937')
        .text(tableNumber, this.margin + 100, this.currentY);
    }
    
    this.currentY += 30;
    
    // Separator line
    this.doc
      .moveTo(this.margin, this.currentY)
      .lineTo(612 - this.margin, this.currentY)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();
    
    this.currentY += 15;
  }

  // Draw customer information
  private drawCustomerInfo(): void {
    const { customer } = this.data;
    
    if (!customer) {
      return;
    }
    
    // Background box
    this.doc
      .save()
      .rect(this.margin, this.currentY, this.contentWidth, 70)
      .fill('#F9FAFB');
    
    this.doc.restore();
    
    this.doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(this.t.billTo, this.margin + 10, this.currentY + 10);
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#1F2937')
      .text(customer.name, this.margin + 10, this.currentY + 28);
    
    if (customer.address) {
      this.doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text(customer.address, this.margin + 10, this.currentY + 42);
    }
    
    if (customer.phone || customer.email) {
      let infoX = this.margin + 250;
      
      if (customer.phone) {
        this.doc
          .fontSize(9)
          .fillColor('#6B7280')
          .text(`${this.t.phone}: ${customer.phone}`, infoX, this.currentY + 28);
        infoX += 120;
      }
      
      if (customer.email) {
        this.doc
          .fontSize(9)
          .fillColor('#6B7280')
          .text(`${this.t.email}: ${customer.email}`, infoX, this.currentY + 28);
      }
    }
    
    if (customer.taxId) {
      this.doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text(`${this.t.taxId}: ${customer.taxId}`, this.margin + 10, this.currentY + 56);
    }
    
    this.currentY += 85;
  }

  // Draw items table
  private drawItemsTable(): void {
    const { items, currency } = this.data;
    
    // Table header
    const tableTop = this.currentY;
    const colWidths = [220, 60, 90, 90]; // Description, Qty, Unit Price, Total
    const rowHeight = 25;
    
    // Header background
    this.doc
      .save()
      .rect(this.margin, tableTop, this.contentWidth, rowHeight)
      .fill('#374151');
    
    this.doc.restore();
    
    // Header text
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF');
    
    let colX = this.margin + 10;
    this.doc.text(this.t.description, colX, tableTop + 7);
    
    colX += colWidths[0];
    this.doc.text(this.t.quantity, colX, tableTop + 7, { width: colWidths[1], align: 'center' });
    
    colX += colWidths[1];
    this.doc.text(this.t.unitPrice, colX, tableTop + 7, { width: colWidths[2], align: 'right' });
    
    colX += colWidths[2];
    this.doc.text(this.t.total, colX, tableTop + 7, { width: colWidths[3] - 20, align: 'right' });
    
    this.currentY = tableTop + rowHeight;
    
    // Table rows
    items.forEach((item, index) => {
      const rowY = this.currentY;
      const isAlternate = index % 2 === 1;
      
      // Row background
      if (isAlternate) {
        this.doc
          .save()
          .rect(this.margin, rowY, this.contentWidth, rowHeight)
          .fill('#F9FAFB');
        this.doc.restore();
      }
      
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#1F2937');
      
      colX = this.margin + 10;
      
      // Item name
      this.doc.text(item.name, colX, rowY + 7, { width: colWidths[0] - 20 });
      
      if (item.notes) {
        this.doc
          .fontSize(7)
          .fillColor('#6B7280')
          .text(item.notes, colX, rowY + 18, { width: colWidths[0] - 20 });
      }
      
      this.doc.fillColor('#1F2937');
      
      // Quantity
      colX += colWidths[0];
      this.doc.fontSize(9).text(item.quantity.toString(), colX, rowY + 7, { width: colWidths[1], align: 'center' });
      
      // Unit price
      colX += colWidths[1];
      this.doc.text(formatPrice(item.unitPrice, currency), colX, rowY + 7, { width: colWidths[2], align: 'right' });
      
      // Total
      colX += colWidths[2];
      this.doc
        .font('Helvetica-Bold')
        .text(formatPrice(item.total, currency), colX, rowY + 7, { width: colWidths[3] - 20, align: 'right' });
      
      this.currentY += rowHeight;
    });
    
    // Table border
    this.doc
      .rect(this.margin, tableTop, this.contentWidth, this.currentY - tableTop)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();
    
    this.currentY += 20;
  }

  // Draw totals section
  private drawTotals(): void {
    const { subtotal, tax, taxRate, discount, tip, deliveryFee, total, currency } = this.data;
    
    const totalsX = 380;
    const valueX = 462;
    const labelWidth = 70;
    const valueWidth = 100;
    
    // Subtotal
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(this.t.subtotal, totalsX, this.currentY, { width: labelWidth, align: 'right' });
    
    this.doc
      .fillColor('#1F2937')
      .text(formatPrice(subtotal, currency), valueX, this.currentY, { width: valueWidth, align: 'right' });
    
    this.currentY += 18;
    
    // Discount
    if (discount && discount > 0) {
      this.doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text(this.t.discount, totalsX, this.currentY, { width: labelWidth, align: 'right' });
      
      this.doc
        .fillColor('#EF4444')
        .text(`-${formatPrice(discount, currency)}`, valueX, this.currentY, { width: valueWidth, align: 'right' });
      
      this.currentY += 18;
    }
    
    // Tax
    this.doc
      .fontSize(10)
      .fillColor('#6B7280')
      .text(`${this.t.tax} (${taxRate}%)`, totalsX, this.currentY, { width: labelWidth, align: 'right' });
    
    this.doc
      .fillColor('#1F2937')
      .text(formatPrice(tax, currency), valueX, this.currentY, { width: valueWidth, align: 'right' });
    
    this.currentY += 18;
    
    // Delivery fee
    if (deliveryFee && deliveryFee > 0) {
      this.doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text(this.t.deliveryFee, totalsX, this.currentY, { width: labelWidth, align: 'right' });
      
      this.doc
        .fillColor('#1F2937')
        .text(formatPrice(deliveryFee, currency), valueX, this.currentY, { width: valueWidth, align: 'right' });
      
      this.currentY += 18;
    }
    
    // Tip
    if (tip && tip > 0) {
      this.doc
        .fontSize(10)
        .fillColor('#6B7280')
        .text(this.t.tip, totalsX, this.currentY, { width: labelWidth, align: 'right' });
      
      this.doc
        .fillColor('#1F2937')
        .text(formatPrice(tip, currency), valueX, this.currentY, { width: valueWidth, align: 'right' });
      
      this.currentY += 18;
    }
    
    // Divider line
    this.doc
      .moveTo(totalsX - 10, this.currentY)
      .lineTo(562, this.currentY)
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .stroke();
    
    this.currentY += 10;
    
    // Grand total
    this.doc
      .save()
      .roundedRect(totalsX - 10, this.currentY - 5, 192, 30, 6)
      .fill('#FF6B00');
    
    this.doc.restore();
    
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(this.t.grandTotal, totalsX, this.currentY + 2, { width: labelWidth, align: 'right' });
    
    this.doc
      .fontSize(14)
      .text(formatPrice(total, currency), valueX, this.currentY, { width: valueWidth, align: 'right' });
    
    this.currentY += 45;
  }

  // Draw payment information with Mobile Money QR
  private drawPaymentInfo(): void {
    const { payment, total, currency } = this.data;
    
    // Payment info box
    const boxHeight = 80;
    
    this.doc
      .save()
      .roundedRect(this.margin, this.currentY, this.contentWidth, boxHeight)
      .fillColor('#F0FDF4')
      .fill();
    
    this.doc.restore();
    
    // Payment status badge
    const statusColor = getStatusColor(payment.status);
    const statusLabel = this.t[payment.status.toLowerCase() as keyof typeof this.t] || payment.status;
    
    this.doc
      .save()
      .roundedRect(this.margin + 10, this.currentY + 10, 80, 22, 4)
      .fill(statusColor);
    
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text(statusLabel, this.margin + 10, this.currentY + 14, { width: 80, align: 'center' });
    
    this.doc.restore();
    
    // Payment method
    const methodLabel = paymentMethodLabels[payment.method];
    
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text(`${this.t.paymentMethod}:`, this.margin + 110, this.currentY + 15);
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#1F2937')
      .text(methodLabel[this.data.language], this.margin + 200, this.currentY + 15);
    
    // Payment reference
    if (payment.reference) {
      this.doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text(`${this.t.paymentReference}: ${payment.reference}`, this.margin + 10, this.currentY + 40);
    }
    
    // Phone number for Mobile Money
    if (payment.phoneNumber && ['ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 'MPESA'].includes(payment.method)) {
      this.doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text(`${this.t.phone}: ${payment.phoneNumber}`, this.margin + 10, this.currentY + 55);
    }
    
    // QR code placeholder for Mobile Money
    if (['ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 'MPESA'].includes(payment.method)) {
      const qrX = 462;
      const qrY = this.currentY + 10;
      const qrSize = 60;
      
      // QR code box
      this.doc
        .save()
        .rect(qrX, qrY, qrSize, qrSize)
        .fill('#FFFFFF')
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .stroke();
      
      // QR code placeholder pattern
      this.drawQRPlaceholder(qrX + 5, qrY + 5, qrSize - 10);
      
      this.doc.restore();
      
      this.doc
        .fontSize(7)
        .fillColor('#6B7280')
        .text(this.t.qrCode, qrX, qrY + qrSize + 2, { width: qrSize, align: 'center' });
    }
    
    this.doc.restore();
    this.currentY += boxHeight + 20;
  }

  // Draw QR code placeholder pattern
  private drawQRPlaceholder(x: number, y: number, size: number): void {
    const moduleCount = 7;
    const moduleSize = size / moduleCount;
    
    // QR corner patterns
    const drawCornerPattern = (cx: number, cy: number) => {
      // Outer square
      this.doc.rect(cx, cy, moduleSize * 3, moduleSize * 3).fill('#1F2937');
      // Inner white square
      this.doc.rect(cx + moduleSize, cy + moduleSize, moduleSize, moduleSize).fill('#FFFFFF');
    };
    
    // Top-left corner
    drawCornerPattern(x, y);
    // Top-right corner
    drawCornerPattern(x + moduleSize * 4, y);
    // Bottom-left corner
    drawCornerPattern(x, y + moduleSize * 4);
    
    // Random pattern in the middle
    const pattern = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0, 1, 1],
      [0, 1, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ];
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (pattern[row][col] === 1) {
          this.doc
            .rect(x + col * moduleSize, y + row * moduleSize, moduleSize, moduleSize)
            .fill('#1F2937');
        }
      }
    }
  }

  // Draw delivery information
  private drawDeliveryInfo(): void {
    const { delivery, orderType } = this.data;
    
    if (orderType !== 'DELIVERY' || !delivery) {
      return;
    }
    
    const boxHeight = 60;
    
    this.doc
      .save()
      .roundedRect(this.margin, this.currentY, this.contentWidth, boxHeight)
      .fill('#FEF3C7');
    
    this.doc.restore();
    
    // Delivery icon (text-based)
    this.doc
      .fontSize(16)
      .text('🚚', this.margin + 10, this.currentY + 15);
    
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#92400E')
      .text(this.t.deliveryAddress, this.margin + 35, this.currentY + 10);
    
    this.doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#78350F')
      .text(delivery.address, this.margin + 35, this.currentY + 25);
    
    if (delivery.driverName) {
      this.doc
        .fontSize(9)
        .fillColor('#78350F')
        .text(`${this.t.driver}: ${delivery.driverName}`, this.margin + 35, this.currentY + 40);
      
      if (delivery.driverPhone) {
        this.doc
          .text(`${this.t.contact}: ${delivery.driverPhone}`, this.margin + 200, this.currentY + 40);
      }
    }
    
    this.currentY += boxHeight + 20;
  }

  // Draw notes and terms
  private drawNotes(): void {
    const { notes, terms } = this.data;
    
    if (notes) {
      this.doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(`${this.t.notes}:`, this.margin, this.currentY);
      
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(notes, this.margin + 50, this.currentY);
      
      this.currentY += 20;
    }
    
    if (terms) {
      this.doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .fillColor('#9CA3AF')
        .text(terms, this.margin, this.currentY, { width: this.contentWidth });
      
      this.currentY += 30;
    }
  }

  // Draw footer
  private drawFooter(): void {
    const footerY = this.pageHeight - 40;
    
    // Thank you message
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#FF6B00')
      .text(this.t.thankYou, this.margin, footerY, { width: this.contentWidth, align: 'center' });
    
    // Restaurant website/contact
    if (this.data.restaurant.website) {
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(this.data.restaurant.website, this.margin, footerY + 18, { width: this.contentWidth, align: 'center' });
    }
  }
}

// ============================================
// Demo Data Generator
// ============================================

export function getDemoInvoiceData(language: 'fr' | 'en' = 'fr'): InvoiceData {
  const now = new Date();
  
  return {
    invoiceNumber: `INV-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    orderNumber: `ORD-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    invoiceDate: now,
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    
    restaurant: {
      name: 'Le Savoir Africain',
      address: '123 Avenue de la République, Abidjan, Côte d\'Ivoire',
      phone: '+225 07 12 34 56 78',
      email: 'contact@lesavoirafricain.ci',
      taxId: 'CI-ABJ-2024-12345',
      website: 'www.lesavoirafricain.ci',
    },
    
    customer: {
      name: 'Kouamé Jean-Baptiste',
      email: 'kouame.jb@email.com',
      phone: '+225 05 98 76 54 32',
      address: '45 Rue des Jardins, Cocody, Abidjan',
    },
    
    orderType: 'DELIVERY',
    
    items: [
      {
        name: 'Attieké Poisson Grillé',
        description: 'Attieké avec poisson grillé et sauce graine',
        quantity: 2,
        unitPrice: 4500,
        total: 9000,
      },
      {
        name: 'Kedjenou de Poulet',
        description: 'Poulet braisé aux légumes',
        quantity: 1,
        unitPrice: 5500,
        total: 5500,
        notes: 'Sans piment',
      },
      {
        name: 'Jus de Bissap',
        quantity: 3,
        unitPrice: 800,
        total: 2400,
      },
      {
        name: 'Alloco',
        description: 'Banane plantain frite',
        quantity: 2,
        unitPrice: 1000,
        total: 2000,
      },
    ],
    
    subtotal: 18900,
    tax: 3402,
    taxRate: 18,
    discount: 1000,
    discountReason: 'Fidélité client',
    deliveryFee: 1500,
    total: 22802,
    currency: 'XOF',
    
    payment: {
      method: 'ORANGE_MONEY',
      amount: 22802,
      reference: 'OM' + Date.now(),
      phoneNumber: '+225 07 12 34 56 78',
      status: 'COMPLETED',
    },
    
    delivery: {
      address: '45 Rue des Jardins, Cocody, Abidjan',
      fee: 1500,
      driverName: 'Amadou Touré',
      driverPhone: '+225 05 11 22 33 44',
      estimatedTime: '30 min',
    },
    
    notes: 'Merci de sonner à l\'interphone',
    terms: 'Les produits consommés ne sont ni échangeables ni remboursables. En cas de retard de livraison, veuillez nous contacter.',
    
    language,
  };
}

// ============================================
// Export convenience function
// ============================================

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const generator = new InvoiceGenerator(data);
  return generator.generate();
}
