/**
 * OpenClaw Gateway WebSocket API 类型定义
 * 基于官方文档: https://docs.openclaw.ai/gateway/protocol
 */

// ============================================================================
// 协议基础类型
// ============================================================================

export type ProtocolVersion = 3;

export type MessageType = 'req' | 'res' | 'event';

export type ClientRole = 'operator' | 'node';

export type ClientMode = 'cli' | 'ui' | 'node' | 'app';

export type ClientPlatform = 'web' | 'node' | 'macos' | 'ios' | 'android';

export type OperatorScope = 
  | 'operator.read' 
  | 'operator.write' 
  | 'operator.admin' 
  | 'operator.approvals' 
  | 'operator.pairing';

// ============================================================================
// 连接相关类型
// ============================================================================

export interface ConnectChallengeEvent {
  type: 'event';
  event: 'connect.challenge';
  payload: {
    nonce: string;
    ts: number;
  };
}

export interface ClientInfo {
  id: string;
  version: string;
  platform: ClientPlatform;
  mode: ClientMode;
  instanceId: string;
}

export interface DeviceIdentity {
  id: string;
  publicKey?: string;
  signature?: string;
  signedAt?: number;
  nonce?: string;
}

export interface AuthCredentials {
  token?: string;
  password?: string;
  deviceToken?: string;
}

export interface ConnectParams {
  minProtocol: ProtocolVersion;
  maxProtocol: ProtocolVersion;
  client: ClientInfo;
  role: ClientRole;
  scopes: OperatorScope[];
  caps: string[];
  commands?: string[];
  permissions?: Record<string, boolean>;
  auth: AuthCredentials;
  locale?: string;
  userAgent?: string;
  device?: DeviceIdentity;
}

export interface HelloOkResponse {
  type: 'hello-ok';
  protocol: ProtocolVersion;
  policy: {
    tickIntervalMs: number;
  };
  auth?: {
    deviceToken: string;
    role: ClientRole;
    scopes: OperatorScope[];
  };
}

// ============================================================================
// 请求/响应类型
// ============================================================================

export interface JsonRpcRequest<T = unknown> {
  type: 'req';
  id: string;
  method: string;
  params: T;
}

export interface JsonRpcResponse<T = unknown> {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface JsonRpcEvent<T = unknown> {
  type: 'event';
  event: string;
  payload: T;
  seq?: number;
  stateVersion?: number;
}

// ============================================================================
// Gateway 状态类型
// ============================================================================

export interface GatewayStatus {
  runtime: 'running' | 'stopped' | 'error';
  version: string;
  uptime: number;
  pid: number;
  rpcProbe: 'ok' | 'error' | 'timeout';
  health: HealthStatus;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    channels: boolean;
    agent: boolean;
    memory: boolean;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

// ============================================================================
// Channel 类型
// ============================================================================

export interface Channel {
  channelId: string;
  account: string;
  name: string;
  enabled: boolean;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  type: string;
  capabilities: string[];
}

export interface ChannelStats {
  channelId: string;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
  lastActivity: number;
  connectionTime: number;
}

// ============================================================================
// Cron 任务类型
// ============================================================================

export interface CronJob {
  jobId: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: 'cron' | 'at' | 'interval';
    expr?: string;
    atMs?: number;
    intervalMs?: number;
    tz?: string;
  };
  sessionTarget: 'main' | 'isolated';
  wakeMode: 'now' | 'lazy';
  payload: {
    kind: 'systemEvent' | 'agentTurn';
    text?: string;
    message?: string;
    deliver?: boolean;
    channel?: string;
    to?: string;
  };
  deleteAfterRun?: boolean;
  lastRun?: number;
  nextRun?: number;
  runCount: number;
}

// ============================================================================
// System 类型
// ============================================================================

export interface SystemEvolverStatus {
  version: string;
  updateAvailable: boolean;
  latestVersion?: string;
  releaseNotes?: string;
  lastCheck: number;
}

export interface Session {
  sessionKey: string;
  type: 'main' | 'dm' | 'group' | 'cron' | 'webhook';
  agentId: string;
  createdAt: number;
  lastActivity: number;
  messageCount: number;
}

// ============================================================================
// Agent 类型
// ============================================================================

export interface Agent {
  agentId: string;
  workspace: string;
  model: {
    primary: string;
    fallback?: string;
  };
  status: 'idle' | 'running' | 'error';
}

export interface AgentRun {
  runId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'aborted';
  sessionKey: string;
  startedAt: number;
  endedAt?: number;
}

// ============================================================================
// 配置类型
// ============================================================================

export interface GatewayConfig {
  gateway: {
    port: number;
    bind: 'loopback' | 'lan';
    mode: 'local' | 'remote';
    auth: {
      mode: 'token' | 'password' | 'none';
      token?: string;
    };
  };
  agents: {
    list: Agent[];
  };
  channels: Record<string, unknown>;
}

// ============================================================================
// RPC 方法参数类型
// ============================================================================

export interface StatusParams {
  includeHealth?: boolean;
}

export interface ChannelsListParams {
  includeDisabled?: boolean;
}

export interface ChannelsStatsParams {
  channelId?: string;
}

export interface CronListParams {
  includeDisabled?: boolean;
}

export interface CronToggleParams {
  jobId: string;
  enabled: boolean;
}

export interface ConfigGetParams {
  path?: string;
}

export interface SessionsListParams {
  filter?: 'active' | 'all';
}

export interface ChatSendParams {
  sessionKey: string;
  message: string;
  idempotencyKey: string;
}

export interface AgentRunParams {
  agentId: string;
  sessionKey: string;
  prompt: string;
  idempotencyKey: string;
}

// ============================================================================
// WebSocket 客户端配置
// ============================================================================

export interface GatewayClientConfig {
  /** Gateway WebSocket URL */
  url: string;
  /** 认证 Token */
  authToken: string;
  /** 客户端 ID */
  clientId?: string;
  /** 客户端版本 */
  clientVersion?: string;
  /** 协议版本 */
  protocolVersion?: ProtocolVersion;
  /** 角色 */
  role?: ClientRole;
  /** 权限范围 */
  scopes?: OperatorScope[];
  /** 重连配置 */
  reconnect?: {
    enabled: boolean;
    initialDelay: number;
    maxDelay: number;
    maxRetries: number;
    jitter: number;
  };
  /** 心跳配置 */
  heartbeat?: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  /** 超时配置 */
  timeout?: {
    connect: number;
    request: number;
  };
}

// ============================================================================
// 事件类型
// ============================================================================

export type ConnectionState = 
  | 'disconnected' 
  | 'connecting' 
  | 'authenticating' 
  | 'connected' 
  | 'reconnecting' 
  | 'error';

export interface ConnectionStateChangeEvent {
  state: ConnectionState;
  previousState: ConnectionState;
  timestamp: number;
  error?: Error;
}

export interface GatewayEventMap {
  'connect.challenge': ConnectChallengeEvent['payload'];
  'presence': {
    online: boolean;
    lastSeen: number;
  };
  'tick': {
    timestamp: number;
    stateVersion: number;
  };
  'agent': AgentRun;
  'session': Session;
  'exec.approval.requested': {
    requestId: string;
    tool: string;
    params: unknown;
  };
}
