// Users API - User CRUD with pagination
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { hashPassword } from '@/lib/auth-helpers';
import { isValidEmail, isValidPassword } from '@/lib/utils-helpers';

// GET /api/users - List users with pagination
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where = {
      deletedAt: null,
      ...(role && { role: role as string }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { email: { contains: search } },
          { phone: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }),
      ...(organizationId && {
        organizationUsers: { some: { organizationId } },
      }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          firstName: true,
          lastName: true,
          avatar: true,
          language: true,
          isActive: true,
          isLocked: true,
          emailVerified: true,
          phoneVerified: true,
          lastLoginAt: true,
          createdAt: true,
          organizationUsers: {
            include: {
              organization: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return apiSuccess({
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/users - Create new user
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      role = 'CUSTOMER',
      organizationId,
      organizationRole = 'member',
    } = body;

    // Validation
    if (!email || !password) {
      return apiError('Email et mot de passe sont requis');
    }

    if (!isValidEmail(email)) {
      return apiError('Email invalide');
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return apiError(passwordValidation.message || 'Mot de passe invalide');
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError('Un utilisateur avec cet email existe déjà', 409);
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        phone,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        role,
        ...(organizationId && {
          organizationUsers: {
            create: {
              organizationId,
              role: organizationRole,
              acceptedAt: new Date(),
            },
          },
        }),
      },
      include: {
        organizationUsers: {
          include: { organization: true },
        },
      },
    });

    return apiSuccess({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      organizations: user.organizationUsers,
    }, 'Utilisateur créé avec succès', 201);
  });
}

// PATCH /api/users - Update user
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      id,
      email,
      phone,
      firstName,
      lastName,
      avatar,
      language,
      timezone,
      isActive,
      isLocked,
      role,
    } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return apiError('Utilisateur non trouvé', 404);
    }

    // Check email uniqueness if changing
    if (email && email !== existingUser.email) {
      const emailExists = await db.user.findUnique({ where: { email } });
      if (emailExists) {
        return apiError('Cet email est déjà utilisé', 409);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isLocked !== undefined) {
      updateData.isLocked = isLocked;
      if (isLocked) updateData.lockedAt = new Date();
    }
    if (role !== undefined) updateData.role = role;

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        language: true,
        isActive: true,
        isLocked: true,
      },
    });

    return apiSuccess(user, 'Utilisateur mis à jour');
  });
}

// DELETE /api/users - Soft delete user
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return apiError('Utilisateur non trouvé', 404);
    }

    // Soft delete
    await db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // Invalidate all sessions
    await db.session.deleteMany({ where: { userId: id } });

    return apiSuccess({ deleted: true }, 'Utilisateur supprimé');
  });
}
