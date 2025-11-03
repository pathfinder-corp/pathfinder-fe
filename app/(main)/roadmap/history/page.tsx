'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Loader2, MoreVertical, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { roadmapService } from '@/services/roadmap.service';
import type { IRoadmapResponse } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function RoadmapHistoryPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<IRoadmapResponse[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<IRoadmapResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = roadmaps.filter(roadmap =>
        roadmap.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRoadmaps(filtered);
    } else {
      setFilteredRoadmaps(roadmaps);
    }
  }, [searchQuery, roadmaps]);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      
      const roadmapsData = await roadmapService.getAllRoadmaps(1, 50);
      
      setRoadmaps(roadmapsData);
      setFilteredRoadmaps(roadmapsData);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải danh sách lộ trình');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa lộ trình thành công');
    } catch (error) {
      toast.error('Không thể xóa lộ trình');
    } finally {
      setDeleteId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold mb-3">Roadmap Library</h1>
          <p className="text-xl text-neutral-400">
            Explore the learning roadmaps created by AI
          </p>
        </div>
        <Button
          onClick={() => router.push('/roadmap')}
          size="lg"
          disabled={isLoading}
          className="!h-12 rounded-full text-base bg-white text-neutral-950 hover:bg-neutral-200"
        >
          <Plus className="size-5" />
          Create new
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
        <Input
          placeholder="Search roadmap..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
          className="pl-12 !h-14 !text-base bg-neutral-900/50 border-neutral-800"
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        {isLoading ? (
          <Skeleton className="h-6 w-48 bg-neutral-800" />
        ) : (
          <p className="text-base text-neutral-400">
            You have created <span className="font-semibold text-white">{roadmaps?.length}</span> roadmaps
          </p>
        )}
      </div>

      {isLoading && <HistoryLoading />}

      {!isLoading && filteredRoadmaps?.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <div className="size-20 rounded-full bg-neutral-900/50 flex items-center justify-center mb-4">
            <Calendar className="size-10 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {searchQuery ? 'No roadmap found' : 'No roadmap created yet'}
          </h3>
          <p className="text-neutral-400 mb-6">
            {searchQuery 
              ? 'Try searching with a different keyword' 
              : 'Start creating your first learning roadmap'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push('/roadmap')}
              size="lg"
              className="!h-12 rounded-full"
            >
              <Plus className="size-5" />
              Create new roadmap
            </Button>
          )}
        </div>
      )}

      {!isLoading && filteredRoadmaps?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="group relative bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/roadmap/${roadmap.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {roadmap.topic}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Calendar className="size-4" />
                    <span>{formatTimeAgo(roadmap.createdAt)}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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

              <div className="space-y-2">
                {roadmap.experienceLevel && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Experience level:</span>
                    <span className="text-sm capitalize text-neutral-300">
                      {roadmap.experienceLevel}
                    </span>
                  </div>
                )}
                {roadmap.learningPace && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Learning pace:</span>
                    <span className="text-sm capitalize text-neutral-300">
                      {roadmap.learningPace}
                    </span>
                  </div>
                )}
                {roadmap.timeframe && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Timeframe:</span>
                    <span className="text-sm text-neutral-300">
                      {roadmap.timeframe}
                    </span>
                  </div>
                )}
              </div>

              {roadmap.phases && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <span className="text-sm text-neutral-400">
                    {roadmap.phases.length} phases • {' '}
                    {roadmap.phases.reduce((acc, phase) => acc + (phase.steps?.length || 0), 0)} steps
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
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
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}