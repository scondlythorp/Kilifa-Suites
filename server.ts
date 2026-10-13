import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './src/server/app';
import { checkDatabaseConnection } from './src/server/db/prisma';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Probe database connection once at startup
  await checkDatabaseConnection();

  // Vite middleware for development / Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KILIFA SUITES SERVER] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[KILIFA SUITES SERVER ERROR]', err);
  process.exit(1);
});
