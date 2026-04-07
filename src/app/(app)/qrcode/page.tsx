'use client';

import { QRCodeGenerator } from '@/components/qr-code/qr-generator';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Smartphone, Users } from 'lucide-react';

export default function QRCodePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-7 h-7" />
          QR Codes Tables
        </h1>
        <p className="text-gray-500">Générez des QR codes pour la commande à table</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">20</p>
                <p className="text-xs text-gray-500">QR Codes créés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-gray-500">Scans ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-gray-500">Commandes via QR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <QRCodeGenerator />
    </div>
  );
}
