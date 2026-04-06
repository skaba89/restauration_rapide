import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete the restaurant without menus
  const result = await prisma.restaurant.delete({
    where: { id: 'cmnnri01c002st1ul2136vvpy' }
  });
  console.log('Deleted duplicate restaurant:', result.name);
  
  // Verify
  const restaurants = await prisma.restaurant.findMany({
    where: { slug: 'kfm-delice' },
    select: { id: true, name: true, slug: true, menus: { select: { id: true, name: true, categories: { select: { name: true, items: true } } } } }
  });
  console.log('Remaining restaurants:', JSON.stringify(restaurants, null, 2));
}

main().finally(() => prisma.$disconnect());
