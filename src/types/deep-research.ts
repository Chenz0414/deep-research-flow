export type Stage = 'IDLE' | 'GENERATING_PLAN' | 'REVIEWING_PLAN' | 'RESEARCHING' | 'COMPLETED';

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

/** API message format: uses `text` field */
export interface ApiMessage {
  text: string;
}

export interface PlanSection {
  title: string;
  description: string;
}

export interface SearchReference {
  title: string;
  url: string;
  favicon?: string;
}

export interface SearchImage {
  url: string;
  alt?: string;
}

export interface ResearchRound {
  id: string;
  type: 'search' | 'text' | 'summary';
  /** For 'search' type: the search query */
  query?: string;
  references?: SearchReference[];
  images?: SearchImage[];
  /** For 'text' and 'summary' type: markdown content */
  content?: string;
  /** Whether this round is still streaming */
  isStreaming?: boolean;
}

export interface SSEEvent {
  event: string;
  data: string;
}

export interface ChatRequestBody {
  chat_id: number;
  model: string;
  messages: ApiMessage[];
  is_deep_search: boolean;
  is_edit_plan: boolean;
  deep_search_step?: number;
  key: string;
  report_style?: number;
  language?: string;
}
