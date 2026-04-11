'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'sms' | 'whatsapp' | 'email' | 'push';
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'whatsapp', recipient: '+224622123456', message: 'Votre commande #1234 est prête!', status: 'sent', sentAt: '2024-01-20 12:30' },
  { id: '2', type: 'sms', recipient: '+224622654321', message: 'Livraison en cours - Arrivée estimée: 15 min', status: 'sent', sentAt: '2024-01-20 12:15' },
  { id: '3', type: 'email', recipient: 'client@email.com', message: 'Confirmation de votre réservation', status: 'pending' },
];

const CHANNEL_CONFIG = {
  sms: { name: 'SMS', icon: MessageSquare, color: 'text-blue-500', enabled: true },
  whatsapp: { name: 'WhatsApp', icon: Smartphone, color: 'text-green-500', enabled: true },
  email: { name: 'Email', icon: Mail, color: 'text-purple-500', enabled: true },
  push: { name: 'Push', icon: Bell, color: 'text-orange-500', enabled: false },
};

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [channels, setChannels] = useState(CHANNEL_CONFIG);
  const [quickMessage, setQuickMessage] = useState({
    type: 'whatsapp' as const,
    recipient: '',
    message: '',
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const handleSendQuickMessage = () => {
    if (!quickMessage.recipient || !quickMessage.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const newNotif: Notification = {
      id: Date.now().toString(),
      type: quickMessage.type,
      recipient: quickMessage.recipient,
      message: quickMessage.message,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
    setQuickMessage({ type: 'whatsapp', recipient: '', message: '' });
    toast.success('Message envoyé');
  };

  const handleToggleChannel = (channel: string) => {
    setChannels(prev => ({
      ...prev,
      [channel]: { ...prev[channel as keyof typeof prev], enabled: !prev[channel as keyof typeof prev].enabled },
    }));
    toast.success(`Canal ${channel} ${channels[channel as keyof typeof channels].enabled ? 'désactivé' : 'activé'}`);
  };

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-xs text-gray-500">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sentCount}</p>
                <p className="text-xs text-gray-500">Envoyées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Envoyer</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Envoyer un message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(channels).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        quickMessage.type === key ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                      onClick={() => setQuickMessage(prev => ({ ...prev, type: key as any }))}
                    >
                      <Icon className={`w-6 h-6 ${config.color}`} />
                      <span className="text-xs">{config.name}</span>
                    </button>
                  );
                })}
              </div>
              <div><Label>Destinataire</Label><Input value={quickMessage.recipient} onChange={(e) => setQuickMessage(prev => ({ ...prev, recipient: e.target.value }))} placeholder="+224 6XX XXX XXX" /></div>
              <div><Label>Message</Label><Input value={quickMessage.message} onChange={(e) => setQuickMessage(prev => ({ ...prev, message: e.target.value }))} placeholder="Votre message..." /></div>
              <Button onClick={handleSendQuickMessage} className="w-full bg-orange-500 hover:bg-orange-600">
                <Send className="w-4 h-4 mr-2" /> Envoyer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Historique des notifications</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {notifications.map(notif => {
                    const Icon = channels[notif.type].icon;
                    return (
                      <div key={notif.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <Icon className={`w-5 h-5 ${channels[notif.type].color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{notif.recipient}</span>
                            {getStatusIcon(notif.status)}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                        </div>
                        {notif.sentAt && <span className="text-xs text-gray-400">{new Date(notif.sentAt).toLocaleTimeString('fr-FR')}</span>}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Paramètres des canaux</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(channels).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <div>
                        <p className="font-medium">{config.name}</p>
                        <p className="text-xs text-gray-500">
                          {key === 'sms' && 'Orange SMS, MTN SMS'}
                          {key === 'whatsapp' && 'WhatsApp Business API'}
                          {key === 'email' && 'SMTP Email'}
                          {key === 'push' && 'Push Notifications'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={config.enabled} onCheckedChange={() => handleToggleChannel(key)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
