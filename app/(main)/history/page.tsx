'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreVertical, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { roadmapService, assessmentService } from '@/services';
import type { IRoadmapResponse, IAssessment } from '@/types';
import { searchVietnamese } from '@/lib';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { Badge } from '@/components/ui/badge';
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

type FilterType = 'all' | 'roadmap' | 'assessment';

type LoadingStates = {
  initial: boolean;
  loadMore: boolean;
  delete: boolean;
  deleteAll: boolean;
};

type HistoryItem = {
  id: string;
  type: Exclude<FilterType, 'all'>;
  title: string;
  createdAt: string;
  data: IRoadmapResponse | IAssessment;
};

export default function HistoryPage() {
  const router = useRouter();

  const [roadmaps, setRoadmaps] = useState<IRoadmapResponse[]>([]);
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    loadMore: false,
    delete: false,
    deleteAll: false,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [deleteItem, setDeleteItem] = useState<HistoryItem | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const allItems: HistoryItem[] = [
      ...roadmaps.map(r => ({
        id: r.id,
        type: 'roadmap' as const,
        title: r.topic,
        createdAt: r.createdAt,
        data: r
      })),
      ...assessments.map(a => ({
        id: a.id,
        type: 'assessment' as const,
        title: a.domain,
        createdAt: a.createdAt,
        data: a
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let filtered = allItems;

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        searchVietnamese(item.title, searchQuery)
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, roadmaps, assessments, filterType]);

  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadInitialData = async () => {
    try {
      updateLoadingState('initial', true);
      
      const [roadmapsData, assessmentsData] = await Promise.all([
        roadmapService.getAllRoadmaps(1, ITEMS_PER_PAGE),
        assessmentService.getAllAssessments()
      ]);
      
      setRoadmaps(roadmapsData);
      setAssessments(assessmentsData);
      setHasNextPage(roadmapsData.length === ITEMS_PER_PAGE);
      setPage(1);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      updateLoadingState('initial', false);
    }
  };

  const loadMoreRoadmaps = useCallback(async () => {
    if (loadingStates.loadMore || !hasNextPage || filterType === 'assessment') return;

    try {
      updateLoadingState('loadMore', true);
      const nextPage = page + 1;
      const roadmapsData = await roadmapService.getAllRoadmaps(nextPage, ITEMS_PER_PAGE);
      
      if (roadmapsData.length > 0) {
        setRoadmaps(prev => [...prev, ...roadmapsData]);
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
  }, [page, loadingStates.loadMore, hasNextPage, filterType, updateLoadingState]);

  const handleDelete = async (item: HistoryItem) => {
    try {
      updateLoadingState('delete', true);
      
      if (item.type === 'roadmap') {
        await roadmapService.deleteRoadmap(item.id);
        setRoadmaps(prev => prev.filter(r => r.id !== item.id));
        toast.success('Roadmap deleted successfully');
      } else {
        await assessmentService.deleteAssessment(item.id);
        setAssessments(prev => prev.filter(a => a.id !== item.id));
        toast.success('Assessment deleted successfully');
      }
    } catch (error) {
      toast.error(`Failed to delete ${item.type}`);
    } finally {
      updateLoadingState('delete', false);
      setDeleteItem(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      updateLoadingState('deleteAll', true);
      await roadmapService.deleteAllRoadmaps();
      
      setRoadmaps([]);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const renderHistoryCard = useCallback((item: HistoryItem) => {
    const isRoadmap = item.type === 'roadmap';
    const roadmapData = isRoadmap ? item.data as IRoadmapResponse : null;
    const assessmentData = !isRoadmap ? item.data as IAssessment : null;

    return (
      <div
        key={`${item.type}-${item.id}`}
        className="group relative bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all duration-300 cursor-pointer h-full flex flex-col"
        onClick={() => router.push(isRoadmap ? `/roadmap/${item.id}` : `/assessment/${item.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold mb-2 line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-md text-neutral-500">
              <Calendar className="size-4" />
              <span>{formatTimeAgo(item.createdAt)}</span>
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
                  router.push(isRoadmap ? `/roadmap/${item.id}` : `/assessment/${item.id}`);
                }}
                className="text-base"
              >
                View {item.type}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  setDeleteItem(item);
                }}
                className="text-base text-red-500 focus:text-red-500"
              >
                Delete {item.type}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    
        {isRoadmap && roadmapData && (
          <>
            <div className="space-y-2 flex-1">
              {roadmapData.experienceLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-base text-neutral-500">Level:</span>
                  <span className="text-base capitalize text-neutral-300">
                    {roadmapData.experienceLevel}
                  </span>
                </div>
              )}
              {roadmapData.learningPace && (
                <div className="flex items-center gap-2">
                  <span className="text-base text-neutral-500">Pace:</span>
                  <span className="text-base capitalize text-neutral-300">
                    {roadmapData.learningPace}
                  </span>
                </div>
              )}
              {roadmapData.timeframe && (
                <div className="flex items-center gap-2">
                  <span className="text-base text-neutral-500">Timeframe:</span>
                  <span className="text-base text-neutral-300">
                    {roadmapData.timeframe}
                  </span>
                </div>
              )}
            </div>
    
            {roadmapData.phases && (
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <span className="text-base text-neutral-400">
                  {roadmapData.phases.length} phases • {' '}
                  {roadmapData.phases.reduce((acc, phase) => acc + (phase.steps?.length || 0), 0)} steps
                </span>
              </div>
            )}
          </>
        )}

        {!isRoadmap && assessmentData && (
          <>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`capitalize ${getDifficultyColor(assessmentData.difficulty)}`}>
                  {assessmentData.difficulty}
                </Badge>
                <Badge variant="outline" className={`capitalize ${getStatusColor(assessmentData.status)}`}>
                  {assessmentData.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base text-neutral-500">Questions:</span>
                <span className="text-base text-neutral-300">
                  {assessmentData.questionCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base text-neutral-500">Answered:</span>
                <span className="text-base text-neutral-300">
                  {assessmentData.answeredCount} / {assessmentData.questionCount}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800">
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${(assessmentData.answeredCount / assessmentData.questionCount) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }, [router, formatTimeAgo]);

  const totalItems = roadmaps.length + assessments.length;
  const displayCount = filterType === 'all' 
    ? totalItems 
    : filterType === 'roadmap' 
      ? roadmaps.length 
      : assessments.length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold mb-3">History</h1>
          <p className="text-xl text-neutral-400">
            View all your roadmaps and assessments
          </p>
        </div>
        
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

      <div className="relative flex-1 mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
        <Input
          placeholder="Search..."
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
              <>Found <span className="font-semibold text-white">{filteredItems.length}</span> items</>
            ) : (
              <>You have <span className="font-semibold text-white">{displayCount}</span> {filterType === 'all' ? 'items' : filterType + 's'}</>
            )}
          </p>
        )}
        <div className="flex items-center">
          {(['all', 'roadmap', 'assessment'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`cursor-pointer px-4 py-2 text-base font-medium transition-colors ${
                filterType === type
                  ? 'text-white bg-neutral-800 rounded-lg'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {type === 'all' ? 'All' : type === 'roadmap' ? 'Roadmaps' : 'Assessments'}
            </button>
          ))}
        </div>
      </div>

      {loadingStates.initial && <HistoryLoading />}

      {!loadingStates.initial && filteredItems.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <div className="size-20 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
            <Calendar className="size-10 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {filterType === 'all' ? 'No items created yet' : `No ${filterType}s created yet`}
          </h3>
          <p className="text-neutral-400 mb-6">
            Start creating your first {filterType === 'all' ? 'learning content' : filterType}
          </p>
        </div>
      )}

      {!loadingStates.initial && searchQuery && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <div className="size-20 rounded-full bg-neutral-900/50 flex items-center justify-center mb-4">
            <Search className="size-10 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No results found</h3>
          <p className="text-neutral-400">Try searching with a different keyword</p>
        </div>
      )}

      {!loadingStates.initial && filteredItems.length > 0 && (
        <InfiniteScroll
          items={filteredItems}
          hasNextPage={!searchQuery && hasNextPage && filterType !== 'assessment'}
          isLoading={loadingStates.loadMore}
          onLoadMore={loadMoreRoadmaps}
          threshold={200}
          initialLoad={false}
          renderItem={renderHistoryCard}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          loader={() => (
            <div className="col-span-full flex justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                <p className="text-sm text-neutral-400">Loading more...</p>
              </div>
            </div>
          )}
          endMessage={null}
        />
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete {deleteItem?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteItem?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && handleDelete(deleteItem)}
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

