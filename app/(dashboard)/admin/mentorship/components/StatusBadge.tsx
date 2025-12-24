'use client';

import { Badge } from '@/components/ui/badge';
import type { MentorApplicationStatus, MentorshipStatus } from '@/types';
import {
  getStatusBadgeColor,
  formatStatus,
  getMentorActiveBadgeColor,
  formatMentorActiveStatus,
  getMentorshipStatusBadgeColor,
  formatMentorshipStatus,
} from './utils';

type StatusBadgeType = 'application' | 'mentor-active' | 'mentorship';

interface ApplicationStatusBadgeProps {
  type?: 'application';
  status: MentorApplicationStatus;
  size?: 'sm' | 'md';
}

interface MentorActiveStatusBadgeProps {
  type: 'mentor-active';
  status: boolean;
  size?: 'sm' | 'md';
}

interface MentorshipStatusBadgeProps {
  type: 'mentorship';
  status: MentorshipStatus;
  size?: 'sm' | 'md';
}

type StatusBadgeProps =
  | ApplicationStatusBadgeProps
  | MentorActiveStatusBadgeProps
  | MentorshipStatusBadgeProps;

export function StatusBadge(props: StatusBadgeProps) {
  const { size = 'md' } = props;
  const type = props.type || 'application';

  const sizeClasses =
    size === 'sm' ? 'py-1 px-2.5 text-sm' : 'py-2 px-3 text-sm';

  let colorClass = '';
  let label = '';

  switch (type) {
    case 'application':
      colorClass = getStatusBadgeColor(props.status as MentorApplicationStatus);
      label = formatStatus(props.status as MentorApplicationStatus);
      break;
    case 'mentor-active':
      colorClass = getMentorActiveBadgeColor(props.status as boolean);
      label = formatMentorActiveStatus(props.status as boolean);
      break;
    case 'mentorship':
      colorClass = getMentorshipStatusBadgeColor(
        props.status as MentorshipStatus
      );
      label = formatMentorshipStatus(props.status as MentorshipStatus);
      break;
  }

  return (
    <Badge variant="outline" className={`${sizeClasses} w-fit ${colorClass}`}>
      {label}
    </Badge>
  );
}
