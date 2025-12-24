'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { ApproveDialogProps, DeclineDialogProps } from './types';

export function ApproveDialog({
  application,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: ApproveDialogProps) {
  const [adminNotes, setAdminNotes] = useState('');

  const handleConfirm = async () => {
    await onConfirm(adminNotes || undefined);
    setAdminNotes('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAdminNotes('');
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="size-7" />
            Approve Application
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to approve this mentor application? The
            applicant will be granted mentor privileges.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label htmlFor="admin-notes" className="text-lg">
              Admin Notes (optional)
            </Label>
            <Textarea
              id="admin-notes"
              placeholder="Add any internal notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-2 min-h-[100px] border-neutral-800 bg-neutral-900/50 text-lg"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="h-12! text-base">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="h-12! bg-green-600 text-base text-white hover:bg-green-700"
          >
            {isLoading && <Loader2 className="mr-2 size-5 animate-spin" />}
            Approve Application
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeclineDialog({
  application,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeclineDialogProps) {
  const [declineReason, setDeclineReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const handleConfirm = async () => {
    await onConfirm(declineReason.trim(), adminNotes || undefined);
    setDeclineReason('');
    setAdminNotes('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDeclineReason('');
      setAdminNotes('');
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            <XCircle className="size-7" />
            Decline Application
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Please provide a reason for declining this application. This will be
            visible to the applicant.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label htmlFor="decline-reason" className="text-xl">
              Decline Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="decline-reason"
              placeholder="Enter the reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="mt-2 min-h-[100px] border-neutral-800 bg-neutral-900/50 text-lg!"
            />
          </div>
          <div>
            <Label htmlFor="admin-notes-decline" className="text-xl">
              Admin Notes (optional)
            </Label>
            <Textarea
              id="admin-notes-decline"
              placeholder="Add any internal notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-2 min-h-[80px] border-neutral-800 bg-neutral-900/50 text-lg!"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="h-12! text-base">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || !declineReason.trim()}
            className="h-12! bg-red-600 text-base text-white hover:bg-red-700"
          >
            {isLoading ? (
              <>
                Processing...
                <Loader2 className="size-5 animate-spin" />
              </>
            ) : (
              <>Decline Application</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
