import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  food: 'Cuisine',
  service: 'Service',
  ambiance: 'Ambiance',
  cleanliness: 'Propreté'
};

// GET - List feedback with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rating = searchParams.get('rating');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const tableId = searchParams.get('tableId');
  const stats = searchParams.get('stats') === 'true';
  
  try {
    
    // Real database queries
    const where: any = {};
    
    if (rating) {
      where.rating = parseInt(rating);
    }
    if (status) {
      where.status = status;
    }
    
    // Get feedback from database
    const feedback = await db.customerFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    if (stats) {
      const total = feedback.length;
      const avgRating = feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (total || 1);
      
      return NextResponse.json({
        success: true,
        data: {
          total,
          avgRating: avgRating.toFixed(1),
          newCount: feedback.filter(f => f.status === 'new').length,
          respondedCount: feedback.filter(f => f.status === 'responded').length
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: feedback,
      total: feedback.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0
    });
  }
}

// POST - Submit feedback (public)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tableId, tableNumber, rating, categories, comment, customerName, customerPhone } = body;
  
  // Validate required fields
  if (!tableId || !tableNumber || !rating) {
    return NextResponse.json({
      success: false,
      error: 'Informations manquantes'
    }, { status: 400 });
  }
  
  try {
    const feedback = await db.customerFeedback.create({
      data: {
        organizationId: 'demo-org', // Should be from context
        restaurantId: tableId,
        type: 'table_feedback',
        category: categories?.join(','),
        message: comment || '',
        rating,
        status: 'new'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis !',
      data: feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi'
    }, { status: 500 });
  }
}

// PUT - Respond to feedback
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { feedbackId, response } = body;
  
  if (!feedbackId || !response) {
    return NextResponse.json({
      success: false,
      error: 'Informations manquantes'
    }, { status: 400 });
  }
  
  try {
    await db.customerFeedback.update({
      where: { id: feedbackId },
      data: {
        response,
        respondedAt: new Date(),
        status: 'responded'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Réponse envoyée avec succès'
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi de la réponse'
    }, { status: 500 });
  }
}