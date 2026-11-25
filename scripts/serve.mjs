import { createServer as httpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/src/app.js', ['src/app.js', 'text/javascript; charset=utf-8']],
  ['/src/domain.js', ['src/domain.js', 'text/javascript; charset=utf-8']],
  ['/src/demo-data.js', ['src/demo-data.js', 'text/javascript; charset=utf-8']],
  ['/src/styles.css', ['src/styles.css', 'text/css; charset=utf-8']]
]);

export function createServer() {
  return httpServer(async (request, response) => {
    const entry = files.get(request.url?.split('?')[0]);
    if (!entry || request.method !== 'GET') {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    try {
      const body = await readFile(join(root, entry[0]));
      response.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': 'no-store' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4175);
  createServer().listen(port, '127.0.0.1', () => {
    console.log(`客序 AI 演示地址：http://127.0.0.1:${port}`);
  });
}
