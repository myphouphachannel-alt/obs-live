import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/database.js';
import { BroadcastSocketServer } from './server/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = 3000;

  // JSON Body parsing (limit 20MB for image data URLs / logos)
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // WebSocket Server
  const socketServer = new BroadcastSocketServer(server);

  // --- REST API Endpoints ---

  // Get full state
  app.get('/api/state', (_req: Request, res: Response) => {
    res.json(db.getState());
  });

  // Get people
  app.get('/api/people', (_req: Request, res: Response) => {
    res.json(db.getPeople());
  });

  // Add person
  app.post('/api/people', (req: Request, res: Response) => {
    try {
      const { name, position, description, profileImage, themeColor, textColor, bgColor, category } = req.body;
      if (!name || !position) {
        return res.status(400).json({ error: 'Name and Position are required' });
      }
      const newPerson = db.addPerson({
        name,
        position,
        description: description || '',
        profileImage: profileImage || '',
        themeColor: themeColor || '#8B5CF6',
        textColor: textColor || '#FFFFFF',
        bgColor: bgColor || '#0F172A',
        category: category || 'ทั่วไป',
        order: 0,
      });

      socketServer.broadcast({
        type: 'PEOPLE_CHANGED',
        payload: db.getPeople(),
      });

      res.status(201).json(newPerson);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to add person' });
    }
  });

  // Update person
  app.put('/api/people/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updatePerson(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Person not found' });
      }

      socketServer.broadcast({
        type: 'PEOPLE_CHANGED',
        payload: db.getPeople(),
      });

      // If active, update overlay
      const state = db.getState();
      if (state.activeLowerThird.person?.id === id) {
        socketServer.broadcast({
          type: 'LOWER_THIRD_CHANGED',
          payload: state.activeLowerThird,
        });
      }

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update person' });
    }
  });

  // Delete person
  app.delete('/api/people/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentActive = db.getState().activeLowerThird;
      const wasActive = currentActive.person?.id === id;

      const deleted = db.deletePerson(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Person not found' });
      }

      socketServer.broadcast({
        type: 'PEOPLE_CHANGED',
        payload: db.getPeople(),
      });

      if (wasActive) {
        socketServer.broadcast({
          type: 'LOWER_THIRD_CHANGED',
          payload: db.getState().activeLowerThird,
        });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete person' });
    }
  });

  // Reorder people
  app.post('/api/people/reorder', (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'orderedIds array is required' });
      }
      const reordered = db.reorderPeople(orderedIds);
      socketServer.broadcast({
        type: 'PEOPLE_CHANGED',
        payload: reordered,
      });
      res.json(reordered);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to reorder' });
    }
  });

  // Get settings
  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json(db.getSettings());
  });

  // Update settings
  app.put('/api/settings', (req: Request, res: Response) => {
    try {
      const updated = db.updateSettings(req.body);
      socketServer.broadcast({
        type: 'SETTINGS_CHANGED',
        payload: updated,
      });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update settings' });
    }
  });

  // Control: Show Lower Third
  app.post('/api/control/show', (req: Request, res: Response) => {
    try {
      const { personId } = req.body;
      if (!personId) {
        return res.status(400).json({ error: 'personId is required' });
      }
      const active = db.showLowerThird(personId);
      socketServer.broadcast({
        type: 'LOWER_THIRD_CHANGED',
        payload: active,
      });
      res.json(active);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to trigger lower third' });
    }
  });

  // Control: Hide Lower Third
  app.post('/api/control/hide', (_req: Request, res: Response) => {
    try {
      const active = db.hideLowerThird();
      socketServer.broadcast({
        type: 'LOWER_THIRD_CHANGED',
        payload: active,
      });
      res.json(active);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to hide lower third' });
    }
  });

  // Export JSON backup
  app.get('/api/export', (_req: Request, res: Response) => {
    const backupJson = db.exportBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="obs-lower-third-backup.json"');
    res.send(backupJson);
  });

  // Import JSON backup
  app.post('/api/import', (req: Request, res: Response) => {
    try {
      const dataStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const success = db.importBackup(dataStr);
      if (!success) {
        return res.status(400).json({ error: 'Invalid backup format' });
      }

      // Sync all clients
      socketServer.broadcast({
        type: 'STATE_SYNC',
        payload: db.getState(),
      });

      res.json({ success: true, state: db.getState() });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Import failed' });
    }
  });

  // Reset to defaults
  app.post('/api/reset', (_req: Request, res: Response) => {
    try {
      const newState = db.resetToDefaults();
      socketServer.broadcast({
        type: 'STATE_SYNC',
        payload: newState,
      });
      res.json({ success: true, state: newState });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Reset failed' });
    }
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // --- Vite Dev Server Middleware or Static Production Serving ---
  if (!isProd) {
    console.log('[Server] Starting Vite in middleware mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in dev mode (e.g. /overlay)
    app.use('*', async (req: Request, res: Response, next) => {
      // Don't intercept API routes
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    console.log('[Server] Serving production build from dist...');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Start listening
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  OBS LOWER THIRD CONTROL PANEL`);
    console.log(`  Control Panel: http://localhost:${PORT}/`);
    console.log(`  OBS Overlay:   http://localhost:${PORT}/overlay`);
    console.log(`  WebSocket:     ws://localhost:${PORT}/`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
