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
  History
} from 'lucide-react';

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
import { formatDateTime, getStatusBadgeColor, formatStatus, canReview } from './utils';
import type { ApplicationDetailDialogProps } from './types';

export function ApplicationDetailDialog({
  application,
  isOpen,
  onOpenChange,
  onApprove,
  onDecline
}: ApplicationDetailDialogProps) {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-800">
          <DialogTitle className="text-xl">Application Details</DialogTitle>
          <DialogDescription>
            Review mentor application information
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-lg font-bold flex-shrink-0">
                {application.user?.firstName?.[0] || ''}{application.user?.lastName?.[0] || ''}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold">
                    {application.user?.firstName || ''} {application.user?.lastName || ''}
                  </p>
                  {application.isFlagged && (
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <AlertTriangle className="size-3 mr-1" />
                      Flagged
                    </Badge>
                  )}
                </div>
                <p className="text-base text-neutral-400">{application.user?.email || 'N/A'}</p>
                <p className="text-base text-neutral-300 mt-1">
                  {application.applicationData?.headline || 'No headline'}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </div>

            <Separator className="bg-neutral-800" />

            <div>
              <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Bio</h4>
              <p className="text-base text-neutral-300 leading-relaxed">
                {application.applicationData?.bio || 'No bio provided'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Motivation</h4>
              <p className="text-base text-neutral-300 leading-relaxed">
                {application.applicationData?.motivation || 'No motivation provided'}
              </p>
            </div>

            <Separator className="bg-neutral-800" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Briefcase className="size-4" />
                  <span className="text-sm">Experience</span>
                </div>
                <p className="text-lg font-semibold">{application.applicationData?.yearsExperience ?? 0} years</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Globe className="size-4" />
                  <span className="text-sm">Languages</span>
                </div>
                <p className="text-base">
                  {application.applicationData?.languages?.join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Calendar className="size-4" />
                  <span className="text-sm">Applied On</span>
                </div>
                <p className="text-base">{formatDateTime(application.createdAt)}</p>
              </div>
              {application.decidedAt && (
                <div>
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <CheckCircle className="size-4" />
                    <span className="text-sm">Decided On</span>
                  </div>
                  <p className="text-base">{formatDateTime(application.decidedAt)}</p>
                </div>
              )}
            </div>

            {(application.applicationData?.expertise?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {application.applicationData?.expertise?.map((item, index) => (
                    <Badge key={index} variant="outline" className="py-1.5 px-3 text-sm bg-neutral-800/50">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(application.applicationData?.skills?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {application.applicationData?.skills?.map((skill, index) => (
                    <Badge key={index} variant="outline" className="py-1.5 px-3 text-sm bg-neutral-800/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(application.applicationData?.industries?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {application.applicationData?.industries?.map((industry, index) => (
                    <Badge key={index} variant="outline" className="py-1.5 px-3 text-sm bg-neutral-800/50">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              {application.applicationData?.linkedinUrl && (
                <a 
                  href={application.applicationData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Linkedin className="size-5" />
                  LinkedIn Profile
                  <ExternalLink className="size-4" />
                </a>
              )}
              {application.applicationData?.portfolioUrl && (
                <a 
                  href={application.applicationData.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Globe className="size-5" />
                  Portfolio
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>

            {application.reviewer && (
              <>
                <Separator className="bg-neutral-800" />
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-neutral-400 mb-2">
                    <User className="size-4" />
                    <span className="text-sm font-semibold">Reviewed by</span>
                  </div>
                  <p className="text-base">
                    {application.reviewer?.firstName || ''} {application.reviewer?.lastName || ''}
                  </p>
                  <p className="text-sm text-neutral-400">{application.reviewer?.email || 'N/A'}</p>
                </div>
              </>
            )}

            {application.adminNotes && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Admin Notes</h4>
                <p className="text-base text-neutral-300">{application.adminNotes}</p>
              </div>
            )}

            {application.declineReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Decline Reason</h4>
                <p className="text-base text-neutral-300">{application.declineReason}</p>
              </div>
            )}

            {application.statusHistory && application.statusHistory.length > 0 && (
              <>
                <Separator className="bg-neutral-800" />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="size-4 text-neutral-400" />
                    <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Status History</h4>
                  </div>
                  <div className="space-y-3">
                    {application.statusHistory.map((history) => (
                      <div 
                        key={history.id} 
                        className="flex items-center gap-3 text-sm bg-neutral-800/30 rounded-lg p-3"
                      >
                        <Badge 
                          variant="outline" 
                          className={`py-1 px-2 text-xs ${getStatusBadgeColor(history.previousStatus)}`}
                        >
                          {formatStatus(history.previousStatus)}
                        </Badge>
                        <span className="text-neutral-500">→</span>
                        <Badge 
                          variant="outline" 
                          className={`py-1 px-2 text-xs ${getStatusBadgeColor(history.newStatus)}`}
                        >
                          {formatStatus(history.newStatus)}
                        </Badge>
                        <span className="text-neutral-500 ml-auto">
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
          <div className="p-6 pt-4 border-t border-neutral-800 flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1 !h-12 text-red-500 border-red-500/30 hover:bg-red-500/10"
              onClick={() => {
                onOpenChange(false);
                onDecline(application);
              }}
            >
              <XCircle className="size-5 mr-2" />
              Decline
            </Button>
            <Button
              className="flex-1 !h-12 bg-green-600 hover:bg-green-700"
              onClick={() => {
                onOpenChange(false);
                onApprove(application);
              }}
            >
              <CheckCircle className="size-5 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}