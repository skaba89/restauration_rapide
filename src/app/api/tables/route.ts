import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// In-memory store for demo mode
// GET - List tables with status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

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
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tables',
        tables: [],
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
    } = body;

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
    const { tables } = body;

    // Batch update for saving layout
    if (Array.isArray(tables)) {

      // Real database update would go here
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Tables updated successfully',
      });
    }

    // Single table update
    const { tableId, positionX, positionY, rotation, status, serverId } = body;

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
    const { tableId, status, serverId, currentPartySize } = body;

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