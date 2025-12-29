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
  description: string;
  outcome: string;
  estimatedDuration: string;
  objectives?: string[];
  keySkills?: string[];
  prerequisites?: string[];
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

// Progress Tracking Types
export interface IStepProgress {
  stepIndex: number;
  completed: boolean;
  completedAt: string | null;
}

export interface IPhaseProgress {
  phaseIndex: number;
  completed: boolean;
  completedAt: string | null;
  steps: IStepProgress[];
}

export interface IMilestoneProgress {
  milestoneIndex: number;
  completed: boolean;
  completedAt: string | null;
}

export interface IProgressResponse {
  id: string;
  roadmapId: string;
  phases: IPhaseProgress[];
  milestones: IMilestoneProgress[];
  overallProgress: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateProgressRequest {
  phaseIndex?: number;
  stepIndex?: number;
  milestoneIndex?: number;
  completed: boolean;
}

// Gamification Types
export enum BadgeType {
  FIRST_ROADMAP = 'first_roadmap',
  ROADMAP_COMPLETE = 'roadmap_complete',
  PHASE_MASTER = 'phase_master',
  WEEK_STREAK = 'week_streak',
  MONTH_STREAK = 'month_streak',
  EARLY_BIRD = 'early_bird',
  NIGHT_OWL = 'night_owl',
  CONSISTENT_LEARNER = 'consistent_learner',
  SPEED_LEARNER = 'speed_learner',
  MILESTONE_ACHIEVER = 'milestone_achiever'
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export interface IBadge {
  id: string;
  type: BadgeType;
  tier: BadgeTier;
  title: string;
  description: string;
  iconName: string;
  xpAwarded: number;
  earnedAt: string;
}

export interface IGamificationStats {
  userId: string;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  roadmapsCompleted: number;
  phasesCompleted: number;
  stepsCompleted: number;
  milestonesCompleted: number;
  lastActivityDate: string | null;
  badgesCount: number;
}

export interface ILeaderboardEntry {
  userId: string;
  displayName: string;
  totalXp: number;
  level: number;
  rank: number;
  badgesCount: number;
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
