/**
 * OpenClaw Gateway WebSocket 客户端
 * 
 * 功能特性:
 * - 完整的 challenge-response 认证流程
 * - 自动重连机制 (指数退避 + 抖动)
 * - 心跳检测
 * - 请求/响应匹配
 * - 事件订阅
 * - 类型安全的 RPC 调用
 */

import type {
  GatewayClientConfig,
  ConnectionState,
  ConnectionStateChangeEvent,
  ConnectChallengeEvent,
  ConnectParams,
  HelloOkResponse,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcEvent,
  ProtocolVersion,
  ClientRole,
  OperatorScope,
  GatewayStatus,
  Channel,
  ChannelStats,
  CronJob,
  SystemEvolverStatus,
  Session,
  Agent,
  GatewayConfig,
  GatewayEventMap,
} from '../types/gateway';

// ============================================================================
// 默认配置
// ============================================================================

const DEFAULT_CONFIG: Partial<GatewayClientConfig> = {
  clientId: 'openclaw-console',
  clientVersion: '1.0.0',
  protocolVersion: 3 as ProtocolVersion,
  role: 'operator' as ClientRole,
  scopes: ['operator.read', 'operator.write', 'operator.admin'] as OperatorScope[],
  reconnect: {
    enabled: true,
    initialDelay: 1000,
    maxDelay: 30000,
    maxRetries: 10,
    jitter: 0.1,
  },
  heartbeat: {
    enabled: true,
    interval: 15000,
    timeout: 10000,
  },
  timeout: {
    connect: 10000,
    request: 30000,
  },
};

// ============================================================================
// 错误类
// ============================================================================

export class GatewayError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export class GatewayTimeoutError extends GatewayError {
  constructor(message = 'Request timeout') {
    super(message, 'TIMEOUT');
    this.name = 'GatewayTimeoutError';
  }
}

export class GatewayAuthError extends GatewayError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_FAILED');
    this.name = 'GatewayAuthError';
  }
}

export class GatewayConnectionError extends GatewayError {
  constructor(message = 'Connection failed') {
    super(message, 'CONNECTION_FAILED');
    this.name = 'GatewayConnectionError';
  }
}

// ============================================================================
// 事件发射器 (简化版)
// ============================================================================

class EventEmitter<T extends Record<string, unknown>> {
  private listeners: Map<keyof T, Array<(data: T[keyof T]) => void>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener as (data: T[keyof T]) => void);
    
    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener as (data: T[keyof T]) => void);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }
  }
}

interface GatewayClientEvents {
  'stateChange': ConnectionStateChangeEvent;
  'connect': void;
  'disconnect': { code: number; reason: string };
  'error': Error;
  'event': JsonRpcEvent;
  'message': unknown;
}

// ============================================================================
// Gateway WebSocket 客户端
// ============================================================================

export class GatewayClient extends EventEmitter<GatewayClientEvents> {
  private ws: WebSocket | null = null;
  private config: GatewayClientConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempt = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private heartbeatTimeoutTimer: number | null = null;
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timer: number;
  }> = new Map();
  private messageId = 0;
  private challengeNonce: string | null = null;
  private deviceToken: string | null = null;
  private eventHandlers: Map<string, Array<(payload: unknown) => void>> = new Map();

  constructor(config: GatewayClientConfig) {
    super();
    this.config = this.mergeConfig(config);
  }

  // ============================================================================
  // 配置管理
  // ============================================================================

  private mergeConfig(config: GatewayClientConfig): GatewayClientConfig {
    return {
      ...DEFAULT_CONFIG,
      ...config,
      reconnect: { ...DEFAULT_CONFIG.reconnect, ...config.reconnect },
      heartbeat: { ...DEFAULT_CONFIG.heartbeat, ...config.heartbeat },
      timeout: { ...DEFAULT_CONFIG.timeout, ...config.timeout },
    } as GatewayClientConfig;
  }

  public updateConfig(updates: Partial<GatewayClientConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getConfig(): GatewayClientConfig {
    return { ...this.config };
  }

  // ============================================================================
  // 状态管理
  // ============================================================================

  private setState(newState: ConnectionState, error?: Error): void {
    const previousState = this.state;
    if (previousState !== newState) {
      this.state = newState;
      this.emit('stateChange', {
        state: newState,
        previousState,
        timestamp: Date.now(),
        error,
      });
    }
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // ============================================================================
  // 连接管理
  // ============================================================================

  public async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'authenticating') {
      console.log('[GatewayClient] Connection already in progress');
      return;
    }

    if (this.isConnected()) {
      console.log('[GatewayClient] Already connected');
      return;
    }

    this.setState('connecting');
    this.clearReconnectTimer();

    return new Promise((resolve, reject) => {
      try {
        console.log(`[GatewayClient] Connecting to ${this.config.url}`);
        
        this.ws = new WebSocket(this.config.url);
        
        const connectTimeout = window.setTimeout(() => {
          this.ws?.close();
          reject(new GatewayTimeoutError('Connection timeout'));
        }, this.config.timeout!.connect);

        this.ws.onopen = () => {
          window.clearTimeout(connectTimeout);
          // 等待 challenge 事件，不要立即 resolve
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data, resolve, reject);
        };

        this.ws.onclose = (event) => {
          window.clearTimeout(connectTimeout);
          this.handleClose(event);
          if (this.state !== 'connected') {
            reject(new GatewayConnectionError(`Connection closed: ${event.reason}`));
          }
        };

        this.ws.onerror = (error) => {
          window.clearTimeout(connectTimeout);
          this.handleError(error);
          reject(new GatewayConnectionError('WebSocket error'));
        };

      } catch (error) {
        this.setState('error', error as Error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    console.log('[GatewayClient] Disconnecting...');
    this.clearReconnectTimer();
    this.stopHeartbeat();
    this.clearPendingRequests();
    
    if (this.ws) {
      // 正常关闭，不触发重连
      const ws = this.ws;
      this.ws = null;
      ws.close(1000, 'Client disconnect');;
    }
    
    this.setState('disconnected');
  }

  // ============================================================================
  // 消息处理
  // ============================================================================

  private handleMessage(
    data: string, 
    resolveConnect?: (value: void | PromiseLike<void>) => void,
    rejectConnect?: (reason: Error) => void
  ): void {
    try {
      const message = JSON.parse(data) as 
        | JsonRpcResponse 
        | JsonRpcEvent 
        | ConnectChallengeEvent;

      console.log('[GatewayClient] Received:', message.type, message);
      this.emit('message', message);

      switch (message.type) {
        case 'event':
          this.handleEvent(message as JsonRpcEvent, resolveConnect, rejectConnect);
          break;
        case 'res':
          this.handleResponse(message as JsonRpcResponse);
          break;
        default:
          console.warn('[GatewayClient] Unknown message type:', message);
      }
    } catch (error) {
      console.error('[GatewayClient] Failed to parse message:', error);
    }
  }

  private handleEvent(
    event: JsonRpcEvent,
    resolveConnect?: (value: void | PromiseLike<void>) => void,
    rejectConnect?: (reason: Error) => void
  ): void {
    // 处理 connect.challenge 事件
    if (event.event === 'connect.challenge') {
      const challenge = event as unknown as ConnectChallengeEvent;
      this.challengeNonce = challenge.payload.nonce;
      this.setState('authenticating');
      this.sendConnectRequest(resolveConnect, rejectConnect);
      return;
    }

    // 处理心跳 tick
    if (event.event === 'tick') {
      this.resetHeartbeatTimeout();
    }

    // 触发通用事件
    this.emit('event', event);

    // 触发特定事件处理器
    const handlers = this.eventHandlers.get(event.event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event.payload);
        } catch (error) {
          console.error(`[GatewayClient] Error in event handler for ${event.event}:`, error);
        }
      });
    }
  }

  private handleResponse(response: JsonRpcResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.warn('[GatewayClient] Received response for unknown request:', response.id);
      return;
    }

    this.pendingRequests.delete(response.id);
    window.clearTimeout(pending.timer);

    if (response.ok) {
      pending.resolve(response.payload);
    } else {
      const error = new GatewayError(
        response.error?.message || 'Unknown error',
        response.error?.code || 'UNKNOWN',
        response.error?.details
      );
      pending.reject(error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`[GatewayClient] Connection closed: ${event.code} - ${event.reason}`);
    
    const wasConnected = this.state === 'connected';
    this.setState('disconnected');
    this.stopHeartbeat();
    this.ws = null;
    
    this.emit('disconnect', { code: event.code, reason: event.reason });

    // 如果不是正常关闭，尝试重连
    if (wasConnected && this.config.reconnect!.enabled) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('[GatewayClient] WebSocket error:', error);
    this.setState('error', error as unknown as Error);
    this.emit('error', error as unknown as Error);
  }

  // ============================================================================
  // 认证流程
  // ============================================================================

  private async sendConnectRequest(
    resolveConnect?: (value: void | PromiseLike<void>) => void,
    rejectConnect?: (reason: Error) => void
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      rejectConnect?.(new GatewayConnectionError('WebSocket not open'));
      return;
    }

    const connectParams: ConnectParams = {
      minProtocol: this.config.protocolVersion!,
      maxProtocol: this.config.protocolVersion!,
      client: {
        id: this.config.clientId!,
        version: this.config.clientVersion!,
        platform: 'web',
        mode: 'ui',
        instanceId: this.generateInstanceId(),
      },
      role: this.config.role!,
      scopes: this.config.scopes!,
      caps: [],
      auth: {
        token: this.config.authToken,
        deviceToken: this.deviceToken || undefined,
      },
      locale: navigator.language,
      userAgent: navigator.userAgent,
      device: this.challengeNonce ? {
        id: this.generateDeviceId(),
        nonce: this.challengeNonce,
        signedAt: Date.now(),
      } : undefined,
    };

    const request: JsonRpcRequest = {
      type: 'req',
      id: this.generateMessageId(),
      method: 'connect',
      params: connectParams,
    };

    console.log('[GatewayClient] Sending connect request:', request);

    // 设置连接超时
    const connectTimeout = window.setTimeout(() => {
      rejectConnect?.(new GatewayTimeoutError('Authentication timeout'));
    }, this.config.timeout!.connect);

    // 等待 hello-ok 响应
    this.pendingRequests.set(request.id, {
      resolve: (payload) => {
        window.clearTimeout(connectTimeout);
        const helloOk = payload as HelloOkResponse;
        
        if (helloOk.auth?.deviceToken) {
          this.deviceToken = helloOk.auth.deviceToken;
          // 可以持久化到 localStorage
          this.saveDeviceToken(this.deviceToken);
        }

        this.setState('connected');
        this.reconnectAttempt = 0;
        this.startHeartbeat(helloOk.policy.tickIntervalMs);
        
        console.log('[GatewayClient] Connected successfully');
        this.emit('connect', undefined);
        resolveConnect?.();
      },
      reject: (error) => {
        window.clearTimeout(connectTimeout);
        this.setState('error', error);
        rejectConnect?.(error);
      },
      timer: connectTimeout,
    });

    this.ws.send(JSON.stringify(request));
  }

  // ============================================================================
  // 重连机制
  // ============================================================================

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.config.reconnect!.maxRetries!) {
      console.error('[GatewayClient] Max reconnection attempts reached');
      this.setState('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempt++;
    this.setState('reconnecting');

    // 指数退避计算延迟
    const baseDelay = this.config.reconnect!.initialDelay! * Math.pow(2, this.reconnectAttempt - 1);
    const maxDelay = this.config.reconnect!.maxDelay!;
    const delay = Math.min(baseDelay, maxDelay);
    
    // 添加抖动 (±10%)
    const jitter = delay * this.config.reconnect!.jitter! * (Math.random() * 2 - 1);
    const finalDelay = Math.max(0, delay + jitter);

    console.log(`[GatewayClient] Reconnecting in ${finalDelay.toFixed(0)}ms (attempt ${this.reconnectAttempt}/${this.config.reconnect!.maxRetries})`);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error('[GatewayClient] Reconnection failed:', error);
      });
    }, finalDelay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ============================================================================
  // 心跳机制
  // ============================================================================

  private startHeartbeat(tickIntervalMs: number): void {
    if (!this.config.heartbeat!.enabled) return;

    this.stopHeartbeat();

    // 使用服务器推荐的 tick 间隔，或配置的值
    const interval = tickIntervalMs || this.config.heartbeat!.interval;

    this.heartbeatTimer = window.setInterval(() => {
      this.checkConnectionHealth();
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.heartbeatTimeoutTimer) {
      window.clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private checkConnectionHealth(): void {
    if (!this.isConnected()) return;

    // 设置超时检测
    this.heartbeatTimeoutTimer = window.setTimeout(() => {
      console.warn('[GatewayClient] Heartbeat timeout, closing connection');
      this.ws?.close(1001, 'Heartbeat timeout');
    }, this.config.heartbeat!.timeout);

    // 发送健康检查请求
    this.call('health', {}).catch(error => {
      console.warn('[GatewayClient] Health check failed:', error);
    });
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      window.clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  // ============================================================================
  // RPC 调用
  // ============================================================================

  public async call<T = unknown>(method: string, params: unknown): Promise<T> {
    if (!this.isConnected()) {
      throw new GatewayConnectionError('Not connected to Gateway');
    }

    const id = this.generateMessageId();
    const request: JsonRpcRequest = {
      type: 'req',
      id,
      method,
      params,
    };

    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new GatewayTimeoutError(`Request timeout: ${method}`));
      }, this.config.timeout!.request);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject: reject as (error: Error) => void,
        timer,
      });

      console.log(`[GatewayClient] RPC call: ${method}`, params);
      this.ws!.send(JSON.stringify(request));
    });
  }

  // ============================================================================
  // 事件订阅
  // ============================================================================

  public onEvent<K extends keyof GatewayEventMap>(
    event: K, 
    handler: (payload: GatewayEventMap[K]) => void
  ): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    const wrappedHandler = (payload: unknown) => handler(payload as GatewayEventMap[K]);
    this.eventHandlers.get(event)!.push(wrappedHandler);

    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(wrappedHandler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // ============================================================================
  // 工具方法
  // ============================================================================

  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  private generateInstanceId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeviceId(): string {
    // 尝试从 localStorage 获取稳定的设备 ID
    let deviceId = localStorage.getItem('openclaw_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('openclaw_device_id', deviceId);
    }
    return deviceId;
  }

  private saveDeviceToken(token: string): void {
    try {
      localStorage.setItem('openclaw_device_token', token);
    } catch (error) {
      console.warn('[GatewayClient] Failed to save device token:', error);
    }
  }

  private loadDeviceToken(): string | null {
    try {
      return localStorage.getItem('openclaw_device_token');
    } catch (error) {
      return null;
    }
  }

  private clearPendingRequests(): void {
    this.pendingRequests.forEach((pending) => {
      window.clearTimeout(pending.timer);
      pending.reject(new GatewayError('Connection closed', 'CONNECTION_CLOSED'));
    });
    this.pendingRequests.clear();
  }

  // ============================================================================
  // 便捷 RPC 方法
  // ============================================================================

  /** 获取 Gateway 状态 */
  public async getStatus(): Promise<GatewayStatus> {
    return this.call<GatewayStatus>('status', {});
  }

  /** 获取健康状态 */
  public async getHealth(): Promise<unknown> {
    return this.call('health', {});
  }

  /** 获取频道列表 */
  public async getChannels(): Promise<Channel[]> {
    return this.call<Channel[]>('channels.list', {});
  }

  /** 获取频道统计 */
  public async getChannelStats(channelId?: string): Promise<ChannelStats | ChannelStats[]> {
    return this.call<ChannelStats | ChannelStats[]>('channels.stats', { channelId });
  }

  /** 获取 Cron 任务列表 */
  public async getCronJobs(): Promise<CronJob[]> {
    return this.call<CronJob[]>('cron.list', {});
  }

  /** 切换 Cron 任务状态 */
  public async toggleCronJob(jobId: string, enabled: boolean): Promise<void> {
    return this.call<void>('cron.toggle', { jobId, enabled });
  }

  /** 获取系统 Evolver 状态 */
  public async getSystemEvolverStatus(): Promise<SystemEvolverStatus> {
    return this.call<SystemEvolverStatus>('system.evolver_status', {});
  }

  /** 获取配置 */
  public async getConfig(path?: string): Promise<GatewayConfig> {
    return this.call<GatewayConfig>('config.get', { path });
  }

  /** 获取会话列表 */
  public async getSessions(filter?: 'active' | 'all'): Promise<Session[]> {
    return this.call<Session[]>('sessions.list', { filter });
  }

  /** 获取 Agent 列表 */
  public async getAgents(): Promise<Agent[]> {
    return this.call<Agent[]>('agents.list', {});
  }

  /** 发送聊天消息 */
  public async sendChat(sessionKey: string, message: string): Promise<unknown> {
    return this.call('chat.send', {
      sessionKey,
      message,
      idempotencyKey: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }
}

// ============================================================================
// 单例导出
// ============================================================================

let globalClient: GatewayClient | null = null;

export function createGatewayClient(config: GatewayClientConfig): GatewayClient {
  return new GatewayClient(config);
}

export function getGlobalGatewayClient(): GatewayClient | null {
  return globalClient;
}

export function setGlobalGatewayClient(client: GatewayClient): void {
  globalClient = client;
}

export default GatewayClient;
