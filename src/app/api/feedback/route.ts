import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo feedback data
const DEMO_FEEDBACK = [
  {
    id: 'fb-001',
    tableId: 'table-1',
    tableNumber: 'T1',
    rating: 5,
    categories: ['food', 'service'],
    comment: 'Excellent repas ! Le poisson était frais et bien assaisonné. Service impeccable.',
    customerName: 'Kouamé Jean',
    customerPhone: '+225 07 00 00 01',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min ago
  },
  {
    id: 'fb-002',
    tableId: 'table-3',
    tableNumber: 'T3',
    rating: 4,
    categories: ['food'],
    comment: 'Très bon attieké, un peu d\'attente mais ça valait le coup.',
    customerName: 'Aya Marie',
    customerPhone: '+225 07 00 00 02',
    status: 'reviewed',
    response: 'Merci pour votre avis ! Nous travaillons à réduire les temps d\'attente.',
    respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-003',
    tableId: 'table-7',
    tableNumber: 'T7',
    rating: 2,
    categories: ['service'],
    comment: 'Service très lent aujourd\'hui. Nous avons attendu 45 minutes pour notre commande.',
    customerName: 'Koné Ibrahim',
    customerPhone: '+225 07 00 00 03',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-004',
    tableId: 'table-12',
    tableNumber: 'T12',
    rating: 5,
    categories: ['food', 'service', 'ambiance'],
    comment: 'Parfait ! Ambiance chaleureuse, cuisine délicieuse et personnel très aimable. Je recommande !',
    customerName: 'Diallo Fatou',
    customerPhone: '+225 07 00 00 04',
    status: 'responded',
    response: 'Merci beaucoup Fatou ! Nous sommes ravis que vous ayez passé un bon moment. À bientôt !',
    respondedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-005',
    tableId: 'table-5',
    tableNumber: 'T5',
    rating: 3,
    categories: ['food'],
    comment: 'Le plat était un peu trop salé à mon goût. Sinon bon accueil.',
    customerName: 'Touré Amadou',
    customerPhone: '+225 07 00 00 05',
    status: 'reviewed',
    response: 'Nous prenons note de votre remarque sur l\'assaisonnement. Merci !',
    respondedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-006',
    tableId: 'table-2',
    tableNumber: 'T2',
    rating: 4,
    categories: ['food', 'ambiance'],
    comment: 'Très bonne cuisine ivoirienne authentique. L\'ambiance est agréable, musique pas trop forte.',
    customerName: 'Kouassi Yao',
    customerPhone: null,
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-007',
    tableId: 'table-9',
    tableNumber: 'T9',
    rating: 1,
    categories: ['service', 'cleanliness'],
    comment: 'Table sale à notre arrivée. Serveur désagréable. Très déçu.',
    customerName: 'Traoré Aïssata',
    customerPhone: '+225 07 00 00 07',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-008',
    tableId: 'table-4',
    tableNumber: 'T4',
    rating: 5,
    categories: ['food'],
    comment: 'Le kedjenou est à tomber ! Meilleur que chez ma grand-mère.',
    customerName: 'Bamba Seydou',
    customerPhone: '+225 07 00 00 08',
    status: 'responded',
    response: 'Quel compliment ! Notre chef va être ravi. Merci Seydou !',
    respondedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-009',
    tableId: 'table-6',
    tableNumber: 'T6',
    rating: 4,
    categories: ['service', 'ambiance'],
    comment: 'Bon service, équipe souriante. Cadre sympa pour un déjeuner entre collègues.',
    customerName: null,
    customerPhone: null,
    status: 'reviewed',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-010',
    tableId: 'table-8',
    tableNumber: 'T8',
    rating: 5,
    categories: ['food', 'service', 'ambiance', 'cleanliness'],
    comment: 'Tout était parfait ! Restaurant propre, cuisine excellente, service de qualité. Notre nouvelle adresse préférée !',
    customerName: 'Kouakou Jean-Baptiste',
    customerPhone: '+225 07 00 00 10',
    status: 'responded',
    response: 'Merci infiniment ! Nous sommes honorés de devenir votre adresse préférée. À très vite !',
    respondedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-011',
    tableId: 'table-10',
    tableNumber: 'T10',
    rating: 3,
    categories: ['service'],
    comment: 'Temps d\'attente un peu long mais le serveur était seul. Bon courage à l\'équipe.',
    customerName: 'Diarra Moussa',
    customerPhone: '+225 07 00 00 11',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-012',
    tableId: 'table-11',
    tableNumber: 'T11',
    rating: 4,
    categories: ['food'],
    comment: 'Le garba était excellent et bien pimenté comme j\'aime. Portions généreuses.',
    customerName: 'Sy Savane',
    customerPhone: '+225 07 00 00 12',
    status: 'reviewed',
    response: 'Super ! Le garba est l\'un de nos plats signatures. Merci pour votre avis !',
    respondedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 38 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-013',
    tableId: 'table-14',
    tableNumber: 'T14',
    rating: 2,
    categories: ['cleanliness'],
    comment: 'Les toilettes étaient sales. Veuillez faire attention à la propreté.',
    customerName: null,
    customerPhone: '+225 07 00 00 13',
    status: 'reviewed',
    response: 'Nous nous excusons sincèrement. L\'équipe de nettoyage a été informée immédiatement.',
    respondedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-014',
    tableId: 'table-15',
    tableNumber: 'T15',
    rating: 5,
    categories: ['food', 'ambiance'],
    comment: 'Jus de bissap fait maison délicieux ! Ambiance musicale parfaite.',
    customerName: 'Ouattara Awa',
    customerPhone: '+225 07 00 00 14',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-015',
    tableId: 'table-16',
    tableNumber: 'T16',
    rating: 4,
    categories: ['food', 'service'],
    comment: 'Très bon thiéboudienne. Service rapide pour un vendredi soir. Bravo !',
    customerName: 'Gnagne Paul',
    customerPhone: '+225 07 00 00 15',
    status: 'responded',
    response: 'Merci Paul ! Ravie que vous ayez apprécié. Bon week-end !',
    respondedAt: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 54 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-016',
    tableId: 'table-3',
    tableNumber: 'T3',
    rating: 5,
    categories: ['food', 'service', 'ambiance'],
    comment: 'Deuxième visite et toujours aussi satisfait ! L\'équipe est au top.',
    customerName: 'Kouamé Jean',
    customerPhone: '+225 07 00 00 01',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-017',
    tableId: 'table-1',
    tableNumber: 'T1',
    rating: 3,
    categories: ['service'],
    comment: 'Erreur sur ma commande mais le serveur s\'est excusé et a corrigé rapidement.',
    customerName: 'Brou Emmanuel',
    customerPhone: '+225 07 00 00 17',
    status: 'reviewed',
    response: 'Merci pour votre compréhension. Nous faisons de notre mieux pour éviter ces erreurs.',
    respondedAt: new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 82 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-018',
    tableId: 'table-18',
    tableNumber: 'T18',
    rating: 1,
    categories: ['food', 'service'],
    comment: 'Poisson pas frais du tout. Très déçu. Je ne reviendrai pas.',
    customerName: 'Kone Drissa',
    customerPhone: '+225 07 00 00 18',
    status: 'new',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-019',
    tableId: 'table-20',
    tableNumber: 'T20',
    rating: 5,
    categories: ['food'],
    comment: 'Poulet braisé succulent ! La marinade est parfaite.',
    customerName: 'Coulibaly Mariam',
    customerPhone: '+225 07 00 00 19',
    status: 'responded',
    response: 'Merci Mariam ! Notre poulet braisé est mariné pendant 24h. Secret de famille !',
    respondedAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 102 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb-020',
    tableId: 'table-22',
    tableNumber: 'T22',
    rating: 4,
    categories: ['ambiance'],
    comment: 'Belle décoration, on se sent bien ici. Juste un peu de bruit quand c\'est complet.',
    customerName: null,
    customerPhone: null,
    status: 'reviewed',
    response: 'Merci ! Nous travaillons sur l\'acoustique pour améliorer le confort.',
    respondedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 122 * 60 * 60 * 1000).toISOString()
  }
];

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
  const demo = searchParams.get('demo') === 'true';
  const rating = searchParams.get('rating');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const tableId = searchParams.get('tableId');
  const stats = searchParams.get('stats') === 'true';
  
  try {
    // Demo mode
    if (demo) {
      let filtered = [...DEMO_FEEDBACK];
      
      // Apply filters
      if (rating) {
        filtered = filtered.filter(f => f.rating === parseInt(rating));
      }
      if (category) {
        filtered = filtered.filter(f => f.categories.includes(category));
      }
      if (status) {
        filtered = filtered.filter(f => f.status === status);
      }
      if (tableId) {
        filtered = filtered.filter(f => f.tableId === tableId);
      }
      
      // Calculate stats
      if (stats) {
        const total = filtered.length;
        const avgRating = filtered.reduce((sum, f) => sum + f.rating, 0) / (total || 1);
        const ratingDistribution = [1, 2, 3, 4, 5].map(r => ({
          rating: r,
          count: filtered.filter(f => f.rating === r).length
        }));
        const categoryBreakdown = Object.keys(CATEGORY_LABELS).map(cat => ({
          category: cat,
          label: CATEGORY_LABELS[cat],
          count: filtered.filter(f => f.categories.includes(cat)).length
        }));
        const respondedCount = filtered.filter(f => f.status === 'responded').length;
        const responseRate = total > 0 ? (respondedCount / total) * 100 : 0;
        
        return NextResponse.json({
          success: true,
          data: {
            total,
            avgRating: avgRating.toFixed(1),
            ratingDistribution,
            categoryBreakdown,
            responseRate: responseRate.toFixed(0),
            newCount: filtered.filter(f => f.status === 'new').length,
            respondedCount,
            reviewedCount: filtered.filter(f => f.status === 'reviewed').length
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: filtered,
        total: filtered.length
      });
    }
    
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
    // Return demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_FEEDBACK,
      total: DEMO_FEEDBACK.length
    });
  }
}

// POST - Submit feedback (public)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tableId, tableNumber, rating, categories, comment, customerName, customerPhone, demo } = body;
  
  // Validate required fields
  if (!tableId || !tableNumber || !rating) {
    return NextResponse.json({
      success: false,
      error: 'Informations manquantes'
    }, { status: 400 });
  }
  
  // Demo mode
  if (demo) {
    const newFeedback = {
      id: `fb-${Date.now()}`,
      tableId,
      tableNumber,
      rating,
      categories: categories || [],
      comment,
      customerName,
      customerPhone,
      status: 'new',
      response: null,
      respondedAt: null,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis !',
      data: newFeedback
    });
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
  const { feedbackId, response, demo } = body;
  
  if (!feedbackId || !response) {
    return NextResponse.json({
      success: false,
      error: 'Informations manquantes'
    }, { status: 400 });
  }
  
  // Demo mode
  if (demo) {
    return NextResponse.json({
      success: true,
      message: 'Réponse envoyée avec succès'
    });
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
