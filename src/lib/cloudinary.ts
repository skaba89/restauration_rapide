// Cloudinary Configuration for Image Uploads
// Free tier: 25GB storage, 25GB bandwidth/month

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  uploadPreset: 'restaurant-os', // Create this in Cloudinary dashboard
};

// Folder structure for organized uploads
export const CLOUDINARY_FOLDERS = {
  RESTAURANTS: 'restaurant-os/restaurants',
  MENUS: 'restaurant-os/menus',
  USERS: 'restaurant-os/users',
  PRODUCTS: 'restaurant-os/products',
  LOGOS: 'restaurant-os/logos',
  COVERS: 'restaurant-os/covers',
} as const;

// Image transformation presets
export const IMAGE_PRESETS = {
  THUMBNAIL: { width: 150, height: 150, crop: 'fill' },
  SMALL: { width: 300, height: 300, crop: 'fill' },
  MEDIUM: { width: 600, height: 400, crop: 'fill' },
  LARGE: { width: 1200, height: 800, crop: 'fill' },
  COVER: { width: 1920, height: 600, crop: 'fill' },
  LOGO: { width: 200, height: 200, crop: 'pad', background: 'auto' },
} as const;

// Helper to get Cloudinary URL with transformations
export function getCloudinaryUrl(
  publicId: string,
  preset: keyof typeof IMAGE_PRESETS = 'MEDIUM'
): string {
  const cloudName = CLOUDINARY_CONFIG.cloudName;
  if (!cloudName || !publicId) return '';

  const transform = IMAGE_PRESETS[preset];
  const transformStr = `w_${transform.width},h_${transform.height},c_${transform.crop}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
}

// Helper to extract public_id from Cloudinary URL
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;

    // Skip version if present (v1234567890)
    let startIndex = uploadIndex + 1;
    if (urlParts[startIndex]?.startsWith('v')) {
      startIndex++;
    }

    // Skip transformation parameters
    while (urlParts[startIndex]?.includes(',')) {
      startIndex++;
    }

    // Get the public_id (remove extension)
    const publicIdWithExt = urlParts.slice(startIndex).join('/');
    const lastDot = publicIdWithExt.lastIndexOf('.');
    return lastDot > -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
  } catch {
    return null;
  }
}

// Upload parameters for direct upload
export function getUploadParams(folder: string) {
  return {
    cloudName: CLOUDINARY_CONFIG.cloudName,
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
    folder,
    maxFileSize: 5000000, // 5MB
    allowedFormats: ['jpg', 'png', 'webp', 'gif'],
  };
}
