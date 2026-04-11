import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🔧 Fixing user passwords...');
  
  // Update admin password
  const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  await prisma.user.update({
    where: { email: 'admin@restaurant-os.com' },
    data: { passwordHash: adminPassword },
  });
  console.log('✅ Admin password fixed');
  
  // Update all customer passwords
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
  });
  
  const customerPassword = await bcrypt.hash('Customer123!', SALT_ROUNDS);
  
  for (const customer of customers) {
    await prisma.user.update({
      where: { id: customer.id },
      data: { passwordHash: customerPassword },
    });
  }
  console.log(`✅ ${customers.length} customer passwords fixed`);
  
  // Verify
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@restaurant-os.com' },
  });
  
  if (admin) {
    const isValid = await bcrypt.compare('Admin123!', admin.passwordHash);
    console.log(`🔐 Admin password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
