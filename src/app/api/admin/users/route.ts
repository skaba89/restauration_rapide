import { NextRequest, NextResponse } from 'next/server';
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword, fetchOrganizations, fetchRestaurants } from '@/lib/admin/service';
import { UserRole } from '@prisma/client';

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as UserRole | null;
    const isActive = searchParams.get('isActive') 
      ? searchParams.get('isActive') === 'true' 
      : undefined;
    const organizationId = searchParams.get('organizationId') || undefined;

    const result = await fetchUsers({
      page,
      limit,
      search,
      role: role || undefined,
      isActive,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Email, mot de passe et rôle sont requis' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = [
      'SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 
      'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER', 
      'STAFF', 'KITCHEN', 'DRIVER', 'CUSTOMER', 'SUPPORT'
    ];
    
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      email: body.email,
      phone: body.phone,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      organizationId: body.organizationId,
      restaurantId: body.restaurantId,
      vehicleType: body.vehicleType,
      vehiclePlate: body.vehiclePlate,
      staffRole: body.staffRole,
      department: body.department,
      hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : undefined,
    });

    return NextResponse.json({ 
      success: true, 
      data: user,
      message: 'Utilisateur créé avec succès' 
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    const user = await updateUser(body.id, {
      role: body.role,
      isActive: body.isActive,
      isLocked: body.isLocked,
      firstName: body.firstName,
      lastName: body.lastName,
    });

    return NextResponse.json({ 
      success: true, 
      data: user,
      message: 'Utilisateur mis à jour' 
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    await deleteUser(id);

    return NextResponse.json({ 
      success: true,
      message: 'Utilisateur désactivé' 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
