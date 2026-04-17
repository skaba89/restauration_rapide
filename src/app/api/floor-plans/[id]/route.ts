import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// GET - Get a single floor plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Real database query
    const floorPlan = await db.floorPlan.findUnique({
      where: { id },
      include: {
        tables: {
          where: { isActive: true },
          include: {
            server: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            diningRoom: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan de salle non trouvé' },
        { status: 404 }
      );
    }

    // Transform tables
    const transformedTables = floorPlan.tables.map(table => ({
      id: table.id,
      number: table.number,
      shape: table.shape as 'round' | 'square' | 'rectangle',
      capacity: table.capacity,
      positionX: table.positionX || 0,
      positionY: table.positionY || 0,
      width: table.width || (table.shape === 'rectangle' ? 120 : table.shape === 'square' ? 70 : 80),
      height: table.height || (table.shape === 'rectangle' ? 80 : table.shape === 'square' ? 70 : 80),
      rotation: table.rotation || 0,
      status: table.status.toLowerCase() as 'available' | 'occupied' | 'reserved' | 'cleaning',
      currentPartySize: table.currentPartySize,
      serverId: table.serverId,
      serverName: table.server?.user 
        ? `${table.server.user.firstName} ${table.server.user.lastName}`
        : undefined,
      section: table.diningRoom?.name || 'Salle Principale',
      isVip: table.isVip,
      isAccessible: table.isAccessible,
      isCombineable: table.isCombineable,
    }));

    return NextResponse.json({
      success: true,
      floorPlan: {
        id: floorPlan.id,
        name: floorPlan.name,
        description: floorPlan.description,
        layout: floorPlan.layout ? JSON.parse(floorPlan.layout) : null,
        isDefault: floorPlan.isDefault,
        isActive: floorPlan.isActive,
        tables: transformedTables,
        createdAt: floorPlan.createdAt,
        updatedAt: floorPlan.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du plan de salle' },
      { status: 500 }
    );
  }
}

// PUT - Update a floor plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      layout, 
      isDefault, 
      isActive,
      restaurantId,
    } = body;

    // If setting as default, unset other defaults
    if (isDefault && restaurantId) {
      await db.floorPlan.updateMany({
        where: { restaurantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Update floor plan
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (layout !== undefined) updateData.layout = JSON.stringify(layout);
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (isActive !== undefined) updateData.isActive = isActive;

    const floorPlan = await db.floorPlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      floorPlan: {
        id: floorPlan.id,
        name: floorPlan.name,
        description: floorPlan.description,
        layout: layout || null,
        isDefault: floorPlan.isDefault,
        isActive: floorPlan.isActive,
        updatedAt: floorPlan.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du plan de salle' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a floor plan (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Soft delete by setting isActive to false
    await db.floorPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan de salle supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du plan de salle' },
      { status: 500 }
    );
  }
}

