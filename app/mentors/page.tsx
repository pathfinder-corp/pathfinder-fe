'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Users, 
  Briefcase, 
  Globe, 
  Linkedin,
  ExternalLink,
  X,
  SlidersHorizontal,
  ArrowRight,
  GraduationCap,
  MessageSquareShare
} from 'lucide-react';
import { toast } from 'sonner';
import { useDebounceValue } from 'usehooks-ts';
import { useUserStore } from '@/stores';
import { mentorService } from '@/services';
import type { IMentorProfile, IMentorProfilesParams } from '@/types';
import { ITEMS_PER_PAGE, USER_ROLES } from '@/constants';

import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
];

const SORT_OPTIONS = [
  { value: 'yearsExperience', label: 'Most Experienced' },
  { value: 'createdAt', label: 'Newest Mentors' },
];

export default function MentorsPage() {
  const router = useRouter();
  const initializeUser = useUserStore((state) => state.initializeUser);
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const [mentors, setMentors] = useState<IMentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [minExperience, setMinExperience] = useState<string>('0');
  const [sortBy, setSortBy] = useState<string>('yearsExperience');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [expertiseFilter, setExpertiseFilter] = useState<string>('');
  const [skillsFilter, setSkillsFilter] = useState<string>('');
  const [industriesFilter, setIndustriesFilter] = useState<string>('');
  const [languagesFilter, setLanguagesFilter] = useState<string>('');

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const fetchMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IMentorProfilesParams = {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (minExperience !== '0') {
        params.minYearsExperience = parseInt(minExperience);
      }

      if (expertiseFilter.trim()) {
        params.expertise = expertiseFilter.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (skillsFilter.trim()) {
        params.skills = skillsFilter.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (industriesFilter.trim()) {
        params.industries = industriesFilter.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (languagesFilter.trim()) {
        params.languages = languagesFilter.split(',').map(s => s.trim()).filter(Boolean);
      }

      const response = await mentorService.getMentors(params);
      setMentors(response.mentors || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load mentors';
      toast.error('Failed to load mentors', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, sortOrder, debouncedSearch, minExperience, expertiseFilter, skillsFilter, industriesFilter, languagesFilter]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, minExperience, sortBy, sortOrder, expertiseFilter, skillsFilter, industriesFilter, languagesFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setMinExperience('0');
    setExpertiseFilter('');
    setSkillsFilter('');
    setIndustriesFilter('');
    setLanguagesFilter('');
    setIsFilterOpen(false);
  };

  const hasActiveFilters = expertiseFilter || skillsFilter || industriesFilter || languagesFilter;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderMentorCard = (mentor: IMentorProfile) => (
    <div
      key={mentor.id}
      className="group bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500"
    >
      <div className="relative h-32 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        
        {mentor.isAcceptingMentees && (
          <div className="absolute top-4 right-4">
            <Badge className="px-4 py-2 text-base bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
              Available
            </Badge>
          </div>
        )}
        
        <div className="absolute -bottom-10 left-6">
          {mentor.user?.avatar ? (
            <div className="relative size-20 rounded-2xl overflow-hidden border-4 border-neutral-950 shadow-xl">
              <Image
                src={mentor.user.avatar}
                alt={`${mentor.user?.firstName} ${mentor.user?.lastName}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-20 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-800 border-4 border-neutral-950 flex items-center justify-center text-xl font-bold shadow-xl">
              {getInitials(mentor.user?.firstName || '', mentor.user?.lastName || '')}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-14">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-bold truncate group-hover:text-white transition-colors">
              {mentor.user?.firstName} {mentor.user?.lastName}
            </h3>
            <p className="text-lg text-neutral-400 line-clamp-1">
              {mentor.headline || 'Mentor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 py-3 border-y border-neutral-800/50">
          <div className="flex items-center gap-2 text-base text-neutral-400">
            <Briefcase className="size-5 text-neutral-500" />
            <span className="font-medium text-white">{mentor.yearsExperience || 0}</span>
            <span>years</span>
          </div>
          {mentor.languages && mentor.languages.length > 0 && (
            <div className="flex items-center gap-2 text-base text-neutral-400">
              <Globe className="size-5 text-neutral-500" />
              <span>{mentor.languages.slice(0, 2).join(', ')}</span>
            </div>
          )}
        </div>

        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {mentor.expertise.slice(0, 3).map((exp, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="py-1.5 px-3 text-sm bg-white/5 border-neutral-700 hover:bg-white/10 transition-colors"
              >
                {exp}
              </Badge>
            ))}
            {mentor.expertise.length > 3 && (
              <Badge variant="outline" className="py-1.5 px-3 text-sm bg-white/5 border-neutral-700">
                +{mentor.expertise.length - 3}
              </Badge>
            )}
          </div>
        )}

        {mentor.bio && (
          <p className="text-base text-neutral-500 line-clamp-2 mb-5">
            {mentor.bio}
          </p>
        )}

        <div className="flex items-center gap-2.5 mb-5">
          {mentor.linkedinUrl && (
            <a
              href={mentor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-lg bg-neutral-800/50 text-neutral-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
            >
              <Linkedin className="size-5" />
            </a>
          )}
          {mentor.portfolioUrl && (
            <a
              href={mentor.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-lg bg-neutral-800/50 text-neutral-400 hover:bg-purple-500/20 hover:text-purple-400 transition-all"
            >
              <ExternalLink className="size-5" />
            </a>
          )}
        </div>

        <Button
          onClick={() => router.push(`/mentors/${mentor.id}`)}
          className="w-full !h-12 !text-base bg-white text-neutral-950 hover:bg-neutral-200 font-medium group/btn"
        >
          View Profile
          <ArrowRight className="size-5 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-14">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="!h-12 !text-base"
        >
          Previous
        </Button>
        
        {pages.map((p, i) => (
          typeof p === 'number' ? (
            <Button
              key={i}
              variant={page === p ? 'default' : 'outline'}
              size="lg"
              onClick={() => setPage(p)}
              className={`!h-12 !w-12 !text-base ${page === p ? 'bg-white text-neutral-950' : ''}`}
            >
              {p}
            </Button>
          ) : (
            <span key={i} className="px-3 text-lg text-neutral-500">...</span>
          )
        ))}
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="!h-12 !text-base"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <PublicHeader />

      <main className="pt-24">
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22%23333%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
          
          <div className="relative max-w-[1100px] mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-neutral-700 bg-neutral-900/80 backdrop-blur-sm mb-8">
              <MessageSquareShare className="size-5 text-neutral-300" />
              <span className="text-lg text-neutral-300">
                Connect with industry experts
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              Find Your Perfect{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                Mentor
              </span>
            </h1>
            
            <p className="text-2xl text-neutral-400 max-w-3xl mx-auto mb-12">
              Learn from experienced professionals who have walked the path before you. 
              Get personalized guidance to accelerate your career growth.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-2">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{total || '100'}+</div>
                <div className="text-base text-neutral-500">Expert Mentors</div>
              </div>
              <div className="h-10 w-px bg-neutral-800 hidden md:block" />
              <div className="text-center">
                <div className="text-4xl font-bold text-white">50+</div>
                <div className="text-base text-neutral-500">Industries</div>
              </div>
              <div className="h-10 w-px bg-neutral-800 hidden md:block" />
              <div className="text-center">
                <div className="text-4xl font-bold text-white">1000+</div>
                <div className="text-base text-neutral-500">Sessions Completed</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 -mt-4 mb-10">
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-neutral-500" />
                <Input
                  placeholder="Search by name, expertise, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 !h-16 !text-xl bg-neutral-800/50 border-neutral-700 focus:border-neutral-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    <X className="size-6" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={minExperience} onValueChange={setMinExperience}>
                  <SelectTrigger className="w-[180px] !h-16 !text-lg bg-neutral-800/50 border-neutral-700">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="!text-base">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] !h-16 !text-lg bg-neutral-800/50 border-neutral-700">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="!text-base">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className={`!h-16 !text-lg gap-2.5 bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700 ${hasActiveFilters ? 'border-white text-white' : ''}`}
                    >
                      <SlidersHorizontal className="size-6" />
                      More Filters
                      {hasActiveFilters && (
                        <span className="size-2.5 rounded-full bg-white" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle className="text-2xl">Filter Mentors</SheetTitle>
                      <SheetDescription className="text-base">
                        Narrow down your search with specific criteria
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-200px)] mt-6 px-4">
                      <div className="space-y-7">
                        <div className="space-y-2">
                          <Label className="text-lg">Expertise Areas</Label>
                          <Input
                            placeholder="e.g., Frontend, Backend, Cloud"
                            value={expertiseFilter}
                            onChange={(e) => setExpertiseFilter(e.target.value)}
                            className="!h-14 !text-base"
                          />
                          <p className="text-base text-neutral-500">Separate multiple values with commas</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-lg">Skills</Label>
                          <Input
                            placeholder="e.g., React, Python, AWS"
                            value={skillsFilter}
                            onChange={(e) => setSkillsFilter(e.target.value)}
                            className="!h-14 !text-base"
                          />
                          <p className="text-base text-neutral-500">Separate multiple values with commas</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-lg">Industries</Label>
                          <Input
                            placeholder="e.g., FinTech, Healthcare"
                            value={industriesFilter}
                            onChange={(e) => setIndustriesFilter(e.target.value)}
                            className="!h-14 !text-base"
                          />
                          <p className="text-base text-neutral-500">Separate multiple values with commas</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-lg">Languages</Label>
                          <Input
                            placeholder="e.g., English, Vietnamese"
                            value={languagesFilter}
                            onChange={(e) => setLanguagesFilter(e.target.value)}
                            className="!h-14 !text-base"
                          />
                          <p className="text-base text-neutral-500">Separate multiple values with commas</p>
                        </div>
                      </div>
                    </ScrollArea>
                    <SheetFooter className="mt-6">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex-1 !h-14 !text-base"
                      >
                        Clear All
                      </Button>
                      <Button
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 !h-14 !text-base"
                      >
                        Apply Filters
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            {isLoading ? (
              <Skeleton className="h-7 w-52 bg-neutral-800" />
            ) : (
              <p className="text-xl text-neutral-400">
                Showing <span className="font-semibold text-white">{mentors.length}</span> of{' '}
                <span className="font-semibold text-white">{total}</span> mentor{total > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <Skeleton className="h-32 w-full bg-neutral-800" />
                  <div className="p-6 pt-14">
                    <Skeleton className="h-6 w-40 mb-2 bg-neutral-800" />
                    <Skeleton className="h-5 w-56 mb-4 bg-neutral-800" />
                    <Skeleton className="h-12 w-full mb-4 bg-neutral-800" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20 bg-neutral-800 rounded-full" />
                      <Skeleton className="h-6 w-24 bg-neutral-800 rounded-full" />
                    </div>
                    <Skeleton className="h-11 w-full bg-neutral-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && mentors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-28 rounded-full bg-neutral-900 flex items-center justify-center mb-8">
                <Users className="size-14 text-neutral-600" />
              </div>
              <h3 className="text-3xl font-semibold mb-4">No mentors found</h3>
              <p className="text-lg text-neutral-400 mb-10 max-w-md">
                {searchQuery || hasActiveFilters 
                  ? 'Try adjusting your search or filter criteria to find more mentors'
                  : 'No mentors are currently available. Check back later!'}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <Button variant="outline" size="lg" onClick={clearFilters} className="!h-12 !text-base">
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {!isLoading && mentors.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {mentors.map(renderMentorCard)}
              </div>
              {renderPagination()}
            </>
          )}
        </section>

        {isAuthenticated && user?.role === USER_ROLES.STUDENT && (
          <section className="max-w-[1100px] mx-auto px-6 pb-16">
            <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-10 md:p-14">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="size-20 rounded-2xl bg-white/10 flex items-center justify-center">
                    <GraduationCap className="size-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Want to share your expertise?</h3>
                    <p className="text-xl text-neutral-400">
                      Join our mentor community and help others grow in their careers.
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => router.push('/mentor')}
                  size="lg"
                  className="!h-16 !px-10 !text-xl bg-white text-neutral-950 hover:bg-neutral-200 whitespace-nowrap"
                >
                  Become a Mentor
                  <ArrowRight className="size-6" />
                </Button>
              </div>
            </div>
          </section>
        )}

        <PublicFooter />
      </main>
    </div>
  );
}