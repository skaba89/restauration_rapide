// Menu Items Management API - Uses Prisma Database (SimpleMenuItem)
// This is the SAME data source as the public menu API for synchronization
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// GET - Fetch all menu items for admin
export async function GET() {
  try {
    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
        data: [],
      }, { status: 503 });
    }

    // Fetch from database
    const items = await db.simpleMenuItem.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Transform to match expected format
    const menuItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      costPrice: item.costPrice,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
      isPopular: item.isPopular,
      isNew: item.isNew,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      image: item.image,
      orderCount: item.orderCount,
    }));

    return NextResponse.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement du menu',
      data: [],
    }, { status: 500 });
  }
}

// POST - Create new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, price, costPrice, preparationTime, isAvailable, allergens, image, isPopular, isNew } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le prix sont requis' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    // Create in database
    const newItem = await db.simpleMenuItem.create({
      data: {
        name,
        description: description || '',
        category: category || 'Plats',
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        isAvailable: isAvailable !== false,
        preparationTime: parseInt(preparationTime) || 15,
        isPopular: isPopular || false,
        isNew: isNew || false,
        allergens: allergens && allergens.length > 0 ? JSON.stringify(allergens) : null,
        image: image || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newItem.id,
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        price: newItem.price,
        costPrice: newItem.costPrice,
        isAvailable: newItem.isAvailable,
        preparationTime: newItem.preparationTime,
        isPopular: newItem.isPopular,
        isNew: newItem.isNew,
        allergens: newItem.allergens ? JSON.parse(newItem.allergens) : [],
        image: newItem.image,
        orderCount: newItem.orderCount,
      },
      message: 'Article créé avec succès',
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

// PATCH - Update menu item
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID est requis' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    // Prepare update data
    const prismaUpdateData: any = {};
    
    if (updateData.name !== undefined) prismaUpdateData.name = updateData.name;
    if (updateData.description !== undefined) prismaUpdateData.description = updateData.description;
    if (updateData.category !== undefined) prismaUpdateData.category = updateData.category;
    if (updateData.price !== undefined) prismaUpdateData.price = parseFloat(updateData.price);
    if (updateData.costPrice !== undefined) prismaUpdateData.costPrice = parseFloat(updateData.costPrice);
    if (updateData.isAvailable !== undefined) prismaUpdateData.isAvailable = updateData.isAvailable;
    if (updateData.isPopular !== undefined) prismaUpdateData.isPopular = updateData.isPopular;
    if (updateData.isNew !== undefined) prismaUpdateData.isNew = updateData.isNew;
    if (updateData.preparationTime !== undefined) prismaUpdateData.preparationTime = parseInt(updateData.preparationTime);
    if (updateData.image !== undefined) prismaUpdateData.image = updateData.image;
    if (updateData.allergens !== undefined) {
      prismaUpdateData.allergens = updateData.allergens && updateData.allergens.length > 0 
        ? JSON.stringify(updateData.allergens) 
        : null;
    }

    // Update in database
    const updatedItem = await db.simpleMenuItem.update({
      where: { id },
      data: prismaUpdateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        category: updatedItem.category,
        price: updatedItem.price,
        costPrice: updatedItem.costPrice,
        isAvailable: updatedItem.isAvailable,
        preparationTime: updatedItem.preparationTime,
        isPopular: updatedItem.isPopular,
        isNew: updatedItem.isNew,
        allergens: updatedItem.allergens ? JSON.parse(updatedItem.allergens) : [],
        image: updatedItem.image,
        orderCount: updatedItem.orderCount,
      },
      message: 'Article mis à jour',
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID est requis' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
      }, { status: 503 });
    }

    // Delete from database
    await db.simpleMenuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Article supprimé',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
