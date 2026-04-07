import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update table position
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tableId } = await params;
    const body = await request.json();
    const { 
      positionX, 
      positionY, 
      width, 
      height, 
      rotation,
      demo = false,
    } = body;

    // Demo mode
    if (demo || tableId.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        table: {
          id: tableId,
          positionX,
          positionY,
          width,
          height,
          rotation,
        },
        demo: true,
      });
    }

    // Real database update
    const updateData: Record<string, unknown> = {};
    if (positionX !== undefined) updateData.positionX = positionX;
    if (positionY !== undefined) updateData.positionY = positionY;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (rotation !== undefined) updateData.rotation = rotation;

    const table = await db.table.update({
      where: { id: tableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
        rotation: table.rotation,
      },
    });
  } catch (error) {
    console.error('Error updating table position:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la position de la table' },
      { status: 500 }
    );
  }
}
