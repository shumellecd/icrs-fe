import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { upstreams, authServiceUrl, port } from './config.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const app = express();
app.use(express.json());

// icrs-auth: dedicated routes, registered before the generic /api proxy
// below (Express matches in registration order) — its endpoints
// (/register, /login, /login/verify) are flat, not /api/auth/*-shaped, so
// the generic proxy can't reach them as-is.
async function forwardToAuth(authPath, req, res) {
  try {
    const url = new URL(authPath, authServiceUrl);
    if (req.method === 'GET') {
      url.search = new URLSearchParams(req.query).toString();
    }

    const upstreamRes = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body),
    });

    res.status(upstreamRes.status).json(await upstreamRes.json());
  } catch {
    res.status(502).json({ status: 502, message: 'Auth service unreachable', data: null });
  }
}

app.post('/api/auth/register', (req, res) => forwardToAuth('/register', req, res));
app.post('/api/auth/login', (req, res) => forwardToAuth('/login', req, res));
app.get('/api/auth/login/verify', (req, res) => forwardToAuth('/login/verify', req, res));
app.post('/api/auth/login/verify', (req, res) => forwardToAuth('/login/verify', req, res));

// Same-origin proxy: the browser only ever talks to /api/*, never to a
// microservice directly. The resource name (first path segment after /api)
// picks which microservice to forward to — this is the one place that knows
// where each service actually lives.
app.use('/api', async (req, res) => {
  const resource = req.originalUrl.split('/')[2];
  const upstreamOrigin = upstreams[resource];

  if (!upstreamOrigin) {
    res.status(502).json({ message: `No upstream configured for /api/${resource}` });
    return;
  }

  try {
    const upstreamRes = await fetch(`${upstreamOrigin}${req.originalUrl}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    res.status(upstreamRes.status);
    if (contentType.includes('application/json')) {
      res.json(await upstreamRes.json());
    } else {
      res.send(await upstreamRes.text());
    }
  } catch {
    res.status(502).json({ message: `${resource} service unreachable` });
  }
});

app.use(express.static(rootDir));

app.listen(port, () => {
  console.log(`BFF listening on http://localhost:${port}`);
});
