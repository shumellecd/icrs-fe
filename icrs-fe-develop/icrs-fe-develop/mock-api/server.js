import { createServer } from 'node:http';
import { users, orders } from './fixtures.js';

// Zero-dependency stand-ins for the real microservices, matching the base
// URLs in src/config/env.js. Lets the sample pages show real data instead of
// only exercising their error state.
function serveJson(port, routes) {
  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const path = req.url.split('?')[0];
    const data = routes[path];

    if (req.method === 'GET' && data !== undefined) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  });

  server.listen(port, () => {
    console.log(`mock service listening on http://localhost:${port}`);
  });

  return server;
}

serveJson(1002, { '/api/users': users });
serveJson(1003, { '/api/orders': orders });
