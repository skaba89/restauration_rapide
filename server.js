/**
 * Custom server entry point for Render deployment
 * This ensures the server binds to the correct host and port
 */

// Set hostname to 0.0.0.0 to accept connections from any interface
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

// Use Render's PORT or default to 10000
process.env.PORT = process.env.PORT || 10000;

console.log('==========================================');
console.log('🚀 KFM DELICE Server Starting...');
console.log(`📡 Host: ${process.env.HOSTNAME}`);
console.log(`🔌 Port: ${process.env.PORT}`);
console.log('==========================================');

// Import and run the Next.js standalone server
require('./.next/standalone/server.js');
