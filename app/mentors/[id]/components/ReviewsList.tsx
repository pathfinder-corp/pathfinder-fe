'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { Loader2, Star as StarIcon, MessageSquare } from 'lucide-react';
import { mentorService } from '@/services';
import type { IMentorReview, IMentorReviewStats } from '@/types';
import { getInitials } from '@/lib';

import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface ReviewsListProps {
  mentorId: string;
  onWriteReview?: () => void;
}

export function ReviewsList({ mentorId, onWriteReview }: ReviewsListProps) {
  const [reviews, setReviews] = useState<IMentorReview[]>([]);
  const [stats, setStats] = useState<IMentorReviewStats | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const fetchReviews = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await mentorService.getMentorReviews(mentorId, {
        page: pageNum,
        limit: 20,
      });

      if (append) {
        setReviews((prev) => [...prev, ...response.reviews]);
      } else {
        setReviews(response.reviews);
      }

      setStats(response.stats);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (mentorId) {
      fetchReviews(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage, true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <Skeleton className="mb-6 h-8 w-48 bg-neutral-800" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full bg-neutral-800" />
            <Skeleton className="h-6 w-3/4 bg-neutral-800" />
            <Skeleton className="h-6 w-1/2 bg-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="p-10 text-center">
        <MessageSquare className="mx-auto mb-4 size-14 text-neutral-600" />
        <p className="mb-2 text-xl text-neutral-400">No reviews yet</p>
        <p className="mb-6 text-base text-neutral-500">
          Be the first to review this mentor!
        </p>
        {onWriteReview && (
          <Button onClick={onWriteReview} className="h-12! text-base!">
            Write a Review
          </Button>
        )}
      </div>
    );
  }

  const getRatingPercentage = (starCount: number) => {
    if (stats.totalReviews === 0) return 0;
    return (starCount / stats.totalReviews) * 100;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-5xl font-bold text-white">
                {stats.averageRating.toFixed(1)}
              </span>
              <StarIcon className="size-8 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <p className="text-lg text-neutral-400">
            Based on {stats.totalReviews}{' '}
            {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {onWriteReview && (
          <Button
            onClick={onWriteReview}
            className="h-12! w-full bg-white text-base! md:w-auto"
          >
            Write a Review
          </Button>
        )}
      </div>

      <div className="space-y-3 border-t border-neutral-800 pt-6">
        {[5, 4, 3, 2, 1].map((star) => {
          const count =
            stats.ratingDistribution[
              star as keyof typeof stats.ratingDistribution
            ];
          const percentage = getRatingPercentage(count);

          return (
            <div key={star} className="flex items-center gap-4">
              <div className="flex w-20 items-center gap-2">
                <span className="text-base text-neutral-300">{star}</span>
                <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1">
                <Progress value={percentage} className="h-2" />
              </div>
              <span className="w-16 text-right text-base text-neutral-400">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Reviews</h2>
          <span className="text-base text-neutral-400">
            {stats.totalReviews}{' '}
            {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        <div
          className={
            reviews.length >= 2
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
              : 'space-y-4'
          }
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
            >
              <div className="mb-4 flex items-start gap-4">
                {review.student?.avatar ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={review.student.avatar}
                      alt={`${review.student.firstName} ${review.student.lastName}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-lg font-bold">
                    {getInitials(
                      review.student?.firstName || '',
                      review.student?.lastName || ''
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-white">
                      {review.student?.firstName} {review.student?.lastName}
                    </p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-neutral-500">
                    {format(parseISO(review.createdAt), 'MMMM d, yyyy')}
                    {review.updatedAt !== review.createdAt && (
                      <span className="ml-2 text-neutral-600">(Updated)</span>
                    )}
                  </p>
                </div>
              </div>

              {review.feedback && (
                <p className="text-base leading-relaxed whitespace-pre-line text-neutral-300">
                  {review.feedback}
                </p>
              )}
            </div>
          ))}
        </div>

        {page < totalPages && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="h-12! text-base!"
            >
              {isLoadingMore ? (
                <>
                  Loading...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                'Load More Reviews'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
