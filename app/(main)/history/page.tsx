'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MoreVertical,
  Calendar,
  Trash2,
  FileText,
  Map,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { roadmapService, assessmentService } from '@/services';
import type { IRoadmapResponse, IAssessment } from '@/types';
import { searchVietnamese } from '@/lib';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { Badge } from '@/components/ui/badge';
import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import HistoryLoading from './loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

const TABS = [
  { id: 'all' as const, label: 'All', icon: Calendar },
  { id: 'roadmap' as const, label: 'Roadmaps', icon: Map },
  { id: 'assessment' as const, label: 'Assessments', icon: FileText },
];

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
  attempts?: IAssessment[]; // For grouped assessments
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
    // Group assessments by original ID
    const groupedAssessments = new globalThis.Map<string, IAssessment[]>();

    assessments.forEach((assessment) => {
      const rootId = assessment.originalAssessmentId || assessment.id;
      if (!groupedAssessments.has(rootId)) {
        groupedAssessments.set(rootId, []);
      }
      groupedAssessments.get(rootId)!.push(assessment);
    });

    // Sort attempts within each group
    groupedAssessments.forEach((attempts) => {
      attempts.sort((a, b) => a.attemptNumber - b.attemptNumber);
    });

    // Create history items with grouped assessments (use latest attempt for display)
    const allItems: HistoryItem[] = [
      ...roadmaps.map((r) => ({
        id: r.id,
        type: 'roadmap' as const,
        title: r.topic,
        createdAt: r.createdAt,
        data: r,
      })),
      ...Array.from(groupedAssessments.values()).map((attempts) => {
        const latestAttempt = attempts[attempts.length - 1];
        return {
          id: latestAttempt.originalAssessmentId || latestAttempt.id,
          type: 'assessment' as const,
          title: latestAttempt.domain,
          createdAt: latestAttempt.createdAt,
          data: latestAttempt,
          attempts: attempts, // Store all attempts for display
        };
      }),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let filtered = allItems;

    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        searchVietnamese(item.title, searchQuery)
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, roadmaps, assessments, filterType]);

  const updateLoadingState = useCallback(
    (key: keyof LoadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const loadInitialData = async () => {
    try {
      updateLoadingState('initial', true);

      const [roadmapsData, assessmentsData] = await Promise.all([
        roadmapService.getAllRoadmaps(1, ITEMS_PER_PAGE),
        assessmentService.getAllAssessments(),
      ]);

      setRoadmaps(roadmapsData);
      setAssessments(assessmentsData);
      setHasNextPage(roadmapsData.length === ITEMS_PER_PAGE);
      setPage(1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error('Failed to fetch data', {
        description: errorMessage,
      });
    } finally {
      updateLoadingState('initial', false);
    }
  };

  const loadMoreRoadmaps = useCallback(async () => {
    if (loadingStates.loadMore || !hasNextPage || filterType === 'assessment')
      return;

    try {
      updateLoadingState('loadMore', true);
      const nextPage = page + 1;
      const roadmapsData = await roadmapService.getAllRoadmaps(
        nextPage,
        ITEMS_PER_PAGE
      );

      if (roadmapsData.length > 0) {
        setRoadmaps((prev) => [...prev, ...roadmapsData]);
        setPage(nextPage);
        setHasNextPage(roadmapsData.length === ITEMS_PER_PAGE);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load more roadmaps';
      toast.error('Failed to load more roadmaps', {
        description: errorMessage,
      });
    } finally {
      updateLoadingState('loadMore', false);
    }
  }, [
    page,
    loadingStates.loadMore,
    hasNextPage,
    filterType,
    updateLoadingState,
  ]);

  const handleDelete = async (item: HistoryItem) => {
    try {
      updateLoadingState('delete', true);

      if (item.type === 'roadmap') {
        await roadmapService.deleteRoadmap(item.id);
        setRoadmaps((prev) => prev.filter((r) => r.id !== item.id));
        toast.success('Roadmap deleted successfully');
      } else {
        await assessmentService.deleteAssessment(item.id);
        setAssessments((prev) => prev.filter((a) => a.id !== item.id));
        toast.success('Assessment deleted successfully');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to delete ${item.type}`;
      toast.error('Failed to delete', {
        description: errorMessage,
      });
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete all roadmaps';
      toast.error('Failed to delete all roadmaps', {
        description: errorMessage,
      });
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

  const renderHistoryCard = useCallback(
    (item: HistoryItem) => {
      const isRoadmap = item.type === 'roadmap';
      const roadmapData = isRoadmap ? (item.data as IRoadmapResponse) : null;
      const assessmentData = !isRoadmap ? (item.data as IAssessment) : null;
      const hasMultipleAttempts = item.attempts && item.attempts.length > 1;
      const latestAttempt = item.attempts
        ? item.attempts[item.attempts.length - 1]
        : assessmentData;

      return (
        <div
          key={`${item.type}-${item.id}`}
          className="group relative flex h-full cursor-pointer flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 p-7 transition-all duration-300 hover:border-neutral-700"
          onClick={() =>
            router.push(
              isRoadmap
                ? `/roadmap/${item.id}`
                : `/assessment/${latestAttempt?.id}`
            )
          }
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start gap-3">
                <h3 className="line-clamp-2 flex-1 text-2xl font-semibold">
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-lg text-neutral-500">
                <Calendar className="size-5" />
                <span>{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  e.stopPropagation()
                }
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreVertical className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-46">
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    router.push(
                      isRoadmap
                        ? `/roadmap/${item.id}`
                        : `/assessment/${latestAttempt?.id}`
                    );
                  }}
                  className="py-3 text-lg"
                >
                  View {item.type}
                </DropdownMenuItem>
                {!isRoadmap &&
                  latestAttempt &&
                  latestAttempt.attemptNumber > 1 && (
                    <DropdownMenuItem
                      onClick={async (e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        try {
                          const newAssessment =
                            await assessmentService.retakeAssessment(item.id);
                          toast.success(
                            `Starting attempt ${newAssessment.attemptNumber}!`
                          );
                          router.push(`/assessment/${newAssessment.id}`);
                        } catch (error) {
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : 'Failed to retake assessment';
                          toast.error(errorMessage);
                        } finally {
                        }
                      }}
                      className="py-3 text-lg"
                    >
                      Retake assessment
                    </DropdownMenuItem>
                  )}
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    setDeleteItem(item);
                  }}
                  className="py-3 text-lg text-red-500 focus:text-red-500 dark:hover:bg-red-500/10"
                >
                  Delete {item.type}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isRoadmap && roadmapData && (
            <>
              <div className="flex-1 space-y-2.5">
                {roadmapData.experienceLevel && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-neutral-500">Level:</span>
                    <span className="text-lg text-neutral-300 capitalize">
                      {roadmapData.experienceLevel}
                    </span>
                  </div>
                )}
                {roadmapData.learningPace && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-neutral-500">Pace:</span>
                    <span className="text-lg text-neutral-300 capitalize">
                      {roadmapData.learningPace}
                    </span>
                  </div>
                )}
                {roadmapData.timeframe && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-neutral-500">Timeframe:</span>
                    <span className="text-lg text-neutral-300">
                      {roadmapData.timeframe}
                    </span>
                  </div>
                )}
              </div>

              {roadmapData.phases && (
                <div className="mt-4 border-t border-neutral-800 pt-4">
                  <span className="text-lg text-neutral-400">
                    {roadmapData.phases.length} phases •{' '}
                    {roadmapData.phases.reduce(
                      (acc, phase) => acc + (phase.steps?.length || 0),
                      0
                    )}{' '}
                    steps
                  </span>
                </div>
              )}
            </>
          )}

          {!isRoadmap && latestAttempt && (
            <>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`px-3 py-2 text-base capitalize ${getDifficultyColor(latestAttempt.difficulty)}`}
                  >
                    {latestAttempt.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`px-3 py-2 text-base capitalize ${getStatusColor(latestAttempt.status)}`}
                  >
                    {latestAttempt.status.replace('_', ' ')}
                  </Badge>
                  {latestAttempt.attemptNumber > 0 && (
                    <Badge
                      variant="outline"
                      className="border-neutral-500/30 bg-neutral-500/20 px-3 py-2 text-base text-neutral-400"
                    >
                      {latestAttempt.attemptNumber}{' '}
                      {latestAttempt.attemptNumber === 1
                        ? 'Attempt'
                        : 'Attempts'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-neutral-500">Questions:</span>
                  <span className="text-lg text-neutral-300">
                    {latestAttempt.questionCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-neutral-500">Answered:</span>
                  <span className="text-lg text-neutral-300">
                    {latestAttempt.answeredCount} /{' '}
                    {latestAttempt.questionCount}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-800 pt-4">
                <div className="h-2.5 w-full rounded-full bg-neutral-800">
                  <div
                    className="h-2.5 rounded-full bg-white transition-all"
                    style={{
                      width: `${(latestAttempt.answeredCount / latestAttempt.questionCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      );
    },
    [router, formatTimeAgo]
  );

  const totalItems = roadmaps.length + assessments.length;
  const displayCount =
    filterType === 'all'
      ? totalItems
      : filterType === 'roadmap'
        ? roadmaps.length
        : assessments.length;

  const activeIndex = TABS.findIndex((tab) => tab.id === filterType);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-3 text-6xl font-bold">History</h1>
          <p className="text-2xl text-neutral-400">
            View all your roadmaps and assessments
          </p>
        </div>

        {roadmaps.length >= 2 && (
          <Button
            onClick={() => setIsDeleteAllOpen(true)}
            size="lg"
            variant="outline"
            disabled={loadingStates.initial || loadingStates.deleteAll}
            className="h-14! rounded-full !border-red-500 text-lg text-red-500 hover:text-red-500"
          >
            Delete All
            <Trash2 className="size-6" />
          </Button>
        )}
      </div>

      <div className="relative mb-6 flex-1">
        <Search className="absolute top-1/2 left-4 size-6 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loadingStates.initial}
          className="h-16! border-neutral-800 bg-neutral-900/50 pl-14 text-lg!"
        />
      </div>

      <div className="mb-2 flex items-center justify-between">
        {loadingStates.initial ? (
          <Skeleton className="h-7 w-52 bg-neutral-800" />
        ) : (
          <p className="text-lg text-neutral-400">
            {searchQuery ? (
              <>
                Found{' '}
                <span className="font-semibold text-white">
                  {filteredItems.length}
                </span>{' '}
                item
                {filteredItems.length > 1 ? 's' : ''}
              </>
            ) : (
              <>
                You have{' '}
                <span className="font-semibold text-white">{displayCount}</span>{' '}
                {filterType === 'all'
                  ? displayCount > 1
                    ? 'items'
                    : 'item'
                  : displayCount > 1
                    ? filterType + 's'
                    : filterType}
              </>
            )}
          </p>
        )}
      </div>

      <div className="mb-6 flex items-center gap-1 border-b border-neutral-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`relative flex cursor-pointer items-center gap-2 px-5 py-4 text-lg font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="size-5" />
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="activeHistoryTab"
                  className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"
                />
              )}
            </button>
          );
        })}
      </div>

      <TransitionPanel
        activeIndex={activeIndex}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        variants={{
          enter: { opacity: 0, y: -20, filter: 'blur(4px)' },
          center: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: 20, filter: 'blur(4px)' },
        }}
      >
        {TABS.map((tab) => (
          <div key={tab.id}>
            {loadingStates.initial && <HistoryLoading />}

            {!loadingStates.initial &&
              filteredItems.length === 0 &&
              !searchQuery && (
                <div className="flex h-[40vh] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-neutral-900">
                    <Calendar className="size-12 text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-3xl font-semibold">
                    {filterType === 'all'
                      ? 'No items created yet'
                      : `No ${filterType}s created yet`}
                  </h3>
                  <p className="mb-6 text-lg text-neutral-400">
                    Start creating your first{' '}
                    {filterType === 'all' ? 'learning content' : filterType}
                  </p>
                </div>
              )}

            {!loadingStates.initial &&
              searchQuery &&
              filteredItems.length === 0 && (
                <div className="flex h-[40vh] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-neutral-900/50">
                    <Search className="size-12 text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-3xl font-semibold">
                    No results found
                  </h3>
                  <p className="text-lg text-neutral-400">
                    Try searching with a different keyword
                  </p>
                </div>
              )}

            {!loadingStates.initial && filteredItems.length > 0 && (
              <InfiniteScroll
                items={filteredItems}
                hasNextPage={
                  !searchQuery && hasNextPage && filterType !== 'assessment'
                }
                isLoading={loadingStates.loadMore}
                onLoadMore={loadMoreRoadmaps}
                threshold={200}
                initialLoad={false}
                renderItem={renderHistoryCard}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                loader={() => (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
                      <p className="text-base text-neutral-400">
                        Loading more...
                      </p>
                    </div>
                  </div>
                )}
                endMessage={null}
              />
            )}
          </div>
        ))}
      </TransitionPanel>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Confirm delete {deleteItem?.type}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this {deleteItem?.type}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11! text-base">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && handleDelete(deleteItem)}
              disabled={loadingStates.delete}
              className="h-11! bg-red-500 text-base text-white hover:bg-red-600"
            >
              {loadingStates.delete ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Confirm delete all roadmaps
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete{' '}
              <strong>all {roadmaps.length} roadmaps</strong>? This action
              cannot be undone and all your learning roadmaps will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loadingStates.deleteAll}
              className="h-11! text-base"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={loadingStates.deleteAll}
              className="h-11! bg-red-500 text-base text-white hover:bg-red-600"
            >
              {loadingStates.deleteAll ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
