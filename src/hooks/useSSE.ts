import { useCallback, useRef } from 'react';
import type { ThoughtItem, ApiMessage } from '@/types/deep-research';

const API_URL = 'https://apiv2.wahezu.cn/ai/deep_search/chat';

function generateKey(): string {
  return `${crypto.randomUUID()}-1`;
}

interface UseSSEOptions {
  onThought: (thought: ThoughtItem) => void;
  onContent: (chunk: string) => void;
  onComplete: (messageId?: string) => void;
  onError: (error: string) => void;
}

interface SendParams {
  chat_id: number;
  model: string;
  is_deep_search: boolean;
  is_edit_plan: boolean;
  deep_search_step?: number;
  report_style?: number;
  language?: string;
}

export function useSSE({ onThought, onContent, onComplete, onError }: UseSSEOptions) {
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (
    messages: ApiMessage[],
    params: SendParams
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const body = {
        ...params,
        messages,
        key: generateKey(),
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': 'e9QyzZfgMk43Re2tsgwGzFWFHGv3P94g',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // Check if response is a JSON error (some APIs return 200 with error body)
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json') && !contentType.includes('stream')) {
        const json = await res.json();
        if (json.code && json.code !== 200 && json.code !== 0) {
          throw new Error(json.message || json.error || `API Error ${json.code}`);
        }
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              // Handle error events
              if (currentEvent === 'error') {
                onError(data.message || data.error || 'Unknown error');
                return;
              }

              const thoughtTypes = ['thinking', 'searching', 'search_result', 'planning', 'writing'];

              if (thoughtTypes.includes(currentEvent)) {
                onThought({
                  id: `${currentEvent}-${Date.now()}-${Math.random()}`,
                  type: currentEvent as ThoughtItem['type'],
                  content: data.text || data.content || data.query || data.result || data.status || JSON.stringify(data),
                  timestamp: Date.now(),
                });
              } else if (currentEvent === 'content') {
                onContent(data.text || data.content || '');
              } else if (currentEvent === 'user_message') {
                onComplete(data.message_id);
              }
            } catch {
              // non-JSON data line, skip
            }
            currentEvent = '';
          }
        }
      }

      onComplete();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onError(err.message || 'Stream failed');
      }
    }
  }, [onThought, onContent, onComplete, onError]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { send, abort };
}
