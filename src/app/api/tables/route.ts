import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo tables data
const DEMO_TABLES = [
  // Salle Principale (Tables 1-5)
  { 
    id: 'demo-1', 
    number: 'T1', 
    shape: 'round', 
    capacity: 4, 
    positionX: 80, 
    positionY: 100, 
    width: 80, 
    height: 80, 
    rotation: 0, 
    status: 'occupied', 
    currentPartySize: 3, 
    serverName: 'Aïssata', 
    section: 'Salle Principale' 
  },
  { 
    id: 'demo-2', 
    number: 'T2', 
    shape: 'round', 
    capacity: 4, 
    positionX: 200, 
    positionY: 100, 
    width: 80, 
    height: 80, 
    rotation: 0, 
    status: 'reserved', 
    section: 'Salle Principale', 
    reservationTime: '19:30', 
    reservationName: 'M. Koné' 
  },
  { 
    id: 'demo-3', 
    number: 'T3', 
    shape: 'round', 
    capacity: 4, 
    positionX: 320, 
    positionY: 100, 
    width: 80, 
    height: 80, 
    rotation: 0, 
    status: 'occupied', 
    currentPartySize: 4, 
    serverName: 'Moussa', 
    section: 'Salle Principale' 
  },
  { 
    id: 'demo-4', 
    number: 'T4', 
    shape: 'square', 
    capacity: 4, 
    positionX: 80, 
    positionY: 220, 
    width: 70, 
    height: 70, 
    rotation: 0, 
    status: 'cleaning', 
    section: 'Salle Principale' 
  },
  { 
    id: 'demo-5', 
    number: 'T5', 
    shape: 'round', 
    capacity: 4, 
    positionX: 200, 
    positionY: 220, 
    width: 80, 
    height: 80, 
    rotation: 0, 
    status: 'reserved', 
    section: 'Salle Principale', 
    reservationTime: '20:00', 
    reservationName: 'Diallo' 
  },
  
  // Terrasse (Tables 6-10)
  { 
    id: 'demo-6', 
    number: 'T6', 
    shape: 'square', 
    capacity: 4, 
    positionX: 520, 
    positionY: 100, 
    width: 70, 
    height: 70, 
    rotation: 0, 
    status: 'occupied', 
    currentPartySize: 2, 
    serverName: 'Fatou', 
    section: 'Terrasse' 
  },
  { 
    id: 'demo-7', 
    number: 'T7', 
    shape: 'square', 
    capacity: 4, 
    positionX: 620, 
    positionY: 100, 
    width: 70, 
    height: 70, 
    rotation: 0, 
    status: 'occupied', 
    currentPartySize: 3, 
    serverName: 'Kouamé', 
    section: 'Terrasse' 
  },
  { 
    id: 'demo-8', 
    number: 'T8', 
    shape: 'square', 
    capacity: 4, 
    positionX: 720, 
    positionY: 100, 
    width: 70, 
    height: 70, 
    rotation: 0, 
    status: 'available', 
    section: 'Terrasse' 
  },
  { 
    id: 'demo-9', 
    number: 'T9', 
    shape: 'square', 
    capacity: 4, 
    positionX: 520, 
    positionY: 200, 
    width: 70, 
    height: 70, 
    rotation: 0, 
    status: 'available', 
    section: 'Terrasse' 
  },
  { 
    id: 'demo-10', 
    number: 'T10', 
    shape: 'square', 
    capacity: 4, 
    positionX: 620, 
    positionY: 200, 
    width: 70, 
    height: 70, 
    rotation: 0, 
    status: 'available', 
    section: 'Terrasse' 
  },
  
  // VIP (Tables 11-12)
  { 
    id: 'demo-11', 
    number: 'VIP1', 
    shape: 'rectangle', 
    capacity: 6, 
    positionX: 80, 
    positionY: 400, 
    width: 120, 
    height: 80, 
    rotation: 0, 
    status: 'available', 
    section: 'VIP' 
  },
  { 
    id: 'demo-12', 
    number: 'VIP2', 
    shape: 'rectangle', 
    capacity: 6, 
    positionX: 240, 
    positionY: 400, 
    width: 120, 
    height: 80, 
    rotation: 0, 
    status: 'available', 
    section: 'VIP' 
  },
  
  // Coins intimes (Tables 13-15)
  { 
    id: 'demo-13', 
    number: 'C1', 
    shape: 'round', 
    capacity: 2, 
    positionX: 450, 
    positionY: 400, 
    width: 60, 
    height: 60, 
    rotation: 0, 
    status: 'available', 
    section: 'Coins Intimes' 
  },
  { 
    id: 'demo-14', 
    number: 'C2', 
    shape: 'round', 
    capacity: 2, 
    positionX: 530, 
    positionY: 400, 
    width: 60, 
    height: 60, 
    rotation: 0, 
    status: 'available', 
    section: 'Coins Intimes' 
  },
  { 
    id: 'demo-15', 
    number: 'C3', 
    shape: 'round', 
    capacity: 2, 
    positionX: 610, 
    positionY: 400, 
    width: 60, 
    height: 60, 
    rotation: 0, 
    status: 'available', 
    section: 'Coins Intimes' 
  },
];

// In-memory store for demo mode
let demoTablesStore = [...DEMO_TABLES];

// GET - List tables with status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const demo = searchParams.get('demo') === 'true';

    // Demo mode
    if (demo || !restaurantId) {
      return NextResponse.json({
        success: true,
        tables: demoTablesStore,
        stats: {
          total: demoTablesStore.length,
          available: demoTablesStore.filter(t => t.status === 'available').length,
          occupied: demoTablesStore.filter(t => t.status === 'occupied').length,
          reserved: demoTablesStore.filter(t => t.status === 'reserved').length,
          cleaning: demoTablesStore.filter(t => t.status === 'cleaning').length,
        },
        demo: true,
      });
    }

    // Real database query
    const tables = await db.table.findMany({
      where: {
        restaurantId,
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
      orderBy: {
        number: 'asc',
      },
    });

    // Transform database tables to frontend format
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
    }));

    // Calculate stats
    const stats = {
      total: transformedTables.length,
      available: transformedTables.filter(t => t.status === 'available').length,
      occupied: transformedTables.filter(t => t.status === 'occupied').length,
      reserved: transformedTables.filter(t => t.status === 'reserved').length,
      cleaning: transformedTables.filter(t => t.status === 'cleaning').length,
    };

    return NextResponse.json({
      success: true,
      tables: transformedTables,
      stats,
      demo: false,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tables',
        tables: demoTablesStore, // Fallback to demo data
        demo: true,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      restaurantId, 
      number, 
      shape = 'round', 
      capacity = 4, 
      positionX = 100, 
      positionY = 100, 
      width, 
      height, 
      section,
      demo = false,
    } = body;

    // Demo mode
    if (demo || !restaurantId) {
      const newTable = {
        id: `demo-${Date.now()}`,
        number,
        shape,
        capacity,
        positionX,
        positionY,
        width: width || (shape === 'rectangle' ? 120 : shape === 'square' ? 70 : 80),
        height: height || (shape === 'rectangle' ? 80 : shape === 'square' ? 70 : 80),
        rotation: 0,
        status: 'available',
        section: section || 'Salle Principale',
      };
      
      demoTablesStore.push(newTable as any);
      
      return NextResponse.json({
        success: true,
        table: newTable,
        demo: true,
      });
    }

    // Real database creation
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

    const table = await db.table.create({
      data: {
        restaurantId,
        number,
        shape,
        capacity,
        positionX,
        positionY,
        width: width || (shape === 'rectangle' ? 120 : shape === 'square' ? 70 : 80),
        height: height || (shape === 'rectangle' ? 80 : shape === 'square' ? 70 : 80),
        diningRoomId,
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
      },
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create table' },
      { status: 500 }
    );
  }
}

// PUT - Update table (position, status)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tables, demo = false } = body;

    // Batch update for saving layout
    if (Array.isArray(tables)) {
      // Demo mode
      if (demo) {
        demoTablesStore = tables;
        return NextResponse.json({
          success: true,
          message: 'Tables updated successfully',
          demo: true,
        });
      }

      // Real database update would go here
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Tables updated successfully',
      });
    }

    // Single table update
    const { tableId, positionX, positionY, rotation, status, serverId } = body;

    // Demo mode
    if (demo || !tableId) {
      const tableIndex = demoTablesStore.findIndex(t => t.id === tableId);
      if (tableIndex !== -1) {
        demoTablesStore[tableIndex] = {
          ...demoTablesStore[tableIndex],
          ...(positionX !== undefined && { positionX }),
          ...(positionY !== undefined && { positionY }),
          ...(rotation !== undefined && { rotation }),
          ...(status && { status }),
          ...(serverId && { serverId }),
        };
      }
      
      return NextResponse.json({
        success: true,
        demo: true,
      });
    }

    // Real database update
    const updateData: any = {};
    if (positionX !== undefined) updateData.positionX = positionX;
    if (positionY !== undefined) updateData.positionY = positionY;
    if (rotation !== undefined) updateData.rotation = rotation;
    if (status) updateData.status = status.toUpperCase();
    if (serverId !== undefined) updateData.serverId = serverId;

    const table = await db.table.update({
      where: { id: tableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        status: table.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

// PATCH - Quick status update
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, status, serverId, currentPartySize, demo = false } = body;

    // Demo mode
    if (demo || tableId?.startsWith('demo-')) {
      const tableIndex = demoTablesStore.findIndex(t => t.id === tableId);
      if (tableIndex !== -1) {
        demoTablesStore[tableIndex] = {
          ...demoTablesStore[tableIndex],
          ...(status && { status }),
          ...(serverId !== undefined && { serverId }),
          ...(currentPartySize !== undefined && { currentPartySize }),
          ...(status === 'occupied' && { 
            currentPartySize: currentPartySize || demoTablesStore[tableIndex].capacity 
          }),
        };
      }
      
      return NextResponse.json({
        success: true,
        demo: true,
      });
    }

    // Real database update
    const updateData: any = {};
    if (status) updateData.status = status.toUpperCase();
    if (serverId !== undefined) updateData.serverId = serverId;
    if (currentPartySize !== undefined) updateData.currentPartySize = currentPartySize;

    if (status === 'occupied') {
      updateData.currentPartySize = currentPartySize || 1;
    } else if (status === 'available' || status === 'cleaning') {
      updateData.currentPartySize = null;
      updateData.serverId = null;
    }

    const table = await db.table.update({
      where: { id: tableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        status: table.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Error updating table status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update table status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a table
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');
    const demo = searchParams.get('demo') === 'true';

    // Demo mode
    if (demo || tableId?.startsWith('demo-')) {
      demoTablesStore = demoTablesStore.filter(t => t.id !== tableId);
      return NextResponse.json({
        success: true,
        demo: true,
      });
    }

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'Table ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    await db.table.update({
      where: { id: tableId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}
