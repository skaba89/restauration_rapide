#!/usr/bin/env node
/**
 * Restaurant OS - VAPID Keys Generator
 * Generate keys for push notifications
 */

const { webpush } = require('web-push');
const fs = require('fs');
const path = require('path');

async function generateVapidKeys() {
  console.log('🔐 Generating VAPID keys for push notifications...\n');

  const vapidKeys = await webpush.generateVAPIDKeys();

  const envContent = `
# VAPID Keys for Push Notifications (Generated on ${new Date().toISOString().split('T')[0]})
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

  const envPath = path.join(__dirname, '..', '.env.vapid');
  fs.writeFileSync(envPath, envContent.trim());

  console.log('\n✅ VAPID keys generated successfully!');
  console.log('\nAdd these to your .env.production file:');
  console.log(`  NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey.substring(0, 50)}...`);
  console.log(`  VAPID_PRIVATE_KEY=${vapidKeys.privateKey.substring(0, 50)}...`);
  console.log('\nOr import from .env.vapid');
}

generateVapidKeys().catch(console.error);
