#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read version from manifest.json
const manifestPath = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version;

// Define files and directories to exclude
const excludePatterns = [
  '*.git*',
  'node_modules/*',
  '*.zip',
  '.DS_Store',
  '.vscode/*',
  'scripts/*',
  'package.json',
  'package-lock.json',
  'PACKAGING.md',
  'TESTING_CHECKLIST.md'
];

// Build exclude arguments for zip command
const excludeArgs = excludePatterns.map(pattern => `-x "${pattern}"`).join(' ');

// Output filename
const outputFile = `annotateweb-v${version}.zip`;

console.log(`📦 Packaging AnnotateWeb v${version}...`);
console.log(`📁 Output: ${outputFile}`);

try {
  // Create zip file (works on Unix-like systems)
  const command = `zip -r ${outputFile} . ${excludeArgs}`;
  execSync(command, { stdio: 'inherit' });
  
  console.log(`✅ Successfully created ${outputFile}`);
  
  // Show file size
  const stats = fs.statSync(outputFile);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`📊 Package size: ${fileSizeInKB} KB`);
  
  console.log('\n🎉 Package ready for distribution!');
  console.log('📖 See PACKAGING.md for store submission instructions');
  
} catch (error) {
  console.error('❌ Error creating package:', error.message);
  console.log('\n💡 If you\'re on Windows, use PowerShell:');
  console.log(`   Compress-Archive -Path * -DestinationPath ${outputFile} -Force`);
  process.exit(1);
}