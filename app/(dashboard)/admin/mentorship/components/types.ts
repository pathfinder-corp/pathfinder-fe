import type { 
  IMentorApplication, 
  IMentorApplicationDetail,
  MentorApplicationStatus 
} from '@/types';

export type StatusFilter = MentorApplicationStatus | 'all';

export interface ApplicationsTabProps {
  onViewApplication: (application: IMentorApplication) => void;
  onMarkUnderReview: (application: IMentorApplication) => void;
  onUnflagApplication: (application: IMentorApplication) => void;
  onApprove: (application: IMentorApplication) => void;
  onDecline: (application: IMentorApplication) => void;
  refreshTrigger?: number;
}

export interface FlaggedTabProps {
  onViewApplication: (application: IMentorApplication) => void;
  onUnflagApplication: (application: IMentorApplication) => void;
}

export interface ApplicationDetailDialogProps {
  application: IMentorApplicationDetail | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (application: IMentorApplicationDetail) => void;
  onDecline: (application: IMentorApplicationDetail) => void;
}

export interface ApproveDialogProps {
  application: IMentorApplication | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (adminNotes?: string) => Promise<void>;
  isLoading: boolean;
}

export interface DeclineDialogProps {
  application: IMentorApplication | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (declineReason: string, adminNotes?: string) => Promise<void>;
  isLoading: boolean;
}