export type Stage = 'IDLE' | 'GENERATING_PLAN' | 'REVIEWING_PLAN' | 'RESEARCHING';

export interface ThoughtItem {
  id: string;
  type: 'thinking' | 'searching' | 'search_result' | 'planning' | 'writing';
  content: string;
  timestamp: number;
}

export interface MessageItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface PlanSection {
  title: string;
  description: string;
}

export interface SSEEvent {
  event: string;
  data: string;
}

export interface ChatRequestBody {
  messages: MessageItem[];
  is_deep_search: boolean;
  is_edit_plan: boolean;
  deep_search_step?: number;
}
