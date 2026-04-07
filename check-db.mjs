import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if we can connect
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // List users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true }
    });
    console.log('👥 Users:', JSON.stringify(users, null, 2));
    
    // Check sessions
    const sessionCount = await prisma.session.count();
    console.log(`🔐 Sessions: ${sessionCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
