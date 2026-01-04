#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

try {
  console.log('🔨 Building for GitHub Pages...\n');

  // TypeScript compilation
  console.log('1️⃣  Compiling TypeScript...');
  execSync('tsc', { stdio: 'inherit', cwd: projectRoot });

  // Vite build
  console.log('2️⃣  Building app with Vite...');
  execSync('GITHUB_PAGES=true vite build', { stdio: 'inherit', cwd: projectRoot });

  // Copy index.html to 404.html for GitHub Pages routing
  console.log('3️⃣  Setting up GitHub Pages routing...');
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  fs.copyFileSync(indexPath, notFoundPath);
  console.log(`   ✓ Created ${notFoundPath}`);

  // Build storybook
  console.log('4️⃣  Building Storybook...');
  execSync('GITHUB_PAGES=true storybook build -o dist/storybook', {
    stdio: 'inherit',
    cwd: projectRoot,
  });

  console.log('\n✅ GitHub Pages build complete!');
  console.log(`   • Game: /iota-board-game/`);
  console.log(`   • Storybook: /iota-board-game/storybook/\n`);
} catch (error) {
  console.error('\n❌ Build failed');
  process.exit(1);
}
