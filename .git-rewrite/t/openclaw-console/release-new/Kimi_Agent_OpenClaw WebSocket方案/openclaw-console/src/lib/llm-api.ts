/**
 * OpenClaw LLM HTTP REST API 客户端
 * 
 * 用于 LLM 对话的 HTTP API，与 WebSocket API 互补使用
 * 
 * HTTP API 适用场景:
 * - LLM 对话 (chat completions)
 * - 一次性请求/响应
 * - 文件上传
 * 
 * WebSocket API 适用场景:
 * - 实时状态监控
 * - 事件订阅
 * - 流式响应
 */

import type { GatewayClientConfig } from '../types/gateway';

// ============================================================================
// 类型定义
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  tools?: ToolDefinition[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }[];
}

// ============================================================================
// LLM API 客户端
// ============================================================================

export class LlmApiClient {
  private baseUrl: string;
  private authToken: string;

  constructor(config: { baseUrl: string; authToken: string }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authToken = config.authToken;
  }

  /**
   * 从 Gateway WebSocket URL 推导 HTTP URL
   */
  static fromGatewayUrl(gatewayUrl: string, authToken: string): LlmApiClient {
    // ws://127.0.0.1:18789 -> http://127.0.0.1:18789
    // wss://example.com/ws -> https://example.com
    const httpUrl = gatewayUrl
      .replace(/^wss:\/\//, 'https://')
      .replace(/^ws:\/\//, 'http://')
      .replace(/\/ws$/, '');
    
    return new LlmApiClient({ baseUrl: httpUrl, authToken });
  }

  /**
   * 获取认证头
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
    };
  }

  /**
   * 发送请求
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new LlmApiError(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  // ============================================================================
  // Chat Completions API
  // ============================================================================

  /**
   * 创建聊天完成 (非流式)
   */
  async createChatCompletion(
    request: Omit<ChatCompletionRequest, 'stream'>
  ): Promise<ChatCompletionResponse> {
    return this.request<ChatCompletionResponse>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ ...request, stream: false }),
    });
  }

  /**
   * 创建聊天完成 (流式)
   */
  async createChatCompletionStream(
    request: Omit<ChatCompletionRequest, 'stream'>,
    onChunk: (chunk: ChatCompletionChunk) => void,
    onDone?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const url = `${this.baseUrl}/v1/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new LlmApiError(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new LlmApiError('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onDone?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6)) as ChatCompletionChunk;
              onChunk(data);
            } catch (error) {
              console.warn('Failed to parse SSE data:', trimmed);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  // ============================================================================
  // Models API
  // ============================================================================

  /**
   * 获取可用模型列表
   */
  async listModels(): Promise<{
    object: 'list';
    data: {
      id: string;
      object: 'model';
      created: number;
      owned_by: string;
    }[];
  }> {
    return this.request('/v1/models');
  }

  // ============================================================================
  // 工具调用辅助方法
  // ============================================================================

  /**
   * 执行工具调用
   */
  async executeWithTools(
    request: Omit<ChatCompletionRequest, 'tools' | 'tool_choice'>,
    tools: ToolDefinition[],
    toolHandlers: Record<string, (args: unknown) => Promise<unknown>>
  ): Promise<ChatCompletionResponse> {
    // 第一次调用，让模型决定使用什么工具
    const response = await this.createChatCompletion({
      ...request,
      tools,
      tool_choice: 'auto',
    });

    const message = response.choices[0]?.message;
    if (!message?.tool_calls) {
      return response;
    }

    // 执行工具调用
    const toolResults: ChatMessage[] = [];
    
    for (const toolCall of message.tool_calls) {
      const handler = toolHandlers[toolCall.function.name];
      if (handler) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await handler(args);
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: (error as Error).message }),
          });
        }
      }
    }

    // 第二次调用，将工具结果返回给模型
    return this.createChatCompletion({
      ...request,
      messages: [
        ...request.messages,
        message,
        ...toolResults,
      ],
    });
  }
}

// ============================================================================
// 错误类
// ============================================================================

export class LlmApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'LlmApiError';
  }
}

// ============================================================================
// React Hook
// ============================================================================

import { useState, useCallback, useRef } from 'react';

export function useLlmApi(config: { baseUrl: string; authToken: string }) {
  const clientRef = useRef(new LlmApiClient(config));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCompletion = useCallback(
    async (request: Omit<ChatCompletionRequest, 'stream'>) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await clientRef.current.createChatCompletion(request);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createStream = useCallback(
    async (
      request: Omit<ChatCompletionRequest, 'stream'>,
      onChunk: (chunk: ChatCompletionChunk) => void
    ) => {
      setIsLoading(true);
      setError(null);
      
      try {
        await clientRef.current.createChatCompletionStream(
          request,
          onChunk,
          () => setIsLoading(false),
          (err) => {
            setError(err);
            setIsLoading(false);
          }
        );
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    client: clientRef.current,
    isLoading,
    error,
    createCompletion,
    createStream,
  };
}

export default LlmApiClient;
