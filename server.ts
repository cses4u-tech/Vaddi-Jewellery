import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './src/server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer(async (req, res) => {
  const reqUrl = req.url || '/';

  // 1. API routes
  if (reqUrl.startsWith('/api')) {
    try {
      const handled = await handleApiRequest(req, res);
      if (handled) return;
    } catch (err) {
      console.error('API Server Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
      return;
    }
  }

  // 2. Static files from dist/
  const urlPath = reqUrl.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 3. SPA Fallback to index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`VADDI Jewellery production server running on port ${PORT}`);
});
