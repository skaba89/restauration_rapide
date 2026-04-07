import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    where: { slug: { contains: 'kfm' } },
    select: { id: true, name: true, slug: true, organizationId: true, menus: { select: { id: true, name: true } } }
  });
  console.log('Restaurants with kfm slug:', JSON.stringify(restaurants, null, 2));
  
  const menus = await prisma.menu.findMany({
    select: { id: true, name: true, restaurantId: true }
  });
  console.log('All menus count:', menus.length);
  console.log('Menus:', JSON.stringify(menus, null, 2));
}

main().finally(() => prisma.$disconnect());
