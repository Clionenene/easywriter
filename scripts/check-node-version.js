#!/usr/bin/env node

const [major, minor] = process.versions.node.split('.').map(Number);

const isSupported = major > 20 || (major === 20 && minor >= 0);

if (!isSupported) {
  console.error('\n❌ Unsupported Node.js version detected.');
  console.error(`Current: v${process.versions.node}`);
  console.error('Required: >= v20.0.0 (recommended: v20 LTS)\n');
  console.error('Please run:');
  console.error('  nvm install 20 && nvm use 20\n');
  process.exit(1);
}
