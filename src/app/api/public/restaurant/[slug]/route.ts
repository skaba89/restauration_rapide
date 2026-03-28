// ============================================
// PUBLIC RESTAURANT API
// No authentication required
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RestaurantWithMenu {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  email: string | null;
  phone: string;
  website: string | null;
  address: string;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryFee: number;
  minOrderAmount: number;
  maxDeliveryRadius: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isOpen: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  organizationId: string;
  currencyId: string;
  menus: any[];
  deliveryZones: any[];
  hours: any[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch restaurant with all related data
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      include: {
        menus: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            categories: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                items: {
                  where: { isAvailable: true },
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    variants: {
                      orderBy: { sortOrder: 'asc' },
                    },
                    options: {
                      orderBy: { sortOrder: 'asc' },
                      include: {
                        values: {
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        deliveryZones: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        hours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    if (!restaurant.isActive) {
      return NextResponse.json(
        { success: false, error: 'Ce restaurant n\'est pas disponible' },
        { status: 403 }
      );
    }

    // Transform the data for the public API
    const publicData = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      phone: restaurant.phone,
      email: restaurant.email,
      website: restaurant.website,
      address: restaurant.address,
      city: restaurant.city,
      district: restaurant.district,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      deliveryFee: restaurant.deliveryFee,
      minOrderAmount: restaurant.minOrderAmount,
      maxDeliveryRadius: restaurant.maxDeliveryRadius,
      deliveryTime: restaurant.deliveryTime,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      isOpen: restaurant.isOpen,
      acceptsDelivery: restaurant.acceptsDelivery,
      acceptsTakeaway: restaurant.acceptsTakeaway,
      acceptsDineIn: restaurant.acceptsDineIn,
      currency: restaurant.currencyId,
      menus: restaurant.menus.map((menu) => ({
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        description: menu.description,
        menuType: menu.menuType,
        categories: menu.categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          icon: category.icon,
          items: category.items.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            image: item.image,
            price: item.price,
            discountPrice: item.discountPrice,
            isFeatured: item.isFeatured,
            isPopular: item.isPopular,
            isNew: item.isNew,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isHalal: item.isHalal,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy,
            spicyLevel: item.spicyLevel,
            prepTime: item.prepTime,
            calories: item.calories,
            rating: item.rating,
            reviewCount: item.reviewCount,
            variants: item.variants,
            options: item.options.map((opt) => ({
              id: opt.id,
              name: opt.name,
              required: opt.required,
              multiSelect: opt.multiSelect,
              maxSelect: opt.maxSelect,
              values: opt.values,
            })),
          })),
        })),
      })),
      deliveryZones: restaurant.deliveryZones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        description: zone.description,
        baseFee: zone.baseFee,
        perKmFee: zone.perKmFee,
        minOrder: zone.minOrder,
        minTime: zone.minTime,
        maxTime: zone.maxTime,
      })),
      hours: restaurant.hours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
        breakStart: hour.breakStart,
        breakEnd: hour.breakEnd,
      })),
    };

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error('Error fetching public restaurant:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement du restaurant' },
      { status: 500 }
    );
  }
}
