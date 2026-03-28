// ============================================
// RESTAURANT OS - Login Page
// Entry point with real authentication
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogin, useRegister } from '@/hooks/use-api';
import { setAuthToken } from '@/lib/api-client';
import {
  ChefHat,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Check,
  X,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Password validation helper
function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

export default function LoginPage() {
  const router = useRouter();
  
  // Login state
  const [loginTab, setLoginTab] = useState<'password' | 'otp'>('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Password validation
  const passwordValidation = useMemo(() => validatePassword(registerPassword), [registerPassword]);
  const isPasswordValid = passwordValidation.length && passwordValidation.uppercase && passwordValidation.lowercase && passwordValidation.number;
  
  // Mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  // Handle login
  const handleLogin = async () => {
    if (loginTab === 'password') {
      if (!loginPassword || (!loginEmail && !loginPhone)) {
        return;
      }
      
      try {
        const result = await loginMutation.mutateAsync({
          email: loginEmail || undefined,
          phone: loginPhone || undefined,
          password: loginPassword,
        });
        
        setAuthToken(result.token);
        
        // Redirect based on user role
        const userRole = result.user?.role;
        if (userRole === 'CUSTOMER') {
          router.push('/customer');
        } else {
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.error('Login failed:', error);
      }
    }
  };
  
  // Register validation state
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Handle register
  const handleRegister = async () => {
    setRegisterError(null);
    
    if (!registerEmail || !registerPassword) {
      setRegisterError('Email et mot de passe sont requis');
      return;
    }
    
    if (!isPasswordValid) {
      setRegisterError('Le mot de passe ne respecte pas les exigences');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      const result = await registerMutation.mutateAsync({
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone || undefined,
        firstName: registerFirstName || undefined,
        lastName: registerLastName || undefined,
      });
      
      setAuthToken(result.token);
      // New users are always customers
      router.push('/customer');
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };
  
  // Demo mode - bypass auth for demo (admin demo)
  const handleDemoLogin = () => {
    // For demo purposes, set a fake token and redirect
    setAuthToken('demo_token');
    router.push('/dashboard');
  };
  
  // Demo customer login
  const handleDemoCustomerLogin = () => {
    setAuthToken('demo_customer_token');
    router.push('/customer');
  };

  // Demo driver login
  const handleDemoDriverLogin = () => {
    setAuthToken('demo_driver_token');
    router.push('/driver/orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Restaurant OS</h1>
          <p className="text-white/80 text-sm">Africa-First, Global-Ready</p>
        </div>

        {/* Login/Register Card */}
        <Card className="border-0 shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Bienvenue</CardTitle>
                <CardDescription>
                  Connectez-vous à votre espace restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Login method tabs */}
                <Tabs value={loginTab} onValueChange={(v) => setLoginTab(v as 'password' | 'otp')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="password">Mot de passe</TabsTrigger>
                    <TabsTrigger value="otp">Code OTP</TabsTrigger>
                  </TabsList>

                  {/* Password login */}
                  <TabsContent value="password" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* OTP login */}
                  <TabsContent value="otp" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="07 00 00 00 00"
                          className="pl-10"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Entrez votre numéro pour recevoir un code OTP
                    </p>
                  </TabsContent>
                </Tabs>

                {/* Error display */}
                {loginMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(loginMutation.error as any)?.message || (loginMutation.error as any)?.error || 'Erreur de connexion'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Login button */}
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  onClick={handleLogin}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                {/* Demo button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Démo Admin
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoCustomerLogin}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Démo Client
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoDriverLogin}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Démo Driver
                </Button>
              </CardContent>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Créer un compte</CardTitle>
                <CardDescription>
                  Rejoignez Restaurant OS en quelques clics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Amadou"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Diallo"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPhone">Téléphone (optionnel)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="registerPhone"
                      type="tel"
                      placeholder="07 00 00 00 00"
                      className="pl-10"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="registerPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {/* Password validation indicators */}
                  {registerPassword && (
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className={`flex items-center gap-1 ${passwordValidation.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        8+ caractères
                      </span>
                      <span className={`flex items-center gap-1 ${passwordValidation.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        1 majuscule
                      </span>
                      <span className={`flex items-center gap-1 ${passwordValidation.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        1 minuscule
                      </span>
                      <span className={`flex items-center gap-1 ${passwordValidation.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordValidation.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        1 chiffre
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Error display */}
                {(registerMutation.isError || registerError) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {registerError || (registerMutation.error as any)?.message || (registerMutation.error as any)?.error || 'Erreur lors de l\'inscription'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/70 text-xs">
          <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
          <p className="mt-1">© 2025 Restaurant OS - Made with ❤️ in Africa</p>
        </div>
      </div>
    </div>
  );
}
