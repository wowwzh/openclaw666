/**
 * OpenClaw Gateway React Hook
 * 
 * 提供在 React 组件中使用 Gateway WebSocket 客户端的便捷方式
 */

import { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';
import type { GatewayClient } from '../lib/gateway-client';
import type {
  ConnectionState,
  GatewayStatus,
  Channel,
  ChannelStats,
  CronJob,
  SystemEvolverStatus,
  Session,
  Agent,
  GatewayConfig,
  JsonRpcEvent,
} from '../types/gateway';

// ============================================================================
// Context
// ============================================================================

interface GatewayContextValue {
  client: GatewayClient | null;
  state: ConnectionState;
  isConnected: boolean;
  error: Error | null;
}

const GatewayContext = createContext<GatewayContextValue | null>(null);

export const GatewayProvider = GatewayContext.Provider;

export function useGatewayContext(): GatewayContextValue {
  const context = useContext(GatewayContext);
  if (!context) {
    throw new Error('useGatewayContext must be used within a GatewayProvider');
  }
  return context;
}

// ============================================================================
// 基础 Hook
// ============================================================================

interface UseGatewayOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (code: number, reason: string) => void;
  onError?: (error: Error) => void;
  onEvent?: (event: JsonRpcEvent) => void;
}

export function useGateway(options: UseGatewayOptions = {}) {
  const { client } = useGatewayContext();
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const optionsRef = useRef(options);

  // 保持 options 引用最新
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // 监听连接状态变化
  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.on('stateChange', (event) => {
      setState(event.state);
      if (event.error) {
        setError(event.error);
      }
    });

    // 同步当前状态
    setState(client.getState());

    return unsubscribe;
  }, [client]);

  // 监听连接事件
  useEffect(() => {
    if (!client) return;

    const unsubConnect = client.on('connect', () => {
      setError(null);
      optionsRef.current.onConnect?.();
    });

    const unsubDisconnect = client.on('disconnect', ({ code, reason }) => {
      optionsRef.current.onDisconnect?.(code, reason);
    });

    const unsubError = client.on('error', (err) => {
      setError(err);
      optionsRef.current.onError?.(err);
    });

    const unsubEvent = client.on('event', (event) => {
      optionsRef.current.onEvent?.(event);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubError();
      unsubEvent();
    };
  }, [client]);

  // 自动连接
  useEffect(() => {
    if (options.autoConnect && client && state === 'disconnected') {
      client.connect().catch((err) => {
        console.error('Auto-connect failed:', err);
      });
    }
  }, [client, options.autoConnect, state]);

  const connect = useCallback(async () => {
    if (!client) throw new Error('Gateway client not initialized');
    return client.connect();
  }, [client]);

  const disconnect = useCallback(() => {
    client?.disconnect();
  }, [client]);

  const call = useCallback(
    async <T = unknown>(method: string, params: unknown = {}): Promise<T> => {
      if (!client) throw new Error('Gateway client not initialized');
      return client.call<T>(method, params);
    },
    [client]
  );

  return {
    client,
    state,
    isConnected: state === 'connected',
    error,
    connect,
    disconnect,
    call,
  };
}

// ============================================================================
// 数据获取 Hooks
// ============================================================================

interface UseGatewayDataOptions<T> {
  method: string;
  params?: unknown;
  initialData?: T;
  refreshInterval?: number;
  enabled?: boolean;
}

function useGatewayData<T>(options: UseGatewayDataOptions<T>) {
  const { call, isConnected } = useGateway();
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await call<T>(options.method, options.params);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [call, isConnected, options.method, options.params]);

  // 初始加载和连接变化时加载
  useEffect(() => {
    if (options.enabled !== false && isConnected) {
      fetchData();
    }
  }, [isConnected, options.enabled, fetchData]);

  // 定时刷新
  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      intervalRef.current = window.setInterval(fetchData, options.refreshInterval);
      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      };
    }
  }, [options.refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/** 获取 Gateway 状态 */
export function useGatewayStatus(refreshInterval?: number) {
  return useGatewayData<GatewayStatus>({
    method: 'status',
    refreshInterval,
  });
}

/** 获取频道列表 */
export function useChannels(refreshInterval?: number) {
  return useGatewayData<Channel[]>({
    method: 'channels.list',
    initialData: [],
    refreshInterval,
  });
}

/** 获取频道统计 */
export function useChannelStats(channelId?: string, refreshInterval?: number) {
  return useGatewayData<ChannelStats | ChannelStats[]>({
    method: 'channels.stats',
    params: { channelId },
    refreshInterval,
  });
}

/** 获取 Cron 任务列表 */
export function useCronJobs(refreshInterval?: number) {
  return useGatewayData<CronJob[]>({
    method: 'cron.list',
    params: { includeDisabled: true },
    initialData: [],
    refreshInterval,
  });
}

/** 获取系统 Evolver 状态 */
export function useSystemEvolverStatus(refreshInterval?: number) {
  return useGatewayData<SystemEvolverStatus>({
    method: 'system.evolver_status',
    refreshInterval,
  });
}

/** 获取会话列表 */
export function useSessions(filter?: 'active' | 'all', refreshInterval?: number) {
  return useGatewayData<Session[]>({
    method: 'sessions.list',
    params: { filter },
    initialData: [],
    refreshInterval,
  });
}

/** 获取 Agent 列表 */
export function useAgents(refreshInterval?: number) {
  return useGatewayData<Agent[]>({
    method: 'agents.list',
    initialData: [],
    refreshInterval,
  });
}

/** 获取配置 */
export function useConfig(path?: string) {
  return useGatewayData<GatewayConfig>({
    method: 'config.get',
    params: { path },
  });
}

// ============================================================================
// 操作 Hooks
// ============================================================================

export function useToggleCronJob() {
  const { call, isConnected } = useGateway();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggle = useCallback(
    async (jobId: string, enabled: boolean) => {
      if (!isConnected) throw new Error('Not connected to Gateway');

      setIsLoading(true);
      setError(null);

      try {
        await call('cron.toggle', { jobId, enabled });
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [call, isConnected]
  );

  return { toggle, isLoading, error };
}

export function useSendChat() {
  const { call, isConnected } = useGateway();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (sessionKey: string, message: string) => {
      if (!isConnected) throw new Error('Not connected to Gateway');

      setIsLoading(true);
      setError(null);

      try {
        const result = await call('chat.send', {
          sessionKey,
          message,
          idempotencyKey: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [call, isConnected]
  );

  return { send, isLoading, error };
}

// ============================================================================
// 事件订阅 Hook
// ============================================================================

export function useGatewayEvent<T = unknown>(
  eventName: string,
  handler: (payload: T) => void
) {
  const { client } = useGatewayContext();

  useEffect(() => {
    if (!client) return;
    return client.onEvent(eventName as keyof import('../types/gateway').GatewayEventMap, handler as (payload: unknown) => void);
  }, [client, eventName, handler]);
}

// ============================================================================
// 组合 Hook - 仪表盘数据
// ============================================================================

export function useDashboardData(refreshInterval = 30000) {
  const status = useGatewayStatus(refreshInterval);
  const channels = useChannels(refreshInterval);
  const channelStats = useChannelStats(undefined, refreshInterval);
  const cronJobs = useCronJobs(refreshInterval);
  const sessions = useSessions('active', refreshInterval);
  const agents = useAgents(refreshInterval);

  const isLoading =
    status.isLoading ||
    channels.isLoading ||
    channelStats.isLoading ||
    cronJobs.isLoading ||
    sessions.isLoading ||
    agents.isLoading;

  const error =
    status.error ||
    channels.error ||
    channelStats.error ||
    cronJobs.error ||
    sessions.error ||
    agents.error;

  const refetch = useCallback(() => {
    status.refetch();
    channels.refetch();
    channelStats.refetch();
    cronJobs.refetch();
    sessions.refetch();
    agents.refetch();
  }, [status, channels, channelStats, cronJobs, sessions, agents]);

  return {
    data: {
      status: status.data,
      channels: channels.data,
      channelStats: channelStats.data,
      cronJobs: cronJobs.data,
      sessions: sessions.data,
      agents: agents.data,
    },
    isLoading,
    error,
    refetch,
  };
}
