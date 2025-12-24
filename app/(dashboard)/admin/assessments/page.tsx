'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MoreVertical, 
  ClipboardList,
  Loader2,
  Trash2,
  Eye,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { adminService } from '@/services';
import type { 
  IAdminAssessment, 
  IAdminAssessmentDetail,
  IAdminAssessmentsParams,
  AssessmentSortField,
  SortOrder,
  AssessmentDifficulty,
  AssessmentStatus
} from '@/types';
import { ITEMS_PER_PAGE, SORT_ORDER } from '@/constants';
import { useDebounceValue } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type StatusFilter = AssessmentStatus | 'all';
type DifficultyFilter = AssessmentDifficulty | 'all';

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<IAdminAssessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalAssessments, setTotalAssessments] = useState<number>(0);
  const [sortBy, setSortBy] = useState<AssessmentSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.DESC);

  const [selectedAssessment, setSelectedAssessment] = useState<IAdminAssessmentDetail | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<IAdminAssessment | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);

  const fetchAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IAdminAssessmentsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch.trim()) {
        params.domain = debouncedSearch.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (difficultyFilter !== 'all') {
        params.difficulty = difficultyFilter;
      }

      const response = await adminService.getAssessments(params);
      setAssessments(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalAssessments(response.meta.total);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load assessments';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, difficultyFilter, sortBy, sortOrder]);

  const handleSort = (field: AssessmentSortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC);
    } else {
      setSortBy(field);
      setSortOrder(SORT_ORDER.DESC);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: AssessmentSortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="size-5 ml-2 opacity-50" />;
    }
    return sortOrder === SORT_ORDER.ASC 
      ? <ArrowUp className="size-5 ml-2" />
      : <ArrowDown className="size-5 ml-2" />;
  };

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, difficultyFilter]);

  const handleViewAssessment = async (assessment: IAdminAssessment) => {
    try {
      setIsLoadingAction(true);
      const assessmentDetail = await adminService.getAssessmentById(assessment.id);
      setSelectedAssessment(assessmentDetail);
      setIsViewDialogOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load assessment details';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;

    try {
      setIsLoadingAction(true);
      await adminService.deleteAssessment(assessmentToDelete.id);
      toast.success('Assessment deleted successfully');
      setIsDeleteDialogOpen(false);
      setAssessmentToDelete(null);
      fetchAssessments();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete assessment';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending':
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalAssessments);

  const generatePaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      
      if (currentPage > 3) {
        items.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        items.push('ellipsis');
      }
      
      items.push(totalPages);
    }
    
    return items;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-3">Assessments</h1>
        <p className="text-xl text-neutral-400">
          Manage all assessments on the platform
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-6 text-neutral-400" />
          <Input
            placeholder="Search by domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-14! text-lg! bg-neutral-900/50 border-neutral-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[180px] h-14! text-lg bg-neutral-900/50 border-neutral-800">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">All Status</SelectItem>
              <SelectItem value="pending" className="text-lg">Pending</SelectItem>
              <SelectItem value="in_progress" className="text-lg">In Progress</SelectItem>
              <SelectItem value="completed" className="text-lg">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={difficultyFilter} 
            onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}
          >
            <SelectTrigger className="w-[170px] h-14! text-lg bg-neutral-900/50 border-neutral-800">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">All Levels</SelectItem>
              <SelectItem value="easy" className="text-lg">Easy</SelectItem>
              <SelectItem value="medium" className="text-lg">Medium</SelectItem>
              <SelectItem value="hard" className="text-lg">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-7 cursor-pointer hover:text-white transition-colors w-[300px]"
                onClick={() => handleSort('domain')}
              >
                <div className="flex items-center">
                  Domain
                  {getSortIcon('domain')}
                </div>
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[200px]">
                Owner
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[130px]"
                onClick={() => handleSort('difficulty')}
              >
                <div className="flex items-center">
                  Difficulty
                  {getSortIcon('difficulty')}
                </div>
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[120px]">
                Questions
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[140px]"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[150px]"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created
                  {getSortIcon('createdAt')}
                </div>
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-7 text-right w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-lg bg-neutral-800" />
                      <Skeleton className="h-5 w-44 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-8 rounded-full bg-neutral-800" />
                      <Skeleton className="h-5 w-28 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-7 w-20 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-24 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : assessments.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="size-8 text-neutral-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No assessments found</h3>
                  <p className="text-neutral-400">
                    {searchQuery ? 'Try a different search term' : 'No assessments match the selected filters'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              assessments.map((assessment) => (
                <TableRow 
                  key={assessment.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-5 pl-7">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-lg bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center shrink-0">
                        <ClipboardList className="size-6 text-neutral-400" />
                      </div>
                      <p className="font-medium text-lg text-neutral-100 truncate max-w-[220px]">
                        {assessment.domain}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                        {assessment.owner.firstName[0]}{assessment.owner.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg text-neutral-300 truncate max-w-[140px]">
                          {assessment.owner.firstName} {assessment.owner.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`py-2 px-4 capitalize text-base ${getDifficultyBadgeColor(assessment.difficulty)}`}>
                      {assessment.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {assessment.questionCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`py-2 px-4 text-base ${getStatusBadgeColor(assessment.status)}`}>
                      {formatStatus(assessment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {formatDate(assessment.createdAt)}
                  </TableCell>
                  <TableCell className="pr-7 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-10">
                          <MoreVertical className="size-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem 
                          onClick={() => handleViewAssessment(assessment)}
                          className="text-lg py-3"
                        >
                          <Eye className="size-5" />
                          View details
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem asChild>
                          <Link 
                            href={`/assessment/${assessment.id}`} 
                            target="_blank"
                            className="text-lg py-3"
                          >
                            <ExternalLink className="size-5" />
                            Open assessment
                          </Link>
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setAssessmentToDelete(assessment);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="dark:hover:bg-red-500/10 transition-colors text-lg py-3 text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-5 text-red-500" />
                          Delete assessment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalAssessments > 0 && (
          <div className="px-7 py-5 border-t border-neutral-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-lg text-neutral-400 whitespace-nowrap">
              Showing {startIndex} to {endIndex} of {totalAssessments} assessment{totalAssessments > 1 ? 's' : ''}
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
                  
                  {generatePaginationItems().map((item, index) => (
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
            <DialogTitle className="text-xl">Assessment Details</DialogTitle>
            <DialogDescription>
              View detailed information about this assessment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssessment && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center shrink-0">
                  <ClipboardList className="size-7 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-semibold wrap-break-word">
                    {selectedAssessment.domain}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`py-1 px-2 capitalize text-sm ${getDifficultyBadgeColor(selectedAssessment.difficulty)}`}>
                      {selectedAssessment.difficulty}
                    </Badge>
                    <Badge variant="outline" className={`py-1 px-2 text-sm ${getStatusBadgeColor(selectedAssessment.status)}`}>
                      {formatStatus(selectedAssessment.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-neutral-500 mb-2">Owner</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-linear-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-sm font-bold">
                    {selectedAssessment.owner.firstName[0]}{selectedAssessment.owner.lastName[0]}
                  </div>
                  <div>
                    <p className="text-base font-medium">
                      {selectedAssessment.owner.firstName} {selectedAssessment.owner.lastName}
                    </p>
                    <p className="text-sm text-neutral-400">{selectedAssessment.owner.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base text-neutral-500 mb-1">Questions</p>
                  <p className="text-lg font-semibold">{selectedAssessment.questionCount}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Answered</p>
                  <p className="text-lg font-semibold">{selectedAssessment.answeredCount} / {selectedAssessment.questionCount}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Created</p>
                  <p className="text-lg">{formatDate(selectedAssessment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Updated</p>
                  <p className="text-lg">{formatDate(selectedAssessment.updatedAt)}</p>
                </div>
              </div>

              {/* <div className="pt-2">
                <Button asChild className="w-full h-14! text-[1.15rem]!">
                  <Link href={`/assessment/${selectedAssessment.id}`} target="_blank">
                    Open Assessment
                    <ExternalLink className="size-5" />
                  </Link>
                </Button>
              </div> */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the assessment &quot;<strong>{assessmentToDelete?.domain}</strong>&quot;? 
              This action cannot be undone and will permanently remove the assessment and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoadingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssessment}
              disabled={isLoadingAction}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoadingAction && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}