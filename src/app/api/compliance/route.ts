import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Helper function to determine temperature status
function getTemperatureStatus(temperature: number, equipmentType: string): 'normal' | 'warning' | 'critical' {
  if (equipmentType.includes('fridge') || equipmentType.includes('Frigo')) {
    if (temperature >= 0 && temperature <= 4) return 'normal';
    if (temperature > 4 && temperature <= 5) return 'warning';
    return 'critical';
  } else {
    // Freezer
    if (temperature <= -18) return 'normal';
    if (temperature > -18 && temperature <= -15) return 'warning';
    return 'critical';
  }
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // Real database implementation would go here
  return NextResponse.json({ success: true, data: [] });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { type, data } = body;

  const newId = `new-${Date.now()}`;

  switch (type) {
    case 'checklist':
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          createdAt: new Date().toISOString(),
        },
      });
    case 'temperature':
      const status = getTemperatureStatus(data.temperature, data.equipmentName || 'fridge');
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          status,
          recordedAt: new Date().toISOString(),
        },
      });
    case 'cleaning':
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          createdAt: new Date().toISOString(),
        },
      });
    case 'inspection':
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          createdAt: new Date().toISOString(),
        },
      });
    default:
      return NextResponse.json({ success: false, error: 'Type non supporté' }, { status: 400 });
  }
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, type, data } = body;

  return NextResponse.json({
    success: true,
    data: {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    },
  });
});