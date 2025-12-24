'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  GraduationCap,
  Eye,
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { IAdminMentor, IAdminMentorsParams } from '@/types';
import { ITEMS_PER_PAGE } from '@/constants';
import { useDebounceValue } from 'usehooks-ts';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

import { generatePaginationItems, formatDate } from './utils';
import { StatusBadge } from './StatusBadge';
import type { MentorsTabProps, MentorStatusFilter } from './types';

export function MentorsTab({ refreshTrigger = 0 }: MentorsTabProps) {
  const [mentors, setMentors] = useState<IAdminMentor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<MentorStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMentors, setTotalMentors] = useState<number>(0);

  const [selectedMentor, setSelectedMentor] = useState<IAdminMentor | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  const fetchMentors = useCallback(async () => {
    try {
      setIsLoading(true);

      const params: IAdminMentorsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (statusFilter === 'active') {
        params.isActive = true;
      } else if (statusFilter === 'inactive') {
        params.isActive = false;
      } else if (statusFilter === 'accepting') {
        params.isAcceptingMentees = true;
      }

      const response = await adminService.getMentors(params);
      setMentors(response.mentors || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalMentors(response.meta?.total || 0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load mentors';
      toast.error(errorMessage);
      setMentors([]);
      setTotalPages(1);
      setTotalMentors(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors, refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleViewMentor = (mentor: IAdminMentor) => {
    setSelectedMentor(mentor);
    setIsViewDialogOpen(true);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalMentors);
  const paginationItems = generatePaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute top-1/2 left-4 size-6 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by name, email, headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14! border-neutral-800 bg-neutral-900/50 pl-14 text-lg!"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as MentorStatusFilter)
          }
        >
          <SelectTrigger className="h-14! w-[200px] border-neutral-800 bg-neutral-900/50 text-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-lg">
              All Mentors
            </SelectItem>
            <SelectItem value="active" className="text-lg">
              Active
            </SelectItem>
            <SelectItem value="inactive" className="text-lg">
              Inactive
            </SelectItem>
            <SelectItem value="accepting" className="text-lg">
              Accepting Students
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="w-[250px] py-5 pl-6 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Mentor
              </TableHead>
              <TableHead className="w-[200px] py-5 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Headline
              </TableHead>
              <TableHead className="w-[100px] py-5 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Experience
              </TableHead>
              <TableHead className="w-[120px] py-5 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Status
              </TableHead>
              <TableHead className="w-[120px] py-5 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Accepting
              </TableHead>
              <TableHead className="w-[80px] py-5 pr-6 text-right text-base font-medium tracking-wider text-neutral-400 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-full bg-neutral-800" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-36 bg-neutral-800" />
                        <Skeleton className="h-5 w-44 bg-neutral-800" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40 bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 rounded-full bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 rounded-full bg-neutral-800" />
                  </TableCell>
                  <TableCell className="pr-6">
                    <Skeleton className="ml-auto size-10 rounded-lg bg-neutral-800" />
                  </TableCell>
                </TableRow>
              ))
            ) : mentors.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-neutral-800">
                    <GraduationCap className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">
                    No mentors found
                  </h3>
                  <p className="text-lg text-neutral-400">
                    {statusFilter !== 'all'
                      ? 'No mentors match the selected filter'
                      : 'No mentors registered yet'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              mentors.map((mentor) => (
                <TableRow
                  key={mentor.id}
                  className="border-neutral-800 transition-colors hover:bg-neutral-800/30"
                >
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      {mentor.user?.avatar ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={mentor.user.avatar}
                            alt={`${mentor.user?.firstName} ${mentor.user?.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-base font-bold">
                          {mentor.user?.firstName?.[0] || ''}
                          {mentor.user?.lastName?.[0] || ''}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-lg font-medium text-neutral-100">
                          {mentor.user?.firstName || ''}{' '}
                          {mentor.user?.lastName || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[180px] truncate text-lg text-neutral-300">
                      {mentor.headline || 'No headline'}
                    </p>
                  </TableCell>
                  <TableCell className="text-lg text-neutral-300">
                    {mentor.yearsExperience}{' '}
                    {mentor.yearsExperience === 1 ? 'year' : 'years'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      type="mentor-active"
                      status={mentor.isActive}
                    />
                  </TableCell>
                  <TableCell>
                    {mentor.isAcceptingMentees ? (
                      <CheckCircle className="size-6 text-green-400" />
                    ) : (
                      <XCircle className="size-6 text-neutral-500" />
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-10">
                          <MoreVertical className="size-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => handleViewMentor(mentor)}
                          className="py-3 text-lg"
                        >
                          <Eye className="size-5" />
                          View details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalMentors > 0 && (
          <div className="flex flex-col gap-3 border-t border-neutral-800 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <span className="text-lg whitespace-nowrap text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalMentors} mentor
              {totalMentors > 1 ? 's' : ''}
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

                  {paginationItems.map((item, index) => (
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
        <DialogContent className="max-h-[90vh] max-w-2xl p-0">
          <DialogHeader className="border-b border-neutral-800 p-6 pb-4">
            <DialogTitle className="text-2xl">Mentor Profile</DialogTitle>
            <DialogDescription className="text-base">
              View detailed mentor information
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="space-y-6 p-6">
              {selectedMentor && (
                <>
                  <div className="flex items-start gap-4">
                    {selectedMentor.user?.avatar ? (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={selectedMentor.user.avatar}
                          alt={`${selectedMentor.user?.firstName} ${selectedMentor.user?.lastName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-xl font-bold">
                        {selectedMentor.user?.firstName?.[0] || ''}
                        {selectedMentor.user?.lastName?.[0] || ''}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-semibold">
                          {selectedMentor.user?.firstName || ''}{' '}
                          {selectedMentor.user?.lastName || ''}
                        </p>
                        <StatusBadge
                          type="mentor-active"
                          status={selectedMentor.isActive}
                          size="sm"
                        />
                      </div>
                      <p className="mt-1 text-lg text-neutral-300">
                        {selectedMentor.headline || 'No headline'}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-neutral-800" />

                  <div>
                    <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                      Bio
                    </h4>
                    <p className="text-lg leading-relaxed wrap-break-word text-neutral-300">
                      {selectedMentor.bio || 'No bio provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-base text-neutral-500">
                        Experience
                      </p>
                      <p className="text-xl font-semibold">
                        {selectedMentor.yearsExperience}{' '}
                        {selectedMentor.yearsExperience === 1
                          ? 'year'
                          : 'years'}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-base text-neutral-500">
                        Max Students
                      </p>
                      <p className="text-xl font-semibold">
                        {selectedMentor.maxMentees}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-base text-neutral-500">
                        Accepting Students
                      </p>
                      <p className="text-lg">
                        {selectedMentor.isAcceptingMentees ? (
                          <span className="text-green-400">Yes</span>
                        ) : (
                          <span className="text-neutral-500">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-base text-neutral-500">
                        Member Since
                      </p>
                      <p className="text-lg">
                        {formatDate(selectedMentor.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedMentor.expertise.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.expertise.map((item, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-neutral-800/50 px-4 py-2 text-base"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMentor.skills.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-neutral-800/50 px-4 py-2 text-base"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMentor.industries.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Industries
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.industries.map((industry, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-neutral-800/50 px-4 py-2 text-base"
                          >
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMentor.languages.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.languages.map((lang, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-neutral-800/50 px-4 py-2 text-base"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {selectedMentor.linkedinUrl && (
                      <a
                        href={selectedMentor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lg text-blue-400 transition-colors hover:text-blue-300"
                      >
                        LinkedIn Profile
                        <ExternalLink className="size-5" />
                      </a>
                    )}
                    {selectedMentor.portfolioUrl && (
                      <a
                        href={selectedMentor.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lg text-purple-400 transition-colors hover:text-purple-300"
                      >
                        Portfolio
                        <ExternalLink className="size-5" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
