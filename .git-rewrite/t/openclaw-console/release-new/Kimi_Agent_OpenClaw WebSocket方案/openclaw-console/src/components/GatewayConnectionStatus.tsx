/**
 * Gateway 连接状态组件
 * 
 * 显示当前 WebSocket 连接状态，并提供连接/断开按钮
 */

import React from 'react';
import { useGateway } from '../hooks/useGateway';
import type { ConnectionState } from '../types/gateway';

interface GatewayConnectionStatusProps {
  className?: string;
}

const stateConfig: Record<ConnectionState, { label: string; color: string; icon: string }> = {
  disconnected: { label: '已断开', color: '#ef4444', icon: '⚪' },
  connecting: { label: '连接中...', color: '#f59e0b', icon: '🟡' },
  authenticating: { label: '认证中...', color: '#3b82f6', icon: '🔵' },
  connected: { label: '已连接', color: '#10b981', icon: '🟢' },
  reconnecting: { label: '重连中...', color: '#f59e0b', icon: '🔄' },
  error: { label: '错误', color: '#dc2626', icon: '❌' },
};

export const GatewayConnectionStatus: React.FC<GatewayConnectionStatusProps> = ({ 
  className = '' 
}) => {
  const { state, isConnected, connect, disconnect } = useGateway({
    autoConnect: false,
  });

  const config = stateConfig[state];

  return (
    <div 
      className={`gateway-connection-status ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* 状态指示器 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span 
          style={{ 
            fontSize: '16px',
            animation: state === 'connecting' || state === 'reconnecting' 
              ? 'pulse 1.5s infinite' 
              : undefined,
          }}
        >
          {config.icon}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: config.color,
          }}
        >
          {config.label}
        </span>
      </div>

      {/* 分隔线 */}
      <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />

      {/* 操作按钮 */}
      {isConnected ? (
        <button
          onClick={disconnect}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
        >
          断开连接
        </button>
      ) : (
        <button
          onClick={connect}
          disabled={state === 'connecting' || state === 'authenticating'}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: state === 'connecting' || state === 'authenticating' 
              ? '#9ca3af' 
              : '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            cursor: state === 'connecting' || state === 'authenticating' 
              ? 'not-allowed' 
              : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {state === 'connecting' || state === 'authenticating' ? '连接中...' : '连接'}
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default GatewayConnectionStatus;
