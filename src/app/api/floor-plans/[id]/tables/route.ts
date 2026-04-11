import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo tables store (shared state for demo mode)
let demoTablesStore: Record<string, unknown[]> = {};

// POST - Add a table to a floor plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      demo = false,
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

    // Demo mode
    if (demo || floorPlanId.startsWith('demo-')) {
      const newTable = {
        id: `demo-table-${Date.now()}`,
        floorPlanId,
        number,
        shape,
        capacity,
        positionX,
        positionY,
        width: width || defaultWidth,
        height: height || defaultHeight,
        rotation,
        status: 'available',
        section: section || 'Salle Principale',
        isVip,
        isAccessible,
        isCombineable,
        createdAt: new Date(),
      };
      
      if (!demoTablesStore[floorPlanId]) {
        demoTablesStore[floorPlanId] = [];
      }
      demoTablesStore[floorPlanId].push(newTable);
      
      return NextResponse.json({
        success: true,
        table: newTable,
        demo: true,
      });
    }

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
    const { id: floorPlanId } = await params;
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get('demo') === 'true';

    // Demo mode
    if (demo || floorPlanId.startsWith('demo-')) {
      const demoTables = getDemoTablesForFloorPlan(floorPlanId);
      return NextResponse.json({
        success: true,
        tables: demoTables,
        demo: true,
      });
    }

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
      demo: false,
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
    const { tables, demo = false } = body;

    if (!Array.isArray(tables)) {
      return NextResponse.json(
        { success: false, error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Demo mode
    if (demo || floorPlanId.startsWith('demo-')) {
      demoTablesStore[floorPlanId] = tables;
      return NextResponse.json({
        success: true,
        message: 'Tables mises à jour avec succès',
        demo: true,
      });
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

// Helper function for demo tables
function getDemoTablesForFloorPlan(floorPlanId: string) {
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
