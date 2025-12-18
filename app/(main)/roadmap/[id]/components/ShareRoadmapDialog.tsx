'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useDebounceValue } from 'usehooks-ts';
import { 
  Users, 
  Globe, 
  Loader2, 
  Trash2,
  Copy,
  Search,
  UserPlus,
  Mail,
  User
} from 'lucide-react';
import { roadmapService, userService } from '@/services';
import type { ISharedUser, ISearchUserResult } from '@/types';
import { isValidEmailFormat } from '@/lib/utils';

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
  const [isSharedWithAll, setIsSharedWithAll] = useState<boolean>(false);
  const [sharedUsers, setSharedUsers] = useState<ISharedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userToRevoke, setUserToRevoke] = useState<ISharedUser | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [debouncedSearchEmail] = useDebounceValue(searchEmail, 300);
  const [searchResults, setSearchResults] = useState<ISearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isInviting, setIsInviting] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      fetchShareSettings();
      fetchSharedUsers();
    } else {
      setSearchEmail('');
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roadmapId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchEmail || !isValidEmailFormat(debouncedSearchEmail)) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await userService.searchUsers(debouncedSearchEmail);
        const filteredResults = results.filter(
          user => !sharedUsers.some(shared => shared.id === user.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Search users error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchEmail, sharedUsers]);

  const fetchShareSettings = async () => {
    try {
      setIsLoading(true);
      const data = await roadmapService.getShareSettings(roadmapId);
      setIsSharedWithAll(data.isSharedWithAll);
    } catch (error) {
      toast.error('Failed to load sharing settings');
      console.error('Fetch share settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const users = await roadmapService.getSharedUsers(roadmapId);
      setSharedUsers(users);
    } catch (error) {
      console.error('Fetch shared users error:', error);
      setSharedUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const refreshSharedUsers = async () => {
    try {
      const users = await roadmapService.getSharedUsers(roadmapId);
      setSharedUsers(users);
    } catch (error) {
      console.error('Refresh shared users error:', error);
    }
  };

  const handleToggleShareWithAll = async (checked: boolean) => {
    const previousValue = isSharedWithAll;
    setIsSharedWithAll(checked);
    
    try {
      await roadmapService.shareRoadmap(roadmapId, {
        shareWithAll: checked
      });
      toast.success(checked ? 'Roadmap is now public' : 'Roadmap is now private');
    } catch (error) {
      setIsSharedWithAll(previousValue);
      toast.error('Failed to update sharing settings');
      console.error('Toggle share with all error:', error);
    }
  };

  const handleRevokeAccess = async () => {
    if (!userToRevoke) return;

    try {
      setIsRevoking(true);
      await roadmapService.revokeAccess(roadmapId, userToRevoke.id);
      toast.success(`Access revoked for ${userToRevoke.firstName} ${userToRevoke.lastName}`);
      setUserToRevoke(null);
      refreshSharedUsers();
    } catch (error) {
      toast.error('Failed to revoke access');
      console.error('Revoke access error:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/roadmap/${roadmapId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleInviteUser = async (user: ISearchUserResult) => {
    try {
      setIsInviting(true);
      await roadmapService.shareRoadmap(roadmapId, {
        userIds: [user.id]
      });
      toast.success(`Shared with ${user.firstName} ${user.lastName}`);
      
      setSearchEmail('');
      setSearchResults([]);
      refreshSharedUsers();
    } catch (error) {
      toast.error('Failed to share with user');
      console.error('Invite user error:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const formatSharedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-5">
            <DialogTitle className="text-3xl font-bold">Share Roadmap</DialogTitle>
            <DialogDescription className="text-lg text-neutral-400 mt-2">
              Share &quot;{roadmapTitle}&quot; with others or make it public
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-12 animate-spin text-neutral-400" />
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="px-6 pb-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-base font-semibold flex items-center gap-2">
                    <Copy className="size-5" />
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/roadmap/${roadmapId}`}
                      className="flex-1 !h-12 text-base bg-neutral-900/50 border-neutral-800"
                    />
                    <Button
                      onClick={handleCopyLink}
                      size="default"
                      className="!h-12 px-6 text-base"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex items-start justify-between gap-4 p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2.5 bg-neutral-800 rounded-lg">
                      <Globe className="size-6 text-neutral-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1">Public Access</p>
                      <p className="text-base text-neutral-400 leading-relaxed">
                        Anyone with the link can view this roadmap
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isSharedWithAll}
                    onCheckedChange={handleToggleShareWithAll}
                    className="mt-0.5"
                  />
                </div>

                <Separator className="bg-neutral-800" />

                <div className="space-y-3">
                  <label className="text-base font-semibold flex items-center gap-2">
                    <Mail className="size-5" />
                    Invite by Email
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-500" />
                    <Input
                      placeholder="Enter email address (e.g. user@example.com)"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="!h-12 text-base bg-neutral-900/50 border-neutral-800 pl-12"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 animate-spin text-neutral-500" />
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/30">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800/50 last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-neutral-400 truncate">{user.email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="!h-9 gap-2 ml-3 flex-shrink-0 text-base"
                            onClick={() => handleInviteUser(user)}
                            disabled={isInviting}
                          >
                            {isInviting ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <UserPlus className="size-4" />
                            )}
                            Invite
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchEmail && !isSearching && (
                    <>
                      {!isValidEmailFormat(searchEmail) ? (
                        <p className="text-base text-neutral-500 text-center py-3">
                          Please enter a valid email address
                        </p>
                      ) : searchResults.length === 0 ? (
                        <p className="text-base text-neutral-500 text-center py-3">
                          No users found with that email
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                <Separator className="bg-neutral-800" />

                <div className="space-y-3">
                  <label className="text-base font-semibold flex items-center gap-2">
                    <Users className="size-5" />
                    Shared with ({sharedUsers.length})
                  </label>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="size-8 animate-spin text-neutral-400" />
                    </div>
                  ) : sharedUsers.length > 0 ? (
                    <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/30">
                      <ScrollArea className="max-h-[300px]">
                        {sharedUsers.map((user, index) => (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-4 ${
                              index !== sharedUsers.length - 1 ? 'border-b border-neutral-800/50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  width={44}
                                  height={44}
                                  className="size-11 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="size-11 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                  <User className="size-6 text-neutral-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-neutral-400 truncate mt-0.5">{user.email}</p>
                                <p className="text-sm text-neutral-500 mt-1">
                                  Shared {formatSharedDate(user.sharedAt)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0 ml-3"
                              onClick={() => setUserToRevoke(user)}
                            >
                              <Trash2 className="size-5" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-400 text-base border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">
                      <Users className="size-12 mx-auto mb-3 text-neutral-600" />
                      <p className="font-medium text-base">No users shared yet</p>
                      <p className="text-sm mt-1 text-neutral-500">Invite users by entering their email above</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToRevoke} onOpenChange={(open) => !open && !isRevoking && setUserToRevoke(null)}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Revoke Access</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              Are you sure you want to revoke access for{' '}
              <span className="font-semibold text-white">
                {userToRevoke?.firstName} {userToRevoke?.lastName}
              </span>
              ? They will no longer be able to view this roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="!h-11 text-base" disabled={isRevoking}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAccess}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700 text-white !h-11 text-base"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Revoking...
                </>
              ) : (
                'Revoke Access'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}