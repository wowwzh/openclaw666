/**
 * Gateway 连接配置表单
 * 
 * 用于配置 Gateway WebSocket 连接参数
 */

import React, { useState, useEffect } from 'react';
import type { GatewayClientConfig, ProtocolVersion, ClientRole, OperatorScope } from '../types/gateway';

interface GatewayConfigFormProps {
  initialConfig?: Partial<GatewayClientConfig>;
  onSave: (config: GatewayClientConfig) => void;
  onCancel?: () => void;
}

const PROTOCOL_VERSIONS: ProtocolVersion[] = [3];

const CLIENT_ROLES: { value: ClientRole; label: string }[] = [
  { value: 'operator', label: '操作员 (Operator)' },
  { value: 'node', label: '节点 (Node)' },
];

const OPERATOR_SCOPES: { value: OperatorScope; label: string }[] = [
  { value: 'operator.read', label: '读取 (read)' },
  { value: 'operator.write', label: '写入 (write)' },
  { value: 'operator.admin', label: '管理 (admin)' },
  { value: 'operator.approvals', label: '审批 (approvals)' },
  { value: 'operator.pairing', label: '配对 (pairing)' },
];

export const GatewayConfigForm: React.FC<GatewayConfigFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<Partial<GatewayClientConfig>>({
    url: 'ws://127.0.0.1:18789',
    authToken: '',
    clientId: 'openclaw-console',
    clientVersion: '1.0.0',
    protocolVersion: 3,
    role: 'operator',
    scopes: ['operator.read', 'operator.write', 'operator.admin'],
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
    ...initialConfig,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 从 localStorage 加载保存的配置
  useEffect(() => {
    try {
      const saved = localStorage.getItem('openclaw_gateway_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error);
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.url) {
      newErrors.url = 'Gateway URL 不能为空';
    } else if (!/^wss?:\/\/.+/.test(config.url!)) {
      newErrors.url = '无效的 WebSocket URL';
    }

    if (!config.authToken) {
      newErrors.authToken = '认证 Token 不能为空';
    }

    if (!config.clientId) {
      newErrors.clientId = '客户端 ID 不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // 保存到 localStorage
      localStorage.setItem('openclaw_gateway_config', JSON.stringify(config));
      onSave(config as GatewayClientConfig);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScopeToggle = (scope: OperatorScope) => {
    const currentScopes = config.scopes || [];
    const newScopes = currentScopes.includes(scope)
      ? currentScopes.filter((s) => s !== scope)
      : [...currentScopes, scope];
    handleChange('scopes', newScopes);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${errors[field] ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  };

  const errorStyle: React.CSSProperties = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#ef4444',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>
        Gateway 连接配置
      </h2>

      {/* 基本配置 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#6b7280' }}>
          基本配置
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Gateway URL *</label>
          <input
            type="text"
            value={config.url}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="ws://127.0.0.1:18789"
            style={inputStyle('url')}
          />
          {errors.url && <span style={errorStyle}>{errors.url}</span>}
          <span style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280', display: 'block' }}>
            WebSocket 地址，支持 ws:// 和 wss://
          </span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>认证 Token *</label>
          <input
            type="password"
            value={config.authToken}
            onChange={(e) => handleChange('authToken', e.target.value)}
            placeholder="输入 Gateway 认证 Token"
            style={inputStyle('authToken')}
          />
          {errors.authToken && <span style={errorStyle}>{errors.authToken}</span>}
          <span style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280', display: 'block' }}>
            从环境变量 OPENCLAW_GATEWAY_TOKEN 或配置文件获取
          </span>
        </div>
      </div>

      {/* 客户端配置 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#6b7280' }}>
          客户端配置
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>客户端 ID</label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              style={inputStyle('clientId')}
            />
            {errors.clientId && <span style={errorStyle}>{errors.clientId}</span>}
          </div>

          <div>
            <label style={labelStyle}>客户端版本</label>
            <input
              type="text"
              value={config.clientVersion}
              onChange={(e) => handleChange('clientVersion', e.target.value)}
              style={inputStyle('clientVersion')}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={labelStyle}>协议版本</label>
            <select
              value={config.protocolVersion}
              onChange={(e) => handleChange('protocolVersion', Number(e.target.value))}
              style={inputStyle('protocolVersion')}
            >
              {PROTOCOL_VERSIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>角色</label>
            <select
              value={config.role}
              onChange={(e) => handleChange('role', e.target.value)}
              style={inputStyle('role')}
            >
              {CLIENT_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>权限范围</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {OPERATOR_SCOPES.map((scope) => (
              <label
                key={scope.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: (config.scopes || []).includes(scope.value)
                    ? '#dbeafe'
                    : '#f3f4f6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <input
                  type="checkbox"
                  checked={(config.scopes || []).includes(scope.value)}
                  onChange={() => handleScopeToggle(scope.value)}
                  style={{ margin: 0 }}
                />
                {scope.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 重连配置 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#6b7280' }}>
          重连配置
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={config.reconnect?.enabled}
              onChange={(e) =>
                handleChange('reconnect', { ...config.reconnect, enabled: e.target.checked })
              }
            />
            <span>启用自动重连</span>
          </label>
        </div>

        {config.reconnect?.enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={labelStyle}>初始延迟 (ms)</label>
              <input
                type="number"
                value={config.reconnect.initialDelay}
                onChange={(e) =>
                  handleChange('reconnect', {
                    ...config.reconnect,
                    initialDelay: Number(e.target.value),
                  })
                }
                min={100}
                step={100}
                style={inputStyle('reconnect.initialDelay')}
              />
            </div>

            <div>
              <label style={labelStyle}>最大延迟 (ms)</label>
              <input
                type="number"
                value={config.reconnect.maxDelay}
                onChange={(e) =>
                  handleChange('reconnect', {
                    ...config.reconnect,
                    maxDelay: Number(e.target.value),
                  })
                }
                min={1000}
                step={1000}
                style={inputStyle('reconnect.maxDelay')}
              />
            </div>

            <div>
              <label style={labelStyle}>最大重试次数</label>
              <input
                type="number"
                value={config.reconnect.maxRetries}
                onChange={(e) =>
                  handleChange('reconnect', {
                    ...config.reconnect,
                    maxRetries: Number(e.target.value),
                  })
                }
                min={1}
                max={100}
                style={inputStyle('reconnect.maxRetries')}
              />
            </div>

            <div>
              <label style={labelStyle}>抖动系数 (0-1)</label>
              <input
                type="number"
                value={config.reconnect.jitter}
                onChange={(e) =>
                  handleChange('reconnect', {
                    ...config.reconnect,
                    jitter: Number(e.target.value),
                  })
                }
                min={0}
                max={1}
                step={0.1}
                style={inputStyle('reconnect.jitter')}
              />
            </div>
          </div>
        )}
      </div>

      {/* 心跳配置 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#6b7280' }}>
          心跳配置
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={config.heartbeat?.enabled}
              onChange={(e) =>
                handleChange('heartbeat', { ...config.heartbeat, enabled: e.target.checked })
              }
            />
            <span>启用心跳检测</span>
          </label>
        </div>

        {config.heartbeat?.enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={labelStyle}>心跳间隔 (ms)</label>
              <input
                type="number"
                value={config.heartbeat.interval}
                onChange={(e) =>
                  handleChange('heartbeat', {
                    ...config.heartbeat,
                    interval: Number(e.target.value),
                  })
                }
                min={5000}
                step={1000}
                style={inputStyle('heartbeat.interval')}
              />
            </div>

            <div>
              <label style={labelStyle}>超时时间 (ms)</label>
              <input
                type="number"
                value={config.heartbeat.timeout}
                onChange={(e) =>
                  handleChange('heartbeat', {
                    ...config.heartbeat,
                    timeout: Number(e.target.value),
                  })
                }
                min={1000}
                step={1000}
                style={inputStyle('heartbeat.timeout')}
              />
            </div>
          </div>
        )}
      </div>

      {/* 按钮 */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
        )}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            color: '#fff',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          保存并连接
        </button>
      </div>
    </form>
  );
};

export default GatewayConfigForm;
