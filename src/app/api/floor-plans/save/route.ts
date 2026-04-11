// Floor Plans Save API - Save table positions and layout
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// POST /api/floor-plans/save - Save table positions
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { tables, restaurantId } = body;

    if (!tables || !Array.isArray(tables)) {
      return apiError('Tables data is required');
    }

    // Update each table's position
    const updatePromises = tables.map((table: any) => {
      if (table.id && !table.id.startsWith('demo-')) {
        return db.table.update({
          where: { id: table.id },
          data: {
            positionX: table.positionX,
            positionY: table.positionY,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
          },
        });
      }
      return Promise.resolve(null);
    });

    await Promise.all(updatePromises);

    return apiSuccess({ 
      success: true, 
      updated: tables.length 
    }, 'Plan de salle sauvegardé avec succès');
  });
}
