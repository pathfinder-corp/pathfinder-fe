'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MoreVertical, 
  Map,
  Loader2,
  Trash2,
  Eye,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { adminService } from '@/services';
import type { 
  IAdminRoadmap, 
  IAdminRoadmapDetail,
  IAdminRoadmapsParams,
  RoadmapSortField,
  SortOrder
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

type ShareFilter = 'all' | 'shared' | 'private';

export default function AdminRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<IAdminRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [shareFilter, setShareFilter] = useState<ShareFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRoadmaps, setTotalRoadmaps] = useState<number>(0);
  const [sortBy, setSortBy] = useState<RoadmapSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.DESC);

  const [selectedRoadmap, setSelectedRoadmap] = useState<IAdminRoadmapDetail | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<IAdminRoadmap | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);

  const fetchRoadmaps = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IAdminRoadmapsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch.trim()) {
        params.topic = debouncedSearch.trim();
      }

      if (shareFilter !== 'all') {
        params.isSharedWithAll = shareFilter === 'shared';
      }

      const response = await adminService.getRoadmaps(params);
      setRoadmaps(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalRoadmaps(response.meta.total);
    } catch (error) {
      toast.error('Failed to load roadmaps');
      console.error('Fetch roadmaps error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, shareFilter, sortBy, sortOrder]);

  const handleSort = (field: RoadmapSortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC);
    } else {
      setSortBy(field);
      setSortOrder(SORT_ORDER.DESC);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: RoadmapSortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="size-4 ml-1 opacity-50" />;
    }
    return sortOrder === SORT_ORDER.ASC 
      ? <ArrowUp className="size-4 ml-1" />
      : <ArrowDown className="size-4 ml-1" />;
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, shareFilter]);

  const handleViewRoadmap = async (roadmap: IAdminRoadmap) => {
    try {
      setIsLoadingAction(true);
      const roadmapDetail = await adminService.getRoadmapById(roadmap.id);
      setSelectedRoadmap(roadmapDetail);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load roadmap details');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteRoadmap = async () => {
    if (!roadmapToDelete) return;

    try {
      setIsLoadingAction(true);
      await adminService.deleteRoadmap(roadmapToDelete.id);
      toast.success('Roadmap deleted successfully');
      setIsDeleteDialogOpen(false);
      setRoadmapToDelete(null);
      fetchRoadmaps();
    } catch (error) {
      toast.error('Failed to delete roadmap');
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

  const getExperienceBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalRoadmaps);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Roadmaps</h1>
        <p className="text-lg text-neutral-400">
          Manage all roadmaps on the platform
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
          <Input
            placeholder="Search by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base bg-neutral-900/50 border-neutral-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Select 
          value={shareFilter} 
          onValueChange={(value) => setShareFilter(value as ShareFilter)}
        >
          <SelectTrigger className="w-[140px] !h-12 text-base bg-neutral-900/50 border-neutral-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-base">All Status</SelectItem>
            <SelectItem value="shared" className="text-base">Public</SelectItem>
            <SelectItem value="private" className="text-base">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead 
                className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 pl-6 cursor-pointer hover:text-white transition-colors w-[300px]"
                onClick={() => handleSort('topic')}
              >
                <div className="flex items-center">
                  Topic
                  {getSortIcon('topic')}
                </div>
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 w-[200px]">
                Owner
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 w-[120px]">
                Level
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 w-[120px]">
                Timeframe
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 w-[100px]">
                Status
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 cursor-pointer hover:text-white transition-colors w-[140px]"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created
                  {getSortIcon('createdAt')}
                </div>
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-sm uppercase tracking-wider py-4 pr-6 text-right w-[80px]">
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
                      <Skeleton className="h-5 w-48 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-8 rounded-full bg-neutral-800" />
                      <Skeleton className="h-5 w-32 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-7 w-24 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-18 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : roadmaps.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <Map className="size-8 text-neutral-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No roadmaps found</h3>
                  <p className="text-neutral-400">
                    {searchQuery ? 'Try a different search term' : 'No roadmaps match the selected filter'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              roadmaps.map((roadmap) => (
                <TableRow 
                  key={roadmap.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center flex-shrink-0">
                        <Map className="size-5 text-neutral-400" />
                      </div>
                      <p className="font-medium text-base text-neutral-100 truncate max-w-[220px]">
                        {roadmap.topic}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {roadmap.owner.firstName[0]}{roadmap.owner.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base text-neutral-300 truncate max-w-[140px]">
                          {roadmap.owner.firstName} {roadmap.owner.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`py-1.5 px-3 capitalize text-sm ${getExperienceBadgeColor(roadmap.experienceLevel)}`}>
                      {roadmap.experienceLevel || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-base">
                    {roadmap.timeframe || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`py-1.5 px-3 text-sm ${
                        roadmap.isSharedWithAll 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                      }`}
                    >
                      {roadmap.isSharedWithAll ? 'Public' : 'Private'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-base">
                    {formatDate(roadmap.createdAt)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9">
                          <MoreVertical className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleViewRoadmap(roadmap)}
                          className="text-base py-2"
                        >
                          <Eye className="size-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/roadmap/${roadmap.id}`} 
                            target="_blank"
                            className="text-base py-2"
                          >
                            <ExternalLink className="size-4" />
                            Open roadmap
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setRoadmapToDelete(roadmap);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="dark:hover:bg-red-500/10 transition-colors text-base py-2 text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-4 text-red-500" />
                          Delete roadmap
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalRoadmaps > 0 && (
          <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-base text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalRoadmaps} roadmap{totalRoadmaps > 1 ? 's' : ''}
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
            <DialogTitle className="text-xl">Roadmap Details</DialogTitle>
            <DialogDescription>
              View detailed information about this roadmap
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoadmap && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Map className="size-7 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-semibold break-words">
                    {selectedRoadmap.topic}
                  </p>
                  <p className="text-base text-neutral-400">
                    {selectedRoadmap.timeframe || 'No timeframe specified'}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-sm text-neutral-500 mb-2">Owner</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-sm font-bold">
                    {selectedRoadmap.owner.firstName[0]}{selectedRoadmap.owner.lastName[0]}
                  </div>
                  <div>
                    <p className="text-base font-medium">
                      {selectedRoadmap.owner.firstName} {selectedRoadmap.owner.lastName}
                    </p>
                    <p className="text-sm text-neutral-400">{selectedRoadmap.owner.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base text-neutral-500 mb-1">Experience Level</p>
                  <Badge variant="outline" className={`py-1.5 px-3 capitalize text-sm ${getExperienceBadgeColor(selectedRoadmap.experienceLevel)}`}>
                    {selectedRoadmap.experienceLevel || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Learning Pace</p>
                  <p className="text-lg capitalize">{selectedRoadmap.learningPace || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Phases</p>
                  <p className="text-lg font-semibold">{selectedRoadmap.phases?.length || 0}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Milestones</p>
                  <p className="text-lg font-semibold">{selectedRoadmap.milestones?.length || 0}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Shared With</p>
                  <div className="flex items-center gap-2">
                    <Share2 className="size-4 text-neutral-400" />
                    <p className="text-lg font-semibold">{selectedRoadmap.shareCount} users</p>
                  </div>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Public</p>
                  <p className="text-lg">{selectedRoadmap.isSharedWithAll ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Created</p>
                  <p className="text-lg">{formatDate(selectedRoadmap.createdAt)}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Updated</p>
                  <p className="text-lg">{formatDate(selectedRoadmap.updatedAt)}</p>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full !h-14 !text-[1.15rem]">
                  <Link href={`/roadmap/${selectedRoadmap.id}`} target="_blank">
                    Open Roadmap
                    <ExternalLink className="size-5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roadmap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the roadmap &quot;<strong>{roadmapToDelete?.topic}</strong>&quot;? 
              This action cannot be undone and will permanently remove the roadmap and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoadingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoadmap}
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