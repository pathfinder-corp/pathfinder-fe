'use client';

import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Flag, 
  X,
  FileSearch 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MentorApplicationStatus } from '@/types';
import { getStatusBadgeColor, formatStatus } from './utils';

interface StatusBadgeProps {
  status: MentorApplicationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' 
    ? 'py-1 px-2.5 text-sm' 
    : 'py-2 px-4 text-base';

  return (
    <Badge 
      variant="outline" 
      className={`${sizeClasses} w-fit ${getStatusBadgeColor(status)}`}
    >
      {formatStatus(status)}
    </Badge>
  );
}