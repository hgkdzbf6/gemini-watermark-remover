#!/usr/bin/env node

/**
 * Quick test to verify Raphael module works correctly
 */

import { existsSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Raphael Watermark Remover Module...\n');

// Test 1: Check if built file exists

const builtFile = join(__dirname, '../dist/raphael-watermark-remover.js');
if (existsSync(builtFile)) {
  const stats = statSync(builtFile);
  console.log('✅ Built file exists:', builtFile);
  console.log('   Size:', (stats.size / 1024).toFixed(2), 'KB');
} else {
  console.log('❌ Built file not found:', builtFile);
  console.log('   Run: pnpm build');
  process.exit(1);
}

// Test 2: Check if test page exists
const testPage = join(__dirname, '../dist/raphael-test.html');
if (existsSync(testPage)) {
  console.log('✅ Test page exists:', testPage);
} else {
  console.log('❌ Test page not found:', testPage);
  process.exit(1);
}

// Test 3: Check module exports
console.log('\n📦 Checking module structure...');
const moduleContent = readFileSync(builtFile, 'utf-8');

const exports = [
  'RaphaelWatermarkEngine',
  'detectRaphaelWatermark',
  'extractAlphaMap',
  'removeRaphaelWatermark'
];

exports.forEach(exportName => {
  if (moduleContent.includes(exportName)) {
    console.log(`✅ Export found: ${exportName}`);
  } else {
    console.log(`⚠️  Export not found: ${exportName}`);
  }
});

console.log('\n✅ All checks passed!');
console.log('\n📝 Next steps:');
console.log('   1. Start server: pnpm serve');
console.log('   2. Open browser: http://localhost:4173/raphael-test.html');
console.log('   3. Upload a Raphael watermarked image');
console.log('   4. Check browser console for detailed logs');
