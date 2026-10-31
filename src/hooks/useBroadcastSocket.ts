import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BroadcastState,
  Person,
  BroadcastSettings,
  ActiveLowerThird,
  WSClientAction,
  WSServerMessage,
} from '../types/broadcast';

export interface UseBroadcastSocketReturn {
  state: BroadcastState | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectedClients: number;
  lastPingMs: number;
  // Controls
  showLowerThird: (personId: string) => void;
  hideLowerThird: () => void;
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  reorderPeople: (orderedIds: string[]) => Promise<void>;
  updateSettings: (settings: Partial<BroadcastSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  importBackup: (jsonContent: string) => Promise<boolean>;
  reconnect: () => void;
}

export function useBroadcastSocket(): UseBroadcastSocketReturn {
  const [state, setState] = useState<BroadcastState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [connectedClients, setConnectedClients] = useState<number>(1);
  const [lastPingMs, setLastPingMs] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const pingTimestampRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Send initial HTTP fetch to ensure fast render even before socket connects
  useEffect(() => {
    fetch('/api/state')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch initial state');
      })
      .then((data: BroadcastState) => {
        setState((prev) => prev || data);
      })
      .catch((err) => {
        console.warn('[Broadcast] Initial state fetch fallback failed:', err);
      });
  }, []);

  // WebSocket connect function
  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setIsConnecting(true);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        // Measure ping
        pingTimestampRef.current = Date.now();
        sendAction({ type: 'PING' });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSServerMessage;
          switch (msg.type) {
            case 'STATE_SYNC':
              setState((prev) => ({
                ...msg.payload,
                connectedClients: msg.payload.connectedClients || prev?.connectedClients || 1,
              }));
              if (msg.payload.connectedClients) {
                setConnectedClients(msg.payload.connectedClients);
              }
              break;

            case 'LOWER_THIRD_CHANGED':
              setState((prev) => prev ? { ...prev, activeLowerThird: msg.payload } : null);
              break;

            case 'PEOPLE_CHANGED':
              setState((prev) => prev ? { ...prev, people: msg.payload } : null);
              break;

            case 'SETTINGS_CHANGED':
              setState((prev) => prev ? { ...prev, settings: msg.payload } : null);
              break;

            case 'CLIENT_COUNT':
              setConnectedClients(msg.payload.count);
              break;

            case 'PONG':
              if (pingTimestampRef.current > 0) {
                setLastPingMs(Date.now() - pingTimestampRef.current);
              }
              break;

            case 'ERROR':
              console.error('[WS Error from server]:', msg.payload.message);
              break;
          }
        } catch (err) {
          console.error('[WS] Parse message error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        socketRef.current = null;
        // Auto reconnect after 2 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.warn('[WS] Socket connection error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('[WS] Failed to initiate WebSocket:', e);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    connect();

    // Periodic ping
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        pingTimestampRef.current = Date.now();
        socketRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 15000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Helper to send actions via socket or REST fallback
  const sendAction = useCallback((action: WSClientAction) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(action));
      return true;
    }
    return false;
  }, []);

  // Controls
  const showLowerThird = useCallback((personId: string) => {
    const sent = sendAction({ type: 'SHOW_LOWER_THIRD', payload: { personId } });
    if (!sent) {
      // Fallback REST
      fetch('/api/control/show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      }).catch(console.error);
    }
  }, [sendAction]);

  const hideLowerThird = useCallback(() => {
    const sent = sendAction({ type: 'HIDE_LOWER_THIRD' });
    if (!sent) {
      // Fallback REST
      fetch('/api/control/hide', {
        method: 'POST',
      }).catch(console.error);
    }
  }, [sendAction]);

  const addPerson = useCallback(async (person: Omit<Person, 'id' | 'createdAt'>) => {
    const sent = sendAction({ type: 'ADD_PERSON', payload: person });
    if (!sent) {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      });
      if (!res.ok) throw new Error('Failed to add person');
    }
  }, [sendAction]);

  const updatePerson = useCallback(async (person: Person) => {
    const sent = sendAction({ type: 'UPDATE_PERSON', payload: person });
    if (!sent) {
      const res = await fetch(`/api/people/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      });
      if (!res.ok) throw new Error('Failed to update person');
    }
  }, [sendAction]);

  const deletePerson = useCallback(async (id: string) => {
    const sent = sendAction({ type: 'DELETE_PERSON', payload: { id } });
    if (!sent) {
      const res = await fetch(`/api/people/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete person');
    }
  }, [sendAction]);

  const reorderPeople = useCallback(async (orderedIds: string[]) => {
    const sent = sendAction({ type: 'REORDER_PEOPLE', payload: { orderedIds } });
    if (!sent) {
      const res = await fetch('/api/people/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to reorder people');
    }
  }, [sendAction]);

  const updateSettings = useCallback(async (settings: Partial<BroadcastSettings>) => {
    const sent = sendAction({ type: 'UPDATE_SETTINGS', payload: settings });
    if (!sent) {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
    }
  }, [sendAction]);

  const resetToDefaults = useCallback(async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.state) setState(data.state);
    }
  }, []);

  const importBackup = useCallback(async (jsonContent: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonContent,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    state,
    isConnected,
    isConnecting,
    connectedClients,
    lastPingMs,
    showLowerThird,
    hideLowerThird,
    addPerson,
    updatePerson,
    deletePerson,
    reorderPeople,
    updateSettings,
    resetToDefaults,
    importBackup,
    reconnect: connect,
  };
}
