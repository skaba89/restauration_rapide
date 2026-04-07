import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo social media data
const DEMO_POSTS = [
  {
    id: 'post-001',
    content: '🍽️ Spécial du jour: Attieké Poisson Grillé avec sauce tamarinade! Seulement 15 000 GNF au lieu de 20 000 GNF. Disponible à midi et soir. #KFMDelice #CuisineIvoirienne',
    imageUrl: null,
    platforms: ['facebook', 'instagram'],
    scheduledAt: null,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'posted',
    type: 'daily_special',
    analytics: { likes: 45, comments: 8, shares: 12, reach: 1250 },
  },
  {
    id: 'post-002',
    content: '🎉 CE WEEKEND! 20% de réduction sur toutes les commandes de livraison ce samedi et dimanche. Code promo: WEEKEND20 🚚',
    imageUrl: null,
    platforms: ['facebook', 'instagram'],
    scheduledAt: null,
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'posted',
    type: 'promotion',
    analytics: { likes: 128, comments: 22, shares: 34, reach: 3500 },
  },
  {
    id: 'post-003',
    content: '🎊 Grand Opening de notre nouvelle terrasse! Rejoignez-nous ce vendredi pour découvrir notre tout nouvel espace avec vue panoramique. Cocktail de bienvenue offert! 🍹',
    imageUrl: null,
    platforms: ['facebook'],
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    postedAt: null,
    status: 'scheduled',
    type: 'event',
    analytics: null,
  },
  {
    id: 'post-004',
    content: '🍹 Nouveau: Jus de Gingembre frais maison! Énergisant et délicieux. Essayez-le aujourd\'hui! #BoissonNaturelle #Santé',
    imageUrl: null,
    platforms: ['instagram'],
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    postedAt: null,
    status: 'scheduled',
    type: 'daily_special',
    analytics: null,
  },
  {
    id: 'post-005',
    content: '📝 Menu de la semaine disponible! Découvrez nos nouvelles spécialités: Kedjenou de Poulet, Riz Gras aux fruits de mer, et bien plus...',
    imageUrl: null,
    platforms: ['facebook', 'instagram'],
    scheduledAt: null,
    postedAt: null,
    status: 'draft',
    type: 'general',
    analytics: null,
  },
];

const DEMO_ANALYTICS = {
  facebook: {
    followers: 4250,
    followersChange: 125,
    engagement: 4.2,
    reach: 12500,
    impressions: 28500,
    topPost: {
      id: 'post-002',
      likes: 128,
      comments: 22,
      shares: 34,
    },
    bestTimes: ['12:00', '19:00', '20:00'],
  },
  instagram: {
    followers: 3820,
    followersChange: 89,
    engagement: 5.8,
    reach: 9800,
    impressions: 22100,
    topPost: {
      id: 'post-002',
      likes: 156,
      comments: 28,
      shares: 45,
    },
    bestTimes: ['11:00', '18:00', '21:00'],
  },
};

const DEMO_REVIEWS = [
  {
    id: 'review-001',
    platform: 'google',
    author: 'Amadou Touré',
    rating: 5,
    content: 'Excellent restaurant! L\'attieké poisson est à tomber. Service rapide et personnel très aimable. Je recommande vivement!',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    replied: true,
    replyContent: 'Merci Amadou! Nous sommes ravis que vous ayez apprécié. À bientôt chez KFM DELICE!',
    replyDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-002',
    platform: 'facebook',
    author: 'Fatoumata Sylla',
    rating: 4,
    content: 'Très bonne cuisine ivoirienne. Les portions sont généreuses. Juste un peu d\'attente le weekend.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replied: false,
  },
  {
    id: 'review-003',
    platform: 'google',
    author: 'Ibrahim Koné',
    rating: 5,
    content: 'Le meilleur restaurant de Conakry! Les prix sont abordables et la qualité est au rendez-vous. Mon plat préféré: le Kedjenou.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    replied: true,
    replyContent: 'Merci Ibrahim! Votre satisfaction est notre priorité. Venez nous voir plus souvent!',
    replyDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-004',
    platform: 'facebook',
    author: 'Marie Kouyaté',
    rating: 3,
    content: 'Cuisine correcte mais le temps de livraison était un peu long (45 min au lieu de 30). J\'espère que ça s\'améliorera.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replied: true,
    replyContent: 'Bonjour Marie, nous nous excusons pour ce désagrément. Nous travaillons à améliorer nos délais de livraison. Merci pour votre compréhension.',
    replyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-005',
    platform: 'google',
    author: 'Seydou Bamba',
    rating: 5,
    content: 'Un vrai régal! Les saveurs authentiques de la Côte d\'Ivoire. Le personnel est très professionnel.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    replied: false,
  },
];

const DEMO_CONNECTED_ACCOUNTS = [
  { 
    platform: 'facebook', 
    name: 'KFM DELICE', 
    handle: '@kfm.delice', 
    connected: true, 
    followers: 4250,
    lastSync: new Date().toISOString(),
  },
  { 
    platform: 'instagram', 
    name: 'KFM DELICE Conakry', 
    handle: '@kfm_delice', 
    connected: true, 
    followers: 3820,
    lastSync: new Date().toISOString(),
  },
  { 
    platform: 'whatsapp', 
    name: 'KFM DELICE Business', 
    handle: '+224 62 00 00 00', 
    connected: false, 
    followers: 0,
    lastSync: null,
  },
];

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const platform = searchParams.get('platform');

  // Return demo data
  switch (type) {
    case 'posts':
      let posts = DEMO_POSTS;
      if (platform) {
        posts = posts.filter(p => p.platforms.includes(platform));
      }
      return NextResponse.json({ success: true, data: posts });
      
    case 'analytics':
      if (platform) {
        return NextResponse.json({ 
          success: true, 
          data: DEMO_ANALYTICS[platform as keyof typeof DEMO_ANALYTICS] || null 
        });
      }
      return NextResponse.json({ success: true, data: DEMO_ANALYTICS });
      
    case 'reviews':
      let reviews = DEMO_REVIEWS;
      if (platform) {
        reviews = reviews.filter(r => r.platform === platform);
      }
      return NextResponse.json({ success: true, data: reviews });
      
    case 'accounts':
      return NextResponse.json({ success: true, data: DEMO_CONNECTED_ACCOUNTS });
      
    case 'stats':
      const totalFollowers = DEMO_CONNECTED_ACCOUNTS.reduce((sum, a) => sum + a.followers, 0);
      const totalEngagement = DEMO_POSTS
        .filter(p => p.analytics)
        .reduce((sum, p) => {
          const a = p.analytics!;
          return sum + a.likes + a.comments + a.shares;
        }, 0);
      const avgRating = DEMO_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / DEMO_REVIEWS.length;
      const pendingReviews = DEMO_REVIEWS.filter(r => !r.replied).length;
      
      return NextResponse.json({
        success: true,
        data: {
          totalFollowers,
          totalPosts: DEMO_POSTS.length,
          postedCount: DEMO_POSTS.filter(p => p.status === 'posted').length,
          scheduledCount: DEMO_POSTS.filter(p => p.status === 'scheduled').length,
          draftCount: DEMO_POSTS.filter(p => p.status === 'draft').length,
          totalEngagement,
          reviewsCount: DEMO_REVIEWS.length,
          averageRating: avgRating.toFixed(1),
          pendingReviews,
          connectedAccounts: DEMO_CONNECTED_ACCOUNTS.filter(a => a.connected).length,
        },
      });
      
    default:
      return NextResponse.json({
        success: true,
        data: {
          posts: DEMO_POSTS,
          analytics: DEMO_ANALYTICS,
          reviews: DEMO_REVIEWS,
          accounts: DEMO_CONNECTED_ACCOUNTS,
        },
      });
  }
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { type, data } = body;

  const newId = `new-${Date.now()}`;

  switch (type) {
    case 'post':
      const newPost = {
        id: newId,
        ...data,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        postedAt: null,
        analytics: null,
      };
      return NextResponse.json({ success: true, data: newPost });
      
    case 'review_reply':
      return NextResponse.json({ 
        success: true, 
        data: { 
          reviewId: data.reviewId, 
          replyContent: data.replyContent,
          repliedAt: new Date().toISOString(),
        } 
      });
      
    default:
      return NextResponse.json({ success: false, error: 'Type non supporté' }, { status: 400 });
  }
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, type, data } = body;

  return NextResponse.json({
    success: true,
    data: { id, ...data, updatedAt: new Date().toISOString() },
  });
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  return NextResponse.json({ success: true, data: { deleted: id } });
});
