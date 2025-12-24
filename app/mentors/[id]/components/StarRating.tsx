'use client';

import { useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  const starSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(
            starSize,
            'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]'
          )}
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(starSize, 'fill-neutral-700 text-neutral-700')} />
          <Star
            className={cn(
              starSize,
              'absolute inset-0 overflow-hidden fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]'
            )}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(starSize, 'fill-neutral-700 text-neutral-700')}
        />
      ))}
      {showValue && (
        <span className="ml-2 text-base font-medium text-neutral-300">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface InteractiveStarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export function InteractiveStarRating({
  rating,
  onRatingChange,
  disabled = false,
  className,
}: InteractiveStarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={cn(
            'transition-all',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              'size-7',
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-neutral-700 text-neutral-700'
            )}
          />
        </button>
      ))}
      <span className="ml-3 text-lg text-neutral-400">
        {rating === 0 && 'Select a rating'}
        {rating === 1 && 'Poor'}
        {rating === 2 && 'Fair'}
        {rating === 3 && 'Good'}
        {rating === 4 && 'Very Good'}
        {rating === 5 && 'Excellent'}
      </span>
    </div>
  );
}
