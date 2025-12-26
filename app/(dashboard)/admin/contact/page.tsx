'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  MoreVertical,
  MessageSquare,
  Loader2,
  Eye,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { adminService } from '@/services';
import type {
  IAdminContactMessage,
  IAdminContactMessagesParams,
  IUpdateContactStatusPayload,
  IRespondToContactPayload,
  SortOrder,
  ContactSortField
} from '@/types';
import { useDebounceValue } from 'usehooks-ts';
import { ITEMS_PER_PAGE, SORT_ORDER } from '@/constants';
import { getInitials } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type StatusFilter = 'pending' | 'in_progress' | 'resolved' | 'closed' | 'all';
type TypeFilter = 'general' | 'suspended' | 'feedback' | 'support' | 'all';

export default function AdminContactPage() {
  const [messages, setMessages] = useState<IAdminContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [sortBy, setSortBy] = useState<ContactSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.DESC);

  const [selectedMessage, setSelectedMessage] =
    useState<IAdminContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isRespondDialogOpen, setIsRespondDialogOpen] =
    useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>('');
  const [isResponding, setIsResponding] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      const params: IAdminContactMessagesParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await adminService.getContactMessages(params);
      setMessages(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalMessages(response.meta.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load contact messages';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    statusFilter,
    typeFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  const handleSort = (field: ContactSortField) => {
    if (sortBy === field) {
      setSortOrder(
        sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC
      );
    } else {
      setSortBy(field);
      setSortOrder(SORT_ORDER.DESC);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: ContactSortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 size-5 opacity-50" />;
    }
    return sortOrder === SORT_ORDER.ASC ? (
      <ArrowUp className="ml-2 size-5" />
    ) : (
      <ArrowDown className="ml-2 size-5" />
    );
  };

  const handleViewMessage = async (message: IAdminContactMessage) => {
    try {
      const messageDetail = await adminService.getContactMessageById(
        message.id
      );
      setSelectedMessage(messageDetail);
      setIsViewDialogOpen(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load message details';
      toast.error(errorMessage);
    }
  };

  const handleUpdateStatus = async (
    messageId: string,
    newStatus: 'pending' | 'in_progress' | 'resolved' | 'closed'
  ) => {
    try {
      setIsUpdatingStatus(true);
      const payload: IUpdateContactStatusPayload = { status: newStatus };
      await adminService.updateContactStatus(messageId, payload);
      toast.success('Status updated successfully');
      await fetchMessages();
      if (selectedMessage?.id === messageId) {
        const updated = await adminService.getContactMessageById(messageId);
        setSelectedMessage(updated);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenRespond = (message: IAdminContactMessage) => {
    setSelectedMessage(message);
    setResponseText('');
    setIsRespondDialogOpen(true);
  };

  const handleRespond = async () => {
    if (!selectedMessage || !responseText.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      setIsResponding(true);
      const payload: IRespondToContactPayload = {
        response: responseText.trim(),
      };
      await adminService.respondToContact(selectedMessage.id, payload);
      toast.success('Response sent successfully');
      setIsRespondDialogOpen(false);
      setResponseText('');
      await fetchMessages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send response';
      toast.error(errorMessage);
    } finally {
      setIsResponding(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed':
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'feedback':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'support':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalMessages);

  const generatePaginationItems = () => {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-5xl font-bold">Contact Messages</h1>
        <p className="text-xl text-neutral-400">
          Manage contact messages from users and guests
        </p>
      </div>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute top-1/2 left-5 size-6 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 border-neutral-800 bg-neutral-900/50 pl-14 text-lg!"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-5 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="h-14! w-[160px] border-neutral-800 bg-neutral-900/50 text-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">
                All Status
              </SelectItem>
              <SelectItem value="pending" className="text-lg">
                Pending
              </SelectItem>
              <SelectItem value="in_progress" className="text-lg">
                In Progress
              </SelectItem>
              <SelectItem value="resolved" className="text-lg">
                Resolved
              </SelectItem>
              <SelectItem value="closed" className="text-lg">
                Closed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as TypeFilter)}
          >
            <SelectTrigger className="h-14! w-[160px] border-neutral-800 bg-neutral-900/50 text-lg">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">
                All Types
              </SelectItem>
              <SelectItem value="general" className="text-lg">
                General
              </SelectItem>
              <SelectItem value="suspended" className="text-lg">
                Suspended
              </SelectItem>
              <SelectItem value="feedback" className="text-lg">
                Feedback
              </SelectItem>
              <SelectItem value="support" className="text-lg">
                Support
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead
                className="w-[200px] cursor-pointer py-5 pl-7 text-base font-medium tracking-wider text-neutral-400 uppercase transition-colors hover:text-white"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  From
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer py-5 text-base font-medium tracking-wider text-neutral-400 uppercase transition-colors hover:text-white"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {getSortIcon('email')}
                </div>
              </TableHead>
              <TableHead
                className="w-[120px] cursor-pointer py-5 text-base font-medium tracking-wider text-neutral-400 uppercase transition-colors hover:text-white"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  Type
                  {getSortIcon('type')}
                </div>
              </TableHead>
              <TableHead
                className="w-[140px] cursor-pointer py-5 text-base font-medium tracking-wider text-neutral-400 uppercase transition-colors hover:text-white"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead
                className="w-[180px] cursor-pointer py-5 text-base font-medium tracking-wider text-neutral-400 uppercase transition-colors hover:text-white"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created
                  {getSortIcon('createdAt')}
                </div>
              </TableHead>
              <TableHead className="w-[100px] py-5 pr-7 text-right text-base font-medium tracking-wider text-neutral-400 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-4 pl-6">
                    <Skeleton className="h-5 w-36 bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-52 bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-20 rounded-full bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-24 rounded-full bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28 bg-neutral-800" />
                  </TableCell>
                  <TableCell className="pr-6">
                    <Skeleton className="ml-auto size-9 rounded-lg bg-neutral-800" />
                  </TableCell>
                </TableRow>
              ))
            ) : messages.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-800">
                    <MessageSquare className="size-8 text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    No contact messages found
                  </h3>
                  <p className="text-neutral-400">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'No messages match the selected filter'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow
                  key={message.id}
                  className="border-neutral-800 transition-colors hover:bg-neutral-800/30"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      {message.user?.avatar ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={message.user.avatar}
                            alt={message.user ? `${message.user.firstName} ${message.user.lastName}` : message.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-sm font-bold">
                          {message.user
                            ? getInitials(message.user.firstName, message.user.lastName)
                            : getInitials(message.name, message.name.split(' ')[1] || '')}
                        </div>
                      )}
                      <div>
                        <span className="block text-base font-medium text-neutral-100">
                          {message.user
                            ? `${message.user.firstName} ${message.user.lastName}`
                            : message.name}
                        </span>
                        {message.type === 'suspended' && (
                          <Badge
                            variant="outline"
                            className="mt-1 border-red-500/30 bg-red-500/20 px-2.5 py-1.5 text-xs text-red-400"
                          >
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-base text-neutral-300">
                    {message.user?.email || message.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1.5 text-sm capitalize ${getTypeBadgeColor(message.type)}`}
                    >
                      {message.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1.5 text-sm capitalize ${getStatusBadgeColor(message.status)}`}
                    >
                      {message.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-base text-neutral-300">
                    {formatDate(message.createdAt)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9">
                          <MoreVertical className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() => handleViewMessage(message)}
                          className="py-2 text-base"
                        >
                          <Eye className="size-4" />
                          View details
                        </DropdownMenuItem>
                        {message.status !== 'resolved' &&
                          message.status !== 'closed' &&
                          !message.adminResponse && (
                            <DropdownMenuItem
                              onClick={() => handleOpenRespond(message)}
                              className="py-2 text-base"
                            >
                              <Send className="size-4" />
                              Respond
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuSeparator />
                        {message.status !== 'pending' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(message.id, 'pending')
                            }
                            className="py-2 text-base"
                            disabled={isUpdatingStatus}
                          >
                            <Clock className="size-4" />
                            Mark as Pending
                          </DropdownMenuItem>
                        )}
                        {message.status !== 'in_progress' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(message.id, 'in_progress')
                            }
                            className="py-2 text-base"
                            disabled={isUpdatingStatus}
                          >
                            <AlertCircle className="size-4" />
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {message.status !== 'resolved' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(message.id, 'resolved')
                            }
                            className="py-2 text-base"
                            disabled={isUpdatingStatus}
                          >
                            <CheckCircle2 className="size-4" />
                            Mark as Resolved
                          </DropdownMenuItem>
                        )}
                        {message.status !== 'closed' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(message.id, 'closed')
                            }
                            className="py-2 text-base"
                            disabled={isUpdatingStatus}
                          >
                            <X className="size-4" />
                            Mark as Closed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalMessages > 0 && (
          <div className="flex flex-col gap-3 border-t border-neutral-800 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <span className="text-base whitespace-nowrap text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalMessages} message
              {totalMessages > 1 ? 's' : ''}
            </span>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {generatePaginationItems().map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(item);
                          }}
                          isActive={currentPage === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage((p) => p + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Contact Message Details
            </DialogTitle>
            <DialogDescription className="text-lg text-neutral-400">
              View and manage contact message details
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {selectedMessage.user?.avatar ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={selectedMessage.user.avatar}
                      alt={selectedMessage.user
                        ? `${selectedMessage.user.firstName} ${selectedMessage.user.lastName}`
                        : selectedMessage.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-xl font-bold">
                    {selectedMessage.user
                      ? getInitials(selectedMessage.user.firstName, selectedMessage.user.lastName)
                      : getInitials(selectedMessage.name, selectedMessage.name.split(' ')[1] || '')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-semibold">
                    {selectedMessage.user
                      ? `${selectedMessage.user.firstName} ${selectedMessage.user.lastName}`
                      : selectedMessage.name}
                  </p>
                  <p className="text-lg text-neutral-400">
                    {selectedMessage.user?.email || selectedMessage.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-base text-neutral-500">Type</p>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1.5 text-sm capitalize ${getTypeBadgeColor(selectedMessage.type)}`}
                  >
                    {selectedMessage.type}
                  </Badge>
                </div>
                <div>
                  <p className="mb-1 text-base text-neutral-500">Status</p>
                  <Badge
                    variant="outline"
                    className={`px-3 py-1.5 text-sm capitalize ${getStatusBadgeColor(selectedMessage.status)}`}
                  >
                    {selectedMessage.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="mb-1 text-base text-neutral-500">Created</p>
                  <p className="text-lg">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
                {selectedMessage.respondedAt && (
                  <div>
                    <p className="mb-1 text-base text-neutral-500">Responded</p>
                    <p className="text-lg">
                      {formatDate(selectedMessage.respondedAt)}
                    </p>
                  </div>
                )}
              </div>

              {selectedMessage.respondedByUser && (
                <div className="rounded-lg bg-neutral-800/50 p-4">
                  <p className="mb-2 text-sm text-neutral-500">Responded By</p>
                  <div className="flex items-center gap-3">
                    {selectedMessage.respondedByUser.avatar ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={selectedMessage.respondedByUser.avatar}
                          alt={`${selectedMessage.respondedByUser.firstName} ${selectedMessage.respondedByUser.lastName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-base font-bold">
                        {getInitials(
                          selectedMessage.respondedByUser.firstName,
                          selectedMessage.respondedByUser.lastName
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-base font-medium">
                        {selectedMessage.respondedByUser.firstName}{' '}
                        {selectedMessage.respondedByUser.lastName}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {selectedMessage.respondedByUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMessage.subject && (
                <div>
                  <p className="mb-1 text-base text-neutral-500">Subject</p>
                  <p className="text-lg font-medium">
                    {selectedMessage.subject}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-base text-neutral-500">Message</p>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <p className="text-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {selectedMessage.adminResponse && (
                <div>
                  <p className="mb-2 text-base text-neutral-500">
                    Admin Response
                  </p>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                    <p className="text-lg whitespace-pre-wrap">
                      {selectedMessage.adminResponse}
                    </p>
                  </div>
                </div>
              )}

              {!selectedMessage.adminResponse &&
                selectedMessage.status !== 'resolved' &&
                selectedMessage.status !== 'closed' && (
                  <div className="border-t border-neutral-800 pt-4">
                    <Button
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleOpenRespond(selectedMessage);
                      }}
                      className="h-12! w-full text-base!"
                    >
                      Respond to Message
                      <Send className="size-5" />
                    </Button>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Respond to Contact Message
            </DialogTitle>
            <DialogDescription className="text-lg text-neutral-400">
              Send a response to {selectedMessage?.user
                ? `${selectedMessage.user.firstName} ${selectedMessage.user.lastName}`
                : selectedMessage?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
                <p className="mb-2 text-base text-neutral-500">
                  Original Message
                </p>
                <p className="line-clamp-4 text-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-base font-medium text-neutral-300">
                  Response <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response..."
                  className="min-h-[200px] resize-none border-neutral-700 bg-neutral-800 text-lg!"
                  maxLength={5000}
                />
                <p className="text-sm text-neutral-500">
                  {responseText.length}/5000 characters
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsRespondDialogOpen(false);
                setResponseText('');
              }}
              disabled={isResponding}
              className="h-11! text-base!"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!responseText.trim() || isResponding}
              className="h-11! text-base!"
            >
              {isResponding ? (
                <>
                  Sending...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Send Response
                  <Send className="size-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
