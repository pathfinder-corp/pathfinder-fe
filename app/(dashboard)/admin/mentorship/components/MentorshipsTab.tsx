'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  MoreVertical, 
  Handshake,
  Eye,
  X,
  XCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { 
  IAdminMentorship, 
  IAdminMentorshipsParams
} from '@/types';
import { ITEMS_PER_PAGE } from '@/constants';
import { useDebounceValue } from 'usehooks-ts';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { generatePaginationItems, formatDate, formatDateTime } from './utils';
import { StatusBadge } from './StatusBadge';
import type { MentorshipsTabProps, MentorshipStatusFilter } from './types';

export function MentorshipsTab({ refreshTrigger = 0 }: MentorshipsTabProps) {
  const [mentorships, setMentorships] = useState<IAdminMentorship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<MentorshipStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMentorships, setTotalMentorships] = useState<number>(0);

  const [selectedMentorship, setSelectedMentorship] = useState<IAdminMentorship | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState<boolean>(false);
  const [mentorshipToEnd, setMentorshipToEnd] = useState<IAdminMentorship | null>(null);
  const [endReason, setEndReason] = useState<string>('');
  const [isEnding, setIsEnding] = useState<boolean>(false);

  const fetchMentorships = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IAdminMentorshipsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await adminService.getMentorships(params);
      setMentorships(response.mentorships || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalMentorships(response.meta?.total || 0);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load mentorships';
      toast.error(errorMessage);
      setMentorships([]);
      setTotalPages(1);
      setTotalMentorships(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchMentorships();
  }, [fetchMentorships, refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleViewMentorship = async (mentorship: IAdminMentorship) => {
    try {
      const detail = await adminService.getMentorshipById(mentorship.id);
      setSelectedMentorship(detail);
      setIsViewDialogOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load mentorship details';
      toast.error(errorMessage);
    }
  };

  const handleForceEndMentorship = async () => {
    if (!mentorshipToEnd || !endReason.trim()) return;

    try {
      setIsEnding(true);
      await adminService.forceEndMentorship(mentorshipToEnd.id, {
        reason: endReason.trim()
      });
      toast.success('Mentorship ended successfully');
      setIsEndDialogOpen(false);
      setMentorshipToEnd(null);
      setEndReason('');
      setIsViewDialogOpen(false);
      fetchMentorships();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to end mentorship';
      toast.error(errorMessage);
    } finally {
      setIsEnding(false);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalMentorships);
  const paginationItems = generatePaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-neutral-400" />
          <Input
            placeholder="Search by mentor or mentee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-14! text-lg! bg-neutral-900/50 border-neutral-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <Select 
          value={statusFilter} 
          onValueChange={(value) => setStatusFilter(value as MentorshipStatusFilter)}
        >
          <SelectTrigger className="w-[180px] h-14! text-lg bg-neutral-900/50 border-neutral-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-lg">All Status</SelectItem>
            <SelectItem value="active" className="text-lg">Active</SelectItem>
            <SelectItem value="ended" className="text-lg">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-6 w-[220px]">
                Mentor
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[220px]">
                Mentee
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[120px]">
                Status
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[140px]">
                Started
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[140px]">
                Ended
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-6 text-right w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full bg-neutral-800" />
                      <Skeleton className="h-5 w-32 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full bg-neutral-800" />
                      <Skeleton className="h-5 w-32 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-8 w-20 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-10 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : mentorships.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <Handshake className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No mentorships found</h3>
                  <p className="text-lg text-neutral-400">
                    {statusFilter !== 'all' ? 'No mentorships match the selected filter' : 'No mentorships established yet'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              mentorships.map((mentorship) => (
                <TableRow 
                  key={mentorship.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      {mentorship.mentor?.avatar ? (
                        <Image 
                          src={mentorship.mentor.avatar} 
                          alt={`${mentorship.mentor?.firstName} ${mentorship.mentor?.lastName}`}
                          fill
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                          {mentorship.mentor?.firstName?.[0] || ''}{mentorship.mentor?.lastName?.[0] || ''}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-lg text-neutral-100 truncate">
                          {mentorship.mentor?.firstName || ''} {mentorship.mentor?.lastName || ''}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">
                          {mentorship.mentor?.email || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {mentorship.student?.avatar ? (
                        <Image 
                          src={mentorship.student.avatar} 
                          alt={`${mentorship.student?.firstName} ${mentorship.student?.lastName}`}
                          fill
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                          {mentorship.student?.firstName?.[0] || ''}{mentorship.student?.lastName?.[0] || ''}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-lg text-neutral-100 truncate">
                          {mentorship.student?.firstName || ''} {mentorship.student?.lastName || ''}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">
                          {mentorship.student?.email || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="mentorship" status={mentorship.status} />
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {formatDate(mentorship.startedAt)}
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {mentorship.endedAt ? formatDate(mentorship.endedAt) : '-'}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-10">
                          <MoreVertical className="size-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem 
                          onClick={() => handleViewMentorship(mentorship)}
                          className="text-lg py-3"
                        >
                          <Eye className="size-5" />
                          View details
                        </DropdownMenuItem>
                        {mentorship.status === 'active' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setMentorshipToEnd(mentorship);
                                setIsEndDialogOpen(true);
                              }}
                              className="text-lg py-3 text-red-500 focus:text-red-500 dark:hover:bg-red-500/10"
                            >
                              <XCircle className="size-5 text-red-500" />
                              End mentorship
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalMentorships > 0 && (
          <div className="px-6 py-5 border-t border-neutral-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-lg text-neutral-400 whitespace-nowrap">
              Showing {startIndex} to {endIndex} of {totalMentorships} mentorship{totalMentorships > 1 ? 's' : ''}
            </span>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(p => p - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {paginationItems.map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(item);
                          }}
                          isActive={currentPage === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(p => p + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Handshake className="size-7" />
              Mentorship Details
            </DialogTitle>
            <DialogDescription className="text-base">
              View mentorship information
            </DialogDescription>
          </DialogHeader>
          
          {selectedMentorship && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge type="mentorship" status={selectedMentorship.status} />
              </div>

              <Separator className="bg-neutral-800" />

              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-3">Mentor</p>
                <div className="flex items-center gap-3">
                  {selectedMentorship.mentor?.avatar ? (
                    <Image 
                      src={selectedMentorship.mentor.avatar} 
                      alt={`${selectedMentorship.mentor?.firstName} ${selectedMentorship.mentor?.lastName}`}
                      fill
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-linear-to-br from-amber-600 to-amber-700 flex items-center justify-center text-base font-bold">
                      {selectedMentorship.mentor?.firstName?.[0] || ''}{selectedMentorship.mentor?.lastName?.[0] || ''}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium">
                      {selectedMentorship.mentor?.firstName} {selectedMentorship.mentor?.lastName}
                    </p>
                    <p className="text-base text-neutral-400">{selectedMentorship.mentor?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-3">Mentee</p>
                <div className="flex items-center gap-3">
                  {selectedMentorship.student?.avatar ? (
                    <Image  
                      src={selectedMentorship.student.avatar} 
                      alt={`${selectedMentorship.student?.firstName} ${selectedMentorship.student?.lastName}`}
                      fill
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-base font-bold">
                      {selectedMentorship.student?.firstName?.[0] || ''}{selectedMentorship.student?.lastName?.[0] || ''}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium">
                      {selectedMentorship.student?.firstName} {selectedMentorship.student?.lastName}
                    </p>
                    <p className="text-base text-neutral-400">{selectedMentorship.student?.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base text-neutral-500 mb-1">Started</p>
                  <p className="text-lg">{formatDateTime(selectedMentorship.startedAt)}</p>
                </div>
                {selectedMentorship.endedAt && (
                  <div>
                    <p className="text-base text-neutral-500 mb-1">Ended</p>
                    <p className="text-lg">{formatDateTime(selectedMentorship.endedAt)}</p>
                  </div>
                )}
              </div>

              {selectedMentorship.endReason && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 mb-1">End Reason</p>
                  <p className="text-base text-neutral-300">{selectedMentorship.endReason}</p>
                </div>
              )}

              {selectedMentorship.status === 'active' && (
                <Button
                  variant="outline"
                  className="w-full h-12! text-lg text-red-500 border-red-500/30 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setMentorshipToEnd(selectedMentorship);
                    setIsEndDialogOpen(true);
                  }}
                >
                  <XCircle className="size-5" />
                  Force End Mentorship
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2">
              <XCircle className="size-7" />
              Force End Mentorship
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will immediately end the mentorship relationship. Both the mentor and mentee will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-5 py-2">
            {mentorshipToEnd && (
              <div className="p-4 bg-neutral-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Mentor:</span>
                  <span className="font-medium">
                    {mentorshipToEnd.mentor?.firstName} {mentorshipToEnd.mentor?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Mentee:</span>
                  <span className="font-medium">
                    {mentorshipToEnd.student?.firstName} {mentorshipToEnd.student?.lastName}
                  </span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="end-reason" className="text-lg">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="end-reason"
                placeholder="Provide a reason for ending this mentorship..."
                value={endReason}
                onChange={(e) => setEndReason(e.target.value)}
                className="mt-2 min-h-[100px] text-lg bg-neutral-900/50 border-neutral-800"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isEnding} 
              className="h-12! text-base"
              onClick={() => {
                setEndReason('');
                setMentorshipToEnd(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceEndMentorship}
              disabled={isEnding || !endReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white h-12! text-base"
            >
              {isEnding ? (
                <>
                  Ending...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                'End Mentorship'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

