#!/usr/bin/env node
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const storybookDir = path.join(__dirname, '../storybook-static');
const port = 8080;

const server = http.createServer((req, res) => {
  // Remove trailing slash for consistency (except root)
  let urlPath = req.url.split('?')[0];
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  let filePath;
  let baseDir;

  // Check if it's a storybook route
  if (urlPath.includes('/storybook')) {
    baseDir = storybookDir;
    // Map /iota-board-game/storybook/... to storybook-static/...
    const storyPath = urlPath.replace('/iota-board-game/storybook', '');
    filePath = path.join(storybookDir, storyPath);
  } else {
    baseDir = distDir;
    // Map /iota-board-game/... to dist/...
    filePath = path.join(distDir, urlPath.replace('/iota-board-game', ''));
  }

  // If it's a directory or doesn't exist, try index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(baseDir, 'index.html');
  }

  // If file doesn't exist, serve 404.html (like GitHub Pages)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(baseDir, '404.html');
  }

  // Determine content type
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
  };
  const contentType = contentTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading file');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`\n✅ Testing GitHub Pages locally at: http://localhost:${port}/iota-board-game/\n`);
  console.log('Test these routes:');
  console.log(`  - http://localhost:${port}/iota-board-game/ (Game app)`);
  console.log(`  - http://localhost:${port}/iota-board-game/storybook/ (Storybook)`);
  console.log(`  - http://localhost:${port}/iota-board-game/nonexistent/ (Game app 404 redirect)`);
  console.log('\nPress Ctrl+C to stop the server\n');
});
