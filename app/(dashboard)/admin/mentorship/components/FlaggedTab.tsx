'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  FlagOff,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { IMentorApplicationDetail } from '@/types';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { StatusBadge } from './StatusBadge';
import { formatDate } from './utils';
import type { FlaggedTabProps } from './types';

export function FlaggedTab({ onViewApplication, onUnflagApplication }: FlaggedTabProps) {
  const [flaggedApplications, setFlaggedApplications] = useState<IMentorApplicationDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFlaggedApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getFlaggedApplications();
      setFlaggedApplications(response || []);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load flagged applications';
      toast.error(errorMessage);
      setFlaggedApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlaggedApplications();
  }, [fetchFlaggedApplications]);

  const handleUnflag = async (application: IMentorApplicationDetail) => {
    try {
      await adminService.unflagApplication(application.id);
      toast.success('Application unflagged successfully');
      fetchFlaggedApplications();
      onUnflagApplication(application);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to unflag application';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-6 w-[280px]">
                Applicant
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[200px]">
                Headline
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[140px]">
                Status
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[140px]">
                Applied
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-6 text-right w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-full bg-neutral-800" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-36 bg-neutral-800" />
                        <Skeleton className="h-5 w-44 bg-neutral-800" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-40 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-28 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-10 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : flaggedApplications.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No flagged applications</h3>
                  <p className="text-lg text-neutral-400">All applications look clean!</p>
                </TableCell>
              </TableRow>
            ) : (
              flaggedApplications.map((app) => (
                <TableRow 
                  key={app.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-base font-bold flex-shrink-0">
                        {app.user?.firstName?.[0] || ''}{app.user?.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-lg text-neutral-100 truncate">
                          {app.user?.firstName || ''} {app.user?.lastName || ''}
                        </p>
                        <p className="text-base text-neutral-400 truncate">
                          {app.user?.email || 'N/A'}
                        </p>
                      </div>
                      <ShieldAlert className="size-5 text-neutral-400 flex-shrink-0" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-lg text-neutral-300 truncate max-w-[180px]">
                      {app.applicationData?.headline || 'No headline'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {formatDate(app.createdAt)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-10">
                          <MoreVertical className="size-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem 
                          onClick={() => onViewApplication(app)}
                          className="text-lg py-3"
                        >
                          <Eye className="size-5" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUnflag(app)}
                          className="text-lg py-3"
                        >
                          <FlagOff className="size-5" />
                          Unflag application
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && flaggedApplications.length > 0 && (
          <div className="px-6 py-5 border-t border-neutral-800">
            <span className="text-lg text-neutral-400">
              {flaggedApplications.length} flagged application{flaggedApplications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}