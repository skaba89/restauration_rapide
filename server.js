/**
 * Custom server entry point for Render deployment
 * This ensures the server binds to the correct host and port
 */

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

// Path to the standalone server directory
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

// Check if standalone server exists
if (fs.existsSync(standaloneServer)) {
  console.log('✅ Starting Next.js standalone server...');
  
  // Change working directory to standalone folder
  // This is required because the standalone server expects to run from its own directory
  process.chdir(standaloneDir);
  
  // Update __dirname to reflect new working directory
  // This ensures all relative paths work correctly
  
  // Now require the standalone server
  // The standalone server will handle everything from here
  require(standaloneServer);
} else {
  console.error('❌ Standalone server not found!');
  console.error('Expected path:', standaloneServer);
  console.error('');
  console.error('Make sure the build completed successfully with output: "standalone" in next.config.ts');
  process.exit(1);
}
