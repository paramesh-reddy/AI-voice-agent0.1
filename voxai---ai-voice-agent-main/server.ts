import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './backend/src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function findFrontendDist(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(here, 'public'),
    path.resolve(here, 'frontend/dist'),
    path.resolve(here, 'dist'),
  ];
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ?? null;
}

const distPath = findFrontendDist();
if (distPath) {
  app.use(express.static(distPath, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || path.extname(req.path)) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.warn('Frontend build not found. API routes are still available.');
}

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500).json({ detail: 'Request failed due to an internal error.' });
});

export default app;

const entry = (process.argv[1] || '').replace(/\\/g, '/');
const startedDirectly = /(?:^|\/)server\.(?:ts|js|mjs|cjs)$/.test(entry);

if (!process.env.VERCEL && startedDirectly) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`VoxAI listening on http://127.0.0.1:${port}`);
  });
}
