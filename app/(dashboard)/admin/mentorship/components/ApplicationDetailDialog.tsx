'use client';

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Briefcase,
  Globe,
  Linkedin,
  Calendar,
  User,
  History,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { StatusBadge } from './StatusBadge';
import { DocumentsSection } from './DocumentsSection';
import {
  formatDateTime,
  getStatusBadgeColor,
  formatStatus,
  canReview,
} from './utils';
import type { ApplicationDetailDialogProps } from './types';

export function ApplicationDetailDialog({
  application,
  isOpen,
  onOpenChange,
  onApprove,
  onDecline,
}: ApplicationDetailDialogProps) {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="border-b border-neutral-800 p-6 pb-4">
          <DialogTitle className="text-2xl">Application Details</DialogTitle>
          <DialogDescription className="text-base">
            Review mentor application information
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="space-y-6 p-6">
            <div className="flex items-start gap-4">
              {application.user?.avatar ? (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={application.user.avatar}
                    alt={`${application.user?.firstName} ${application.user?.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-xl font-bold">
                  {application.user?.firstName?.[0] || ''}
                  {application.user?.lastName?.[0] || ''}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold">
                    {application.user?.firstName || ''}{' '}
                    {application.user?.lastName || ''}
                  </p>
                </div>
                <p className="text-lg text-neutral-400">
                  {application.user?.email || 'N/A'}
                </p>
                <p className="mt-1 text-lg text-neutral-300">
                  {application.applicationData?.headline || 'No headline'}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </div>

            <Separator className="bg-neutral-800" />

            <div>
              <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                Bio
              </h4>
              <p className="text-lg leading-relaxed wrap-break-word text-neutral-300">
                {application.applicationData?.bio || 'No bio provided'}
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                Motivation
              </h4>
              <p className="text-lg leading-relaxed wrap-break-word text-neutral-300">
                {application.applicationData?.motivation ||
                  'No motivation provided'}
              </p>
            </div>

            <Separator className="bg-neutral-800" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-neutral-400">
                  <Briefcase className="size-5" />
                  <span className="text-base">Experience</span>
                </div>
                <p className="text-xl font-semibold">
                  {application.applicationData?.yearsExperience ?? 0} years
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-neutral-400">
                  <Globe className="size-5" />
                  <span className="text-base">Languages</span>
                </div>
                <p className="text-lg">
                  {application.applicationData?.languages?.join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-neutral-400">
                  <Calendar className="size-5" />
                  <span className="text-base">Applied On</span>
                </div>
                <p className="text-lg">
                  {formatDateTime(application.createdAt)}
                </p>
              </div>
              {application.decidedAt && (
                <div>
                  <div className="mb-1 flex items-center gap-2 text-neutral-400">
                    <CheckCircle className="size-5" />
                    <span className="text-base">Decided On</span>
                  </div>
                  <p className="text-lg">
                    {formatDateTime(application.decidedAt)}
                  </p>
                </div>
              )}
            </div>

            {(application.applicationData?.expertise?.length ?? 0) > 0 && (
              <div>
                <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                  Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.applicationData?.expertise?.map(
                    (item, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-neutral-800/50 px-4 py-2 text-base"
                      >
                        {item}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {(application.applicationData?.skills?.length ?? 0) > 0 && (
              <div>
                <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.applicationData?.skills?.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-neutral-800/50 px-4 py-2 text-base"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(application.applicationData?.industries?.length ?? 0) > 0 && (
              <div>
                <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                  Industries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.applicationData?.industries?.map(
                    (industry, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-neutral-800/50 px-4 py-2 text-base"
                      >
                        {industry}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              {application.applicationData?.linkedinUrl && (
                <a
                  href={application.applicationData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg text-blue-400 transition-colors hover:text-blue-300"
                >
                  <Linkedin className="size-6" />
                  LinkedIn Profile
                  <ExternalLink className="size-5" />
                </a>
              )}
              {application.applicationData?.portfolioUrl && (
                <a
                  href={application.applicationData.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg text-purple-400 transition-colors hover:text-purple-300"
                >
                  <Globe className="size-6" />
                  Portfolio
                  <ExternalLink className="size-5" />
                </a>
              )}
            </div>

            <Separator className="bg-neutral-800" />

            <DocumentsSection applicationId={application.id} />

            {application.reviewer && (
              <>
                <Separator className="bg-neutral-800" />
                <div className="rounded-lg bg-neutral-800/50 p-5">
                  <div className="mb-2 flex items-center gap-2 text-neutral-400">
                    <User className="size-5" />
                    <span className="text-base font-semibold">Reviewed by</span>
                  </div>
                  <p className="text-lg">
                    {application.reviewer?.firstName || ''}{' '}
                    {application.reviewer?.lastName || ''}
                  </p>
                  <p className="text-base text-neutral-400">
                    {application.reviewer?.email || 'N/A'}
                  </p>
                </div>
              </>
            )}

            {application.adminNotes && (
              <div className="rounded-lg bg-neutral-800/50 p-5">
                <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                  Admin Notes
                </h4>
                <p className="text-lg text-neutral-300">
                  {application.adminNotes}
                </p>
              </div>
            )}

            {application.declineReason && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5">
                <h4 className="mb-2 text-base font-semibold tracking-wider text-red-400 uppercase">
                  Decline Reason
                </h4>
                <p className="text-lg text-neutral-300">
                  {application.declineReason}
                </p>
              </div>
            )}

            {application.statusHistory &&
              application.statusHistory.length > 0 && (
                <>
                  <Separator className="bg-neutral-800" />
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <History className="size-5 text-neutral-400" />
                      <h4 className="text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Status History
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {application.statusHistory.map((history) => (
                        <div
                          key={history.id}
                          className="flex items-center gap-3 rounded-lg bg-neutral-800/30 p-4 text-base"
                        >
                          <Badge
                            variant="outline"
                            className={`px-3 py-1.5 text-sm ${getStatusBadgeColor(history.previousStatus)}`}
                          >
                            {formatStatus(history.previousStatus)}
                          </Badge>
                          <span className="text-lg text-neutral-500">→</span>
                          <Badge
                            variant="outline"
                            className={`px-3 py-1.5 text-sm ${getStatusBadgeColor(history.newStatus)}`}
                          >
                            {formatStatus(history.newStatus)}
                          </Badge>
                          <span className="ml-auto text-base text-neutral-500">
                            {formatDateTime(history.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
          </div>
        </ScrollArea>

        {canReview(application.status) && (
          <div className="flex items-center gap-3 border-t border-neutral-800 p-6 pt-4">
            <Button
              variant="outline"
              className="h-14! flex-1 border-red-500/30 text-lg text-red-500 dark:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              onClick={() => {
                onOpenChange(false);
                onDecline(application);
              }}
            >
              Decline
              <XCircle className="size-6" />
            </Button>
            <Button
              className="h-14! flex-1 bg-green-600 text-lg text-white hover:bg-green-700"
              onClick={() => {
                onOpenChange(false);
                onApprove(application);
              }}
            >
              Approve
              <CheckCircle className="size-6" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
