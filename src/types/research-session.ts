import type { Stage, ThoughtItem, MessageItem, ResearchRound } from './deep-research';

export interface ResearchSession {
  id: string;
  title: string;
  createdAt: string;
  stage: Stage;
  thoughts: ThoughtItem[];
  messageHistory: MessageItem[];
  planText: string;
  reportMarkdown: string;
  researchRounds: ResearchRound[];
  deepSearchStep: number;
}
