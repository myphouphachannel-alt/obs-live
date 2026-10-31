import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { db } from './database.js';
import { WSClientAction, WSServerMessage } from '../src/types/broadcast.js';

export class BroadcastSocketServer {
  private wss: WebSocketServer;
  private autoHideTimeout: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.init();
  }

  private init(): void {
    console.log('[WS] WebSocket Server initialized on HTTP port');

    this.wss.on('connection', (ws: WebSocket) => {
      // Send initial state sync to newly connected client
      const currentState = db.getState();
      const syncMessage: WSServerMessage = {
        type: 'STATE_SYNC',
        payload: {
          ...currentState,
          connectedClients: this.wss.clients.size,
        },
      };
      this.send(ws, syncMessage);

      // Broadcast updated client count to all
      this.broadcastClientCount();

      ws.on('message', (data: string | Buffer) => {
        try {
          const action = JSON.parse(data.toString()) as WSClientAction;
          this.handleClientAction(ws, action);
        } catch (err: any) {
          console.error('[WS] Error processing message:', err);
          this.send(ws, {
            type: 'ERROR',
            payload: { message: err?.message || 'Invalid message format' },
          });
        }
      });

      ws.on('close', () => {
        this.broadcastClientCount();
      });

      ws.on('error', (err) => {
        console.error('[WS] Socket error:', err);
      });
    });

    // Keepalive ping every 25 seconds
    setInterval(() => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 25000);
  }

  private handleClientAction(senderWs: WebSocket, action: WSClientAction): void {
    switch (action.type) {
      case 'SHOW_LOWER_THIRD': {
        const { personId } = action.payload;
        const active = db.showLowerThird(personId);
        
        // Broadcast lower third change immediately
        this.broadcast({
          type: 'LOWER_THIRD_CHANGED',
          payload: active,
        });

        // Handle auto-hide if configured
        this.resetAutoHideTimer();
        break;
      }

      case 'HIDE_LOWER_THIRD': {
        this.clearAutoHideTimer();
        const active = db.hideLowerThird();
        this.broadcast({
          type: 'LOWER_THIRD_CHANGED',
          payload: active,
        });
        break;
      }

      case 'UPDATE_PERSON': {
        const updated = db.updatePerson(action.payload.id, action.payload);
        if (updated) {
          this.broadcast({
            type: 'PEOPLE_CHANGED',
            payload: db.getPeople(),
          });
          // Also broadcast lower third if on air
          const state = db.getState();
          if (state.activeLowerThird.person?.id === updated.id) {
            this.broadcast({
              type: 'LOWER_THIRD_CHANGED',
              payload: state.activeLowerThird,
            });
          }
        }
        break;
      }

      case 'ADD_PERSON': {
        db.addPerson(action.payload);
        this.broadcast({
          type: 'PEOPLE_CHANGED',
          payload: db.getPeople(),
        });
        break;
      }

      case 'DELETE_PERSON': {
        const currentActive = db.getState().activeLowerThird;
        const wasActive = currentActive.person?.id === action.payload.id;
        db.deletePerson(action.payload.id);

        this.broadcast({
          type: 'PEOPLE_CHANGED',
          payload: db.getPeople(),
        });

        if (wasActive) {
          this.clearAutoHideTimer();
          this.broadcast({
            type: 'LOWER_THIRD_CHANGED',
            payload: db.getState().activeLowerThird,
          });
        }
        break;
      }

      case 'REORDER_PEOPLE': {
        const reordered = db.reorderPeople(action.payload.orderedIds);
        this.broadcast({
          type: 'PEOPLE_CHANGED',
          payload: reordered,
        });
        break;
      }

      case 'UPDATE_SETTINGS': {
        const updated = db.updateSettings(action.payload);
        this.broadcast({
          type: 'SETTINGS_CHANGED',
          payload: updated,
        });
        // Check if auto-hide duration changed while active
        const state = db.getState();
        if (state.activeLowerThird.visible) {
          this.resetAutoHideTimer();
        }
        break;
      }

      case 'PING': {
        this.send(senderWs, {
          type: 'PONG',
          payload: { timestamp: Date.now() },
        });
        break;
      }

      default:
        console.warn('[WS] Unknown action type:', (action as any)?.type);
    }
  }

  private resetAutoHideTimer(): void {
    this.clearAutoHideTimer();
    const settings = db.getSettings();
    if (settings.autoHide && settings.autoHideDuration > 0) {
      this.autoHideTimeout = setTimeout(() => {
        const active = db.hideLowerThird();
        this.broadcast({
          type: 'LOWER_THIRD_CHANGED',
          payload: active,
        });
      }, settings.autoHideDuration * 1000);
    }
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = null;
    }
  }

  public broadcast(message: WSServerMessage): void {
    const raw = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }

  private broadcastClientCount(): void {
    const count = this.wss.clients.size;
    this.broadcast({
      type: 'CLIENT_COUNT',
      payload: { count },
    });
  }

  private send(client: WebSocket, message: WSServerMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
