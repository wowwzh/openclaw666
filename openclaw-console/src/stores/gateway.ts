/**
 * Gateway State Store
 * Manages Gateway connection state and communication
 * 
 * Migrated from ClawX - Uses WebSocket + JSON-RPC
 */
import { create } from 'zustand';
import type { GatewayStatus } from '../types/gateway';

const GATEWAY_WS = 'ws://127.0.0.1:18789';
const GATEWAY_TOKEN = 'bc9fdceecace2b226836f8f35d884f9365093aa390021263';
const isElectron = typeof window !== 'undefined' && !!(window as any).electron?.ipcRenderer;

// WebSocket client for JSON-RPC
class GatewayWSClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, { resolve: Function; reject: Function }>();
  private id = 0;
  private listeners = new Map<string, Function[]>();
  private connected = false;
  private messageHandler: ((data: any) => void) | null = null;

  connect(onMessage?: (data: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(GATEWAY_WS);
        this.messageHandler = onMessage || null;

        this.ws.onopen = () => {
          console.log('[GatewayWS] Connected');
          this.connected = true;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'req') {
              // It's a request from gateway (like chat events)
              if (this.messageHandler) {
                this.messageHandler(data);
              }
              this.emit('message', data);
            } else if (data.id) {
              // It's a response to our request
              const pending = this.pending.get(data.id);
              if (pending) {
                this.pending.delete(data.id);
                if (data.error) {
                  pending.reject(new Error(data.error.message || JSON.stringify(data.error)));
                } else {
                  pending.resolve(data.result);
                }
              }
            }
          } catch (e) {
            console.error('[GatewayWS] Parse error:', e);
          }
        };

        this.ws.onclose = () => {
          console.log('[GatewayWS] Disconnected');
          this.connected = false;
          this.emit('close', {});
        };

        this.ws.onerror = (error) => {
          console.error('[GatewayWS] Error:', error);
          reject(error);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  async rpc<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const id = `req_${++this.id}`;
    const frame = { type: 'req', id, method, params };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(frame));
      
      // Timeout after 30s
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`RPC timeout: ${method}`));
        }
      }, 30000);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }

  isConnected() {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  close() {
    this.ws?.close();
    this.connected = false;
  }
}

// Singleton client
const wsClient = new GatewayWSClient();

let gatewayInitPromise: Promise<void> | null = null;

interface GatewayHealth {
  ok: boolean;
  error?: string;
  uptime?: number;
}

interface GatewayState {
  status: GatewayStatus;
  health: GatewayHealth | null;
  isInitialized: boolean;
  lastError: string | null;

  // Actions
  init: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  checkHealth: () => Promise<GatewayHealth>;
  rpc: <T>(method: string, params?: unknown, timeoutMs?: number) => Promise<T>;
  setStatus: (status: GatewayStatus) => void;
  clearError: () => void;
}

export const useGatewayStore = create<GatewayState>((set, get) => ({
  status: {
    state: 'stopped',
    port: 18789,
  },
  health: null,
  isInitialized: false,
  lastError: null,

  init: async () => {
    if (get().isInitialized) return;
    if (gatewayInitPromise) {
      await gatewayInitPromise;
      return;
    }

    gatewayInitPromise = (async () => {
      try {
        let status: GatewayStatus;
        
        if (isElectron) {
          // Use Electron IPC
          status = await window.electron.ipcRenderer.invoke('gateway:status') as GatewayStatus;
        } else {
          // Browser fallback: connect via WebSocket
          try {
            await wsClient.connect((data) => {
              // Handle chat events from gateway
              if (data.method === 'agent' || data.method === 'chat') {
                // Forward to chat store
                import('./chat')
                  .then(({ useChatStore }) => {
                    useChatStore.getState().handleChatEvent(data.params || {});
                  })
                  .catch(console.warn);
              }
            });
            status = { state: 'running', port: 18789 };
          } catch {
            status = { state: 'stopped', port: 18789 };
          }
        }
        
        set({ status, isInitialized: true });

        // Listen for status changes (Electron only)
        if (isElectron) {
          window.electron.ipcRenderer.on('gateway:status-changed', (newStatus) => {
            set({ status: newStatus as GatewayStatus });
          });

          // Listen for errors
          window.electron.ipcRenderer.on('gateway:error', (error) => {
            set({ lastError: String(error) });
          });
        }

        // Some Gateway builds stream chat events via generic "agent" notifications.
        // Normalize and forward them to the chat store.
        // The Gateway may put event fields (state, message, etc.) either inside
        // params.data or directly on params — we must handle both layouts.
        window.electron.ipcRenderer.on('gateway:notification', (notification) => {
          const payload = notification as { method?: string; params?: Record<string, unknown> } | undefined;
          if (!payload || payload.method !== 'agent' || !payload.params || typeof payload.params !== 'object') {
            return;
          }

          const p = payload.params;
          const data = (p.data && typeof p.data === 'object') ? (p.data as Record<string, unknown>) : {};
          const normalizedEvent: Record<string, unknown> = {
            // Spread data sub-object first (nested layout)
            ...data,
            // Then override with top-level params fields (flat layout takes precedence)
            runId: p.runId ?? data.runId,
            sessionKey: p.sessionKey ?? data.sessionKey,
            stream: p.stream ?? data.stream,
            seq: p.seq ?? data.seq,
            // Critical: also pick up state and message from params (flat layout)
            state: p.state ?? data.state,
            message: p.message ?? data.message,
          };

          import('./chat')
            .then(({ useChatStore }) => {
              useChatStore.getState().handleChatEvent(normalizedEvent);
            })
            .catch((err) => {
              console.warn('Failed to forward gateway notification event:', err);
            });
        });

        // Listen for chat events from the gateway and forward to chat store.
        // The data arrives as { message: payload } from handleProtocolEvent.
        // The payload may be a full event wrapper ({ state, runId, message })
        // or the raw chat message itself. We need to handle both.
        window.electron.ipcRenderer.on('gateway:chat-message', (data) => {
          try {
            // Dynamic import to avoid circular dependency
            import('./chat').then(({ useChatStore }) => {
              const chatData = data as Record<string, unknown>;
              // Unwrap the { message: payload } wrapper from handleProtocolEvent
              const payload = ('message' in chatData && typeof chatData.message === 'object')
                ? chatData.message as Record<string, unknown>
                : chatData;

              // If payload has a 'state' field, it's already a proper event wrapper
              if (payload.state) {
                useChatStore.getState().handleChatEvent(payload);
                return;
              }

              // Otherwise, payload is the raw message — wrap it as a 'final' event
              // so handleChatEvent can process it (this happens when the Gateway
              // sends protocol events with the message directly as payload).
              const syntheticEvent: Record<string, unknown> = {
                state: 'final',
                message: payload,
                runId: chatData.runId ?? payload.runId,
              };
              useChatStore.getState().handleChatEvent(syntheticEvent);
            });
          } catch (err) {
            console.warn('Failed to forward chat event:', err);
          }
        });

      } catch (error) {
        console.error('Failed to initialize Gateway:', error);
        set({ lastError: String(error) });
      } finally {
        gatewayInitPromise = null;
      }
    })();

    await gatewayInitPromise;
  },

  start: async () => {
    try {
      set({ status: { ...get().status, state: 'starting' }, lastError: null });
      const result = await window.electron.ipcRenderer.invoke('gateway:start') as { success: boolean; error?: string };

      if (!result.success) {
        set({
          status: { ...get().status, state: 'error', error: result.error },
          lastError: result.error || 'Failed to start Gateway'
        });
      }
    } catch (error) {
      set({
        status: { ...get().status, state: 'error', error: String(error) },
        lastError: String(error)
      });
    }
  },

  stop: async () => {
    try {
      await window.electron.ipcRenderer.invoke('gateway:stop');
      set({ status: { ...get().status, state: 'stopped' }, lastError: null });
    } catch (error) {
      console.error('Failed to stop Gateway:', error);
      set({ lastError: String(error) });
    }
  },

  restart: async () => {
    try {
      set({ status: { ...get().status, state: 'starting' }, lastError: null });
      const result = await window.electron.ipcRenderer.invoke('gateway:restart') as { success: boolean; error?: string };

      if (!result.success) {
        set({
          status: { ...get().status, state: 'error', error: result.error },
          lastError: result.error || 'Failed to restart Gateway'
        });
      }
    } catch (error) {
      set({
        status: { ...get().status, state: 'error', error: String(error) },
        lastError: String(error)
      });
    }
  },

  checkHealth: async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('gateway:health') as {
        success: boolean;
        ok: boolean;
        error?: string;
        uptime?: number
      };

      const health: GatewayHealth = {
        ok: result.ok,
        error: result.error,
        uptime: result.uptime,
      };

      set({ health });
      return health;
    } catch (error) {
      const health: GatewayHealth = { ok: false, error: String(error) };
      set({ health });
      return health;
    }
  },

  rpc: async <T>(method: string, params?: unknown, timeoutMs?: number): Promise<T> => {
    if (isElectron) {
      const result = await window.electron.ipcRenderer.invoke('gateway:rpc', method, params, timeoutMs) as {
        success: boolean;
        result?: T;
        error?: string;
      };

      if (!result.success) {
        throw new Error(result.error || `RPC call failed: ${method}`);
      }

      return result.result as T;
    } else {
      // Browser fallback: use WebSocket JSON-RPC
      try {
        return await wsClient.rpc<T>(method, params as Record<string, unknown>);
      } catch (e) {
        console.error(`RPC ${method} failed:`, e);
        throw e;
      }
    }
  },

  setStatus: (status) => set({ status }),

  clearError: () => set({ lastError: null }),
}));

// ============================================
// 便捷导出
// ============================================
export const useGatewayStatus = () => useGatewayStore((s) => s.status);
export const useGatewayHealth = () => useGatewayStore((s) => s.health);
export const useGatewayState = () => useGatewayStore((s) => s.status.state);
export const useGatewayVersion = () => useGatewayStore((s) => s.status.version);
export const useGatewayUptime = () => useGatewayStore((s) => s.status.uptime);
