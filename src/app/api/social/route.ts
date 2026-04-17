import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const platform = searchParams.get('platform');

  switch (type) {
    case 'posts':
      let posts = [];
      if (platform) {
        posts = posts.filter(p => p.platforms.includes(platform));
      }
      return NextResponse.json({ success: true, data: posts });
      
    case 'analytics':
      if (platform) {
        return NextResponse.json({ 
          success: true, 
          data: null 
        });
      }
      return NextResponse.json({ success: true, data: [] });
      
    case 'reviews':
      let reviews = [];
      if (platform) {
        reviews = reviews.filter(r => r.platform === platform);
      }
      return NextResponse.json({ success: true, data: reviews });
      
    case 'accounts':
      return NextResponse.json({ success: true, data: [] });
      
    case 'stats':
      const totalFollowers = [].reduce((sum: number, a: any) => sum + a.followers, 0);
      const totalEngagement = []
        .filter((p: any) => p.analytics)
        .reduce((sum: number, p: any) => {
          const a = p.analytics!;
          return sum + a.likes + a.comments + a.shares;
        }, 0);
      const avgRating = 0;
      const pendingReviews = [].length;
      
      return NextResponse.json({
        success: true,
        data: {
          totalFollowers,
          totalPosts: 0,
          postedCount: [].length,
          scheduledCount: [].length,
          draftCount: [].length,
          totalEngagement,
          reviewsCount: 0,
          averageRating: avgRating.toFixed(1),
          pendingReviews,
          connectedAccounts: [].length,
        },
      });
      
    default:
      return NextResponse.json({
        success: true,
        data: {
          posts: [],
          analytics: [],
          reviews: [],
          accounts: [],
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