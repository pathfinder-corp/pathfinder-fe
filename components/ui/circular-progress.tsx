'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  trackColor = 'stroke-neutral-800',
  progressColor = 'stroke-green-500',
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(progressColor, 'transition-all duration-700 ease-out')}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
