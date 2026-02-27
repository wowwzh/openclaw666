/**
 * OpenClaw Console Web 客户端 - 主应用
 * 
 * 功能:
 * - Gateway 连接配置
 * - 连接状态显示
 * - 仪表盘数据展示
 */

import React, { useState, useCallback } from 'react';
import { GatewayClient, createGatewayClient, setGlobalGatewayClient } from './lib/gateway-client';
import { GatewayProvider } from './hooks/useGateway';
import { GatewayConfigForm } from './components/GatewayConfigForm';
import { GatewayConnectionStatus } from './components/GatewayConnectionStatus';
import { GatewayDashboard } from './components/GatewayDashboard';
import type { GatewayClientConfig, ConnectionState } from './types/gateway';

type AppView = 'config' | 'dashboard';

const App: React.FC = () => {
  const [client, setClient] = useState<GatewayClient | null>(null);
  const [view, setView] = useState<AppView>('config');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // 处理配置保存
  const handleConfigSave = useCallback(async (config: GatewayClientConfig) => {
    try {
      setError(null);
      
      // 创建新的客户端
      const newClient = createGatewayClient(config);
      
      // 监听状态变化
      newClient.on('stateChange', (event) => {
        setConnectionState(event.state);
      });

      newClient.on('error', (err) => {
        setError(err.message);
      });

      // 尝试连接
      await newClient.connect();
      
      // 连接成功
      setClient(newClient);
      setGlobalGatewayClient(newClient);
      setView('dashboard');
      
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // 断开连接
  const handleDisconnect = useCallback(() => {
    client?.disconnect();
    setClient(null);
    setGlobalGatewayClient(null);
    setView('config');
    setError(null);
  }, [client]);

  // 如果还没有客户端，显示配置表单
  if (!client || view === 'config') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>OpenClaw Console</h1>
            <p style={styles.subtitle}>Gateway WebSocket 客户端</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <strong>连接失败:</strong> {error}
            </div>
          )}

          <GatewayConfigForm
            onSave={handleConfigSave}
            initialConfig={{
              url: localStorage.getItem('openclaw_gateway_url') || 'ws://127.0.0.1:18789',
              authToken: localStorage.getItem('openclaw_gateway_token') || '',
            }}
          />
        </div>
      </div>
    );
  }

  // 已连接，显示仪表盘
  return (
    <GatewayProvider value={{ client, state: connectionState, isConnected: true, error: null }}>
      <div style={styles.appContainer}>
        {/* 顶部导航栏 */}
        <header style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <h1 style={styles.headerTitle}>OpenClaw Console</h1>
            <span style={styles.versionBadge}>v1.0.0</span>
          </div>
          <div style={styles.headerRight}>
            <GatewayConnectionStatus />
            <button
              onClick={handleDisconnect}
              style={styles.disconnectButton}
            >
              断开并重新配置
            </button>
          </div>
        </header>

        {/* 主内容区 */}
        <main style={styles.mainContent}>
          <GatewayDashboard />
        </main>

        {/* 页脚 */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            OpenClaw Console - 基于 Gateway WebSocket API
          </p>
        </footer>
      </div>
    </GatewayProvider>
  );
};

// ============================================================================
// 样式
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '32px',
    width: '100%',
    maxWidth: '640px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
  errorAlert: {
    padding: '12px 16px',
    marginBottom: '20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '14px',
  },
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f1f5f9',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
  },
  versionBadge: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  disconnectButton: {
    padding: '8px 16px',
    fontSize: '13px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    overflow: 'auto',
  },
  footer: {
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
  },
};

export default App;
