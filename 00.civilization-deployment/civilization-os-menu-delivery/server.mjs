import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROUTES = Object.freeze({
  '/business-menu': '03.business-os/os-menu',
  '/game-menu': '05.game-os/os-menu',
  '/streaming-menu': '06.streaming-os/os-menu',
  '/staticart-menu': '10.staticart-os/os-menu'
});
const REQUIRED_FILES = Object.freeze([
  'index.html',
  'menu.css',
  'menu.js',
  'menu-contract.json'
]);

const NEWLINE = String.fromCharCode(10);

const MIME = Object.freeze({
  'index.html': 'text/html; charset=utf-8',
  'menu.css': 'text/css; charset=utf-8',
  'menu.js': 'text/javascript; charset=utf-8',
  'menu-contract.json': 'application/json; charset=utf-8'
});

function reject(res, code) {
  const body = code === 405 ? 'Method Not Allowed\n' : 'Not Found\n';
  res.writeHead(code, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    ...(code === 405 ? { allow: 'GET, HEAD' } : {})
  });
  res.end(body);
}

export async function deliveryReady(
  directories = Object.values(ROUTES)
) {
  for (const directory of directories) {
    const base = path.resolve(ROOT, directory);
    let realBase;
    try {
      realBase = await realpath(base);
    } catch {
      return false;
    }
    for (const filename of REQUIRED_FILES) {
      try {
        const realFile = await realpath(
          path.join(base, filename)
        );
        if (
          path.dirname(realFile) !== realBase ||
          !(await stat(realFile)).isFile()
        ) {
          return false;
        }
      } catch {
        return false;
      }
    }
  }
  return true;
}

function respondHealth(req, res, status, message) {
  const body = Buffer.from(message + NEWLINE, 'utf8');
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': body.length,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

export function createServer({
  readinessDirectories = Object.values(ROUTES)
} = {}) {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      reject(res, 405);
      return;
    }
    const rawPath = (req.url || '/').split(/[?#]/, 1)[0];
    if (rawPath === '/healthz') {
      respondHealth(req, res, 200, 'ok');
      return;
    }
    if (rawPath === '/readyz') {
      const available = await deliveryReady(readinessDirectories);
      respondHealth(
        req,
        res,
        available ? 200 : 503,
        available ? 'ready' : 'unavailable'
      );
      return;
    }
    const route = Object.entries(ROUTES).find(([prefix]) =>
      rawPath === prefix || rawPath.startsWith(prefix + '/')
    );
    if (!route) { reject(res, 404); return; }
    const [prefix, directory] = route;
    let filename;
    try {
      filename = decodeURIComponent(rawPath.slice(prefix.length).replace(/^\//, '') || 'index.html');
    } catch {
      reject(res, 404);
      return;
    }
    if (!Object.hasOwn(MIME, filename)) { reject(res, 404); return; }
    const base = path.resolve(ROOT, directory);
    try {
      const [realBase, realFile] = await Promise.all([
        realpath(base), realpath(path.join(base, filename))
      ]);
      if (path.dirname(realFile) !== realBase || !(await stat(realFile)).isFile()) {
        reject(res, 404);
        return;
      }
      const data = await readFile(realFile);
      res.writeHead(200, {
        'content-type': MIME[filename],
        'content-length': data.length,
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {
      reject(res, 404);
    }
  });
}

export function parsePort(value) {
  if (!/^[0-9]+$/.test(String(value ?? ''))) throw Error('INVALID_DELIVERY_PORT');
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('INVALID_DELIVERY_PORT');
  return port;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const host = process.env.OS_MENU_DELIVERY_HOST || '127.0.0.1';
    const port = parsePort(process.env.OS_MENU_DELIVERY_PORT || '8787');
    const server = createServer();
    server.on('error', error => {
      console.error('OS_MENU_DELIVERY_FAILED=' + error.message);
      process.exitCode = 1;
    });
    server.listen(port, host, () => console.log('OS_MENU_DELIVERY_LISTENING=' + host + ':' + port));
  } catch (error) {
    console.error('OS_MENU_DELIVERY_FAILED=' + error.message);
    process.exitCode = 1;
  }
}
