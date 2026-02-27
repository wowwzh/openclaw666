/**
 * 聊天示例组件
 * 
 * 展示如何混用 HTTP REST API (LLM 对话) 和 WebSocket API (状态监控)
 */

import React, { useState, useCallback, useRef } from 'react';
import { useGateway, useGatewayEvent } from '../hooks/useGateway';
import { useLlmApi } from '../lib/llm-api';
import type { ChatMessage, ChatCompletionChunk } from '../lib/llm-api';

interface ChatExampleProps {
  gatewayUrl: string;
  authToken: string;
}

export const ChatExample: React.FC<ChatExampleProps> = ({ gatewayUrl, authToken }) => {
  const { isConnected } = useGateway();
  const { createStream, isLoading: isStreaming } = useLlmApi({
    baseUrl: gatewayUrl.replace(/^ws/, 'http').replace(/\/ws$/, ''),
    authToken,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: '你是一个有帮助的 AI 助手。' },
  ]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [agentStatus, setAgentStatus] = useState<string>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 监听 Agent 事件
  useGatewayEvent('agent', (payload) => {
    setAgentStatus(payload.status);
  });

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStreamingContent('');

    try {
      let fullContent = '';
      
      await createStream(
        {
          model: 'anthropic/claude-opus-4-6',
          messages: [...messages, userMessage],
          temperature: 0.7,
          max_tokens: 2000,
        },
        (chunk: ChatCompletionChunk) => {
          const content = chunk.choices[0]?.delta?.content || '';
          fullContent += content;
          setStreamingContent(fullContent);
          scrollToBottom();
        }
      );

      // 流式响应完成，添加到消息列表
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullContent },
      ]);
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，发生了错误。请重试。' },
      ]);
    }
  }, [input, messages, createStream, isStreaming]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.offlineMessage}>
          <p>请先连接到 Gateway 以使用聊天功能</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Agent 状态指示器 */}
      <div style={styles.statusBar}>
        <span style={styles.statusLabel}>Agent 状态:</span>
        <span style={{ ...styles.statusBadge, ...getStatusStyle(agentStatus) }}>
          {getStatusText(agentStatus)}
        </span>
      </div>

      {/* 消息列表 */}
      <div style={styles.messagesContainer}>
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage),
            }}
          >
            <div style={styles.messageHeader}>
              {message.role === 'user' ? '👤 用户' : '🤖 助手'}
            </div>
            <div style={styles.messageContent}>{message.content}</div>
          </div>
        ))}
        
        {/* 流式响应预览 */}
        {streamingContent && (
          <div style={{ ...styles.message, ...styles.assistantMessage }}>
            <div style={styles.messageHeader}>🤖 助手</div>
            <div style={styles.messageContent}>{streamingContent}</div>
            <span style={styles.typingIndicator}>▊</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div style={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          disabled={isStreaming}
          style={styles.input}
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          style={{
            ...styles.sendButton,
            ...(isStreaming || !input.trim() ? styles.sendButtonDisabled : {}),
          }}
        >
          {isStreaming ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

// 辅助函数
function getStatusStyle(status: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    idle: { backgroundColor: '#dcfce7', color: '#166534' },
    running: { backgroundColor: '#dbeafe', color: '#1e40af' },
    error: { backgroundColor: '#fee2e2', color: '#991b1b' },
  };
  return styles[status] || styles.idle;
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    idle: '空闲',
    running: '运行中',
    error: '错误',
  };
  return texts[status] || status;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  offlineMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  statusLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  statusBadge: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '9999px',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
  },
  messageHeader: {
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '4px',
    opacity: 0.8,
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  typingIndicator: {
    fontSize: '14px',
    color: '#3b82f6',
    animation: 'blink 1s infinite',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    resize: 'none',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default ChatExample;
