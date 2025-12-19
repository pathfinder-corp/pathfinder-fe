'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  MoreVertical, 
  GraduationCap,
  Eye,
  X,
  CheckCircle,
  XCircle,
  FlagOff,
  FileSearch,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { 
  IMentorApplication, 
  IMentorApplicationsParams 
} from '@/types';
import { ITEMS_PER_PAGE } from '@/constants';
import { useDebounceValue } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
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

import { StatusBadge } from './StatusBadge';
import { formatDate, canReview, generatePaginationItems } from './utils';
import type { StatusFilter, ApplicationsTabProps } from './types';

export function ApplicationsTab({
  onViewApplication,
  onMarkUnderReview,
  onUnflagApplication,
  onApprove,
  onDecline,
  refreshTrigger = 0
}: ApplicationsTabProps) {
  const [applications, setApplications] = useState<IMentorApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalApplications, setTotalApplications] = useState<number>(0);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IMentorApplicationsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await adminService.getMentorApplications(params);
      setApplications(response.applications || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalApplications(response.meta?.total || 0);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load mentor applications';
      toast.error(errorMessage);
      setApplications([]);
      setTotalPages(1);
      setTotalApplications(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleMarkUnderReview = async (application: IMentorApplication) => {
    try {
      await adminService.markApplicationUnderReview(application.id);
      toast.success('Application marked as under review');
      fetchApplications();
      onMarkUnderReview(application);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to mark application as under review';
      toast.error(errorMessage);
    }
  };

  const handleUnflag = async (application: IMentorApplication) => {
    try {
      await adminService.unflagApplication(application.id);
      toast.success('Application unflagged successfully');
      fetchApplications();
      onUnflagApplication(application);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to unflag application';
      toast.error(errorMessage);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalApplications);
  const paginationItems = generatePaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-neutral-400" />
          <Input
            placeholder="Search by applicant name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 !h-14 !text-lg bg-neutral-900/50 border-neutral-800"
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
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-[200px] !h-14 text-lg bg-neutral-900/50 border-neutral-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-lg">All Status</SelectItem>
            <SelectItem value="pending" className="text-lg">Pending</SelectItem>
            <SelectItem value="under_review" className="text-lg">Under Review</SelectItem>
            <SelectItem value="flagged" className="text-lg">Flagged</SelectItem>
            <SelectItem value="approved" className="text-lg">Approved</SelectItem>
            <SelectItem value="declined" className="text-lg">Declined</SelectItem>
            <SelectItem value="withdrawn" className="text-lg">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-6 w-[220px]">
                Applicant
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[200px]">
                Headline
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[100px]">
                Experience
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
              [...Array(10)].map((_, i) => (
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
                  <TableCell><Skeleton className="h-6 w-20 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-28 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-10 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : applications.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No applications found</h3>
                  <p className="text-lg text-neutral-400">
                    {statusFilter !== 'all' ? 'No applications match the selected filter' : 'No mentor applications yet'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow 
                  key={application.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-base font-bold flex-shrink-0">
                        {application.user?.firstName?.[0] || ''}{application.user?.lastName?.[0] || ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-lg text-neutral-100 truncate">
                          {application.user?.firstName || ''} {application.user?.lastName || ''}
                        </p>
                        <p className="text-base text-neutral-400 truncate">
                          {application.user?.email || 'N/A'}
                        </p>
                      </div>
                      {application.isFlagged && (
                        <AlertTriangle className="size-5 text-orange-400 flex-shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-lg text-neutral-300 truncate max-w-[180px]">
                      {application.applicationData?.headline || 'No headline'}
                    </p>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {application.applicationData?.yearsExperience ?? 0} years
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={application.status} />
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {formatDate(application.createdAt)}
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
                          onClick={() => onViewApplication(application)}
                          className="text-lg py-3"
                        >
                          <Eye className="size-5" />
                          View details
                        </DropdownMenuItem>
                        
                        {application.status === 'pending' && (
                          <DropdownMenuItem 
                            onClick={() => handleMarkUnderReview(application)}
                            className="text-lg py-3"
                          >
                            <FileSearch className="size-5" />
                            Mark under review
                          </DropdownMenuItem>
                        )}

                        {application.isFlagged && (
                          <DropdownMenuItem 
                            onClick={() => handleUnflag(application)}
                            className="text-lg py-3 text-orange-500 focus:text-orange-500"
                          >
                            <FlagOff className="size-5 text-orange-500" />
                            Unflag application
                          </DropdownMenuItem>
                        )}
                        
                        {canReview(application.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onApprove(application)}
                              className="text-lg py-3 text-green-500 focus:text-green-500 dark:hover:bg-green-500/10"
                            >
                              <CheckCircle className="size-5 text-green-500" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDecline(application)}
                              className="text-lg py-3 text-red-500 focus:text-red-500 dark:hover:bg-red-500/10"
                            >
                              <XCircle className="size-5 text-red-500" />
                              Decline
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

        {!isLoading && totalApplications > 0 && (
          <div className="px-6 py-5 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-lg text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalApplications} application{totalApplications > 1 ? 's' : ''}
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
    </div>
  );
}