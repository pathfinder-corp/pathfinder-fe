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

interface IRoadmapOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
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
  owner: IRoadmapOwner;
  accessType: 'owner' | 'shared' | 'public';
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

export interface ISharedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  sharedAt: string;
}

export interface IShareSettings {
  isSharedWithAll: boolean;
  sharedUsers: ISharedUser[];
}

export interface IShareRoadmapRequest {
  shareWithAll?: boolean;
  userIds?: string[];
}

export interface IRoadmapStore {
  isViewMode: boolean;
  setIsViewMode: (isViewMode: boolean) => void;
  reset: () => void;
}
