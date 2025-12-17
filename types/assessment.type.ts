export type AssessmentDifficulty = 'easy' | 'medium' | 'hard';
export type AssessmentStatus = 'pending' | 'in_progress' | 'completed';

export interface IAssessmentQuestion {
  id: string;
  questionText: string;
  options: string[];
  resources: Record<string, unknown>[];
  orderIndex: number;
}

export interface IAssessment {
  id: string;
  domain: string;
  difficulty: AssessmentDifficulty;
  questionCount: number;
  status: AssessmentStatus;
  isSharedWithAll: boolean;
  answeredCount: number;
  questions: IAssessmentQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateAssessmentRequest {
  domain: string;
  difficulty: AssessmentDifficulty;
  questionCount: number;
}

export interface ISubmitAnswerRequest {
  questionId: string;
  selectedAnswerIndex: number;
  timeSpent: number;
}

export interface ISubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswerIndex: number;
}

export interface IQuestionBreakdown {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  explanation: string;
  resources: Record<string, unknown>[];
  timeSpent: number;
}

export interface IAssessmentSummary {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  topicsToReview: string[];
  studyRecommendations: string[];
}

export interface ISuggestedRoadmap {
  topic: string;
}

export interface IAssessmentResult {
  id: string;
  assessmentId: string;
  domain: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  summary: IAssessmentSummary;
  questionBreakdown: IQuestionBreakdown[];
  suggestedRoadmaps: ISuggestedRoadmap[];
  completedAt: string;
}
