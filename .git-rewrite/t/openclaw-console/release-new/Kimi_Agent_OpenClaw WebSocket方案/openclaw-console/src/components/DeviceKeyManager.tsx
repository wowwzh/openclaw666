/**
 * 设备密钥管理组件
 * 
 * 展示设备密钥的生成、签名和配对状态
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getDeviceKeyManager, DeviceCryptoError } from '../lib/device-crypto';
import type { DeviceKeyPair, DeviceSignature } from '../lib/device-crypto';

export const DeviceKeyManager: React.FC = () => {
  const [keyPair, setKeyPair] = useState<DeviceKeyPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testNonce, setTestNonce] = useState('test-challenge-nonce-123');
  const [signature, setSignature] = useState<DeviceSignature | null>(null);

  // 初始化设备密钥
  useEffect(() => {
    loadDeviceKey();
  }, []);

  const loadDeviceKey = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const manager = getDeviceKeyManager();
      const kp = await manager.initialize();
      setKeyPair(kp);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const manager = getDeviceKeyManager();
      await manager.reset();
      setKeyPair(null);
      setSignature(null);
      // 重新生成
      await loadDeviceKey();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSign = async () => {
    if (!testNonce.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const manager = getDeviceKeyManager();
      const sig = await manager.signChallenge(testNonce);
      setSignature(sig);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const truncate = (str: string, len: number = 20) => {
    if (str.length <= len) return str;
    return str.slice(0, len) + '...';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 设备密钥管理</h2>
      
      {error && (
        <div style={styles.errorAlert}>
          ⚠️ {error}
        </div>
      )}

      {/* 密钥信息 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>当前设备密钥</h3>
        
        {isLoading && !keyPair ? (
          <div style={styles.loading}>初始化中...</div>
        ) : keyPair ? (
          <div style={styles.keyInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>设备 ID:</span>
              <code style={styles.code}>{keyPair.deviceId}</code>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>公钥:</span>
              <code style={styles.code} title={keyPair.publicKey}>
                {truncate(keyPair.publicKey, 40)}
              </code>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>创建时间:</span>
              <span>{formatDate(keyPair.createdAt)}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>私钥状态:</span>
              <span style={styles.success}>✓ 内存中 (会话期间有效)</span>
            </div>
          </div>
        ) : (
          <div style={styles.empty}>暂无设备密钥</div>
        )}

        <div style={styles.actions}>
          <button 
            onClick={loadDeviceKey} 
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? '加载中...' : '刷新密钥'}
          </button>
          <button 
            onClick={handleReset} 
            disabled={isLoading}
            style={{ ...styles.button, ...styles.dangerButton }}
          >
            重置密钥 (重新配对)
          </button>
        </div>
      </div>

      {/* 签名测试 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>签名测试</h3>
        
        <div style={styles.testArea}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Challenge Nonce:</label>
            <input
              type="text"
              value={testNonce}
              onChange={(e) => setTestNonce(e.target.value)}
              style={styles.input}
              placeholder="输入要签名的 nonce"
            />
          </div>
          
          <button 
            onClick={handleTestSign} 
            disabled={isLoading || !testNonce.trim()}
            style={styles.button}
          >
            {isLoading ? '签名中...' : '测试签名'}
          </button>
        </div>

        {signature && (
          <div style={styles.signatureResult}>
            <h4 style={styles.resultTitle}>签名结果</h4>
            <div style={styles.infoRow}>
              <span style={styles.label}>签名值:</span>
              <code style={styles.code} title={signature.signature}>
                {truncate(signature.signature, 50)}
              </code>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>签名时间:</span>
              <span>{formatDate(signature.signedAt)}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>使用的公钥:</span>
              <code style={styles.code} title={signature.publicKey}>
                {truncate(signature.publicKey, 30)}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>工作原理</h3>
        <div style={styles.explanation}>
          <ol style={styles.list}>
            <li><strong>密钥生成:</strong> 首次连接时，使用 WebCrypto API 生成 ECDSA P-256 密钥对</li>
            <li><strong>公钥存储:</strong> 公钥和设备 ID 保存到 localStorage</li>
            <li><strong>私钥管理:</strong> 私钥仅保存在内存中，页面刷新后需要重新生成</li>
            <li><strong>Challenge 签名:</strong> 收到 Gateway 的 challenge 后，使用私钥签名 (nonce + timestamp)</li>
            <li><strong>设备配对:</strong> Gateway 验证签名后，颁发 deviceToken 用于后续连接</li>
          </ol>
          
          <div style={styles.note}>
            <strong>注意:</strong> 由于 Web 安全限制，私钥无法持久化存储。
            每次页面刷新后需要重新生成密钥对并重新配对设备。
            生产环境建议使用原生应用或浏览器扩展来持久化私钥。
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
  },
  title: {
    margin: '0 0 24px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
  },
  section: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
  },
  errorAlert: {
    padding: '12px 16px',
    marginBottom: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#9ca3af',
  },
  keyInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6b7280',
    minWidth: '100px',
  },
  code: {
    padding: '4px 8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    wordBreak: 'break-all' as const,
  },
  success: {
    color: '#16a34a',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  testArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  signatureResult: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
  },
  resultTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#166534',
  },
  explanation: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#4b5563',
  },
  list: {
    margin: '0 0 16px 0',
    paddingLeft: '20px',
  },
  note: {
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    border: '1px solid #fcd34d',
    color: '#92400e',
    fontSize: '13px',
  },
};

export default DeviceKeyManager;
