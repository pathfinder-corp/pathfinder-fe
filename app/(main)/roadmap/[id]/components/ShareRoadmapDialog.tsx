'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  Users, 
  Globe, 
  Loader2, 
  Check, 
  Clock,
  Trash2,
  Copy
} from 'lucide-react';
import { roadmapService } from '@/services';
import type { IShareSettings, ISharedUser } from '@/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

interface IShareRoadmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapId: string;
  roadmapTitle: string;
}

export function ShareRoadmapDialog({
  open,
  onOpenChange,
  roadmapId,
  roadmapTitle
}: IShareRoadmapDialogProps) {
  const [shareSettings, setShareSettings] = useState<IShareSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userToRevoke, setUserToRevoke] = useState<ISharedUser | null>(null);

  useEffect(() => {
    if (open) {
      fetchShareSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roadmapId]);

  const fetchShareSettings = async () => {
    try {
      setIsLoading(true);
      const data = await roadmapService.getShareSettings(roadmapId);
      setShareSettings(data);
    } catch (error) {
      toast.error('Failed to load sharing settings');
      console.error('Fetch share settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshShareSettings = async () => {
    try {
      const data = await roadmapService.getShareSettings(roadmapId);
      setShareSettings(data);
    } catch (error) {
      console.error('Refresh share settings error:', error);
    }
  };

  const handleToggleShareWithAll = async (checked: boolean) => {
    setShareSettings(prev => prev ? { ...prev, isSharedWithAll: checked } : null);
    
    try {
      await roadmapService.shareRoadmap(roadmapId, {
        shareWithAll: checked
      });
      toast.success(checked ? 'Roadmap is now public' : 'Roadmap is now private');
      refreshShareSettings();
    } catch (error) {
      setShareSettings(prev => prev ? { ...prev, isSharedWithAll: !checked } : null);
      toast.error('Failed to update sharing settings');
      console.error('Toggle share with all error:', error);
    }
  };

  const handleRevokeAccess = async () => {
    if (!userToRevoke) return;

    try {
      await roadmapService.revokeAccess(roadmapId, userToRevoke.id);
      toast.success('Access revoked successfully');
      setUserToRevoke(null);
      refreshShareSettings();
    } catch (error) {
      toast.error('Failed to revoke access');
      console.error('Revoke access error:', error);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/roadmap/${roadmapId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const getStatusBadge = (status: 'pending' | 'accepted') => {
    if (status === 'pending') {
      return (
        <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-full">
          <Clock className="size-3.5" />
          Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 text-sm font-medium rounded-full">
        <Check className="size-3.5" />
        Accepted
      </span>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-5">
            <DialogTitle className="text-2xl font-bold">Share Roadmap</DialogTitle>
            <DialogDescription className="text-base text-neutral-400 mt-1.5">
              Share &quot;{roadmapTitle}&quot; with others or make it public
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-10 animate-spin text-neutral-400" />
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="px-6 pb-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Copy className="size-4.5" />
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/roadmap/${roadmapId}`}
                      className="flex-1 !h-11 text-sm bg-neutral-900/50 border-neutral-800"
                    />
                    <Button
                      onClick={handleCopyLink}
                      size="default"
                      className="!h-11 px-5"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex items-start justify-between gap-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-neutral-800 rounded-lg">
                      <Globe className="size-5 text-neutral-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base mb-0.5">Public Access</p>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        Anyone with the link can view this roadmap
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={shareSettings?.isSharedWithAll || false}
                    onCheckedChange={handleToggleShareWithAll}
                    className="mt-0.5"
                  />
                </div>

                <Separator className="bg-neutral-800" />

                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Users className="size-4.5" />
                    Shared with ({shareSettings?.sharedUsers?.length || 0})
                  </label>

                  {shareSettings?.sharedUsers && shareSettings.sharedUsers.length > 0 ? (
                    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/30">
                      <ScrollArea className="max-h-[240px]">
                        {shareSettings.sharedUsers.map((user, index) => (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-3.5 hover:bg-neutral-800/50 transition-colors ${
                              index !== shareSettings.sharedUsers.length - 1 ? 'border-b border-neutral-800/50' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-neutral-400 mt-0.5 truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2.5 ml-3">
                              {getStatusBadge(user.status)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0"
                                onClick={() => setUserToRevoke(user)}
                              >
                                <Trash2 className="size-4.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-400 text-sm border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">
                      <Users className="size-10 mx-auto mb-2.5 text-neutral-600" />
                      <p className="font-medium">No users shared yet</p>
                      <p className="text-xs mt-1 text-neutral-500">Enable public access to share with everyone</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToRevoke} onOpenChange={(open) => !open && setUserToRevoke(null)}>
        <AlertDialogContent className="sm:max-w-[450px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Revoke Access</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              Are you sure you want to revoke access for{' '}
              <span className="font-semibold text-white">
                {userToRevoke?.firstName} {userToRevoke?.lastName}
              </span>
              ? They will no longer be able to view this roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="!h-10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAccess}
              className="bg-red-600 hover:bg-red-700 !h-10"
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}