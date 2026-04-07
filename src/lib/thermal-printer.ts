/**
 * Thermal Printer Service for KFM DELICE
 * ESC/POS commands for thermal receipt printers
 * Supports: USB, Network, Bluetooth connections
 */

// ============================================
// Types
// ============================================

export type PrinterConnectionType = 'usb' | 'network' | 'bluetooth';
export type PaperWidth = 58 | 80;
export type PrintJobType = 'receipt' | 'kitchen' | 'report';

export interface Printer {
  id: string;
  name: string;
  type: 'kitchen' | 'receipt' | 'bar' | 'delivery';
  connectionType: PrinterConnectionType;
  address: string; // IP address or USB path
  paperWidth: PaperWidth;
  isDefault: boolean;
  status: 'online' | 'offline' | 'error';
  lastUsed?: Date;
  charactersPerLine?: number;
}

export interface PrintJob {
  id: string;
  printerId: string;
  type: PrintJobType;
  content: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface ReceiptData {
  orderNumber: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  notes?: string;
  tableNumber?: string;
  waiterName?: string;
  createdAt: Date;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface KitchenTicketData {
  orderNumber: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  items: KitchenTicketItem[];
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
  tableNumber?: string;
  createdAt: Date;
}

export interface KitchenTicketItem {
  name: string;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

// ============================================
// ESC/POS Commands
// ============================================

const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

export const ESC_POS = {
  // Initialize printer
  INIT: [ESC, 0x40],
  
  // Line feed
  LF: [LF],
  
  // Paper cut
  CUT: [GS, 0x56, 0x00], // Full cut
  PARTIAL_CUT: [GS, 0x56, 0x01], // Partial cut
  
  // Alignment
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  
  // Text formatting
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  UNDERLINE_ON: [ESC, 0x2D, 0x01],
  UNDERLINE_OFF: [ESC, 0x2D, 0x00],
  DOUBLE_HEIGHT_ON: [GS, 0x21, 0x10],
  DOUBLE_HEIGHT_OFF: [GS, 0x21, 0x00],
  DOUBLE_WIDTH_ON: [GS, 0x21, 0x01],
  DOUBLE_WIDTH_OFF: [GS, 0x21, 0x00],
  DOUBLE_SIZE_ON: [GS, 0x21, 0x11],
  DOUBLE_SIZE_OFF: [GS, 0x21, 0x00],
  
  // Font size
  FONT_SMALL: [ESC, 0x21, 0x01],
  FONT_NORMAL: [ESC, 0x21, 0x00],
  
  // Character set
  SET_CHARSET: (charset: number) => [ESC, 0x52, charset],
  SET_CODEPAGE: (codepage: number) => [ESC, 0x74, codepage],
  
  // Cash drawer
  OPEN_DRAWER: [ESC, 0x70, 0x00, 0x19, 0xFA],
  
  // Barcode
  BARCODE_HEIGHT: (height: number) => [GS, 0x68, height],
  BARCODE_WIDTH: (width: number) => [GS, 0x77, width],
  BARCODE_PRINT: (type: number, data: string) => [
    GS, 0x6B, type, data.length, ...Array.from(data).map(c => c.charCodeAt(0))
  ],
  
  // QR Code
  QR_CODE: (data: string) => [
    GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00, // Model 2
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08, // Size 8
    GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31, // Error correction L
    ...getQRDataCommands(data),
  ],
};

function getQRDataCommands(data: string): number[] {
  const len = data.length + 3;
  const pL = len & 0xFF;
  const pH = (len >> 8) & 0xFF;
  return [
    GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30,
    ...Array.from(data).map(c => c.charCodeAt(0))
  ];
}

// ============================================
// Printer Service Class
// ============================================

export class ThermalPrinterService {
  private printers: Map<string, Printer> = new Map();
  private printJobs: Map<string, PrintJob> = new Map();
  
  constructor() {
    this.loadPrinters();
  }
  
  // ============================================
  // Printer Management
  // ============================================
  
  private loadPrinters(): void {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('kfm-printers');
    if (stored) {
      try {
        const printers = JSON.parse(stored) as Printer[];
        printers.forEach(p => this.printers.set(p.id, p));
      } catch (e) {
        console.error('Failed to load printers:', e);
      }
    }
  }
  
  private savePrinters(): void {
    if (typeof window === 'undefined') return;
    
    const printers = Array.from(this.printers.values());
    localStorage.setItem('kfm-printers', JSON.stringify(printers));
  }
  
  getPrinters(): Printer[] {
    return Array.from(this.printers.values());
  }
  
  getPrinter(id: string): Printer | undefined {
    return this.printers.get(id);
  }
  
  getDefaultPrinter(): Printer | undefined {
    return Array.from(this.printers.values()).find(p => p.isDefault);
  }
  
  addPrinter(printer: Omit<Printer, 'id' | 'status' | 'lastUsed'>): Printer {
    const newPrinter: Printer = {
      ...printer,
      id: crypto.randomUUID(),
      status: 'offline',
    };
    
    // If this is the first printer or set as default, make it default
    if (this.printers.size === 0 || printer.isDefault) {
      // Remove default from other printers
      this.printers.forEach(p => p.isDefault = false);
      newPrinter.isDefault = true;
    }
    
    this.printers.set(newPrinter.id, newPrinter);
    this.savePrinters();
    
    return newPrinter;
  }
  
  updatePrinter(id: string, updates: Partial<Printer>): Printer | undefined {
    const printer = this.printers.get(id);
    if (!printer) return undefined;
    
    const updated = { ...printer, ...updates };
    
    // If setting as default, remove default from others
    if (updates.isDefault) {
      this.printers.forEach(p => p.isDefault = false);
    }
    
    this.printers.set(id, updated);
    this.savePrinters();
    
    return updated;
  }
  
  deletePrinter(id: string): boolean {
    const deleted = this.printers.delete(id);
    if (deleted) {
      this.savePrinters();
    }
    return deleted;
  }
  
  // ============================================
  // Printer Discovery (WebUSB)
  // ============================================
  
  async discoverUSBPrinters(): Promise<USBDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.usb) {
      throw new Error('USB non supporté par ce navigateur');
    }
    
    try {
      const devices = await navigator.usb.getDevices();
      return devices.filter(d => 
        d.deviceClass === 7 || // Printer class
        d.deviceProtocol === 1 || d.deviceProtocol === 2
      );
    } catch (e) {
      console.error('USB discovery failed:', e);
      return [];
    }
  }
  
  async requestUSBPrinter(): Promise<USBDevice | null> {
    if (typeof navigator === 'undefined' || !navigator.usb) {
      throw new Error('USB non supporté par ce navigateur');
    }
    
    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer class
        ]
      });
      return device;
    } catch (e) {
      console.error('USB request failed:', e);
      return null;
    }
  }
  
  // ============================================
  // Printing Functions
  // ============================================
  
  async print(printerId: string, content: string): Promise<PrintJob> {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error('Imprimante non trouvée');
    }
    
    const job: PrintJob = {
      id: crypto.randomUUID(),
      printerId,
      type: 'receipt',
      content,
      status: 'pending',
      createdAt: new Date(),
    };
    
    this.printJobs.set(job.id, job);
    
    try {
      job.status = 'printing';
      
      if (printer.connectionType === 'usb') {
        await this.printUSB(printer, content);
      } else if (printer.connectionType === 'network') {
        await this.printNetwork(printer, content);
      } else if (printer.connectionType === 'bluetooth') {
        await this.printBluetooth(printer, content);
      }
      
      job.status = 'completed';
      job.completedAt = new Date();
      
      // Update printer last used
      printer.lastUsed = new Date();
      printer.status = 'online';
      this.savePrinters();
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Erreur d\'impression';
      printer.status = 'error';
      this.savePrinters();
    }
    
    return job;
  }
  
  private async printUSB(printer: Printer, content: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.usb) {
      throw new Error('USB non supporté');
    }
    
    // This would require the actual USB device to be connected
    // For demo purposes, we simulate the print
    console.log('Printing via USB to', printer.name);
    console.log('Content:', content);
    
    // In a real implementation:
    // const device = await navigator.usb.getDevices().find(...)
    // await device.open()
    // await device.claimInterface(0)
    // await device.transferOut(1, new TextEncoder().encode(content))
    // await device.close()
  }
  
  private async printNetwork(printer: Printer, content: string): Promise<void> {
    // Network printing would typically use a server-side proxy
    // or WebRTC data channel to communicate with the printer
    
    console.log('Printing via Network to', printer.name, printer.address);
    console.log('Content:', content);
    
    // For a real implementation, we would call an API endpoint
    // that communicates with the printer
    const response = await fetch('/api/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        printerAddress: printer.address,
        content,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Erreur d\'impression réseau');
    }
  }
  
  private async printBluetooth(printer: Printer, content: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      throw new Error('Bluetooth non supporté');
    }
    
    console.log('Printing via Bluetooth to', printer.name);
    console.log('Content:', content);
    
    // In a real implementation:
    // const device = await navigator.bluetooth.requestDevice({
    //   filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
    // });
    // const server = await device.gatt?.connect();
    // ... send data to printer
  }
  
  // ============================================
  // Receipt Generation
  // ============================================
  
  generateReceipt(data: ReceiptData, printer: Printer): string {
    const width = printer.paperWidth === 80 ? 48 : 32;
    const separator = '='.repeat(width);
    const lineSeparator = '-'.repeat(width);
    
    let receipt = '';
    
    // Header
    receipt += this.centerText('KFM DELICE', width) + '\n';
    receipt += this.centerText('Restaurant & Traiteur', width) + '\n';
    receipt += this.centerText('Conakry, Guinée', width) + '\n';
    receipt += this.centerText('Tel: +224 62 00 00 00', width) + '\n';
    receipt += separator + '\n';
    
    // Order info
    receipt += `Ticket: ${data.orderNumber}\n`;
    receipt += `Date: ${this.formatDate(data.createdAt)}\n`;
    receipt += `Type: ${this.getOrderTypeLabel(data.orderType)}\n`;
    
    if (data.tableNumber) {
      receipt += `Table: ${data.tableNumber}\n`;
    }
    if (data.waiterName) {
      receipt += `Serveur: ${data.waiterName}\n`;
    }
    
    receipt += separator + '\n';
    
    // Items
    receipt += this.formatLine('Article', 'Prix', width) + '\n';
    receipt += lineSeparator + '\n';
    
    for (const item of data.items) {
      receipt += `${item.quantity}x ${item.name}\n`;
      receipt += this.formatRight(`   ${this.formatCurrency(item.price * item.quantity)}`, width) + '\n';
      if (item.notes) {
        receipt += `   (${item.notes})\n`;
      }
    }
    
    receipt += lineSeparator + '\n';
    
    // Totals
    receipt += this.formatLine('Sous-total', this.formatCurrency(data.subtotal), width) + '\n';
    
    if (data.discount && data.discount > 0) {
      receipt += this.formatLine('Remise', `-${this.formatCurrency(data.discount)}`, width) + '\n';
    }
    
    if (data.tax && data.tax > 0) {
      receipt += this.formatLine(`TVA (${data.taxRate || 18}%)`, this.formatCurrency(data.tax), width) + '\n';
    }
    
    receipt += separator + '\n';
    receipt += this.formatLine('TOTAL', this.formatCurrency(data.total), width, true) + '\n';
    receipt += separator + '\n';
    
    // Payment
    if (data.paymentMethod) {
      receipt += `Paiement: ${data.paymentMethod}\n`;
    }
    
    // Customer info
    if (data.customerName) {
      receipt += lineSeparator + '\n';
      receipt += `Client: ${data.customerName}\n`;
      if (data.customerPhone) {
        receipt += `Tel: ${data.customerPhone}\n`;
      }
    }
    
    // Delivery info
    if (data.orderType === 'delivery' && data.deliveryAddress) {
      receipt += lineSeparator + '\n';
      receipt += 'Adresse de livraison:\n';
      receipt += `${data.deliveryAddress}\n`;
    }
    
    // Notes
    if (data.notes) {
      receipt += lineSeparator + '\n';
      receipt += `Notes: ${data.notes}\n`;
    }
    
    // Footer
    receipt += '\n';
    receipt += this.centerText('Merci de votre visite!', width) + '\n';
    receipt += this.centerText('À bientôt!', width) + '\n';
    receipt += '\n\n\n';
    
    return receipt;
  }
  
  generateKitchenTicket(data: KitchenTicketData, printer: Printer): string {
    const width = printer.paperWidth === 80 ? 48 : 32;
    const separator = '='.repeat(width);
    const lineSeparator = '-'.repeat(width);
    
    let ticket = '';
    
    // Header
    ticket += separator + '\n';
    ticket += this.centerText('** CUISINE **', width) + '\n';
    ticket += separator + '\n';
    
    // Order info
    ticket += `Ticket: ${data.orderNumber}\n`;
    ticket += `Heure: ${this.formatTime(data.createdAt)}\n`;
    ticket += `Type: ${this.getOrderTypeLabel(data.orderType)}\n`;
    
    if (data.tableNumber) {
      ticket += `Table: ${data.tableNumber}\n`;
    }
    
    // Priority
    if (data.priority !== 'normal') {
      ticket += '\n';
      ticket += this.centerText(
        data.priority === 'urgent' ? '*** URGENT ***' : '** PRIORITAIRE **',
        width
      ) + '\n';
    }
    
    ticket += separator + '\n';
    
    // Items
    for (const item of data.items) {
      ticket += `${item.quantity}x ${item.name.toUpperCase()}\n`;
      if (item.notes) {
        ticket += `   >> ${item.notes}\n`;
      }
      if (item.modifiers && item.modifiers.length > 0) {
        for (const mod of item.modifiers) {
          ticket += `   - ${mod}\n`;
        }
      }
    }
    
    // Notes
    if (data.notes) {
      ticket += separator + '\n';
      ticket += 'NOTES:\n';
      ticket += `${data.notes}\n`;
    }
    
    ticket += separator + '\n';
    ticket += '\n\n\n';
    
    return ticket;
  }
  
  // ============================================
  // Helper Functions
  // ============================================
  
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }
  
  private formatRight(text: string, width: number): string {
    const padding = Math.max(0, width - text.length);
    return ' '.repeat(padding) + text;
  }
  
  private formatLine(left: string, right: string, width: number, bold: boolean = false): string {
    const spaces = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaces) + right;
  }
  
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  private formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
  
  private getOrderTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      dine_in: 'Sur place',
      takeaway: 'À emporter',
      delivery: 'Livraison',
    };
    return labels[type] || type;
  }
  
  // ============================================
  // Print Job Management
  // ============================================
  
  getPrintJobs(): PrintJob[] {
    return Array.from(this.printJobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  getPrintJob(id: string): PrintJob | undefined {
    return this.printJobs.get(id);
  }
  
  clearPrintJobs(): void {
    this.printJobs.clear();
  }
  
  // ============================================
  // Test Print
  // ============================================
  
  async testPrint(printerId: string): Promise<PrintJob> {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error('Imprimante non trouvée');
    }
    
    const testContent = `
${'='.repeat(printer.paperWidth === 80 ? 48 : 32)}
TEST D'IMPRESSION
${'='.repeat(printer.paperWidth === 80 ? 48 : 32)}

Imprimante: ${printer.name}
Type: ${printer.connectionType}
Largeur papier: ${printer.paperWidth}mm
Date: ${new Date().toLocaleString('fr-FR')}

${'='.repeat(printer.paperWidth === 80 ? 48 : 32)}
KFM DELICE - Impression OK!
${'='.repeat(printer.paperWidth === 80 ? 48 : 32)}


`;
    
    return this.print(printerId, testContent);
  }
}

// ============================================
// Demo Printers
// ============================================

export const DEMO_PRINTERS: Printer[] = [
  {
    id: '1',
    name: 'Cuisine',
    type: 'kitchen',
    connectionType: 'network',
    address: '192.168.1.100',
    paperWidth: 80,
    isDefault: true,
    status: 'online',
    lastUsed: new Date(),
    charactersPerLine: 48,
  },
  {
    id: '2',
    name: 'Caisse',
    type: 'receipt',
    connectionType: 'usb',
    address: 'USB001',
    paperWidth: 58,
    isDefault: false,
    status: 'online',
    lastUsed: new Date(),
    charactersPerLine: 32,
  },
  {
    id: '3',
    name: 'Livraison',
    type: 'delivery',
    connectionType: 'network',
    address: '192.168.1.101',
    paperWidth: 80,
    isDefault: false,
    status: 'online',
    charactersPerLine: 48,
  },
];

// Singleton instance
let printerServiceInstance: ThermalPrinterService | null = null;

export function getPrinterService(): ThermalPrinterService {
  if (!printerServiceInstance) {
    printerServiceInstance = new ThermalPrinterService();
  }
  return printerServiceInstance;
}

export default {
  ThermalPrinterService,
  getPrinterService,
  ESC_POS,
  DEMO_PRINTERS,
};
