// ============================================
// Fix KFM DELICE Admin Password
// ============================================
import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

async function main() {
  console.log('🔧 Fixing KFM DELICE admin password...');
  
  const newPassword = 'KFM@Admin2024!';
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
  // Find the super admin
  const admin = await db.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });
  
  if (!admin) {
    console.log('❌ No SUPER_ADMIN found');
    return;
  }
  
  console.log(`📋 Found admin: ${admin.email}`);
  
  // Update password
  await db.user.update({
    where: { id: admin.id },
    data: { 
      passwordHash,
      isLocked: false,
      isActive: true,
    },
  });
  
  // Verify
  const updated = await db.user.findUnique({
    where: { id: admin.id },
  });
  
  if (updated) {
    const isValid = await bcrypt.compare(newPassword, updated.passwordHash);
    console.log(`🔐 Password verification: ${isValid ? 'SUCCESS ✅' : 'FAILED ❌'}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('               🔐 IDENTIFIANTS ADMIN CORRIGÉS                  ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  📧 Email:      ${admin.email}`);
  console.log(`  🔑 Mot de passe: ${newPassword}`);
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
