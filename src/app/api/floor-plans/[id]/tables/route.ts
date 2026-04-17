import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// POST - Add a table to a floor plan
export async function POST(
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

    const { id: floorPlanId } = await params;
    const body = await request.json();
    const { 
      number, 
      shape = 'round', 
      capacity = 4, 
      positionX = 100, 
      positionY = 100, 
      width, 
      height, 
      rotation = 0,
      section,
      isVip = false,
      isAccessible = false,
      isCombineable = true,
      restaurantId,
    } = body;

    // Validate required fields
    if (!number) {
      return NextResponse.json(
        { success: false, error: 'Le numéro de table est requis' },
        { status: 400 }
      );
    }

    // Calculate default dimensions based on shape
    const defaultWidth = shape === 'rectangle' ? 120 : shape === 'square' ? 70 : 80;
    const defaultHeight = shape === 'rectangle' ? 80 : shape === 'square' ? 70 : 80;

    // Check if table number already exists in this floor plan
    const existingTable = await db.table.findFirst({
      where: {
        restaurantId,
        number,
        floorPlanId,
        isActive: true,
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { success: false, error: 'Une table avec ce numéro existe déjà dans ce plan de salle' },
        { status: 400 }
      );
    }

    // Find or create dining room for the section
    let diningRoomId = null;
    if (section) {
      const existingRoom = await db.diningRoom.findFirst({
        where: {
          restaurantId,
          name: section,
        },
      });
      
      if (existingRoom) {
        diningRoomId = existingRoom.id;
      } else {
        const newRoom = await db.diningRoom.create({
          data: {
            restaurantId,
            name: section,
            type: 'indoor',
            capacity: 50,
          },
        });
        diningRoomId = newRoom.id;
      }
    }

    // Create table in database
    const table = await db.table.create({
      data: {
        restaurantId,
        floorPlanId,
        number,
        shape,
        capacity,
        positionX,
        positionY,
        width: width || defaultWidth,
        height: height || defaultHeight,
        rotation,
        diningRoomId,
        isVip,
        isAccessible,
        isCombineable,
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        number: table.number,
        shape: table.shape,
        capacity: table.capacity,
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
        rotation: table.rotation,
        status: table.status.toLowerCase(),
        section,
        isVip: table.isVip,
        isAccessible: table.isAccessible,
        isCombineable: table.isCombineable,
      },
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la table' },
      { status: 500 }
    );
  }
}

// GET - Get all tables for a floor plan
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

    const { id: floorPlanId } = await params;
    const { searchParams } = new URL(request.url);

    // Real database query
    const tables = await db.table.findMany({
      where: {
        floorPlanId,
        isActive: true,
      },
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
    });

    const transformedTables = tables.map(table => ({
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
      tables: transformedTables,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tables' },
      { status: 500 }
    );
  }
}

// PUT - Batch update tables (positions, status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: floorPlanId } = await params;
    const body = await request.json();
    const { tables } = body;

    if (!Array.isArray(tables)) {
      return NextResponse.json(
        { success: false, error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Real database update - use transaction
    for (const table of tables) {
      await db.table.update({
        where: { id: table.id },
        data: {
          positionX: table.positionX,
          positionY: table.positionY,
          width: table.width,
          height: table.height,
          rotation: table.rotation,
          status: table.status?.toUpperCase(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tables mises à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating tables:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des tables' },
      { status: 500 }
    );
  }
}

