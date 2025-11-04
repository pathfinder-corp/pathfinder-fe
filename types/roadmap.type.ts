export interface IRoadmapRequest {
  topic: string;
  background?: string;
  targetOutcome?: string;
  experienceLevel?: string;
  learningPace?: string;
  timeframe?: string;
  preferences?: string;
}

interface ISummary {
  recommendedCadence: string;
  recommendedDuration: string;
  successTips: string[];
  additionalNotes: string;
}

interface IPhase {
  title: string;
  outcome: string;
  estimatedDuration: string;
  steps: IStep[];
}

interface IStep {
  title: string;
  description: string;
  estimatedDuration: string;
  keyActivities: string[];
  resources: IResource[];
}

interface IResource {
  type: string;
  title: string;
  url: string;
  description: string;
}

interface IMilestone {
  title: string;
  successCriteria: string;
}

export interface IRoadmapResponse {
  id: string;
  topic: string;
  experienceLevel: string;
  learningPace: string;
  timeframe: string;
  summary: ISummary;
  phases: IPhase[];
  milestones: IMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface IRoadmapListResponse {
  data: IRoadmapResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface IAskInsightRequest {
  question: string;
  phaseTitle?: string;
  stepTitle?: string;
}

export interface IAskInsightResponse {
  answer: string;
}