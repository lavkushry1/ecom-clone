// Simple test to check if Node.js and dependencies are working
const { execSync } = require('child_process');

console.log('Testing Node.js and project setup...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

try {
  console.log('\nChecking npm version...');
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log('NPM version:', npmVersion.trim());

  console.log('\nChecking if node_modules exists...');
  const fs = require('fs');
  const nodeModulesExists = fs.existsSync('./node_modules');
  console.log('node_modules exists:', nodeModulesExists);

  if (!nodeModulesExists) {
    console.log('\n❌ node_modules not found. Please run: npm install');
  } else {
    console.log('\n✅ Dependencies appear to be installed');
  }

  console.log('\nTesting Next.js import...');
  const next = require('next');
  console.log('✅ Next.js can be imported successfully');

} catch (error) {
  console.error('❌ Error:', error.message);
}
