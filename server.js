/**
 * Custom server entry point for Render deployment
 * This ensures the server binds to the correct host and port
 */

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Set hostname to 0.0.0.0 to accept connections from any interface
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

// Use Render's PORT or default to 10000
const PORT = process.env.PORT || 10000;
process.env.PORT = PORT;

console.log('==========================================');
console.log('🚀 KFM DELICE Server Starting...');
console.log(`📡 Host: ${process.env.HOSTNAME}`);
console.log(`🔌 Port: ${PORT}`);
console.log('==========================================');

// Check if standalone server exists
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standalonePath)) {
  console.log('✅ Found standalone server, starting...');
  // Change to standalone directory to ensure relative paths work
  process.chdir(path.join(__dirname, '.next', 'standalone'));
  // Require the standalone server
  require(standalonePath);
} else {
  console.log('⚠️ Standalone server not found, starting development server...');
  // Fallback to regular Next.js server
  const { createServer: createNextServer } = require('next/dist/server/lib/start-server');
  createNextServer({
    dir: __dirname,
    port: PORT,
    hostname: process.env.HOSTNAME,
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
