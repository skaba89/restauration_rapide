'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  ChefHat, 
  Search, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Minus, 
  Trash2,
  Send,
  AlertTriangle,
  Volume2,
  History,
  HelpCircle
} from 'lucide-react';
import { useCurrencySafe } from '@/lib/currency-context';
import {
  VoiceIndicator,
  VoiceIndicatorState,
  VoiceWaveform,
  TranscriptDisplay,
  CommandFeedback
} from './voice-indicator';
import {
  createSpeechRecognition,
  parseVoiceCommand,
  isSpeechRecognitionSupported,
  DEFAULT_MENU_ITEMS,
  MenuItem,
  VoiceCommand
} from '@/lib/speech-recognition';

// Cart item interface
interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

// Order history item
interface OrderHistoryItem {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Demo menu items
const MENU_ITEMS = DEFAULT_MENU_ITEMS;

export function VoiceOrdering() {
  // State
  const [isSupported, setIsSupported] = useState(true);
  const [indicatorState, setIndicatorState] = useState<VoiceIndicatorState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isInterim, setIsInterim] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Refs
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);
  
  const { formatCurrency } = useCurrencySafe();

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
  const addToCart = useCallback((item: MenuItem, quantity: number = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.id === item.id);
      if (existing) {
        return prevCart.map(c => 
          c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prevCart, { ...item, quantity }];
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(c => c.id !== itemId));
  }, []);

  // Remove from cart by name
  const removeFromCartByName = useCallback((name: string) => {
    setCart(prevCart => prevCart.filter(c => 
      !c.name.toLowerCase().includes(name.toLowerCase())
    ));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prevCart => 
      prevCart.map(c => {
        if (c.id === itemId) {
          const newQty = Math.max(1, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      })
    );
  }, []);

  // Submit order
  const submitOrder = useCallback(() => {
    if (cart.length === 0) return;
    
    const order: OrderHistoryItem = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: cartTotal,
      timestamp: new Date(),
      status: 'pending',
    };
    
    setOrderHistory(prev => [order, ...prev]);
    setCart([]);
    setLastCommand({ type: 'submit', rawText: 'Commande envoyée', confidence: 1 });
  }, [cart, cartTotal]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Process voice command
  const processCommand = useCallback((text: string) => {
    setIndicatorState('processing');
    
    setTimeout(() => {
      const command = parseVoiceCommand(text, MENU_ITEMS);
      setLastCommand(command);
      
      switch (command.type) {
        case 'add':
          if (command.itemName) {
            const item = MENU_ITEMS.find(i => 
              i.name.toLowerCase() === command.itemName?.toLowerCase()
            );
            if (item) {
              addToCart(item, command.quantity || 1);
              setIndicatorState('success');
            } else {
              setErrorMessage(`Article "${command.itemName}" non trouvé`);
              setIndicatorState('error');
            }
          }
          break;
          
        case 'remove':
          if (command.itemName) {
            removeFromCartByName(command.itemName);
            setIndicatorState('success');
          }
          break;
          
        case 'cancel':
          setCart([]);
          setIndicatorState('success');
          break;
          
        case 'submit':
          submitOrder();
          setIndicatorState('success');
          break;
          
        case 'search':
          if (command.itemName) {
            const results = MENU_ITEMS.filter(item =>
              item.name.toLowerCase().includes(command.itemName!.toLowerCase()) ||
              item.aliases?.some(a => a.toLowerCase().includes(command.itemName!.toLowerCase()))
            );
            setSearchResults(results);
            setIndicatorState('success');
          }
          break;
          
        default:
          setErrorMessage('Commande non reconnue. Réessayez.');
          setIndicatorState('error');
      }
      
      setTimeout(() => {
        setIndicatorState('idle');
        setErrorMessage('');
      }, 2000);
    }, 500);
  }, [addToCart, removeFromCartByName, submitOrder]);

  // Initialize speech recognition
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported()); // eslint-disable-line react-hooks/set-state-in-effect
    
    if (isSpeechRecognitionSupported()) {
      recognitionRef.current = createSpeechRecognition({
        language: 'fr-FR',
        continuous: false,
        interimResults: true,
        onResult: (text, isFinal) => {
          setTranscript(text);
          setIsInterim(!isFinal);
          
          if (isFinal) {
            processCommand(text);
          }
        },
        onError: (error) => {
          setErrorMessage(error);
          setIndicatorState('error');
          setTimeout(() => {
            setIndicatorState('idle');
            setErrorMessage('');
          }, 3000);
        },
        onEnd: () => {
          if (indicatorState === 'listening') {
            setIndicatorState('idle');
          }
        },
      });
    }
    
    return () => {
      recognitionRef.current?.stop();
    };
  }, [processCommand, indicatorState]);

  // Start/stop listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (indicatorState === 'listening') {
      recognitionRef.current.stop();
      setIndicatorState('idle');
    } else {
      setTranscript('');
      setLastCommand(null);
      setErrorMessage('');
      setSearchResults([]);
      const started = recognitionRef.current.start();
      if (started) {
        setIndicatorState('listening');
      }
    }
  }, [indicatorState]);

  return (
    <div className="space-y-6">
      {/* Browser support warning */}
      {!isSupported && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Non supporté</AlertTitle>
          <AlertDescription>
            La reconnaissance vocale n'est pas supportée par votre navigateur. 
            Veuillez utiliser Chrome, Edge ou Safari.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Voice Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Commande Vocale
            </CardTitle>
            <CardDescription>
              Parlez pour ajouter des articles à votre commande
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Voice Indicator */}
            <div className="flex flex-col items-center justify-center py-8">
              <VoiceIndicator 
                state={indicatorState}
                size="xl"
                errorMessage={errorMessage}
              />
              
              <Button
                size="lg"
                className="mt-6 gap-2"
                onClick={toggleListening}
                disabled={!isSupported}
                variant={indicatorState === 'listening' ? 'destructive' : 'default'}
              >
                {indicatorState === 'listening' ? (
                  <>
                    <XCircle className="h-5 w-5" />
                    Arrêter l'écoute
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5" />
                    Commencer à parler
                  </>
                )}
              </Button>
              
              {/* Waveform */}
              {indicatorState === 'listening' && (
                <div className="mt-4">
                  <VoiceWaveform isActive={true} />
                </div>
              )}
            </div>

            {/* Transcript Display */}
            <TranscriptDisplay 
              transcript={transcript} 
              isInterim={isInterim}
              className="mt-4"
            />

            {/* Command Feedback */}
            {lastCommand && (
              <CommandFeedback command={lastCommand} className="mt-4" />
            )}

            {/* Available Commands Help */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Commandes disponibles</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <p>"<span className="text-foreground">Ajouter</span> [article]"</p>
                  <p>"<span className="text-foreground">Je veux</span> [article]"</p>
                  <p>"<span className="text-foreground">Deux</span> [article]"</p>
                </div>
                <div className="space-y-1">
                  <p>"<span className="text-foreground">Supprimer</span> [article]"</p>
                  <p>"<span className="text-foreground">Rechercher</span> [terme]"</p>
                  <p>"<span className="text-foreground">Valider</span>" / "<span className="text-foreground">Envoyer</span>"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cart Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Panier
                {cartItemCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cartItemCount} article{cartItemCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Vider
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                  <p>Le panier est vide</p>
                  <p className="text-sm">Utilisez la commande vocale pour ajouter des articles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl text-primary">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <Button className="w-full gap-2" onClick={submitOrder}>
                  <Send className="h-4 w-4" />
                  Valider la commande
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Résultats de recherche ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults.map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-lg border cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  onClick={() => addToCart(item)}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Menu disponible
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              Historique ({orderHistory.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order History */}
          {showHistory && orderHistory.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-muted">
              <h4 className="font-medium mb-3">Commandes récentes</h4>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {orderHistory.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-2 rounded border bg-background">
                      <div>
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.map(i => i.name).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(order.total)}</p>
                        <Badge variant={order.status === 'pending' ? 'outline' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Menu Grid */}
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MENU_ITEMS.map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default VoiceOrdering;
