'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  User,
  Building,
  UtensilsCrossed,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseStatus {
  status: 'not_initialized' | 'initialized' | 'checking' | 'error';
  message?: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    menus: Array<{ id: string; name: string; categories: number }>;
  };
  stats?: {
    menus: number;
    categories: number;
    items: number;
  };
  needsSetup?: boolean;
  adminExists?: boolean;
  adminEmail?: string | null;
}

interface SeedResult {
  success: boolean;
  message: string;
  restaurant?: { id: string; name: string; slug: string };
  menu?: { id: string; name: string };
  stats?: {
    categoriesCreated: number;
    itemsCreated: number;
    adminCreated: boolean;
  };
  credentials?: {
    email: string;
    password: string;
  };
}

export function DatabaseStatusCard() {
  const [status, setStatus] = useState<DatabaseStatus>({ status: 'checking' });
  const [isLoading, setIsLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch database status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setStatus({ status: 'checking' });
      
      // Check seed status
      const seedRes = await fetch('/api/seed');
      const seedData = await seedRes.json();
      
      // Check admin status
      const adminRes = await fetch('/api/setup/admin');
      const adminData = await adminRes.json();

      if (seedData.success) {
        setStatus({
          status: seedData.data?.status || seedData.status || 'not_initialized',
          message: seedData.data?.message || seedData.message,
          restaurant: seedData.data?.restaurant,
          stats: seedData.data?.stats,
          needsSetup: seedData.data?.needsSetup,
          adminExists: adminData.adminExists,
          adminEmail: adminData.adminEmail,
        });
      } else {
        setStatus({ status: 'error', message: seedData.error || 'Erreur inconnue' });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus({ status: 'error', message: 'Impossible de vérifier le statut' });
    }
  };

  const handleSeed = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSeedResult(result.data || result);
        toast.success('Base de données initialisée avec succès!');
        await checkStatus();
      } else {
        toast.error(result.error || 'Erreur lors de l\'initialisation');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error('Erreur lors de l\'initialisation de la base de données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSeedResult(prev => ({
          ...prev,
          success: true,
          message: 'Admin créé avec succès',
          credentials: result.credentials,
        }));
        toast.success('Admin créé avec succès!');
        await checkStatus();
      } else {
        toast.error(result.error || 'Erreur lors de la création de l\'admin');
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
      toast.error('Erreur lors de la création de l\'admin');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copié dans le presse-papiers');
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'initialized':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'not_initialized':
        return <XCircle className="h-5 w-5 text-amber-500" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'initialized':
        return <Badge className="bg-green-500">Initialisé</Badge>;
      case 'not_initialized':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Non initialisé</Badge>;
      case 'checking':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Vérification...</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-500" />
            <CardTitle>Base de données</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          État et initialisation de la base de données KFM DELICE
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{status.message || 'Statut de la base de données'}</p>
            {status.stats && (
              <p className="text-xs text-muted-foreground">
                {status.stats.menus} menu(s) • {status.stats.categories} catégorie(s) • {status.stats.items} article(s)
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={checkStatus} disabled={status.status === 'checking'}>
            <RefreshCw className={`h-4 w-4 ${status.status === 'checking' ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Admin status */}
        {status.adminExists !== undefined && (
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <User className={`h-5 w-5 ${status.adminExists ? 'text-green-500' : 'text-amber-500'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {status.adminExists ? 'Admin existant' : 'Aucun admin configuré'}
              </p>
              {status.adminEmail && (
                <p className="text-xs text-muted-foreground">{status.adminEmail}</p>
              )}
            </div>
          </div>
        )}

        {/* Restaurant info */}
        {status.restaurant && (
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Building className="h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{status.restaurant.name}</p>
              <p className="text-xs text-muted-foreground">{status.restaurant.menus?.length || 0} menu(s)</p>
            </div>
          </div>
        )}

        {/* Seed result */}
        {seedResult && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Initialisation réussie!</AlertTitle>
            <AlertDescription className="mt-2">
              {seedResult.credentials && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Email:</span>
                    <code className="text-sm bg-muted px-1 rounded">{seedResult.credentials.email}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(seedResult.credentials!.email)}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Password:</span>
                    <code className="text-sm bg-muted px-1 rounded">{seedResult.credentials.password}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(seedResult.credentials!.password)}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {status.status === 'not_initialized' && (
            <Button onClick={() => handleSeed(false)} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Initialiser la base de données
                </>
              )}
            </Button>
          )}

          {!status.adminExists && status.status === 'initialized' && (
            <Button onClick={handleSetupAdmin} disabled={isLoading} variant="outline">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Créer l'admin
                </>
              )}
            </Button>
          )}

          {status.status === 'initialized' && (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Réinitialiser la base de données?</DialogTitle>
                  <DialogDescription>
                    Cette action va supprimer et recréer toutes les données de démo.
                    Les données existantes seront perdues.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDialog(false);
                      handleSeed(true);
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Quick info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Cette action crée un restaurant KFM DELICE avec des données de démo</p>
          <p>• Les identifiants admin seront affichés après l'initialisation</p>
          <p>• Les données de démo incluent menu, catégories, articles et admin</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DatabaseStatusCard;
