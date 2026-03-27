// ============================================
// Restaurant OS - PDF Receipt Service
// Receipt generation for orders
// ============================================

import { logger } from '@/lib/logger';

// ============================================
// Receipt Data Types
// ============================================

interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

interface ReceiptPayment {
  method: string;
  amount: number;
  reference?: string;
}

interface ReceiptData {
  // Restaurant info
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantLogo?: string;
  taxId?: string;
  
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
  tax?: number;
  taxRate?: number;
  discount?: number;
  tip?: number;
  total: number;
  currency: string;
  
  // Payment
  payment: ReceiptPayment;
  
  // Delivery info
  deliveryAddress?: string;
  deliveryFee?: number;
  driverName?: string;
  driverPhone?: string;
  
  // Timestamps
  date: string;
  time: string;
  
  // Additional
  notes?: string;
  qrCode?: string;
}

// ============================================
// PDF Generator Class
// ============================================

class PDFReceiptService {
  /**
   * Generate a text receipt (for thermal printers)
   */
  generateTextReceipt(data: ReceiptData): string {
    const divider = '═'.repeat(40);
    const line = '-'.repeat(40);
    const width = 40;

    const center = (text: string) => {
      const padding = Math.max(0, Math.floor((width - text.length) / 2));
      return ' '.repeat(padding) + text;
    };

    const formatPrice = (price: number) => {
      return price.toLocaleString() + ' ' + data.currency;
    };

    let receipt = '';

    // Header
    receipt += divider + '\n';
    receipt += center(data.restaurantName) + '\n';
    if (data.restaurantAddress) {
      receipt += center(data.restaurantAddress) + '\n';
    }
    if (data.restaurantPhone) {
      receipt += center('Tel: ' + data.restaurantPhone) + '\n';
    }
    receipt += divider + '\n\n';

    // Order info
    receipt += `Commande: ${data.orderNumber}\n`;
    receipt += `Date: ${data.date}\n`;
    receipt += `Heure: ${data.time}\n`;
    receipt += `Type: ${data.orderType === 'DINE_IN' ? 'Sur place' : data.orderType === 'DELIVERY' ? 'Livraison' : 'À emporter'}\n`;
    if (data.tableNumber) {
      receipt += `Table: ${data.tableNumber}\n`;
    }
    receipt += line + '\n\n';

    // Items
    receipt += 'ARTICLES\n';
    receipt += line + '\n';
    for (const item of data.items) {
      receipt += `${item.name}\n`;
      receipt += `  ${item.quantity} x ${formatPrice(item.unitPrice)} = ${formatPrice(item.total)}\n`;
      if (item.notes) {
        receipt += `  Note: ${item.notes}\n`;
      }
    }
    receipt += line + '\n';

    // Totals
    receipt += `Sous-total:          ${formatPrice(data.subtotal).padStart(16)}\n`;
    if (data.discount) {
      receipt += `Remise:              -${formatPrice(data.discount).padStart(15)}\n`;
    }
    if (data.tax) {
      receipt += `TVA (${data.taxRate || 18}%):           ${formatPrice(data.tax).padStart(16)}\n`;
    }
    if (data.deliveryFee) {
      receipt += `Livraison:           ${formatPrice(data.deliveryFee).padStart(16)}\n`;
    }
    receipt += line + '\n';
    receipt += `TOTAL:               ${formatPrice(data.total).padStart(16)}\n`;
    receipt += line + '\n\n';

    // Payment
    receipt += `Paiement: ${data.payment.method}\n`;
    if (data.payment.reference) {
      receipt += `Réf: ${data.payment.reference}\n`;
    }
    receipt += '\n';

    // Customer info
    if (data.customerName) {
      receipt += `Client: ${data.customerName}\n`;
    }
    if (data.customerPhone) {
      receipt += `Tél: ${data.customerPhone}\n`;
    }

    // Delivery info
    if (data.orderType === 'DELIVERY' && data.deliveryAddress) {
      receipt += '\n' + line + '\n';
      receipt += 'LIVRAISON\n';
      receipt += `Adresse: ${data.deliveryAddress}\n`;
      if (data.driverName) {
        receipt += `Livreur: ${data.driverName}\n`;
      }
      if (data.driverPhone) {
        receipt += `Contact: ${data.driverPhone}\n`;
      }
    }

    // Notes
    if (data.notes) {
      receipt += '\n' + line + '\n';
      receipt += `Note: ${data.notes}\n`;
    }

    // Footer
    receipt += '\n' + divider + '\n';
    receipt += center('Merci de votre visite!') + '\n';
    receipt += center('À bientôt') + '\n';
    receipt += divider + '\n';

    return receipt;
  }

  /**
   * Generate HTML receipt (for browsers and email)
   */
  generateHTMLReceipt(data: ReceiptData): string {
    const formatPrice = (price: number) => {
      return price.toLocaleString() + ' ' + data.currency;
    };

    const orderTypeLabels: Record<string, string> = {
      DINE_IN: 'Sur place',
      DELIVERY: 'Livraison',
      TAKEAWAY: 'À emporter',
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu - ${data.orderNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
    
    body {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    }
    
    .receipt {
      max-width: 300px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      border-bottom: 2px dashed #ccc;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 10px;
    }
    
    .restaurant-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .restaurant-info {
      font-size: 12px;
      color: #666;
    }
    
    .order-info {
      margin-bottom: 15px;
    }
    
    .order-info p {
      margin: 5px 0;
      font-size: 12px;
    }
    
    .divider {
      border-top: 1px dashed #ccc;
      margin: 10px 0;
    }
    
    .items {
      margin: 15px 0;
    }
    
    .item {
      margin-bottom: 10px;
    }
    
    .item-name {
      font-weight: bold;
      font-size: 13px;
    }
    
    .item-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
    }
    
    .item-notes {
      font-size: 11px;
      color: #888;
      font-style: italic;
    }
    
    .totals {
      margin-top: 15px;
    }
    
    .total-line {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin: 3px 0;
    }
    
    .total-line.grand-total {
      font-size: 16px;
      font-weight: bold;
      border-top: 2px solid #000;
      padding-top: 5px;
      margin-top: 5px;
    }
    
    .payment {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed #ccc;
      font-size: 12px;
    }
    
    .delivery {
      margin-top: 15px;
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid #f97316;
      font-size: 11px;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #ccc;
      font-size: 12px;
      color: #666;
    }
    
    .qr-code {
      text-align: center;
      margin: 15px 0;
    }
    
    .qr-code img {
      width: 100px;
      height: 100px;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: bold;
    }
    
    .badge-delivery { background: #dbeafe; color: #1e40af; }
    .badge-takeaway { background: #fef3c7; color: #92400e; }
    .badge-dinein { background: #dcfce7; color: #166534; }
    
    .print-button {
      display: block;
      width: 100%;
      margin-top: 20px;
      padding: 10px;
      background: #f97316;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }
    
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${data.restaurantLogo ? `<img src="${data.restaurantLogo}" alt="Logo" class="logo">` : ''}
      <div class="restaurant-name">${data.restaurantName}</div>
      ${data.restaurantAddress ? `<div class="restaurant-info">${data.restaurantAddress}</div>` : ''}
      ${data.restaurantPhone ? `<div class="restaurant-info">Tel: ${data.restaurantPhone}</div>` : ''}
    </div>
    
    <div class="order-info">
      <p><strong>Commande:</strong> ${data.orderNumber}</p>
      <p><strong>Date:</strong> ${data.date} ${data.time}</p>
      <p>
        <strong>Type:</strong> 
        <span class="badge badge-${data.orderType.toLowerCase()}">${orderTypeLabels[data.orderType]}</span>
      </p>
      ${data.tableNumber ? `<p><strong>Table:</strong> ${data.tableNumber}</p>` : ''}
    </div>
    
    <div class="divider"></div>
    
    <div class="items">
      ${data.items.map(item => `
        <div class="item">
          <div class="item-name">${item.name}</div>
          <div class="item-details">
            <span>${item.quantity} x ${formatPrice(item.unitPrice)}</span>
            <span>${formatPrice(item.total)}</span>
          </div>
          ${item.notes ? `<div class="item-notes">📝 ${item.notes}</div>` : ''}
        </div>
      `).join('')}
    </div>
    
    <div class="divider"></div>
    
    <div class="totals">
      <div class="total-line">
        <span>Sous-total</span>
        <span>${formatPrice(data.subtotal)}</span>
      </div>
      ${data.discount ? `
        <div class="total-line">
          <span>Remise</span>
          <span>-${formatPrice(data.discount)}</span>
        </div>
      ` : ''}
      ${data.tax ? `
        <div class="total-line">
          <span>TVA (${data.taxRate || 18}%)</span>
          <span>${formatPrice(data.tax)}</span>
        </div>
      ` : ''}
      ${data.deliveryFee ? `
        <div class="total-line">
          <span>Livraison</span>
          <span>${formatPrice(data.deliveryFee)}</span>
        </div>
      ` : ''}
      <div class="total-line grand-total">
        <span>TOTAL</span>
        <span>${formatPrice(data.total)}</span>
      </div>
    </div>
    
    <div class="payment">
      <p><strong>Paiement:</strong> ${data.payment.method}</p>
      ${data.payment.reference ? `<p><strong>Réf:</strong> ${data.payment.reference}</p>` : ''}
    </div>
    
    ${data.customerName ? `
      <div class="divider"></div>
      <div style="font-size: 12px;">
        <p><strong>Client:</strong> ${data.customerName}</p>
        ${data.customerPhone ? `<p><strong>Tél:</strong> ${data.customerPhone}</p>` : ''}
      </div>
    ` : ''}
    
    ${data.orderType === 'DELIVERY' && data.deliveryAddress ? `
      <div class="delivery">
        <p><strong>📍 Adresse de livraison:</strong></p>
        <p>${data.deliveryAddress}</p>
        ${data.driverName ? `<p><strong>Livreur:</strong> ${data.driverName}</p>` : ''}
        ${data.driverPhone ? `<p><strong>Contact:</strong> ${data.driverPhone}</p>` : ''}
      </div>
    ` : ''}
    
    ${data.qrCode ? `
      <div class="qr-code">
        <img src="${data.qrCode}" alt="QR Code">
        <p style="font-size: 10px; color: #888;">Scannez pour suivre votre commande</p>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>Merci de votre visite!</p>
      <p>À bientôt 👋</p>
    </div>
    
    <button class="print-button no-print" onclick="window.print()">
      🖨️ Imprimer le reçu
    </button>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate receipt data structure
   */
  createReceiptData(
    order: {
      id: string;
      orderNumber: string;
      orderType: string;
      tableNumber?: string;
      status: string;
      total: number;
      subtotal: number;
      tax?: number;
      deliveryFee?: number;
      discount?: number;
      notes?: string;
      createdAt: Date;
      customer?: { name?: string; phone?: string } | null;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
        notes?: string;
      }>;
      payment?: {
        method: string;
        status: string;
        reference?: string;
      } | null;
      delivery?: {
        address: string;
        driver?: { name: string; phone: string } | null;
      } | null;
    },
    restaurant: {
      name: string;
      address?: string;
      phone?: string;
      logo?: string;
      taxId?: string;
    }
  ): ReceiptData {
    return {
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantPhone: restaurant.phone,
      restaurantLogo: restaurant.logo,
      taxId: restaurant.taxId,
      
      orderNumber: order.orderNumber,
      orderType: order.orderType as 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY',
      tableNumber: order.tableNumber,
      
      customerName: order.customer?.name,
      customerPhone: order.customer?.phone,
      
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
        notes: item.notes,
      })),
      
      subtotal: order.subtotal,
      tax: order.tax,
      taxRate: 18,
      discount: order.discount,
      total: order.total,
      currency: 'FCFA',
      
      payment: {
        method: order.payment?.method || 'Non spécifié',
        amount: order.total,
        reference: order.payment?.reference,
      },
      
      deliveryAddress: order.delivery?.address,
      deliveryFee: order.deliveryFee,
      driverName: order.delivery?.driver?.name,
      driverPhone: order.delivery?.driver?.phone,
      
      date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
      time: new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      
      notes: order.notes,
    };
  }

  /**
   * Generate a download URL for the receipt
   */
  generateDownloadURL(orderId: string): string {
    return `/api/orders/${orderId}/receipt`;
  }
}

// Export singleton instance
export const pdfReceiptService = new PDFReceiptService();
