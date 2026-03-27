'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  User,
  Truck,
  Store,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
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

interface Conversation {
  orderId: string;
  orderNumber: string;
  otherParty: {
    id: string;
    name: string;
    type: 'driver' | 'restaurant';
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

const CONVERSATIONS: Conversation[] = [
  {
    orderId: 'ORD-2024-0145',
    orderNumber: 'ORD-2024-0145',
    otherParty: {
      id: 'driver-1',
      name: 'Amadou Touré',
      type: 'driver',
    },
    lastMessage: 'Je suis à 2 minutes.',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 1,
  },
  {
    orderId: 'ORD-2024-0144',
    orderNumber: 'ORD-2024-0144',
    otherParty: {
      id: 'restaurant-1',
      name: 'Le Petit Maquis',
      type: 'restaurant',
    },
    lastMessage: 'Votre commande est prête!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
  },
];

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

const DEMO_MESSAGES: Record<string, Message[]> = {
  'ORD-2024-0145': [
    {
      id: 'msg-1',
      orderId: 'ORD-2024-0145',
      senderId: 'driver-1',
      senderName: 'Amadou Touré',
      senderType: 'driver',
      content: 'Bonjour! J\'ai bien pris en charge votre commande.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true,
    },
    {
      id: 'msg-2',
      orderId: 'ORD-2024-0145',
      senderId: 'customer-1',
      senderName: 'Vous',
      senderType: 'customer',
      content: 'Parfait, merci! Combien de temps environ?',
      timestamp: new Date(Date.now() - 14 * 60 * 1000),
      read: true,
    },
    {
      id: 'msg-3',
      orderId: 'ORD-2024-0145',
      senderId: 'driver-1',
      senderName: 'Amadou Touré',
      senderType: 'driver',
      content: 'Environ 15-20 minutes. Je suis en route!',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: true,
    },
    {
      id: 'msg-4',
      orderId: 'ORD-2024-0145',
      senderId: 'driver-1',
      senderName: 'Amadou Touré',
      senderType: 'driver',
      content: 'Je suis à 2 minutes.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
  ],
  'ORD-2024-0144': [
    {
      id: 'msg-5',
      orderId: 'ORD-2024-0144',
      senderId: 'restaurant-1',
      senderName: 'Le Petit Maquis',
      senderType: 'restaurant',
      content: 'Votre commande est en préparation.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: 'msg-6',
      orderId: 'ORD-2024-0144',
      senderId: 'restaurant-1',
      senderName: 'Le Petit Maquis',
      senderType: 'restaurant',
      content: 'Votre commande est prête!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
  ],
};

export default function CustomerMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(DEMO_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return new Date(date).toLocaleDateString('fr-FR');
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      orderId: selectedConversation.orderId,
      senderId: 'customer-1',
      senderName: 'Vous',
      senderType: 'customer',
      content: newMessage.trim(),
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation.orderId]: [...(prev[selectedConversation.orderId] || []), message],
    }));

    setNewMessage('');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
    toast({ title: 'Appel en cours...', description: phone });
  };

  if (selectedConversation) {
    const conversationMessages = messages[selectedConversation.orderId] || [];

    return (
      <div className="space-y-4 h-[calc(100vh-10rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className={`h-10 w-10 ${getSenderColor(selectedConversation.otherParty.type)}`}>
              <AvatarFallback className="text-white">
                {getSenderIcon(selectedConversation.otherParty.type)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{selectedConversation.otherParty.name}</p>
              <p className="text-sm text-muted-foreground">{selectedConversation.orderNumber}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => handleCall('+2250700000100')}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 py-4">
                {conversationMessages.map((message) => {
                  const isCurrentUser = message.senderType === 'customer';

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%]`}>
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
                              {formatMessageTime(message.timestamp)}
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
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>

      {/* Conversations List */}
      <div className="space-y-3">
        {CONVERSATIONS.map((conversation) => (
          <Card
            key={conversation.orderId}
            className="cursor-pointer hover:border-orange-500 transition-colors"
            onClick={() => setSelectedConversation(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className={`h-12 w-12 ${getSenderColor(conversation.otherParty.type)}`}>
                  <AvatarFallback className="text-white">
                    {getSenderIcon(conversation.otherParty.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{conversation.otherParty.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(conversation.lastMessageTime)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {conversation.orderNumber}
                    </Badge>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-orange-500 text-xs">
                        {conversation.unreadCount} non lu{conversation.unreadCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {CONVERSATIONS.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune conversation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vos messages avec les livreurs et restaurants apparaîtront ici
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
