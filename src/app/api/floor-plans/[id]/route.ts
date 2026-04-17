import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This would normally be in a shared store or database

// GET - Get a single floor plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

// Helper function for demo tables
function getDemoTables() {
  return [
    // Salle Principale (Tables 1-5)
    { id: 'demo-t1', number: 'T1', shape: 'round', capacity: 4, positionX: 80, positionY: 100, width: 80, height: 80, rotation: 0, status: 'occupied', currentPartySize: 3, serverName: 'Aïssata', section: 'Salle Principale' },
    { id: 'demo-t2', number: 'T2', shape: 'round', capacity: 4, positionX: 200, positionY: 100, width: 80, height: 80, rotation: 0, status: 'reserved', section: 'Salle Principale', reservationTime: '19:30', reservationName: 'M. Koné' },
    { id: 'demo-t3', number: 'T3', shape: 'round', capacity: 4, positionX: 320, positionY: 100, width: 80, height: 80, rotation: 0, status: 'occupied', currentPartySize: 4, serverName: 'Moussa', section: 'Salle Principale' },
    { id: 'demo-t4', number: 'T4', shape: 'square', capacity: 4, positionX: 80, positionY: 220, width: 70, height: 70, rotation: 0, status: 'cleaning', section: 'Salle Principale' },
    { id: 'demo-t5', number: 'T5', shape: 'round', capacity: 4, positionX: 200, positionY: 220, width: 80, height: 80, rotation: 0, status: 'reserved', section: 'Salle Principale', reservationTime: '20:00', reservationName: 'Diallo' },
    
    // Terrasse (Tables 6-10)
    { id: 'demo-t6', number: 'T6', shape: 'square', capacity: 4, positionX: 520, positionY: 100, width: 70, height: 70, rotation: 0, status: 'occupied', currentPartySize: 2, serverName: 'Fatou', section: 'Terrasse' },
    { id: 'demo-t7', number: 'T7', shape: 'square', capacity: 4, positionX: 620, positionY: 100, width: 70, height: 70, rotation: 0, status: 'occupied', currentPartySize: 3, serverName: 'Kouamé', section: 'Terrasse' },
    { id: 'demo-t8', number: 'T8', shape: 'square', capacity: 4, positionX: 720, positionY: 100, width: 70, height: 70, rotation: 0, status: 'available', section: 'Terrasse' },
    { id: 'demo-t9', number: 'T9', shape: 'square', capacity: 4, positionX: 520, positionY: 200, width: 70, height: 70, rotation: 0, status: 'available', section: 'Terrasse' },
    { id: 'demo-t10', number: 'T10', shape: 'square', capacity: 4, positionX: 620, positionY: 200, width: 70, height: 70, rotation: 0, status: 'available', section: 'Terrasse' },
    
    // VIP (Tables 11-12)
    { id: 'demo-t11', number: 'VIP1', shape: 'rectangle', capacity: 6, positionX: 80, positionY: 400, width: 120, height: 80, rotation: 0, status: 'available', section: 'VIP', isVip: true },
    { id: 'demo-t12', number: 'VIP2', shape: 'rectangle', capacity: 6, positionX: 240, positionY: 400, width: 120, height: 80, rotation: 0, status: 'available', section: 'VIP', isVip: true },
    
    // Coins intimes (Tables 13-15)
    { id: 'demo-t13', number: 'C1', shape: 'round', capacity: 2, positionX: 450, positionY: 400, width: 60, height: 60, rotation: 0, status: 'available', section: 'Coins Intimes' },
    { id: 'demo-t14', number: 'C2', shape: 'round', capacity: 2, positionX: 530, positionY: 400, width: 60, height: 60, rotation: 0, status: 'available', section: 'Coins Intimes' },
    { id: 'demo-t15', number: 'C3', shape: 'round', capacity: 2, positionX: 610, positionY: 400, width: 60, height: 60, rotation: 0, status: 'available', section: 'Coins Intimes' },
  ];
}