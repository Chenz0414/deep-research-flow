import { useCallback, useRef } from 'react';
import type { ThoughtItem, MessageItem } from '@/types/deep-research';

const API_URL = 'https://apiv2.wahezu.cn/ai/deep_search/chat';

interface UseSSEOptions {
  onThought: (thought: ThoughtItem) => void;
  onContent: (chunk: string) => void;
  onComplete: (messageId?: string) => void;
  onError: (error: string) => void;
}

export function useSSE({ onThought, onContent, onComplete, onError }: UseSSEOptions) {
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (
    messages: MessageItem[],
    params: { is_deep_search: boolean; is_edit_plan: boolean; deep_search_step?: number }
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer e9QyzZfgMk43Re2tsgwGzFWFHGv3P94g',
        },
        body: JSON.stringify({ messages, ...params }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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
              const thoughtTypes = ['thinking', 'searching', 'search_result', 'planning', 'writing'];

              if (thoughtTypes.includes(currentEvent)) {
                onThought({
                  id: `${currentEvent}-${Date.now()}-${Math.random()}`,
                  type: currentEvent as ThoughtItem['type'],
                  content: data.content || data.query || data.result || JSON.stringify(data),
                  timestamp: Date.now(),
                });
              } else if (currentEvent === 'content') {
                onContent(data.content || '');
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
