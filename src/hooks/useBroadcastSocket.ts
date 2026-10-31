import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BroadcastState,
  Person,
  BroadcastSettings,
  WSClientAction,
  WSServerMessage,
} from '../types/broadcast';
import { DEFAULT_SETTINGS, INITIAL_PEOPLE } from '../constants/broadcastDefaults';

export interface UseBroadcastSocketReturn {
  state: BroadcastState;
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

const STORAGE_KEY = 'obs_lower_third_state_v1';
const CHANNEL_NAME = 'obs_lower_third_sync_channel';

export function useBroadcastSocket(): UseBroadcastSocketReturn {
  // Load initial local backup if exists
  const getInitialState = (): BroadcastState => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.people)) {
          return {
            people: parsed.people,
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
            activeLowerThird: parsed.activeLowerThird || {
              person: null,
              visible: false,
              timestamp: 0,
            },
            connectedClients: 1,
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return {
      people: INITIAL_PEOPLE,
      settings: DEFAULT_SETTINGS,
      activeLowerThird: {
        person: null,
        visible: false,
        timestamp: 0,
      },
      connectedClients: 1,
    };
  };

  const [state, setState] = useState<BroadcastState>(getInitialState);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedClients, setConnectedClients] = useState<number>(1);
  const [lastPingMs, setLastPingMs] = useState<number>(1);

  const socketRef = useRef<WebSocket | null>(null);
  const pingTimestampRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Sync to localStorage
  const persistState = useCallback((newState: BroadcastState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // storage quota or private mode
    }
  }, []);

  // Set up BroadcastChannel (Instant sync across OBS Dock and OBS Overlay on same domain like Vercel)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'SYNC_STATE') {
          setState(msg.payload);
          persistState(msg.payload);
        } else if (msg.type === 'SHOW_LOWER_THIRD') {
          setState((prev) => {
            const person = prev.people.find((p) => p.id === msg.payload.personId) || null;
            const updated: BroadcastState = {
              ...prev,
              activeLowerThird: {
                person,
                visible: true,
                timestamp: Date.now(),
              },
            };
            persistState(updated);
            return updated;
          });
        } else if (msg.type === 'HIDE_LOWER_THIRD') {
          setState((prev) => {
            const updated: BroadcastState = {
              ...prev,
              activeLowerThird: {
                ...prev.activeLowerThird,
                visible: false,
                timestamp: Date.now(),
              },
            };
            persistState(updated);
            return updated;
          });
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [persistState]);

  // Initial HTTP fetch
  useEffect(() => {
    fetch('/api/state')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Fallback to local state');
      })
      .then((data: BroadcastState) => {
        if (data && Array.isArray(data.people)) {
          setState((prev) => {
            const merged = { ...prev, ...data };
            persistState(merged);
            return merged;
          });
        }
      })
      .catch(() => {
        // Fallback already loaded
      });
  }, [persistState]);

  // WebSocket connect function
  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Try WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        pingTimestampRef.current = Date.now();
        ws.send(JSON.stringify({ type: 'PING' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSServerMessage;
          switch (msg.type) {
            case 'STATE_SYNC':
              setState((prev) => {
                const nextState = {
                  ...msg.payload,
                  connectedClients: msg.payload.connectedClients || prev.connectedClients,
                };
                persistState(nextState);
                return nextState;
              });
              if (msg.payload.connectedClients) {
                setConnectedClients(msg.payload.connectedClients);
              }
              break;

            case 'LOWER_THIRD_CHANGED':
              setState((prev) => {
                const nextState = { ...prev, activeLowerThird: msg.payload };
                persistState(nextState);
                return nextState;
              });
              break;

            case 'PEOPLE_CHANGED':
              setState((prev) => {
                const nextState = { ...prev, people: msg.payload };
                persistState(nextState);
                return nextState;
              });
              break;

            case 'SETTINGS_CHANGED':
              setState((prev) => {
                const nextState = { ...prev, settings: msg.payload };
                persistState(nextState);
                return nextState;
              });
              break;

            case 'CLIENT_COUNT':
              setConnectedClients(msg.payload.count);
              break;

            case 'PONG':
              if (pingTimestampRef.current > 0) {
                setLastPingMs(Date.now() - pingTimestampRef.current);
              }
              break;
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        // On Vercel, WebSocket closes because serverless does not support persistent WS.
        // We remain connected via BroadcastChannel + REST!
        setIsConnected(true);
        setIsConnecting(false);
        socketRef.current = null;
      };

      ws.onerror = () => {
        // On Vercel or static host, fallback gracefully to BroadcastChannel
        setIsConnected(true);
        setIsConnecting(false);
      };
    } catch {
      setIsConnected(true);
      setIsConnecting(false);
    }
  }, [persistState]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  // Dispatch action across WS, BroadcastChannel, and REST
  const dispatchAction = useCallback((action: WSClientAction) => {
    // 1. BroadcastChannel (Works on Vercel across OBS Dock & Overlay on same origin!)
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(action);
    }

    // 2. WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(action));
    }
  }, []);

  // Controls
  const showLowerThird = useCallback((personId: string) => {
    setState((prev) => {
      const person = prev.people.find((p) => p.id === personId) || null;
      const updated: BroadcastState = {
        ...prev,
        activeLowerThird: {
          person,
          visible: true,
          timestamp: Date.now(),
        },
      };
      persistState(updated);
      return updated;
    });

    dispatchAction({ type: 'SHOW_LOWER_THIRD', payload: { personId } });

    fetch('/api/control/show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId }),
    }).catch(() => {});
  }, [dispatchAction, persistState]);

  const hideLowerThird = useCallback(() => {
    setState((prev) => {
      const updated: BroadcastState = {
        ...prev,
        activeLowerThird: {
          ...prev.activeLowerThird,
          visible: false,
          timestamp: Date.now(),
        },
      };
      persistState(updated);
      return updated;
    });

    dispatchAction({ type: 'HIDE_LOWER_THIRD' });

    fetch('/api/control/hide', { method: 'POST' }).catch(() => {});
  }, [dispatchAction, persistState]);

  const addPerson = useCallback(async (personData: Omit<Person, 'id' | 'createdAt'>) => {
    const newPerson: Person = {
      ...personData,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: state.people.length,
      createdAt: Date.now(),
    };

    setState((prev) => {
      const updated: BroadcastState = {
        ...prev,
        people: [...prev.people, newPerson],
      };
      persistState(updated);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: updated });
      }
      return updated;
    });

    dispatchAction({ type: 'ADD_PERSON', payload: personData });

    fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personData),
    }).catch(() => {});
  }, [dispatchAction, persistState, state.people.length]);

  const updatePerson = useCallback(async (person: Person) => {
    setState((prev) => {
      const updatedPeople = prev.people.map((p) => (p.id === person.id ? person : p));
      const updated: BroadcastState = {
        ...prev,
        people: updatedPeople,
        activeLowerThird:
          prev.activeLowerThird.person?.id === person.id
            ? { ...prev.activeLowerThird, person }
            : prev.activeLowerThird,
      };
      persistState(updated);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: updated });
      }
      return updated;
    });

    dispatchAction({ type: 'UPDATE_PERSON', payload: person });

    fetch(`/api/people/${person.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    }).catch(() => {});
  }, [dispatchAction, persistState]);

  const deletePerson = useCallback(async (id: string) => {
    setState((prev) => {
      const updatedPeople = prev.people.filter((p) => p.id !== id);
      const isWasActive = prev.activeLowerThird.person?.id === id;
      const updated: BroadcastState = {
        ...prev,
        people: updatedPeople,
        activeLowerThird: isWasActive
          ? { person: null, visible: false, timestamp: Date.now() }
          : prev.activeLowerThird,
      };
      persistState(updated);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: updated });
      }
      return updated;
    });

    dispatchAction({ type: 'DELETE_PERSON', payload: { id } });

    fetch(`/api/people/${id}`, { method: 'DELETE' }).catch(() => {});
  }, [dispatchAction, persistState]);

  const reorderPeople = useCallback(async (orderedIds: string[]) => {
    setState((prev) => {
      const idMap = new Map(prev.people.map((p) => [p.id, p]));
      const reordered: Person[] = [];
      orderedIds.forEach((id, idx) => {
        const p = idMap.get(id);
        if (p) {
          reordered.push({ ...p, order: idx });
          idMap.delete(id);
        }
      });
      idMap.forEach((p) => reordered.push({ ...p, order: reordered.length }));

      const updated: BroadcastState = { ...prev, people: reordered };
      persistState(updated);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: updated });
      }
      return updated;
    });

    dispatchAction({ type: 'REORDER_PEOPLE', payload: { orderedIds } });

    fetch('/api/people/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    }).catch(() => {});
  }, [dispatchAction, persistState]);

  const updateSettings = useCallback(async (settingsUpdate: Partial<BroadcastSettings>) => {
    setState((prev) => {
      const updated: BroadcastState = {
        ...prev,
        settings: { ...prev.settings, ...settingsUpdate },
      };
      persistState(updated);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: updated });
      }
      return updated;
    });

    dispatchAction({ type: 'UPDATE_SETTINGS', payload: settingsUpdate });

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsUpdate),
    }).catch(() => {});
  }, [dispatchAction, persistState]);

  const resetToDefaults = useCallback(async () => {
    const defaultState: BroadcastState = {
      people: INITIAL_PEOPLE,
      settings: DEFAULT_SETTINGS,
      activeLowerThird: { person: null, visible: false, timestamp: Date.now() },
      connectedClients: 1,
    };
    setState(defaultState);
    persistState(defaultState);
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: defaultState });
    }
    fetch('/api/reset', { method: 'POST' }).catch(() => {});
  }, [persistState]);

  const importBackup = useCallback(async (jsonContent: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.people)) {
        const importedState: BroadcastState = {
          people: parsed.people,
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          activeLowerThird: { person: null, visible: false, timestamp: Date.now() },
          connectedClients: 1,
        };
        setState(importedState);
        persistState(importedState);
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({ type: 'SYNC_STATE', payload: importedState });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [persistState]);

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
