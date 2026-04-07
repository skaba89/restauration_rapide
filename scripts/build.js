#!/usr/bin/env node
/**
 * KFM DELICE Build Script
 * Handles SQLite for development and PostgreSQL for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('postgresql');

console.log('==========================================');
console.log(`Building KFM DELICE (${isProduction ? 'PRODUCTION - PostgreSQL' : 'DEVELOPMENT - SQLite'})`);
console.log('==========================================');

// Determine which schema to use
const schemaPath = isProduction ? './prisma/schema.production.prisma' : './prisma/schema.prisma';

console.log(`Using schema: ${schemaPath}`);

// Copy the appropriate schema to schema.prisma for build
const targetSchemaPath = './prisma/schema.prisma';

// Backup original schema if in production
if (isProduction) {
  console.log('Backing up SQLite schema...');
  fs.copyFileSync(targetSchemaPath, './prisma/schema.sqlite.backup.prisma');

  console.log('Copying PostgreSQL schema for production build...');
  fs.copyFileSync(schemaPath, targetSchemaPath);
}

try {
  // Generate Prisma client
  console.log('\n📦 Generating Prisma client...');
  execSync(`npx prisma generate --schema=${targetSchemaPath}`, { stdio: 'inherit' });

  // Build Next.js
  console.log('\n🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  // Copy static files and public folder for standalone
  console.log('\n📂 Preparing standalone server...');
  execSync('cp -r .next/static .next/standalone/.next/', { stdio: 'inherit' });
  execSync('cp -r public .next/standalone/', { stdio: 'inherit' });

  // Copy Prisma client to standalone
  console.log('\n📦 Copying Prisma to standalone...');
  execSync('mkdir -p .next/standalone/node_modules/.prisma', { stdio: 'inherit' });
  execSync('mkdir -p .next/standalone/node_modules/@prisma', { stdio: 'inherit' });
  execSync('cp -r node_modules/.prisma/client .next/standalone/node_modules/.prisma/', { stdio: 'inherit' });
  execSync('cp -r node_modules/@prisma/client .next/standalone/node_modules/@prisma/', { stdio: 'inherit' });

  // Copy bcryptjs to standalone (required for auth)
  console.log('\n📦 Copying bcryptjs to standalone...');
  execSync('mkdir -p .next/standalone/node_modules/bcryptjs', { stdio: 'inherit' });
  if (fs.existsSync('node_modules/bcryptjs')) {
    execSync('cp -r node_modules/bcryptjs/* .next/standalone/node_modules/bcryptjs/', { stdio: 'inherit' });
  }

  // Copy schema to standalone
  execSync('mkdir -p .next/standalone/prisma', { stdio: 'inherit' });
  execSync(`cp ${targetSchemaPath} .next/standalone/prisma/schema.prisma`, { stdio: 'inherit' });

  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore original SQLite schema after production build
  if (isProduction && fs.existsSync('./prisma/schema.sqlite.backup.prisma')) {
    console.log('\n🔄 Restoring SQLite schema for local development...');
    fs.copyFileSync('./prisma/schema.sqlite.backup.prisma', targetSchemaPath);
    fs.unlinkSync('./prisma/schema.sqlite.backup.prisma');
  }
}

console.log('==========================================');
console.log('🚀 Ready for deployment!');
console.log('==========================================');
