import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// GET - Get real-time table status for a floor plan
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

    // Real database query - get all tables with their current status
    const tables = await db.table.findMany({
      where: {
        floorPlanId,
        isActive: true,
      },
      select: {
        id: true,
        number: true,
        status: true,
        currentPartySize: true,
        serverId: true,
        server: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        currentReservationId: true,
        updatedAt: true,
      },
    });

    // Get today's reservations for reserved tables
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reservations = await db.tableReservation.findMany({
      where: {
        tableId: { in: tables.map(t => t.id) },
        date: today,
        status: 'reserved',
      },
      select: {
        tableId: true,
        time: true,
        reservation: {
          select: {
            guestName: true,
            partySize: true,
          },
        },
      },
    });

    // Build status map
    const tableStatus = tables.map(table => {
      const reservation = reservations.find(r => r.tableId === table.id);
      
      return {
        id: table.id,
        number: table.number,
        status: table.status.toLowerCase(),
        currentPartySize: table.currentPartySize,
        serverId: table.serverId,
        serverName: table.server?.user 
          ? `${table.server.user.firstName} ${table.server.user.lastName}`
          : undefined,
        reservation: reservation ? {
          time: reservation.time,
          guestName: reservation.reservation.guestName,
          partySize: reservation.reservation.partySize,
        } : undefined,
        updatedAt: table.updatedAt,
      };
    });

    // Calculate summary stats
    const stats = {
      total: tables.length,
      available: tables.filter(t => t.status === 'AVAILABLE').length,
      occupied: tables.filter(t => t.status === 'OCCUPIED').length,
      reserved: tables.filter(t => t.status === 'RESERVED').length,
      cleaning: tables.filter(t => t.status === 'DIRTY').length,
      totalGuests: tables.reduce((sum, t) => sum + (t.currentPartySize || 0), 0),
    };

    return NextResponse.json({
      success: true,
      status: tableStatus,
      stats,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error fetching table status:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du statut des tables' },
      { status: 500 }
    );
  }
}

// POST - Update table status (for real-time updates)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: floorPlanId } = await params;
    const body = await request.json();
    const { 
      tableId, 
      status, 
      currentPartySize,
      serverId,
    } = body;

    // Real database update
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status.toUpperCase();
    if (currentPartySize !== undefined) updateData.currentPartySize = currentPartySize;
    if (serverId !== undefined) updateData.serverId = serverId;

    // If setting to available or cleaning, clear party size and server
    if (status === 'available' || status === 'cleaning') {
      updateData.currentPartySize = null;
      updateData.serverId = null;
    }

    // If setting to occupied, set default party size
    if (status === 'occupied' && !currentPartySize) {
      const table = await db.table.findUnique({
        where: { id: tableId },
        select: { capacity: true },
      });
      updateData.currentPartySize = table?.capacity || 4;
    }

    const table = await db.table.update({
      where: { id: tableId },
      data: updateData,
    });

    // Broadcast update via WebSocket if available
    // This would integrate with the existing WebSocket system

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        status: table.status.toLowerCase(),
        currentPartySize: table.currentPartySize,
        serverId: table.serverId,
        updatedAt: table.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating table status:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du statut de la table' },
      { status: 500 }
    );
  }
}

