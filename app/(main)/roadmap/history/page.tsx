'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreVertical, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { roadmapService } from '@/services';
import type { IRoadmapResponse } from '@/types';
import { searchVietnamese } from '@/lib';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import HistoryLoading from './loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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

const ITEMS_PER_PAGE = 12;

type LoadingStates = {
  initial: boolean;
  loadMore: boolean;
  delete: boolean;
  deleteAll: boolean;
};

export default function RoadmapHistoryPage() {
  const router = useRouter();

  const [roadmaps, setRoadmaps] = useState<IRoadmapResponse[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<IRoadmapResponse[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    loadMore: false,
    delete: false,
    deleteAll: false,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    loadInitialRoadmaps();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = roadmaps.filter(roadmap =>
        searchVietnamese(roadmap.topic, searchQuery)
      );
      setFilteredRoadmaps(filtered);
    } else {
      setFilteredRoadmaps(roadmaps);
    }
  }, [searchQuery, roadmaps]);

  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadInitialRoadmaps = async () => {
    try {
      updateLoadingState('initial', true);
      const roadmapsData = await roadmapService.getAllRoadmaps(1, ITEMS_PER_PAGE);
      
      setRoadmaps(roadmapsData);
      setFilteredRoadmaps(roadmapsData);
      setTotalCount(roadmapsData.length);
      setHasNextPage(roadmapsData.length === ITEMS_PER_PAGE);
      setPage(1);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch roadmaps');
    } finally {
      updateLoadingState('initial', false);
    }
  };

  const loadMoreRoadmaps = useCallback(async () => {
    if (loadingStates.loadMore || !hasNextPage) return;

    try {
      updateLoadingState('loadMore', true);
      const nextPage = page + 1;
      const roadmapsData = await roadmapService.getAllRoadmaps(nextPage, ITEMS_PER_PAGE);
      
      if (roadmapsData.length > 0) {
        setRoadmaps(prev => [...prev, ...roadmapsData]);
        setTotalCount(prev => prev + roadmapsData.length);
        setPage(nextPage);
        setHasNextPage(roadmapsData.length === ITEMS_PER_PAGE);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error loading more roadmaps:', error);
      toast.error('Failed to load more roadmaps');
    } finally {
      updateLoadingState('loadMore', false);
    }
  }, [page, loadingStates.loadMore, hasNextPage, updateLoadingState]);

  const handleDelete = async (id: string) => {
    try {
      updateLoadingState('delete', true);
      await roadmapService.deleteRoadmap(id);
      
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      setTotalCount(prev => prev - 1);
      toast.success('Roadmap deleted successfully');
    } catch (error) {
      toast.error('Failed to delete roadmap');
    } finally {
      updateLoadingState('delete', false);
      setDeleteId(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      updateLoadingState('deleteAll', true);
      await roadmapService.deleteAllRoadmaps();
      
      setRoadmaps([]);
      setFilteredRoadmaps([]);
      setTotalCount(0);
      setPage(1);
      setHasNextPage(false);
      toast.success('All roadmaps deleted successfully');
    } catch (error) {
      console.error('Error deleting all roadmaps:', error);
      toast.error('Failed to delete all roadmaps');
    } finally {
      updateLoadingState('deleteAll', false);
      setIsDeleteAllOpen(false);
    }
  };

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, []);

  const renderRoadmapCard = useCallback((roadmap: IRoadmapResponse) => (
    <div
      key={roadmap.id}
      className="group relative bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => router.push(`/roadmap/${roadmap.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
            {roadmap.topic}
          </h3>
          <div className="flex items-center gap-2 text-md text-neutral-500">
            <Calendar className="size-4" />
            <span>{formatTimeAgo(roadmap.createdAt)}</span>
          </div>
        </div>
  
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <MoreVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                router.push(`/roadmap/${roadmap.id}`);
              }}
              className="text-base"
            >
              View roadmap
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                setDeleteId(roadmap.id);
              }}
              className="text-base text-red-500 focus:text-red-500"
            >
              Delete roadmap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
  
      <div className="space-y-2 flex-1">
        {roadmap.experienceLevel && (
          <div className="flex items-center gap-2">
            <span className="text-base text-neutral-500">Experience level:</span>
            <span className="text-base capitalize text-neutral-300">
              {roadmap.experienceLevel}
            </span>
          </div>
        )}
        {roadmap.learningPace && (
          <div className="flex items-center gap-2">
            <span className="text-base text-neutral-500">Learning pace:</span>
            <span className="text-base capitalize text-neutral-300">
              {roadmap.learningPace}
            </span>
          </div>
        )}
        {roadmap.timeframe && (
          <div className="flex items-center gap-2">
            <span className="text-base text-neutral-500">Timeframe:</span>
            <span className="text-base text-neutral-300">
              {roadmap.timeframe}
            </span>
          </div>
        )}
      </div>
  
      {roadmap.phases && (
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <span className="text-base text-neutral-400">
            {roadmap.phases.length} phases • {' '}
            {roadmap.phases.reduce((acc, phase) => acc + (phase.steps?.length || 0), 0)} steps
          </span>
        </div>
      )}
    </div>
  ), [router, formatTimeAgo]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold mb-3">Roadmap Library</h1>
          <p className="text-xl text-neutral-400">
            Explore the learning roadmaps created by AI
          </p>
        </div>
        
        <div className="flex items-center gap-3">          
          <Button
            onClick={() => router.push('/roadmap')}
            size="lg"
            disabled={loadingStates.initial}
            className="!h-12 rounded-full text-base bg-white text-neutral-950 hover:bg-neutral-200"
          >
            Create new
            <Plus className="size-5" />
          </Button>
          {roadmaps.length >= 2 && (
            <Button
              onClick={() => setIsDeleteAllOpen(true)}
              size="lg"
              variant="outline"
              disabled={loadingStates.initial || loadingStates.deleteAll}
              className="!h-12 rounded-full text-base !border-red-500 text-red-500 hover:text-red-500"
            >
              Delete All
              <Trash2 className="size-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
        <Input
          placeholder="Search roadmap..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loadingStates.initial}
          className="pl-12 !h-14 !text-base bg-neutral-900/50 border-neutral-800"
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        {loadingStates.initial ? (
          <Skeleton className="h-6 w-48 bg-neutral-800" />
        ) : (
          <p className="text-base text-neutral-400">
            {searchQuery ? (
              <>Found <span className="font-semibold text-white">{filteredRoadmaps.length}</span> roadmaps</>
            ) : (
              <>You have created <span className="font-semibold text-white">{totalCount}</span> roadmaps</>
            )}
          </p>
        )}
      </div>

      {loadingStates.initial && <HistoryLoading />}

      {!loadingStates.initial && roadmaps.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <div className="size-20 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
            <Calendar className="size-10 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No roadmap created yet</h3>
          <p className="text-neutral-400 mb-6">
            Start creating your first learning roadmap
          </p>
        </div>
      )}

      {!loadingStates.initial && searchQuery && filteredRoadmaps.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <div className="size-20 rounded-full bg-neutral-900/50 flex items-center justify-center mb-4">
            <Search className="size-10 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No roadmap found</h3>
          <p className="text-neutral-400">Try searching with a different keyword</p>
        </div>
      )}

      {!loadingStates.initial && filteredRoadmaps.length > 0 && (
        <InfiniteScroll
          items={filteredRoadmaps}
          hasNextPage={!searchQuery && hasNextPage}
          isLoading={loadingStates.loadMore}
          onLoadMore={loadMoreRoadmaps}
          threshold={200}
          initialLoad={false}
          renderItem={renderRoadmapCard}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          loader={() => (
            <div className="col-span-full flex justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                <p className="text-sm text-neutral-400">Loading more roadmaps...</p>
              </div>
            </div>
          )}
          endMessage={null}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete roadmap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this roadmap? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={loadingStates.delete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loadingStates.delete ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete all roadmaps</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>all {roadmaps.length} roadmaps</strong>? This action cannot be undone and all your learning roadmaps will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingStates.deleteAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={loadingStates.deleteAll}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loadingStates.deleteAll ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}