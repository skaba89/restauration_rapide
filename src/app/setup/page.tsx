// ============================================
// Restaurant OS - First Launch Setup Page
// Creates the first admin user + organization + restaurant
// Only shown when NO users exist in the database
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChefHat,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Store,
  User,
  MapPin,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setAuthToken } from '@/lib/api-client';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Admin user fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantCity, setRestaurantCity] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');

  // Auto-generate slug from restaurant name
  const handleRestaurantNameChange = (name: string) => {
    setRestaurantName(name);
    if (!restaurantSlug || restaurantSlug === slugify(restaurantName)) {
      setRestaurantSlug(slugify(name));
    }
  };

  function slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!firstName || !lastName || !email || !password) {
      setError('Nom, prénom, email et mot de passe sont requis.');
      return;
    }

    if (!restaurantName) {
      setError('Le nom du restaurant est requis.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          phone: phone || undefined,
          password,
          restaurantName,
          restaurantSlug: restaurantSlug || undefined,
          restaurantPhone: restaurantPhone || undefined,
          restaurantCity: restaurantCity || undefined,
          restaurantAddress: restaurantAddress || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Erreur lors de la configuration.');
        return;
      }

      // Auto-login
      if (data.data?.token) {
        setAuthToken(data.data.token);
      }

      setSetupDone(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError('Erreur de connexion au serveur. Vérifiez que la base de données est configurée.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check setup status on mount
  const [checking, setChecking] = useState(true);
  const [alreadySetup, setAlreadySetup] = useState(false);

  useState(() => {
    fetch('/api/setup')
      .then(r => r.json())
      .then(data => {
        if (data.needsSetup === false) {
          setAlreadySetup(true);
          setTimeout(() => router.push('/login'), 1500);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  });

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (alreadySetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Application déjà configurée</h2>
            <p className="text-gray-500">Redirection vers la page de connexion...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (setupDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Configuration terminée !</h2>
            <p className="text-gray-500 mb-4">Votre restaurant est prêt. Redirection vers le dashboard...</p>
            <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Configuration initiale</h1>
          <p className="text-white/80 text-sm">Créez votre compte administrateur et votre premier restaurant</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Compte Administrateur
            </CardTitle>
            <CardDescription>Vos informations de connexion principale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" placeholder="Amadou" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" placeholder="Diallo" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="votre@email.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+224 6xx xx xx xx" className="pl-10" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe * (min. 8 caractères)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 caractères" className="pl-10 pr-10" value={password} onChange={e => setPassword(e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="Confirmer" className="pl-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Restaurant</span></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nom du restaurant *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="restaurantName" placeholder="KFM Delice" className="pl-10" value={restaurantName} onChange={e => handleRestaurantNameChange(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantSlug">Slug (URL)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="restaurantSlug" placeholder="kfm-delice" className="pl-10" value={restaurantSlug} onChange={e => setRestaurantSlug(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">Lien public : /menu/{restaurantSlug || 'votre-slug'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="restaurantPhone">Tél. restaurant</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="restaurantPhone" type="tel" placeholder="+224 6xx" className="pl-10" value={restaurantPhone} onChange={e => setRestaurantPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantCity">Ville</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="restaurantCity" placeholder="Conakry" className="pl-10" value={restaurantCity} onChange={e => setRestaurantCity(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantAddress">Adresse</Label>
              <Input id="restaurantAddress" placeholder="Almamya, Rue KE-050" value={restaurantAddress} onChange={e => setRestaurantAddress(e.target.value)} />
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 mt-4"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configuration en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Créer mon restaurant
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-2">
              La configuration ne peut être faite qu&apos;une seule fois. Assurez-vous d&apos;avoir une base de données PostgreSQL configurée (DATABASE_URL).
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-white/70 text-xs">
          &copy; 2025 Restaurant OS - Made with ❤️ in Africa
        </p>
      </div>
    </div>
  );
}
