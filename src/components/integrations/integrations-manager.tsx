'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CreditCard,
  MessageSquare,
  Map,
  Share2,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plug,
  Trash2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api-client';
import { useCurrencySafe } from '@/lib/currency-context';

interface Integration {
  id: string;
  type: string;
  provider: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  features: string[];
  lastSync: string | null;
  config: Record<string, any>;
  [key: string]: any;
}

interface IntegrationSummary {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  byType: Record<string, number>;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  payment: { label: 'Paiement', icon: CreditCard, color: 'text-green-500' },
  messaging: { label: 'Messagerie', icon: MessageSquare, color: 'text-blue-500' },
  maps: { label: 'Cartes', icon: Map, color: 'text-red-500' },
  social: { label: 'Réseaux sociaux', icon: Share2, color: 'text-purple-500' },
  analytics: { label: 'Analytiques', icon: BarChart3, color: 'text-orange-500' },
};

const PROVIDER_DETAILS: Record<string, { name: string; logo: string; logoImg?: string; description: string }> = {
  orange_money: { name: 'Orange Money', logo: '🟠', logoImg: '/images/partners/orange-money.png', description: 'Paiement Mobile Money Orange' },
  mtn_momo: { name: 'MTN MoMo', logo: '🟡', logoImg: '/images/partners/mtn-momo.png', description: 'Paiement Mobile Money MTN' },
  wave: { name: 'Wave', logo: '🔵', logoImg: '/images/partners/wave.png', description: 'Paiement Mobile Money Wave' },
  whatsapp_business: { name: 'WhatsApp Business', logo: '💬', logoImg: '/images/partners/whatsapp.png', description: 'API WhatsApp Business' },
  orange_sms: { name: 'Orange SMS', logo: '📱', logoImg: '/images/partners/orange-money.png', description: 'SMS via Orange' },
  mtn_sms: { name: 'MTN SMS', logo: '📱', logoImg: '/images/partners/mtn-momo.png', description: 'SMS via MTN' },
  google_maps: { name: 'Google Maps', logo: '🗺️', logoImg: '/images/partners/google-maps.png', description: 'API Google Maps' },
  facebook: { name: 'Facebook', logo: '📘', logoImg: '/images/partners/facebook.png', description: 'Page Facebook' },
  instagram: { name: 'Instagram', logo: '📸', logoImg: '/images/partners/instagram.png', description: 'Compte Instagram Business' },
  google_analytics: { name: 'Google Analytics', logo: '📊', logoImg: '/images/partners/google-analytics.png', description: 'Suivi analytique' },
};

export function IntegrationsManager() {
  const { currencySymbol } = useCurrencySafe();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [summary, setSummary] = useState<IntegrationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});

  // Fetch integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          ...(activeTab !== 'all' && { type: activeTab }),
        });
        
        const response = await fetchWithAuth(`/api/integrations?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setIntegrations(data.data.data);
          setSummary(data.data.summary);
        }
      } catch (error) {
        console.error('Failed to fetch integrations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrations();
  }, [activeTab]);

  // Toggle integration status
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetchWithAuth('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      setIntegrations(prev => prev.map(i => 
        i.id === id ? { ...i, status: newStatus as any } : i
      ));
      toast.success(`Intégration ${newStatus === 'active' ? 'activée' : 'désactivée'}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Disconnect integration
  const disconnect = async (id: string) => {
    if (!confirm('Voulez-vous vraiment déconnecter cette intégration?')) return;
    
    try {
      await fetchWithAuth(`/api/integrations?id=${id}`, { method: 'DELETE' });
      setIntegrations(prev => prev.filter(i => i.id !== id));
      toast.success('Intégration déconnectée');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Save configuration
  const saveConfig = async (id: string) => {
    try {
      await fetchWithAuth('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, config: configForm }),
      });
      
      setConfiguringId(null);
      setConfigForm({});
      toast.success('Configuration sauvegardée');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700">Inactif</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredIntegrations = activeTab === 'all' 
    ? integrations 
    : integrations.filter(i => i.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Plug className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.total || 0}</p>
                <p className="text-xs text-gray-500">Total</p>
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
                <p className="text-2xl font-bold">{summary?.active || 0}</p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.pending || 0}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.inactive || 0}</p>
                <p className="text-xs text-gray-500">Inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-center">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plug className="w-4 h-4 mr-2" /> Ajouter
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
          <TabsTrigger value="messaging">Messages</TabsTrigger>
          <TabsTrigger value="maps">Cartes</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => {
              const typeConfig = TYPE_CONFIG[integration.type] || TYPE_CONFIG.payment;
              const TypeIcon = typeConfig.icon;
              const providerDetail = PROVIDER_DETAILS[integration.provider] || { 
                name: integration.name, 
                logo: '🔌', 
                description: '' 
              };

              return (
                <Card key={integration.id} className={`border-l-4 ${
                  integration.status === 'active' ? 'border-l-green-500' :
                  integration.status === 'pending' ? 'border-l-yellow-500' : 'border-l-gray-300'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {providerDetail.logoImg ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={providerDetail.logoImg}
                            alt={providerDetail.name}
                            className="w-8 h-8 object-contain rounded"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-2xl">{providerDetail.logo}</span>
                        )}
                        <div>
                          <CardTitle className="text-base">{providerDetail.name}</CardTitle>
                          <CardDescription className="text-xs">{typeConfig.label}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-500">{providerDetail.description}</p>

                    {/* Features */}
                    {integration.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {feature.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Last sync */}
                    {integration.lastSync && (
                      <p className="text-xs text-gray-400">
                        Dernière sync: {new Date(integration.lastSync).toLocaleString('fr-FR')}
                      </p>
                    )}

                    {/* Additional info for specific types */}
                    {integration.type === 'social' && integration.followers && (
                      <p className="text-sm font-medium">
                        {integration.followers.toLocaleString()} abonnés
                      </p>
                    )}
                    {integration.type === 'payment' && integration.fees && (
                      <p className="text-sm text-gray-600">
                        Frais: {integration.fees.percentage}% 
                        {integration.fees.fixed > 0 && ` + ${integration.fees.fixed} ${currencySymbol}`}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Switch
                        checked={integration.status === 'active'}
                        onCheckedChange={() => toggleStatus(integration.id, integration.status)}
                      />
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setConfiguringId(integration.id);
                            setConfigForm(integration.config || {});
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500"
                          onClick={() => disconnect(integration.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      {configuringId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configurez les paramètres de l'intégration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(configForm).map(([key, value]) => (
                <div key={key}>
                  <Label>{key}</Label>
                  <Input
                    type={key.toLowerCase().includes('key') || key.toLowerCase().includes('token') ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setConfiguringId(null); setConfigForm({}); }}>
                  Annuler
                </Button>
                <Button onClick={() => saveConfig(configuringId)} className="bg-orange-500 hover:bg-orange-600">
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}