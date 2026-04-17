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
  // Clean up any previous incomplete build
  if (fs.existsSync('.next/standalone')) {
    console.log('\n🧹 Cleaning up previous standalone build...');
    execSync('rm -rf .next/standalone', { stdio: 'inherit' });
  }

  // Generate Prisma client
  console.log('\n📦 Generating Prisma client...');
  execSync(`npx prisma generate --schema=${targetSchemaPath}`, { stdio: 'inherit' });

  // Push database schema (create/update tables) in production
  if (isProduction && process.env.DATABASE_URL) {
    console.log('\n🗄️ Syncing database schema (prisma db push)...');
    try {
      execSync(`npx prisma db push --schema=${targetSchemaPath} --accept-data-loss`, { 
        stdio: 'inherit',
        timeout: 120000, // 2 min timeout for DB sync
      });
      console.log('✅ Database schema synced successfully');
    } catch (dbError) {
      console.error('⚠️ Database schema sync failed:', dbError.message);
      console.error('Tables may not exist. The app will retry at startup.');
    }
  } else {
    console.log('\n⏭️ Skipping database schema sync (not production or no DATABASE_URL)');
  }

  // Build Next.js
  console.log('\n🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  // Verify standalone was created
  if (!fs.existsSync('.next/standalone/server.js')) {
    throw new Error('Standalone server.js was not generated! Check next.config.ts has output: "standalone"');
  }
  console.log('✅ Standalone server.js generated successfully');

  // Copy static files and public folder for standalone
  console.log('\n📂 Preparing standalone server...');
  
  // Ensure directories exist
  if (!fs.existsSync('.next/standalone/.next')) {
    fs.mkdirSync('.next/standalone/.next', { recursive: true });
  }
  
  // Copy static files
  if (fs.existsSync('.next/static')) {
    execSync('cp -r .next/static .next/standalone/.next/', { stdio: 'inherit' });
  }
  
  // Copy public folder
  if (fs.existsSync('public')) {
    execSync('cp -r public .next/standalone/', { stdio: 'inherit' });
  }

  // Copy Prisma client to standalone
  console.log('\n📦 Copying Prisma to standalone...');
  
  const prismaTargetDirs = [
    '.next/standalone/node_modules/.prisma',
    '.next/standalone/node_modules/@prisma',
    '.next/standalone/node_modules/prisma',
  ];
  
  prismaTargetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Copy .prisma/client
  if (fs.existsSync('node_modules/.prisma/client')) {
    execSync('cp -r node_modules/.prisma/client .next/standalone/node_modules/.prisma/', { stdio: 'inherit' });
  }
  
  // Copy @prisma/client
  if (fs.existsSync('node_modules/@prisma/client')) {
    execSync('cp -r node_modules/@prisma/client .next/standalone/node_modules/@prisma/', { stdio: 'inherit' });
  }
  
  // Copy prisma CLI (optional, for migrations)
  if (fs.existsSync('node_modules/prisma')) {
    execSync('cp -r node_modules/prisma .next/standalone/node_modules/', { stdio: 'inherit' });
  }

  // Copy bcryptjs to standalone (CRITICAL for auth)
  console.log('\n📦 Copying bcryptjs to standalone...');
  
  if (fs.existsSync('node_modules/bcryptjs')) {
    if (!fs.existsSync('.next/standalone/node_modules/bcryptjs')) {
      fs.mkdirSync('.next/standalone/node_modules/bcryptjs', { recursive: true });
    }
    execSync('cp -r node_modules/bcryptjs/* .next/standalone/node_modules/bcryptjs/', { stdio: 'inherit' });
    console.log('  ✓ bcryptjs copied successfully');
  } else {
    console.warn('  ⚠️ bcryptjs not found in node_modules');
  }

  // Copy additional runtime dependencies
  console.log('\n📦 Copying additional dependencies...');
  
  const additionalDeps = [
    'bcryptjs',
    '@prisma/client',
    '@prisma/engines',
    'prisma',
    'decimal.js',
    '@panva/asn1.js',
    'dotenv',
  ];
  
  additionalDeps.forEach(pkg => {
    const pkgPath = `node_modules/${pkg}`;
    const targetPath = `.next/standalone/node_modules/${pkg}`;
    
    if (fs.existsSync(pkgPath) && !fs.existsSync(targetPath)) {
      console.log(`  Copying ${pkg}...`);
      try {
        execSync(`mkdir -p ${path.dirname(targetPath)}`, { stdio: 'pipe' });
        execSync(`cp -r ${pkgPath} ${targetPath}`, { stdio: 'pipe' });
        console.log(`  ✓ ${pkg} copied`);
      } catch (e) {
        console.warn(`  ⚠️ Failed to copy ${pkg}: ${e.message}`);
      }
    }
  });

  // Copy schema to standalone
  console.log('\n📦 Copying Prisma schema...');
  if (!fs.existsSync('.next/standalone/prisma')) {
    fs.mkdirSync('.next/standalone/prisma', { recursive: true });
  }
  execSync(`cp ${targetSchemaPath} .next/standalone/prisma/schema.prisma`, { stdio: 'inherit' });

  // Copy the production schema with correct name
  if (isProduction && fs.existsSync(schemaPath)) {
    execSync(`cp ${schemaPath} .next/standalone/prisma/schema.production.prisma`, { stdio: 'inherit' });
  }

  // NOTE: Do NOT copy server.js to standalone - Next.js generates its own server.js
  // We use the root server.js to properly start the standalone server

  // Create a package.json for the standalone folder
  console.log('\n📦 Creating standalone package.json...');
  const standalonePkg = {
    name: 'kfm-delice-standalone',
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'node server.js'
    }
  };
  fs.writeFileSync('.next/standalone/package.json', JSON.stringify(standalonePkg, null, 2));

  console.log('\n✅ Build completed successfully!');
  console.log('\n📋 Build summary:');
  console.log('  - Next.js standalone build created');
  console.log('  - Static files copied');
  console.log('  - Prisma client copied');
  console.log('  - bcryptjs copied (for auth)');
  console.log('  - Schema files copied');
  
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
