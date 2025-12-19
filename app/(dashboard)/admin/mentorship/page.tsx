'use client';

import { useState } from 'react';
import { 
  Users,
  ShieldAlert,
  Network,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { 
  IMentorApplication, 
  IMentorApplicationDetail 
} from '@/types';

import { TransitionPanel } from '@/components/motion-primitives/transition-panel';

import {
  ApplicationsTab,
  FlaggedTab,
  IPStatisticsTab,
  AuditLogsTab,
  ApplicationDetailDialog,
  ApproveDialog,
  DeclineDialog
} from './components';

type ActiveTab = 'applications' | 'flagged' | 'ip-statistics' | 'audit-logs';

const TABS = [
  { id: 'applications' as const, label: 'Applications', icon: Users },
  { id: 'flagged' as const, label: 'Flagged', icon: ShieldAlert },
  { id: 'ip-statistics' as const, label: 'IP Statistics', icon: Network },
  { id: 'audit-logs' as const, label: 'Audit Logs', icon: FileText },
];

export default function AdminMentorshipPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('applications');
  const activeIndex = TABS.findIndex(tab => tab.id === activeTab);

  const [selectedApplication, setSelectedApplication] = useState<IMentorApplicationDetail | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState<boolean>(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState<boolean>(false);
  const [applicationToReview, setApplicationToReview] = useState<IMentorApplication | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const handleViewApplication = async (application: IMentorApplication) => {
    try {
      setIsLoadingAction(true);
      const applicationDetail = await adminService.getMentorApplicationById(application.id);
      setSelectedApplication(applicationDetail);
      setIsViewDialogOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load application details';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleOpenApproveDialog = (application: IMentorApplication | IMentorApplicationDetail) => {
    setApplicationToReview(application as IMentorApplication);
    setIsApproveDialogOpen(true);
  };

  const handleOpenDeclineDialog = (application: IMentorApplication | IMentorApplicationDetail) => {
    setApplicationToReview(application as IMentorApplication);
    setIsDeclineDialogOpen(true);
  };

  const handleApprove = async (adminNotes?: string) => {
    if (!applicationToReview) return;

    try {
      setIsLoadingAction(true);
      await adminService.reviewMentorApplication(applicationToReview.id, {
        decision: 'approve',
        adminNotes,
      });
      toast.success('Application approved successfully');
      setIsApproveDialogOpen(false);
      setIsViewDialogOpen(false);
      setApplicationToReview(null);
      triggerRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to approve application';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDecline = async (declineReason: string, adminNotes?: string) => {
    if (!applicationToReview) return;

    try {
      setIsLoadingAction(true);
      await adminService.reviewMentorApplication(applicationToReview.id, {
        decision: 'decline',
        declineReason,
        adminNotes,
      });
      toast.success('Application declined');
      setIsDeclineDialogOpen(false);
      setIsViewDialogOpen(false);
      setApplicationToReview(null);
      triggerRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to decline application';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-5xl font-bold mb-2">Mentorship Management</h1>
        <p className="text-xl text-neutral-400">
          Review applications, monitor flagged content, and view system logs
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer relative flex items-center gap-2 px-5 py-4 text-lg font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="size-5" />
              {tab.label}
              {isActive && (
                <motion.span 
                  layoutId="activeMentorshipTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" 
                />
              )}
            </button>
          );
        })}
      </div>

      <TransitionPanel
        activeIndex={activeIndex}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        variants={{
          enter: { opacity: 0, y: -20, filter: 'blur(4px)' },
          center: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: 20, filter: 'blur(4px)' },
        }}
      >
        <ApplicationsTab
          onViewApplication={handleViewApplication}
          onMarkUnderReview={() => {}}
          onUnflagApplication={() => {}}
          onApprove={handleOpenApproveDialog}
          onDecline={handleOpenDeclineDialog}
          refreshTrigger={refreshTrigger}
        />
        <FlaggedTab
          onViewApplication={handleViewApplication}
          onUnflagApplication={() => {}}
        />
        <IPStatisticsTab />
        <AuditLogsTab />
      </TransitionPanel>

      <ApplicationDetailDialog
        application={selectedApplication}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onApprove={handleOpenApproveDialog}
        onDecline={handleOpenDeclineDialog}
      />

      <ApproveDialog
        application={applicationToReview}
        isOpen={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onConfirm={handleApprove}
        isLoading={isLoadingAction}
      />

      <DeclineDialog
        application={applicationToReview}
        isOpen={isDeclineDialogOpen}
        onOpenChange={setIsDeclineDialogOpen}
        onConfirm={handleDecline}
        isLoading={isLoadingAction}
      />
    </div>
  );
}
