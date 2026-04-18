'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Utensils,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  city: string;
  isOpen: boolean;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
}

export function QRCodeGenerator() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant (assuming KFM DELICE for now)
      const res = await fetch('/api/public/restaurant/kfm-delice');
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.data);
        
        // Generate demo tables
        const defaultTables: Table[] = Array.from({ length: 20 }, (_, i) => ({
          id: `table-${i + 1}`,
          number: `${i + 1}`,
          capacity: i < 10 ? 4 : 6,
          status: i % 3 === 0 ? 'OCCUPIED' : 'AVAILABLE',
        }));
        setTables(defaultTables);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRUrl = (tableNumber: string) => {
    if (!restaurant) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/menu/${restaurant.slug}?table=${tableNumber}`;
    setQrUrl(url);
    return url;
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      generateQRUrl(table.number);
    }
  };

  const copyToClipboard = async () => {
    if (qrUrl) {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    // Using a QR code API to generate the image
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
    
    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `qr-table-${selectedTable}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code téléchargé');
  };

  const printQR = () => {
    const table = tables.find(t => t.id === selectedTable);
    const printWindow = window.open('', '_blank');
    if (printWindow && restaurant && table) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - Table ${table.number}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .container { max-width: 400px; margin: 0 auto; }
            .qr-code { margin: 20px 0; }
            .restaurant-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .table-number { font-size: 48px; font-weight: bold; color: #f97316; margin: 20px 0; }
            .info { color: #666; font-size: 14px; margin-top: 20px; }
            .logo { font-size: 40px; margin-bottom: 10px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🍽️</div>
            <div class="restaurant-name">${restaurant.name}</div>
            <div class="table-number">Table ${table.number}</div>
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}" alt="QR Code" />
            </div>
            <div class="info">
              <p>📱 Scannez pour commander</p>
              <p>${restaurant.address}, ${restaurant.city}</p>
              <p>📞 ${restaurant.phone}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateAllQRCodes = () => {
    // Generate QR codes for all tables
    toast.success('Génération de tous les QR Codes...');
    // In production, this would generate a PDF with all QR codes
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Générer QR Code
            </CardTitle>
            <CardDescription>
              Créez un QR code pour chaque table. Les clients scannent pour commander directement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Restaurant Info */}
            {restaurant && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
                    🍽️
                  </div>
                  <div>
                    <p className="font-semibold">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.address}, {restaurant.city}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table Selection */}
            <div className="space-y-2">
              <Label>Sélectionner une table</Label>
              <Select value={selectedTable} onValueChange={handleTableSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      <div className="flex items-center gap-2">
                        <span>Table {table.number}</span>
                        <span className="text-gray-400">({table.capacity} places)</span>
                        {table.status === 'OCCUPIED' && (
                          <Badge variant="outline" className="bg-red-50 text-red-600 text-xs">
                            Occupée
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Table Buttons */}
            <div className="space-y-2">
              <Label>Tables populaires</Label>
              <div className="flex flex-wrap gap-2">
                {tables.slice(0, 10).map((table) => (
                  <Button
                    key={table.id}
                    variant={selectedTable === table.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTableSelect(table.id)}
                    className={selectedTable === table.id ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    {table.number}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu QR Code</CardTitle>
            <CardDescription>
              {selectedTable ? `QR Code pour la Table ${tables.find(t => t.id === selectedTable)?.number}` : 'Sélectionnez une table'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTable && qrUrl ? (
              <div className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center p-6 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <div className="mb-4">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`}
                        alt="QR Code"
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      Table {tables.find(t => t.id === selectedTable)?.number}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{restaurant?.name}</p>
                  </div>
                </div>

                {/* URL Display */}
                <div className="flex items-center gap-2">
                  <Input value={qrUrl} readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadQR} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                  <Button onClick={printQR} variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <QrCode className="w-16 h-16 mb-4" />
                <p>Sélectionnez une table pour générer le QR Code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate All Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Générer tous les QR Codes</h3>
              <p className="text-sm text-gray-500">
                Créez un PDF avec tous les QR codes pour imprimer en une fois
              </p>
            </div>
            <Button onClick={generateAllQRCodes} className="bg-orange-500 hover:bg-orange-600">
              <Download className="w-4 h-4 mr-2" />
              Télécharger tout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-500" />
            Comment utiliser les QR Codes
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-medium">Imprimez les QR Codes</p>
                <p className="text-gray-600">Placez un QR code sur chaque table</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-medium">Les clients scannent</p>
                <p className="text-gray-600">Ils accèdent au menu et commandent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-medium">Vous recevez la commande</p>
                <p className="text-gray-600">Le numéro de table est automatiquement inclus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
