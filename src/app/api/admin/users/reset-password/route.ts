import { NextRequest, NextResponse } from 'next/server';
import { resetUserPassword } from '@/lib/admin/service';
import { withAdminAuth } from '@/lib/auth-middleware';

// POST /api/admin/users/reset-password - Reset user password (ADMIN only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    if (!body.id || !body.newPassword) {
      return NextResponse.json(
        { error: 'ID utilisateur et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    await resetUserPassword(body.id, body.newPassword);

    return NextResponse.json({ 
      success: true,
      message: 'Mot de passe réinitialisé avec succès' 
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
});
