import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_RENTAL_ORDERS, INITIAL_GEAR_INVENTORY, INITIAL_SHIFT } from './src/data/initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  const hmrWss = new WebSocketServer({
    noServer: true,
    handleProtocols: (protocols) => {
      const protoList = Array.from(protocols);
      return protoList.length > 0 ? protoList[0] : false;
    },
  });

  hmrWss.on('connection', (ws) => {
    try {
      ws.send(JSON.stringify({ type: 'connected' }));
    } catch {
      // ignore
    }

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // ignore
      }
    });

    ws.on('error', () => {});
  });

  // Handle all WebSocket upgrade requests safely
  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        // Handle Vite HMR client or any other WebSocket probe gracefully
        hmrWss.handleUpgrade(request, socket, head, (ws) => {
          hmrWss.emit('connection', ws, request);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  // Authoritative server state
  let serverOrders = [...INITIAL_RENTAL_ORDERS];
  let serverInventory = [...INITIAL_GEAR_INVENTORY];
  let serverShift = { ...INITIAL_SHIFT };

  // Broadcast helper
  function broadcast(payload: any, excludeWs?: WebSocket) {
    const message = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket) => {
    // Send full current state to newly connected client
    ws.send(
      JSON.stringify({
        type: 'sync:init',
        data: {
          orders: serverOrders,
          inventory: serverInventory,
          shift: serverShift,
        },
      })
    );

    ws.on('message', (message: string) => {
      try {
        const payload = JSON.parse(message.toString());

        switch (payload.type) {
          case 'order:created':
            if (payload.data && !serverOrders.some((o) => o.id === payload.data.id)) {
              serverOrders = [payload.data, ...serverOrders];
            }
            broadcast(payload, ws);
            break;

          case 'order:updated':
            if (payload.data) {
              serverOrders = serverOrders.map((o) => (o.id === payload.data.id ? payload.data : o));
            }
            broadcast(payload, ws);
            break;

          case 'inventory:updated':
            if (payload.data) {
              serverInventory = payload.data;
            }
            broadcast(payload, ws);
            break;

          case 'shift:updated':
            if (payload.data) {
              serverShift = payload.data;
            }
            broadcast(payload, ws);
            break;

          default:
            broadcast(payload, ws);
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('error', (err) => {
      console.warn('WebSocket client error:', err);
    });
  });

  // REST API routes for initial fetch and offline sync fallback
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', clientsCount: wss.clients.size, time: new Date().toISOString() });
  });

  app.get('/api/state', (req, res) => {
    res.json({
      orders: serverOrders,
      inventory: serverInventory,
      shift: serverShift,
    });
  });

  app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    if (newOrder && !serverOrders.some((o) => o.id === newOrder.id)) {
      serverOrders = [newOrder, ...serverOrders];
      broadcast({ type: 'order:created', data: newOrder });
    }
    res.json({ success: true, order: newOrder });
  });

  app.put('/api/orders/:id', (req, res) => {
    const updated = req.body;
    serverOrders = serverOrders.map((o) => (o.id === req.params.id ? updated : o));
    broadcast({ type: 'order:updated', data: updated });
    res.json({ success: true, order: updated });
  });

  app.put('/api/inventory', (req, res) => {
    serverInventory = req.body;
    broadcast({ type: 'inventory:updated', data: serverInventory });
    res.json({ success: true });
  });

  app.put('/api/shift', (req, res) => {
    serverShift = req.body;
    broadcast({ type: 'shift:updated', data: serverShift });
    res.json({ success: true });
  });

  // Mount Vite middleware in development or static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CampGear POS Server running on http://0.0.0.0:${PORT} with WebSocket on /ws`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
