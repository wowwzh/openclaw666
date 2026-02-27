/**
 * Chat Page
 * 与 OpenClaw Gateway 通信的对话页面
 */
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, MessageSquare, Sparkles, Trash2, Loader2, Send, User } from 'lucide-react';
import { useChatStore } from '../stores/chat';
import { useGatewayStore } from '../stores/gateway';
import { ChatMessage as ChatMessageType } from '../stores/types';

// 简单的加载动画组件
function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
  };
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
  );
}

// 欢迎页面组件
function WelcomeScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center',
      padding: '80px 20px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <Bot size={32} color="white" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
        欢迎使用 OpenClaw
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '32px', maxWidth: '400px' }}>
        开始与 AI 助手对话，发送消息即可开始
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '16px', 
        maxWidth: '500px', 
        width: '100%',
      }}>
        <div style={{
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          textAlign: 'left',
        }}>
          <MessageSquare size={24} style={{ color: '#6366f1', marginBottom: '8px' }} />
          <h3 style={{ fontWeight: '500', marginBottom: '4px' }}>问答</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>向 AI 助手提问</p>
        </div>
        <div style={{
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          textAlign: 'left',
        }}>
          <Sparkles size={24} style={{ color: '#6366f1', marginBottom: '8px' }} />
          <h3 style={{ fontWeight: '500', marginBottom: '4px' }}>创意任务</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>生成创意内容</p>
        </div>
      </div>
    </div>
  );
}

// 打字指示器
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Sparkles size={16} color="white" />
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            background: '#6b7280', 
            borderRadius: '50%', 
            animation: 'bounce 1s infinite',
            animationDelay: '0ms',
          }} />
          <span style={{ 
            width: '8px', 
            height: '8px', 
            background: '#6b7280', 
            borderRadius: '50%', 
            animation: 'bounce 1s infinite',
            animationDelay: '150ms',
          }} />
          <span style={{ 
            width: '8px', 
            height: '8px', 
            background: '#6b7280', 
            borderRadius: '50%', 
            animation: 'bounce 1s infinite',
            animationDelay: '300ms',
          }} />
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

// 格式化消息内容
function formatMessageContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    return JSON.stringify(content);
  }
  return String(content);
}

export function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [streamingTimestamp, setStreamingTimestamp] = useState<number>(0);

  // Gateway 状态
  const gatewayStatus = useGatewayStore((s) => s.status);
  const gatewayInit = useGatewayStore((s) => s.init);
  const isGatewayRunning = gatewayStatus.state === 'running';

  // Chat Store 状态
  const messages = useChatStore((s) => s.messages);
  const loading = useChatStore((s) => s.loading);
  const sending = useChatStore((s) => s.sending);
  const error = useChatStore((s) => s.error);
  const showThinking = useChatStore((s) => s.showThinking);
  const streamingMessage = useChatStore((s) => s.streamingMessage);
  const streamingTools = useChatStore((s) => s.streamingTools);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const loadSessions = useChatStore((s) => s.loadSessions);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const abortRun = useChatStore((s) => s.abortRun);
  const clearError = useChatStore((s) => s.clearError);
  const clear = useChatStore((s) => s.clear);

  // 初始化 Gateway 并加载数据
  useEffect(() => {
    let cancelled = false;
    
    const initAndLoad = async () => {
      if (!isGatewayRunning) return;
      
      // 初始化 Gateway
      await gatewayInit();
      
      if (cancelled) return;
      
      // 加载会话列表和历史消息
      await loadSessions();
      if (cancelled) return;
      await loadHistory();
    };
    
    initAndLoad();
    
    return () => {
      cancelled = true;
    };
  }, [isGatewayRunning, gatewayInit, loadHistory, loadSessions]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, sending]);

  // 更新发送时间戳
  useEffect(() => {
    if (sending && streamingTimestamp === 0) {
      setStreamingTimestamp(Date.now() / 1000);
    } else if (!sending && streamingTimestamp !== 0) {
      setStreamingTimestamp(0);
    }
  }, [sending, streamingTimestamp]);

  // 处理发送消息
  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    const userText = input;
    setInput('');
    await sendMessage(userText);
  };

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Gateway 未运行
  if (!isGatewayRunning) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        padding: '32px',
      }}>
        <AlertCircle size={48} style={{ color: '#eab308', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
          Gateway 未运行
        </h2>
        <p style={{ color: '#6b7280', maxWidth: '400px' }}>
          请先启动 Gateway 服务以使用对话功能
        </p>
      </div>
    );
  }

  // 提取流式文本
  const streamText = streamingMessage 
    ? formatMessageContent(streamingMessage.content)
    : '';
  const hasStreamText = streamText.trim().length > 0;
  const hasStreamToolStatus = showThinking && streamingTools.length > 0;
  const shouldRenderStreaming = sending && (hasStreamText || hasStreamToolStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 标题栏 */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #e2e8f0',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={20} />
          对话
        </h1>
        <button 
          onClick={clear}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          <Trash2 size={16} />
          清空记录
        </button>
      </div>
      
      {/* 消息列表 */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '24px',
        background: '#f8fafc',
      }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '80px 0',
          }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : messages.length === 0 && !sending ? (
          <WelcomeScreen />
        ) : (
          <>
            {messages.map((msg: ChatMessageType, idx: number) => (
              <div 
                key={msg.id || `msg-${idx}`}
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: msg.role === 'user' ? '#2563eb' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div style={{
                  maxWidth: '70%',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? '#2563eb' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {formatMessageContent(msg.content)}
                  </div>
                  {msg.timestamp && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#94a3b8', 
                      marginTop: '4px',
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}>
                      {new Date(msg.timestamp * 1000).toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 流式消息 */}
            {shouldRenderStreaming && (
              <div 
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                  flexDirection: 'row',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  <Bot size={18} />
                </div>
                <div style={{
                  maxWidth: '70%',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#1e293b',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {streamText}
                    <span style={{ 
                      display: 'inline-block', 
                      width: '8px', 
                      height: '16px', 
                      background: '#6366f1',
                      marginLeft: '2px',
                      animation: 'blink 1s infinite',
                      verticalAlign: 'middle',
                    }} />
                  </div>
                  <style>{`
                    @keyframes blink {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0; }
                    }
                  `}</style>
                </div>
              </div>
            )}

            {/* 工具调用状态 */}
            {hasStreamToolStatus && (
              <div style={{ marginBottom: '16px' }}>
                {streamingTools.map((tool, idx) => (
                  <div 
                    key={tool.id || `tool-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: '#f0f9ff',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: '#0369a1',
                      marginBottom: '4px',
                    }}
                  >
                    <Loader2 size={14} className={tool.status === 'running' ? 'animate-spin' : ''} />
                    <span>
                      {tool.status === 'running' ? '执行中: ' : tool.status === 'completed' ? '完成: ' : '错误: '}
                      {tool.name}
                    </span>
                    {tool.summary && <span style={{ color: '#6b7280' }}>- {tool.summary}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* 打字指示器 */}
            {sending && !hasStreamText && !hasStreamToolStatus && (
              <TypingIndicator />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div style={{ 
          padding: '8px 16px', 
          background: '#fef2f2',
          borderTop: '1px solid #fecaca',
        }}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <p style={{ fontSize: '0.875rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              {error}
            </p>
            <button
              onClick={clearError}
              style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
      
      {/* 输入框 */}
      <div style={{ 
        padding: '16px 24px', 
        borderTop: '1px solid #e2e8f0',
        background: '#fff',
        display: 'flex',
        gap: '12px',
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter发送, Shift+Enter换行)"
          disabled={sending || !isGatewayRunning}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem',
            resize: 'none',
            minHeight: '44px',
          }}
        />
        <button
          onClick={sending ? abortRun : handleSend}
          disabled={!isGatewayRunning || (!sending && !input.trim())}
          style={{
            padding: '12px 20px',
            background: sending ? '#dc2626' : (!isGatewayRunning ? '#94a3b8' : '#2563eb'),
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: !isGatewayRunning || (!sending && !input.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '100px',
            justifyContent: 'center',
          }}
        >
          {sending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              停止
            </>
          ) : (
            <>
              <Send size={18} />
              发送
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Chat;
