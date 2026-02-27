/**
 * Gateway 仪表盘组件
 * 
 * 展示 Gateway 的完整状态信息，包括:
 * - 运行状态
 * - 频道列表和状态
 * - Cron 任务
 * - 会话列表
 * - Agent 状态
 */

import React, { useState } from 'react';
import { 
  useDashboardData, 
  useToggleCronJob,
  useGateway,
} from '../hooks/useGateway';
import type { Channel, CronJob, Session, Agent } from '../types/gateway';

// ============================================================================
// 辅助组件
// ============================================================================

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ 
  title, 
  children,
  className = ''
}) => (
  <div 
    className={`dashboard-card ${className}`}
    style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    }}
  >
    <div 
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
        {title}
      </h3>
    </div>
    <div style={{ padding: '20px' }}>
      {children}
    </div>
  </div>
);

const Badge: React.FC<{ status: string; children: React.ReactNode }> = ({ status, children }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    connected: { bg: '#dcfce7', text: '#166534' },
    connecting: { bg: '#fef9c3', text: '#854d0e' },
    disconnected: { bg: '#fee2e2', text: '#991b1b' },
    error: { bg: '#fee2e2', text: '#991b1b' },
    running: { bg: '#dcfce7', text: '#166534' },
    idle: { bg: '#f1f5f9', text: '#475569' },
    enabled: { bg: '#dcfce7', text: '#166534' },
    disabled: { bg: '#f1f5f9', text: '#64748b' },
    healthy: { bg: '#dcfce7', text: '#166534' },
    degraded: { bg: '#fef9c3', text: '#854d0e' },
    unhealthy: { bg: '#fee2e2', text: '#991b1b' },
  };

  const color = colors[status] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '9999px',
        backgroundColor: color.bg,
        color: color.text,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </span>
  );
};

const LoadingSpinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <div 
      style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ 
  message, 
  onRetry 
}) => (
  <div 
    style={{
      padding: '20px',
      textAlign: 'center',
      color: '#dc2626',
    }}
  >
    <p style={{ margin: '0 0 12px 0' }}>⚠️ {message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          color: '#fff',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        重试
      </button>
    )}
  </div>
);

// ============================================================================
// 状态卡片
// ============================================================================

const StatusCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (!data.status) return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>暂无数据</div>;

  const { status } = data;

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>运行状态</span>
        <Badge status={status.runtime}>{status.runtime}</Badge>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>版本</span>
        <span style={{ fontWeight: 500 }}>{status.version}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>运行时间</span>
        <span style={{ fontWeight: 500 }}>{formatUptime(status.uptime)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>进程 ID</span>
        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{status.pid}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>RPC 探测</span>
        <Badge status={status.rpcProbe === 'ok' ? 'connected' : 'error'}>
          {status.rpcProbe}
        </Badge>
      </div>
      {status.health && (
        <>
          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>健康状态</span>
            <Badge status={status.health.status}>{status.health.status}</Badge>
          </div>
          {status.health.memory && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>内存使用</span>
                <span style={{ fontSize: '12px' }}>{status.health.memory.percentage.toFixed(1)}%</span>
              </div>
              <div 
                style={{
                  height: '6px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${status.health.memory.percentage}%`,
                    backgroundColor: status.health.memory.percentage > 80 ? '#ef4444' : '#3b82f6',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// 频道列表
// ============================================================================

const ChannelsCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const channels = data.channels || [];

  return (
    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
      {channels.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          暂无配置的频道
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {channels.map((channel: Channel) => (
            <div 
              key={`${channel.channelId}-${channel.account}`}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500 }}>{channel.name}</span>
                <Badge status={channel.status}>{channel.status}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <div>ID: {channel.channelId}</div>
                <div>账号: {channel.account}</div>
                <div>类型: {channel.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Cron 任务列表
// ============================================================================

const CronJobsCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();
  const { toggle, isLoading: isToggling } = useToggleCronJob();
  const [updatingJob, setUpdatingJob] = useState<string | null>(null);

  const handleToggle = async (jobId: string, enabled: boolean) => {
    setUpdatingJob(jobId);
    try {
      await toggle(jobId, enabled);
      refetch();
    } finally {
      setUpdatingJob(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const jobs = data.cronJobs || [];

  return (
    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
      {jobs.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          暂无 Cron 任务
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map((job: CronJob) => (
            <div 
              key={job.jobId}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500 }}>{job.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge status={job.enabled ? 'enabled' : 'disabled'}>
                    {job.enabled ? '启用' : '禁用'}
                  </Badge>
                  <button
                    onClick={() => handleToggle(job.jobId, !job.enabled)}
                    disabled={isToggling && updatingJob === job.jobId}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: job.enabled ? '#dc2626' : '#16a34a',
                      backgroundColor: job.enabled ? '#fef2f2' : '#f0fdf4',
                      border: `1px solid ${job.enabled ? '#fecaca' : '#bbf7d0'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {updatingJob === job.jobId ? '更新中...' : job.enabled ? '禁用' : '启用'}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <div>调度: {formatSchedule(job.schedule)}</div>
                <div>目标: {job.sessionTarget}</div>
                <div>运行次数: {job.runCount}</div>
                {job.nextRun && <div>下次运行: {formatDate(job.nextRun)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 会话列表
// ============================================================================

const SessionsCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const sessions = data.sessions || [];

  return (
    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
      {sessions.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          暂无活动会话
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map((session: Session) => (
            <div 
              key={session.sessionKey}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '13px' }}>
                  {session.sessionKey}
                </span>
                <Badge status={session.type}>{session.type}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <div>Agent: {session.agentId}</div>
                <div>消息数: {session.messageCount}</div>
                <div>最后活动: {formatDate(session.lastActivity)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Agent 列表
// ============================================================================

const AgentsCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const agents = data.agents || [];

  return (
    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
      {agents.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          暂无 Agent
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agents.map((agent: Agent) => (
            <div 
              key={agent.agentId}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500 }}>{agent.agentId}</span>
                <Badge status={agent.status}>{agent.status}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <div>工作区: {agent.workspace}</div>
                <div>主模型: {agent.model.primary}</div>
                {agent.model.fallback && <div>备用模型: {agent.model.fallback}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 主仪表盘组件
// ============================================================================

export const GatewayDashboard: React.FC = () => {
  const { isConnected } = useGateway();
  const { refetch } = useDashboardData();

  if (!isConnected) {
    return (
      <div 
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
        }}
      >
        <p>请先连接到 Gateway 以查看仪表盘数据</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 刷新按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          onClick={refetch}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            color: '#3b82f6',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🔄 刷新数据
        </button>
      </div>

      {/* 仪表盘网格 */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        <Card title="Gateway 状态">
          <StatusCard />
        </Card>

        <Card title="频道">
          <ChannelsCard />
        </Card>

        <Card title="Cron 任务">
          <CronJobsCard />
        </Card>

        <Card title="会话">
          <SessionsCard />
        </Card>

        <Card title="Agents">
          <AgentsCard />
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 工具函数
// ============================================================================

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天 ${hours % 24}小时`;
  if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`;
  if (minutes > 0) return `${minutes}分钟 ${seconds % 60}秒`;
  return `${seconds}秒`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron') {
    return `Cron: ${schedule.expr}`;
  }
  if (schedule.kind === 'at') {
    return `定时: ${formatDate(schedule.atMs!)}`;
  }
  if (schedule.kind === 'interval') {
    return `间隔: ${schedule.intervalMs}ms`;
  }
  return '未知';
}

export default GatewayDashboard;
