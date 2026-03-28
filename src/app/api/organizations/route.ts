// Organizations API - Complete CRUD
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';

// GET /api/organizations - List organizations with pagination
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const isActive = searchParams.get('isActive');
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');

    // Get single organization by slug
    if (slug) {
      const organization = await db.organization.findUnique({
        where: { slug },
        include: {
          settings: true,
          _count: {
            select: {
              restaurants: true,
              users: true,
            },
          },
        },
      });

      if (!organization) {
        return apiError('Organisation non trouvée', 404);
      }

      return apiSuccess(organization);
    }

    const where = {
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(plan && { plan: plan as string }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { slug: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [organizations, total] = await Promise.all([
      db.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          settings: true,
          _count: {
            select: {
              restaurants: true,
              users: true,
              brands: true,
            },
          },
        },
      }),
      db.organization.count({ where }),
    ]);

    return apiSuccess({
      data: organizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/organizations - Create organization
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      name,
      slug: providedSlug,
      phone,
      email,
      address,
      city,
      countryId = 'ci',
      currencyId = 'xof',
      businessType,
      taxId,
      website,
      logo,
      description,
      settings,
    } = body;

    // Validation
    if (!name || !phone || !email || !city) {
      return apiError('Le nom, téléphone, email et ville sont requis');
    }

    const slug = providedSlug || generateSlug(name);

    // Check if slug exists
    const existing = await db.organization.findUnique({ where: { slug } });
    if (existing) {
      return apiError('Cette URL est déjà utilisée', 409);
    }

    // Get or create default country and currency
    let country = await db.country.findFirst({ where: { code: countryId.toUpperCase() } });
    if (!country) {
      country = await db.country.create({
        data: {
          code: countryId.toUpperCase(),
          name: countryId.toUpperCase() === 'CI' ? 'Côte d\'Ivoire' : countryId,
          dialCode: '+225',
          defaultLanguage: 'fr',
          timezone: 'Africa/Abidjan',
          taxIncluded: true,
          defaultTaxRate: 18,
          mobileMoneyEnabled: true,
          isActive: true,
        },
      });
    }

    let currency = await db.currency.findFirst({ where: { code: currencyId.toUpperCase() } });
    if (!currency) {
      currency = await db.currency.create({
        data: {
          code: currencyId.toUpperCase(),
          name: currencyId.toUpperCase() === 'XOF' ? 'Franc CFA' : currencyId,
          symbol: currencyId.toUpperCase() === 'XOF' ? 'FCFA' : currencyId,
          decimalPlaces: 0,
          isActive: true,
        },
      });
    }

    // Create organization with settings
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        phone,
        email,
        address,
        city,
        countryId: country.id,
        currencyId: currency.id,
        businessType,
        taxId,
        website,
        logo,
        description,
        settings: settings ? {
          create: settings,
        } : {
          create: {
            minOrderAmount: 0,
            maxDeliveryRadius: 10,
            defaultDeliveryFee: 500,
            orderPrepTime: 15,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return apiSuccess(organization, 'Organisation créée avec succès', 201);
  });
}

// PATCH /api/organizations - Update organization
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, settings, ...updateData } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const existing = await db.organization.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Organisation non trouvée', 404);
    }

    // Check slug uniqueness if changing
    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await db.organization.findUnique({ where: { slug: updateData.slug } });
      if (slugExists) {
        return apiError('Cette URL est déjà utilisée', 409);
      }
    }

    // Update organization
    const organization = await db.organization.update({
      where: { id },
      data: updateData,
      include: { settings: true },
    });

    // Update settings if provided
    if (settings) {
      await db.organizationSettings.upsert({
        where: { organizationId: id },
        create: { organizationId: id, ...settings },
        update: settings,
      });
    }

    return apiSuccess(organization, 'Organisation mise à jour');
  });
}

// DELETE /api/organizations - Delete organization
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    const organization = await db.organization.findUnique({ where: { id } });
    if (!organization) {
      return apiError('Organisation non trouvée', 404);
    }

    // Soft delete by setting isActive to false
    await db.organization.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true }, 'Organisation désactivée');
  });
}
