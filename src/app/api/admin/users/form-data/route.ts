import { NextResponse } from 'next/server';
import { fetchOrganizations, fetchRestaurants } from '@/lib/admin/service';

// GET /api/admin/users/form-data - Get organizations and restaurants for user creation form
export async function GET() {
  try {
    const [organizations, restaurants] = await Promise.all([
      fetchOrganizations({ limit: 100 }),
      fetchRestaurants({ limit: 100 }),
    ]);

    return NextResponse.json({
      organizations: organizations.data.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
      })),
      restaurants: restaurants.data.map(rest => ({
        id: rest.id,
        name: rest.name,
        organizationId: rest.organization.id,
        organizationName: rest.organization.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching form data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form data' },
      { status: 500 }
    );
  }
}
