'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  Send,
  X,
  MinusCircle,
  User,
  Truck,
  Store,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'driver' | 'restaurant';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface ChatPanelProps {
  orderId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'customer' | 'driver' | 'restaurant';
  otherPartyName: string;
  otherPartyType: 'customer' | 'driver' | 'restaurant';
  className?: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
}

const getSenderIcon = (type: string) => {
  switch (type) {
    case 'driver':
      return <Truck className="h-4 w-4" />;
    case 'restaurant':
      return <Store className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getSenderColor = (type: string) => {
  switch (type) {
    case 'driver':
      return 'bg-green-500';
    case 'restaurant':
      return 'bg-orange-500';
    default:
      return 'bg-blue-500';
  }
};

// Demo messages for initial display
const getDemoMessages = (orderId: string): Message[] => [
  {
    id: 'msg-1',
    orderId,
    senderId: 'driver-1',
    senderName: 'Amadou Touré',
    senderType: 'driver',
    content: 'Bonjour! J\'ai bien pris en charge votre commande.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-2',
    orderId,
    senderId: 'customer-1',
    senderName: 'Vous',
    senderType: 'customer',
    content: 'Parfait, merci! Combien de temps environ?',
    timestamp: new Date(Date.now() - 14 * 60 * 1000),
    read: true,
  },
  {
    id: 'msg-3',
    orderId,
    senderId: 'driver-1',
    senderName: 'Amadou Touré',
    senderType: 'driver',
    content: 'Environ 15-20 minutes. Je suis en route!',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    read: true,
  },
];

export default function ChatPanel({
  orderId,
  currentUserId,
  currentUserName,
  currentUserType,
  otherPartyName,
  otherPartyType,
  className = '',
  isMinimized = false,
  onMinimize,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(getDemoMessages(orderId));
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate receiving messages (in production, use WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random responses
      if (Math.random() > 0.95 && messages.length > 0) {
        const autoResponses = [
          'J\'arrive bientôt!',
          'Je suis à 2 minutes.',
          'Pouvez-vous me confirmer l\'adresse?',
          'Pas de problème!',
        ];
        const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        
        setMessages(prev => [...prev, {
          id: `msg-auto-${Date.now()}`,
          orderId,
          senderId: 'auto',
          senderName: otherPartyName,
          senderType: otherPartyType,
          content: randomResponse,
          timestamp: new Date(),
          read: false,
        }]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [orderId, otherPartyName, otherPartyType, messages.length]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    const message: Message = {
      id: `msg-${Date.now()}`,
      orderId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: currentUserType,
      content: newMessage.trim(),
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate API call
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          senderId: currentUserId,
          senderName: currentUserName,
          senderType: currentUserType,
          content: message.content,
        }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    setIsLoading(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isMinimized) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className={`h-8 w-8 ${getSenderColor(otherPartyType)}`}>
                <AvatarFallback className="text-white text-xs">
                  {getSenderIcon(otherPartyType)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{otherPartyName}</p>
                <p className="text-xs text-muted-foreground">{messages.length} messages</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMinimize}>
                <MessageCircle className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-80 max-w-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className={`h-8 w-8 ${getSenderColor(otherPartyType)}`}>
              <AvatarFallback className="text-white text-xs">
                {getSenderIcon(otherPartyType)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">{otherPartyName}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {otherPartyType === 'driver' ? 'Livreur' : otherPartyType === 'restaurant' ? 'Restaurant' : 'Client'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {onMinimize && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMinimize}>
                <MinusCircle className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages */}
        <ScrollArea className="h-64 px-4" ref={scrollRef}>
          <div className="space-y-3 py-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-end gap-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      {!isCurrentUser && (
                        <Avatar className={`h-6 w-6 ${getSenderColor(message.senderType)}`}>
                          <AvatarFallback className="text-white text-xs">
                            {getSenderIcon(message.senderType)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isCurrentUser
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-orange-100' : 'text-muted-foreground'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button
              size="icon"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={sendMessage}
              disabled={isLoading || !newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Floating Chat Button Component
export function FloatingChatButton({
  unreadCount = 0,
  onClick,
}: {
  unreadCount?: number;
  onClick: () => void;
}) {
  return (
    <Button
      className="fixed bottom-20 right-4 lg:right-8 h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 z-40"
      onClick={onClick}
    >
      <MessageCircle className="h-6 w-6" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
}
