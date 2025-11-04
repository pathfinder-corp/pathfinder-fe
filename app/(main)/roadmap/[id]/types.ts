export interface INodeDetail {
  title: string;
  description: string;
  duration: string;
  outcome?: string;
  keyActivities?: string[];
  resources?: Array<{
    type: string;
    title: string;
    url: string;
    description: string;
  }>;
  isPhase: boolean;
  phaseTitle?: string;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type LoadingStates = {
  initial: boolean;
  aiChat: boolean;
};

