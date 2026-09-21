import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { upstreams, externalApis, port } from './config.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const app = express();
app.use(express.json());

// Explicit route for a third-party API — its path shape doesn't fit the
// generic /api/<resource> proxy below, and the real URL should stay
// server-side rather than being visible in the browser's network tab.
app.get('/api/status/github', async (req, res) => {
  try {
    const upstreamRes = await fetch(externalApis.githubStatus);
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch {
    res.status(502).json({ message: 'GitHub status service unreachable' });
  }
});

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
