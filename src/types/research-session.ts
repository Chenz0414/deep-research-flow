import type { Stage, ThoughtItem, MessageItem, ResearchRound } from './deep-research';

export interface ResearchProgress {
  /** Total sections from the plan */
  totalSections: number;
  /** How many sections have been completed */
  completedSections: number;
  /** Current section being researched */
  currentSection?: string;
}

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
  researchProgress: ResearchProgress;
  /** True when all research rounds are done and report is being written */
  isWritingReport: boolean;
  deepSearchStep: number;
}
