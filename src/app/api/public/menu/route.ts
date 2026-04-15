import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantSlug = searchParams.get("restaurantSlug");
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantSlug && !restaurantId) {
      return NextResponse.json(
        { error: "Restaurant slug or ID is required" },
        { status: 400 }
      );
    }

    // 1. Trouver le restaurant (Même logique que POS/Admin)
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        AND: [
          restaurantSlug ? { slug: restaurantSlug } : {},
          restaurantId ? { id: restaurantId } : {},
        ],
      },
      include: {
        organization: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // 2. Récupérer le menu complet avec les mêmes filtres que le POS
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
        active: true, // Seulement les catégories actives
      },
      include: {
        products: {
          where: {
            active: true, // Seulement les produits actifs
          },
          orderBy: {
            order: "asc",
          },
          include: {
            // Inclure les détails nécessaires (images, variantes, etc.)
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // 3. Formater la réponse exactement comme attendu par le frontend
    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        imageUrl: restaurant.imageUrl,
        currency: restaurant.currency || "GNF",
      },
      categories,
    });
  } catch (error) {
    console.error("Error fetching public menu:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}