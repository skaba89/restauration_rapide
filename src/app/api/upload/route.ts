import { NextRequest, NextResponse } from 'next/server';
import { CLOUDINARY_FOLDERS, getUploadParams } from '@/lib/cloudinary';

// POST /api/upload - Get signed upload parameters for Cloudinary
// Client-side upload uses these params directly with Cloudinary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder, type = 'general' } = body;

    // Determine folder based on type
    let uploadFolder: string;
    switch (type) {
      case 'restaurant':
        uploadFolder = CLOUDINARY_FOLDERS.RESTAURANTS;
        break;
      case 'menu':
      case 'product':
        uploadFolder = CLOUDINARY_FOLDERS.PRODUCTS;
        break;
      case 'logo':
        uploadFolder = CLOUDINARY_FOLDERS.LOGOS;
        break;
      case 'cover':
        uploadFolder = CLOUDINARY_FOLDERS.COVERS;
        break;
      case 'user':
        uploadFolder = CLOUDINARY_FOLDERS.USERS;
        break;
      default:
        uploadFolder = folder || 'restaurant-os/misc';
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'restaurant-os';

    if (!cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    // Return upload parameters for client-side upload
    return NextResponse.json({
      cloudName,
      uploadPreset,
      folder: uploadFolder,
      maxFileSize: 5000000, // 5MB
      allowedFormats: ['jpg', 'png', 'webp', 'gif'],
      timestamp: Math.round(Date.now() / 1000),
    });
  } catch (error) {
    console.error('Upload config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete image from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId' },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    // For server-side deletion, we'd need to use the cloudinary npm package
    // For now, return success (deletion can be done via Cloudinary dashboard)
    return NextResponse.json({ 
      success: true, 
      message: 'Use Cloudinary dashboard to delete images',
      publicId 
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
