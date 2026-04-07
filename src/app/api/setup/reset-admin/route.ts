// ============================================
// Reset Admin Password API
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';

// POST - Reset admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const newPassword = body.password || 'KFM@Admin2024!';
    const email = body.email || 'admin@kfm-delice.com';
    
    // Find the admin user
    const admin = await db.user.findFirst({
      where: { 
        role: 'SUPER_ADMIN',
        email: email
      },
    });

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin non trouvé',
      }, { status: 404 });
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the password
    await db.user.update({
      where: { id: admin.id },
      data: { 
        passwordHash,
        isLocked: false,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès!',
      credentials: {
        email: admin.email,
        password: newPassword,
      },
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    );
  }
}
