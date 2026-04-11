import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// In-memory message storage (in production, use a database)
const messagesStore: Map<string, Array<{
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'driver' | 'restaurant';
  content: string;
  timestamp: Date;
  read: boolean;
}>> = new Map();

// GET /api/messages - Get messages for an order
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const userId = searchParams.get('userId');

  if (!orderId) {
    return NextResponse.json({
      success: false,
      error: 'Order ID is required',
    }, { status: 400 });
  }

  const messages = messagesStore.get(orderId) || [];
  
  // Mark messages as read if userId is provided
  if (userId) {
    const updatedMessages = messages.map(msg => 
      msg.senderId !== userId ? { ...msg, read: true } : msg
    );
    messagesStore.set(orderId, updatedMessages);
  }

  return NextResponse.json({
    success: true,
    data: messages,
  });
});

// POST /api/messages - Send a new message
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { orderId, senderId, senderName, senderType, content } = body;

  if (!orderId || !senderId || !senderName || !senderType || !content) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields',
    }, { status: 400 });
  }

  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    orderId,
    senderId,
    senderName,
    senderType: senderType as 'customer' | 'driver' | 'restaurant',
    content,
    timestamp: new Date(),
    read: false,
  };

  // Get or create messages array for this order
  const existingMessages = messagesStore.get(orderId) || [];
  existingMessages.push(newMessage);
  messagesStore.set(orderId, existingMessages);

  return NextResponse.json({
    success: true,
    data: newMessage,
  });
});

// GET /api/messages/unread - Get unread message count
export async function getUnreadCount(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const userId = searchParams.get('userId');

  if (!orderId || !userId) {
    return NextResponse.json({
      success: false,
      error: 'Order ID and User ID are required',
    }, { status: 400 });
  }

  const messages = messagesStore.get(orderId) || [];
  const unreadCount = messages.filter(
    msg => msg.senderId !== userId && !msg.read
  ).length;

  return NextResponse.json({
    success: true,
    data: { unreadCount },
  });
}
