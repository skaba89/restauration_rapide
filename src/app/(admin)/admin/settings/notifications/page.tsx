'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Send,
  Clock,
  Save,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsSettingsPage() {
  const { toast } = useToast();

  const handleTestEmail = () => {
    toast({
      title: 'Email de test envoyé',
      description: 'Vérifiez votre boîte de réception',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Paramètres de Notifications</h1>
        <p className="text-muted-foreground">Configurez les notifications système et emails</p>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration Email (SMTP)
          </CardTitle>
          <CardDescription>Paramètres du serveur d'envoi d'emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Serveur SMTP</Label>
              <Input placeholder="smtp.example.com" defaultValue="smtp.sendgrid.net" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input defaultValue="587" />
            </div>
            <div className="space-y-2">
              <Label>Utilisateur</Label>
              <Input defaultValue="apikey" />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input type="password" defaultValue="SG.xxx..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email expéditeur</Label>
              <Input defaultValue="noreply@restaurant-os.app" />
            </div>
            <div className="space-y-2">
              <Label>Nom expéditeur</Label>
              <Input defaultValue="Restaurant OS" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestEmail}>
              <TestTube className="h-4 w-4 mr-2" />
              Envoyer email de test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Configuration SMS
          </CardTitle>
          <CardDescription>Intégration SMS pour alertes critiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fournisseur SMS</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="twilio">Twilio</option>
                <option value="orange">Orange SMS API</option>
                <option value="nexmo">Vonage (Nexmo)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Account SID</Label>
              <Input defaultValue="ACxxx..." />
            </div>
            <div className="space-y-2">
              <Label>Auth Token</Label>
              <Input type="password" defaultValue="xxx..." />
            </div>
            <div className="space-y-2">
              <Label>Numéro expéditeur</Label>
              <Input defaultValue="+2250700000000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Types de Notifications
          </CardTitle>
          <CardDescription>Activez/désactivez les différents types de notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'Nouvelles inscriptions', desc: 'Nouveau restaurant inscrit', email: true, sms: false, push: true },
            { name: 'Paiements', desc: 'Confirmation et échecs de paiement', email: true, sms: true, push: true },
            { name: 'Support', desc: 'Nouvelles demandes de support', email: true, sms: true, push: true },
            { name: 'Alertes système', desc: 'Erreurs et problèmes techniques', email: true, sms: true, push: true },
            { name: 'Rapports', desc: 'Rapports quotidiens/hebdomadaires', email: true, sms: false, push: false },
            { name: 'Marketing', desc: 'Newsletters et promotions', email: true, sms: false, push: true },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email</span>
                  <Switch defaultChecked={item.email} />
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">SMS</span>
                  <Switch defaultChecked={item.sms} />
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Push</span>
                  <Switch defaultChecked={item.push} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}
