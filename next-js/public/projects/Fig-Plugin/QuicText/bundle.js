#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outputFile = path.join(__dirname, 'code.ts');

// Files to bundle in order (dependencies first)
const files = [
  'types.ts',
  'config.ts',
  'utils.ts',
  'storage.ts',
  'license.ts',
  'text-processing.ts',
  'main.ts'
];

let bundledContent = `// ==================== BUNDLED FIGMA PLUGIN ====================\n\n`;

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove import statements
    content = content.replace(/^import\s+.*from\s+['"`].*['"`];?$/gm, '');
    content = content.replace(/^import\s+['"`].*['"`];?$/gm, '');

    // Remove export statements but keep the declarations
    content = content.replace(/^export\s+(const|function|async function|class)\s+/gm, '$1 ');
    content = content.replace(/^export\s+(interface|type)\s+/gm, '$1 ');

    // Remove export default statements
    content = content.replace(/^export\s+default\s+/gm, '');

    bundledContent += `// ==================== ${file.toUpperCase()} ====================\n\n`;
    bundledContent += content;
    bundledContent += '\n\n';
  } else {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
});

// Write the bundled content to code.ts
fs.writeFileSync(outputFile, bundledContent);
console.log('✅ Plugin bundled successfully into code.ts');