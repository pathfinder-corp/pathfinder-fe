import { format, parseISO } from 'date-fns';
import { FileText, Award, Briefcase, File, UserCheck, FileSpreadsheet, Presentation, FileType } from 'lucide-react';
import type { MentorApplicationStatus, MentorshipStatus, MentorDocumentType } from '@/types';

export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const getStatusBadgeColor = (status: MentorApplicationStatus | null | undefined) => {
  if (!status) return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  switch (status) {
    case 'approved':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'declined':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'under_review':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'flagged':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'withdrawn':
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    default:
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
};

export const formatStatus = (status: MentorApplicationStatus | null | undefined) => {
  if (!status) return 'Unknown';
  switch (status) {
    case 'under_review':
      return 'Under Review';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const canReview = (status: MentorApplicationStatus | null | undefined) => {
  if (!status) return false;
  return status === 'pending' || status === 'under_review' || status === 'flagged';
};

export const getMentorActiveBadgeColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';
};

export const formatMentorActiveStatus = (isActive: boolean) => {
  return isActive ? 'Active' : 'Inactive';
};

export const getMentorshipStatusBadgeColor = (status: MentorshipStatus | null | undefined) => {
  if (!status) return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'ended':
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    default:
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
};

export const formatMentorshipStatus = (status: MentorshipStatus | null | undefined) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const generatePaginationItems = (currentPage: number, totalPages: number) => {
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

export const getDocumentIconComponent = (type: MentorDocumentType) => {
  switch (type) {
    case 'certificate':
      return FileText;
    case 'award':
      return Award;
    case 'portfolio':
      return Briefcase;
    case 'recommendation':
      return UserCheck;
    default:
      return File;
  }
};

export const getFileTypeIconComponent = (doc: { 
  isPdf?: boolean; 
  isWord?: boolean; 
  isExcel?: boolean; 
  isPowerPoint?: boolean; 
  isImage?: boolean 
}) => {
  if (doc.isImage) return File;
  if (doc.isPdf) return FileText;
  if (doc.isWord) return FileType;
  if (doc.isExcel) return FileSpreadsheet;
  if (doc.isPowerPoint) return Presentation;
  return File;
};

export const getFileTypeLabel = (doc: { 
  isPdf?: boolean; 
  isWord?: boolean; 
  isExcel?: boolean; 
  isPowerPoint?: boolean; 
  isImage?: boolean; 
  mimeType?: string 
}) => {
  if (doc.isImage) return 'Image';
  if (doc.isPdf) return 'PDF';
  if (doc.isWord) return 'Word';
  if (doc.isExcel) return 'Excel';
  if (doc.isPowerPoint) return 'PowerPoint';
  return doc.mimeType?.split('/')[1]?.toUpperCase() || 'Document';
};