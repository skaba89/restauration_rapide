import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Types
interface DateAvailability {
  date: string;
  dayOfWeek: number;
  isAvailable: boolean;
  reason: string | null;
  existingEvents: number;
  maxCapacity: number;
  currentLoad: number;
}

// Demo booked dates (busy dates in the next 60 days)
const generateDemoBookedDates = (): Set<string> => {
  const booked = new Set<string>();
  const today = new Date();
  
  // Book some random dates in the next 60 days
  const busyDays = [3, 5, 7, 14, 15, 21, 22, 28, 35, 42, 45, 50];
  
  busyDays.forEach(daysFromNow => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromNow);
    const dateStr = date.toISOString().split('T')[0];
    booked.add(dateStr);
  });
  
  return booked;
};

const DEMO_BOOKED_DATES = generateDemoBookedDates();

// GET - Check availability
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const date = searchParams.get('date');
  const guestCount = parseInt(searchParams.get('guestCount') || '50');

  // If checking a single date
  if (date) {
    const isBooked = DEMO_BOOKED_DATES.has(date);
    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay();

    // Weekend premium
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const availability: DateAvailability = {
      date,
      dayOfWeek,
      isAvailable: !isBooked,
      reason: isBooked ? 'Date déjà réservée' : null,
      existingEvents: isBooked ? 1 : 0,
      maxCapacity: 500,
      currentLoad: isBooked ? 150 : 0
    };

    // Calculate pricing for this date
    const basePrice = 35000; // Base price per person
    const weekendPremium = isWeekend ? 1.15 : 1; // 15% weekend premium
    
    const pricing = {
      basePricePerPerson: basePrice,
      weekendPremium: isWeekend ? 0.15 : 0,
      finalPricePerPerson: Math.round(basePrice * weekendPremium),
      totalPrice: Math.round(basePrice * weekendPremium * guestCount),
      depositAmount: Math.round(basePrice * weekendPremium * guestCount * 0.3) // 30% deposit
    };

    return NextResponse.json({
      success: true,
      availability,
      pricing,
      demo: true
    });
  }

  // If checking a date range
  if (!startDate || !endDate) {
    return NextResponse.json({
      success: false,
      error: 'Veuillez spécifier une date ou une plage de dates'
    }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const availability: DateAvailability[] = [];

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const isBooked = DEMO_BOOKED_DATES.has(dateStr);
    const dayOfWeek = current.getDay();

    availability.push({
      date: dateStr,
      dayOfWeek,
      isAvailable: !isBooked,
      reason: isBooked ? 'Date déjà réservée' : null,
      existingEvents: isBooked ? 1 : 0,
      maxCapacity: 500,
      currentLoad: isBooked ? 150 : 0
    });

    current.setDate(current.getDate() + 1);
  }

  // Calendar summary
  const summary = {
    totalDays: availability.length,
    availableDays: availability.filter(d => d.isAvailable).length,
    bookedDays: availability.filter(d => !d.isAvailable).length,
    weekends: availability.filter(d => d.dayOfWeek === 0 || d.dayOfWeek === 6).length,
    availableWeekends: availability.filter(d => (d.dayOfWeek === 0 || d.dayOfWeek === 6) && d.isAvailable).length
  };

  return NextResponse.json({
    success: true,
    availability,
    summary,
    demo: true
  });
});

// POST - Block/unblock dates (for admin)
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { dates, action, reason } = body;

  if (!dates || !Array.isArray(dates)) {
    return NextResponse.json({
      success: false,
      error: 'Liste de dates requise'
    }, { status: 400 });
  }

  // In a real implementation, this would update the database
  // For demo, we just return success

  return NextResponse.json({
    success: true,
    message: `${dates.length} date(s) ${action === 'block' ? 'bloquée(s)' : 'débloquée(s)'} avec succès`,
    affectedDates: dates
  });
});
