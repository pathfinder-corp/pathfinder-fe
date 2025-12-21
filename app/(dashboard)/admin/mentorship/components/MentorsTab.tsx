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
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { 
  IAdminMentor, 
  IAdminMentorsParams 
} from '@/types';
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

  const [selectedMentor, setSelectedMentor] = useState<IAdminMentor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  const fetchMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IAdminMentorsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load mentors';
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
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-neutral-400" />
          <Input
            placeholder="Search by name, email, headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-14! text-lg! bg-neutral-900/50 border-neutral-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <Select 
          value={statusFilter} 
          onValueChange={(value) => setStatusFilter(value as MentorStatusFilter)}
        >
          <SelectTrigger className="w-[200px] h-14! text-lg bg-neutral-900/50 border-neutral-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-lg">All Mentors</SelectItem>
            <SelectItem value="active" className="text-lg">Active</SelectItem>
            <SelectItem value="inactive" className="text-lg">Inactive</SelectItem>
            <SelectItem value="accepting" className="text-lg">Accepting Mentees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-6 w-[250px]">
                Mentor
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[200px]">
                Headline
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[100px]">
                Experience
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[120px]">
                Status
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[120px]">
                Accepting
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-6 text-right w-[80px]">
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
                  <TableCell><Skeleton className="h-6 w-40 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-10 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : mentors.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No mentors found</h3>
                  <p className="text-lg text-neutral-400">
                    {statusFilter !== 'all' ? 'No mentors match the selected filter' : 'No mentors registered yet'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              mentors.map((mentor) => (
                <TableRow 
                  key={mentor.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      {mentor.user?.avatar ? (
                        <Image 
                          src={mentor.user.avatar} 
                          alt={`${mentor.user?.firstName} ${mentor.user?.lastName}`}
                          fill
                          className="size-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-12 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-base font-bold shrink-0">
                          {mentor.user?.firstName?.[0] || ''}{mentor.user?.lastName?.[0] || ''}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-lg text-neutral-100 truncate">
                          {mentor.user?.firstName || ''} {mentor.user?.lastName || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-lg text-neutral-300 truncate max-w-[180px]">
                      {mentor.headline || 'No headline'}
                    </p>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-lg">
                    {mentor.yearsExperience} years
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="mentor-active" status={mentor.isActive} />
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
                          className="text-lg py-3"
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
          <div className="px-6 py-5 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-lg text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalMentors} mentor{totalMentors > 1 ? 's' : ''}
            </span>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(p => p - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                        if (currentPage < totalPages) setCurrentPage(p => p + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b border-neutral-800">
            <DialogTitle className="text-2xl">Mentor Profile</DialogTitle>
            <DialogDescription className="text-base">
              View detailed mentor information
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {selectedMentor && (
                <>
                  <div className="flex items-start gap-4">
                    {selectedMentor.user?.avatar ? (
                      <Image 
                        src={selectedMentor.user.avatar} 
                        alt={`${selectedMentor.user?.firstName} ${selectedMentor.user?.lastName}`}
                        fill
                        className="size-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-16 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xl font-bold shrink-0">
                        {selectedMentor.user?.firstName?.[0] || ''}{selectedMentor.user?.lastName?.[0] || ''}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-semibold">
                          {selectedMentor.user?.firstName || ''} {selectedMentor.user?.lastName || ''}
                        </p>
                        <StatusBadge type="mentor-active" status={selectedMentor.isActive} size="sm" />
                      </div>
                      <p className="text-lg text-neutral-300 mt-1">
                        {selectedMentor.headline || 'No headline'}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-neutral-800" />

                  <div>
                    <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-2">Bio</h4>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                      {selectedMentor.bio || 'No bio provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-base text-neutral-500 mb-1">Experience</p>
                      <p className="text-xl font-semibold">{selectedMentor.yearsExperience} years</p>
                    </div>
                    <div>
                      <p className="text-base text-neutral-500 mb-1">Max Mentees</p>
                      <p className="text-xl font-semibold">{selectedMentor.maxMentees}</p>
                    </div>
                    <div>
                      <p className="text-base text-neutral-500 mb-1">Accepting Mentees</p>
                      <p className="text-lg">
                        {selectedMentor.isAcceptingMentees ? (
                          <span className="text-green-400">Yes</span>
                        ) : (
                          <span className="text-neutral-500">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-neutral-500 mb-1">Member Since</p>
                      <p className="text-lg">{formatDate(selectedMentor.createdAt)}</p>
                    </div>
                  </div>

                  {selectedMentor.expertise.length > 0 && (
                    <div>
                      <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.expertise.map((item, index) => (
                          <Badge key={index} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMentor.skills.length > 0 && (
                    <div>
                      <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMentor.industries.length > 0 && (
                    <div>
                      <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-2">Industries</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.industries.map((industry, index) => (
                          <Badge key={index} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMentor.languages.length > 0 && (
                    <div>
                      <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMentor.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
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
                        className="flex items-center gap-2 text-lg text-blue-400 hover:text-blue-300 transition-colors"
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
                        className="flex items-center gap-2 text-lg text-purple-400 hover:text-purple-300 transition-colors"
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