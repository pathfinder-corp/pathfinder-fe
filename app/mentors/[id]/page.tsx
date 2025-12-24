'use client';

import { USER_ROLES } from '@/constants';
import { getInitials } from '@/lib';
import { mentorService, mentorshipService } from '@/services';
import { useUserStore } from '@/stores';
import type {
  IMentorProfile,
  IMentorReview,
  IMentorship,
  MentorDocumentType,
} from '@/types';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  ExternalLink,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  FileType,
  Globe,
  Loader2,
  Presentation,
  Send,
  UserCheck,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { toast } from 'sonner';

import { PublicFooter } from '@/components/PublicFooter';
import { PublicHeader } from '@/components/PublicHeader';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { FaLinkedinIn } from 'react-icons/fa6';
import { ReviewForm } from './components/ReviewForm';
import { ReviewsList } from './components/ReviewsList';

type TabType = 'about' | 'background' | 'credentials' | 'reviews';

const TABS: { id: TabType; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'background', label: 'Background' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'reviews', label: 'Reviews' },
];

const getDocumentIcon = (type: MentorDocumentType) => {
  const baseClassName = 'size-6 text-neutral-400';
  switch (type) {
    case 'certificate':
      return <FileText className={baseClassName} />;
    case 'award':
      return <Award className={baseClassName} />;
    case 'portfolio':
      return <Briefcase className={baseClassName} />;
    case 'recommendation':
      return <UserCheck className={baseClassName} />;
    default:
      return <File className={baseClassName} />;
  }
};

const getFileTypeIcon = (doc: {
  isPdf?: boolean;
  isWord?: boolean;
  isExcel?: boolean;
  isPowerPoint?: boolean;
  isOfficeDocument?: boolean;
  mimeType?: string;
}) => {
  const baseClassName = 'size-6 text-neutral-400';
  if (doc.isPdf) return <FileText className={baseClassName} />;
  if (doc.isWord) return <FileType className={baseClassName} />;
  if (doc.isExcel) return <FileSpreadsheet className={baseClassName} />;
  if (doc.isPowerPoint) return <Presentation className={baseClassName} />;
  return <File className={baseClassName} />;
};

const getFileTypeLabel = (doc: {
  isPdf?: boolean;
  isWord?: boolean;
  isExcel?: boolean;
  isPowerPoint?: boolean;
  mimeType?: string;
}) => {
  if (doc.isPdf) return 'PDF';
  if (doc.isWord) return 'Word';
  if (doc.isExcel) return 'Excel';
  if (doc.isPowerPoint) return 'PowerPoint';
  return doc.mimeType?.split('/')[1]?.toUpperCase() || 'Document';
};

const getDocumentTypeLabel = (type: MentorDocumentType) => {
  switch (type) {
    case 'certificate':
      return 'Certificate';
    case 'award':
      return 'Award';
    case 'portfolio':
      return 'Portfolio';
    case 'recommendation':
      return 'Recommendation';
    default:
      return 'Document';
  }
};

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id as string;
  const user = useUserStore((state) => state.user);
  const initializeUser = useUserStore((state) => state.initializeUser);

  const [mentor, setMentor] = useState<IMentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const [isConnectDialogOpen, setIsConnectDialogOpen] =
    useState<boolean>(false);
  const [connectMessage, setConnectMessage] = useState<string>('');
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState<boolean>(false);
  const [myReview, setMyReview] = useState<IMentorReview | null>(null);
  const [isLoadingMyReview, setIsLoadingMyReview] = useState<boolean>(false);
  const [activeMentorship, setActiveMentorship] = useState<IMentorship | null>(
    null
  );
  const [isCheckingMentorship, setIsCheckingMentorship] =
    useState<boolean>(false);
  const [hasAnyMentorship, setHasAnyMentorship] = useState<boolean>(false);
  const [isCheckingAnyMentorship, setIsCheckingAnyMentorship] =
    useState<boolean>(false);

  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!mentorId) return;

      try {
        setIsLoading(true);
        const data = await mentorService.getMentorWithDocuments(mentorId);
        setMentor(data);
      } catch (error) {
        console.error('Failed to fetch mentor profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId, router]);

  useEffect(() => {
    const fetchMyReview = async () => {
      if (!mentorId || !user || user.role !== USER_ROLES.STUDENT) return;

      try {
        setIsLoadingMyReview(true);
        const review = await mentorService.getMyReview(mentorId);
        setMyReview(review);
      } catch (error) {
        console.error('Failed to fetch my review:', error);
        setMyReview(null);
      } finally {
        setIsLoadingMyReview(false);
      }
    };

    fetchMyReview();
  }, [mentorId, user]);

  useEffect(() => {
    const checkAnyMentorship = async () => {
      if (!mentor?.userId || !user || user.role !== USER_ROLES.STUDENT) {
        setHasAnyMentorship(false);
        return;
      }

      try {
        setIsCheckingAnyMentorship(true);
        const [activeResponse, endedResponse] = await Promise.all([
          mentorshipService.getMentorships({
            role: 'as_student',
            status: 'active',
            limit: 100,
          }),
          mentorshipService.getMentorships({
            role: 'as_student',
            status: 'ended',
            limit: 100,
          }),
        ]);

        const allMentorships = [
          ...(activeResponse.mentorships || []),
          ...(endedResponse.mentorships || []),
        ];

        const hasMentorship = allMentorships.some(
          (m) => m.mentorId === mentor.userId
        );

        setHasAnyMentorship(hasMentorship);
      } catch (error) {
        console.error('Failed to check any mentorship:', error);
        setHasAnyMentorship(false);
      } finally {
        setIsCheckingAnyMentorship(false);
      }
    };

    checkAnyMentorship();
  }, [mentor?.userId, user]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const handleSendRequest = async () => {
    if (!mentor || !connectMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setIsSendingRequest(true);
      await mentorshipService.createRequest({
        mentorId: mentor.userId,
        message: connectMessage.trim(),
      });
      setRequestSent(true);
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Failed to send request:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send connection request';
      toast.error(errorMessage);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleCloseDialog = () => {
    setIsConnectDialogOpen(false);
    if (requestSent) {
      setConnectMessage('');
      setRequestSent(false);
    }
  };

  const canConnect =
    user &&
    user.role === USER_ROLES.STUDENT &&
    user.id !== mentor?.userId &&
    mentor?.isAcceptingMentees &&
    !activeMentorship;

  const canReview =
    user && user.role === USER_ROLES.STUDENT && user.id !== mentor?.userId;

  const handleWriteReview = () => {
    if (!hasAnyMentorship && !isCheckingAnyMentorship) {
      toast.error('Cannot write review', {
        description:
          'You must have at least one mentorship (active or ended) with this mentor before you can review them.',
        duration: 5000,
      });
      return;
    }
    setIsReviewDialogOpen(true);
  };

  const handleReviewSuccess = async () => {
    setIsReviewDialogOpen(false);
    if (mentorId) {
      try {
        const review = await mentorService.getMyReview(mentorId);
        setMyReview(review);
      } catch (error) {
        console.error('Failed to refresh review:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <PublicHeader />
        <main className="pt-36">
          <div className="mx-auto max-w-[1100px] px-6 py-8">
            <div className="mb-8 flex flex-col items-start gap-8 lg:flex-row">
              <Skeleton className="size-40 shrink-0 rounded-xl bg-neutral-800" />
              <div className="flex-1">
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-80 bg-neutral-800" />
                    <Skeleton className="h-8 w-full max-w-lg bg-neutral-800" />
                    <Skeleton className="h-6 w-56 bg-neutral-800" />
                  </div>
                  <Skeleton className="h-9 w-32 rounded-full bg-neutral-800" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                  <Skeleton className="h-10 w-36 rounded-full bg-neutral-800" />
                </div>
              </div>
            </div>

            <div className="mb-10 flex gap-1 border-b border-neutral-800">
              <Skeleton className="h-12 w-20 bg-neutral-800" />
              <Skeleton className="h-12 w-28 bg-neutral-800" />
              <Skeleton className="h-12 w-28 bg-neutral-800" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div>
                  <Skeleton className="mb-5 h-8 w-36 bg-neutral-800" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full bg-neutral-800" />
                    <Skeleton className="h-6 w-full bg-neutral-800" />
                    <Skeleton className="h-6 w-3/4 bg-neutral-800" />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Skeleton className="size-10 rounded bg-neutral-800" />
                  <Skeleton className="size-10 rounded bg-neutral-800" />
                </div>

                <div className="pt-4">
                  <Skeleton className="mb-4 h-5 w-20 bg-neutral-800" />
                  <div className="flex gap-2.5">
                    <Skeleton className="h-10 w-28 rounded-full bg-neutral-800" />
                    <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
                    <Skeleton className="h-10 w-24 rounded-full bg-neutral-800" />
                  </div>
                </div>
              </div>

              <div className="space-y-7">
                <div className="space-y-5 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                  <Skeleton className="h-6 w-32 bg-neutral-800" />
                  <Skeleton className="h-14 w-full rounded-lg bg-neutral-800" />
                  <Skeleton className="h-px w-full bg-neutral-800" />
                  <Skeleton className="h-5 w-28 bg-neutral-800" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full bg-neutral-800" />
                    <Skeleton className="h-6 w-full bg-neutral-800" />
                  </div>
                </div>

                <div className="space-y-5 rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                  <Skeleton className="h-6 w-40 bg-neutral-800" />
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-28 bg-neutral-800" />
                      <Skeleton className="h-6 w-20 bg-neutral-800" />
                    </div>
                    <Skeleton className="h-px w-full bg-neutral-800" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24 bg-neutral-800" />
                      <Skeleton className="h-6 w-12 bg-neutral-800" />
                    </div>
                    <Skeleton className="h-px w-full bg-neutral-800" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-28 bg-neutral-800" />
                      <Skeleton className="h-6 w-16 bg-neutral-800" />
                    </div>
                    <Skeleton className="h-px w-full bg-neutral-800" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-20 bg-neutral-800" />
                      <Skeleton className="h-8 w-24 rounded-full bg-neutral-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!mentor && !isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <PublicHeader />
        <main className="pt-36">
          <div className="mx-auto max-w-[1100px] px-6 py-20 text-center">
            <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-neutral-800">
              <Users className="size-12 text-neutral-500" />
            </div>
            <h2 className="mb-5 text-4xl font-bold">
              Mentor Profile Not Found
            </h2>
            <p className="mb-4 text-xl text-neutral-400">
              This mentor profile doesn&apos;t exist or has been removed.
            </p>
            <p className="mb-10 text-lg text-neutral-500">
              The profile may have been deleted by an administrator or the
              mentor may have withdrawn from the platform.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/mentors')}
              className="h-14! px-10! text-lg!"
            >
              <ArrowLeft className="mr-2 size-6" />
              Back to Mentors
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-neutral-950">
      <PublicHeader />

      <main className="pt-40 pb-16">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-8 flex flex-col items-start gap-8 lg:flex-row">
            {mentor.user?.avatar ? (
              <div className="relative size-40 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={mentor.user.avatar}
                  alt={`${mentor.user?.firstName} ${mentor.user?.lastName}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="flex size-40 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-4xl font-bold">
                {getInitials(
                  mentor.user?.firstName || '',
                  mentor.user?.lastName || ''
                )}
              </div>
            )}

            <div className="flex-1">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="mb-2 text-5xl font-bold">
                    {mentor.user?.firstName} {mentor.user?.lastName}
                  </h1>
                  <p className="text-2xl text-neutral-400">
                    {mentor.headline || 'Professional Mentor'}
                  </p>
                </div>
                {mentor.isActive && (
                  <Badge
                    variant="outline"
                    className="w-fit border-green-500/50 px-4 py-2 text-base text-green-500"
                  >
                    Verified Mentor
                  </Badge>
                )}
              </div>

              {mentor.languages && mentor.languages.length > 0 && (
                <div className="mb-5 flex items-center gap-2.5 text-lg text-neutral-400">
                  <Globe className="size-5" />
                  <span>Speaks:</span>
                  <span className="text-white">{mentor.languages[0]}</span>
                  {mentor.languages.length > 1 && (
                    <span className="text-neutral-500">
                      , {mentor.languages.slice(1).join(', ')}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {mentor.yearsExperience >= 5 && (
                  <Badge
                    variant="outline"
                    className="border-neutral-700 px-4 py-2 text-base text-neutral-300"
                  >
                    {mentor.yearsExperience}+ years experience
                  </Badge>
                )}
                {mentor.isAcceptingMentees && (
                  <Badge
                    variant="outline"
                    className="border-green-500/50 px-4 py-2 text-base text-green-400"
                  >
                    Accepting Students
                  </Badge>
                )}
                {!mentor.isAcceptingMentees && (
                  <Badge
                    variant="outline"
                    className="border-neutral-600 px-4 py-2 text-base text-neutral-400"
                  >
                    Not Accepting
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mb-10 flex items-center gap-1 border-b border-neutral-800">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative cursor-pointer px-5 py-4 text-lg font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeMentorTab"
                      className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TransitionPanel
                activeIndex={activeIndex}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                variants={{
                  enter: { opacity: 0, y: -20, filter: 'blur(4px)' },
                  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  exit: { opacity: 0, y: 20, filter: 'blur(4px)' },
                }}
              >
                <div className="space-y-8">
                  <div>
                    <h2 className="mb-5 text-2xl font-semibold">About Me</h2>
                    <p className="text-lg leading-relaxed wrap-break-word whitespace-pre-line text-neutral-300">
                      {mentor.bio || "This mentor hasn't added a bio yet."}
                    </p>
                  </div>

                  {/* {(mentor.linkedinUrl || mentor.portfolioUrl) && (
                    <div className="flex items-center gap-5 pt-2">
                      {mentor.linkedinUrl && (
                        <a
                          href={mentor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-lg text-neutral-400 transition-colors hover:text-white"
                        >
                          <FaLinkedinIn className="size-6" />
                        </a>
                      )}
                      {mentor.portfolioUrl && (
                        <a
                          href={mentor.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-lg text-neutral-400 transition-colors hover:text-white"
                        >
                          <Globe className="size-6" />
                        </a>
                      )}
                    </div>
                  )} */}

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="pt-4">
                      <h3 className="mb-4 text-base font-medium tracking-wider text-neutral-500 uppercase">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="border-neutral-700 px-4 py-1.5 text-base text-neutral-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-10">
                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-base font-medium tracking-wider text-neutral-500 uppercase">
                        Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {mentor.expertise.map((exp, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="px-4 py-2 text-lg"
                          >
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentor.industries && mentor.industries.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-base font-medium tracking-wider text-neutral-500 uppercase">
                        Industries
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {mentor.industries.map((industry, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="border-neutral-700 px-4 py-1.5 text-base text-neutral-300"
                          >
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-4 text-base font-medium tracking-wider text-neutral-500 uppercase">
                      Experience
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-neutral-800">
                        <Briefcase className="size-6 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          {mentor.yearsExperience}{' '}
                          {mentor.yearsExperience === 1 ? 'year' : 'years'}
                        </p>
                        <p className="text-base text-neutral-500">
                          Professional experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-base font-medium tracking-wider text-neutral-500 uppercase">
                      Member Since
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-neutral-800">
                        <Calendar className="size-6 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          {formatDate(mentor.createdAt)}
                        </p>
                        <p className="text-base text-neutral-500">
                          Joined as Mentor
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="mb-5 text-2xl font-semibold">
                      Credentials & Documents
                    </h2>
                    <p className="mb-8 text-lg text-neutral-400">
                      Verified certificates, awards, and professional documents
                    </p>

                    {!mentor.documents || mentor.documents.length === 0 ? (
                      <div className="py-16 text-center">
                        <File className="mx-auto mb-4 size-14 text-neutral-600" />
                        <p className="mb-2 text-lg text-neutral-400">
                          No credentials uploaded yet
                        </p>
                        <p className="text-base text-neutral-500">
                          This mentor hasn&apos;t added any documents
                        </p>
                      </div>
                    ) : (
                      <PhotoProvider>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {mentor.documents.map((doc) => {
                            const isImage =
                              doc.isImage ?? doc.mimeType?.startsWith('image/');
                            const viewUrl =
                              doc.imagekitUrl ||
                              mentorService.getDocumentViewUrl(
                                mentor.id,
                                doc.id
                              );

                            return (
                              <div
                                key={doc.id}
                                className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition-colors hover:border-neutral-700"
                              >
                                {isImage ? (
                                  <PhotoView src={viewUrl}>
                                    <div className="relative block aspect-video w-full cursor-pointer overflow-hidden bg-neutral-800">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={viewUrl}
                                        alt={doc.title || doc.originalFilename}
                                        className="absolute inset-0 size-full object-cover"
                                      />
                                      <ProgressiveBlur
                                        className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-full"
                                        blurIntensity={0.4}
                                        animate="visible"
                                        variants={{
                                          hidden: { opacity: 0 },
                                          visible: { opacity: 1 },
                                        }}
                                        transition={{
                                          duration: 0.2,
                                          ease: 'easeOut',
                                        }}
                                      />
                                      <motion.div
                                        className="absolute right-0 bottom-0 left-0 p-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.3,
                                          ease: 'easeOut',
                                        }}
                                      >
                                        <span className="text-base font-medium text-white">
                                          {getDocumentTypeLabel(doc.type)}
                                        </span>
                                      </motion.div>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                          <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                            <Eye className="size-5 text-white" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </PhotoView>
                                ) : (
                                  <a
                                    href={viewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block aspect-video bg-neutral-800/50 transition-colors hover:bg-neutral-800/70"
                                  >
                                    <div className="flex size-full items-center justify-center">
                                      <div className="text-center">
                                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-lg bg-neutral-800 transition-colors group-hover:bg-neutral-700">
                                          {getFileTypeIcon(doc)}
                                        </div>
                                        <p className="mb-0.5 text-base font-medium text-neutral-300">
                                          {getFileTypeLabel(doc)}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                          Click to view
                                        </p>
                                      </div>
                                    </div>
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </PhotoProvider>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <ReviewsList
                    mentorId={mentorId}
                    onWriteReview={canReview ? handleWriteReview : undefined}
                  />
                </div>
              </TransitionPanel>
            </div>

            <div className="space-y-7">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                <h3 className="mb-5 text-lg font-semibold capitalize">
                  personal contact
                </h3>

                <Button
                  size="lg"
                  className="mb-5 h-14! w-full bg-white text-lg! text-neutral-950 hover:bg-neutral-200"
                  disabled={!canConnect || isCheckingMentorship}
                  onClick={() => setIsConnectDialogOpen(true)}
                >
                  {isCheckingMentorship ? (
                    <>
                      Checking...
                      <Loader2 className="ml-2 size-5 animate-spin" />
                    </>
                  ) : (
                    'Connect Now'
                  )}
                </Button>

                {!user && (
                  <p className="text-center text-base text-neutral-500">
                    Please login to connect with this mentor
                  </p>
                )}

                {user &&
                  user.role !== USER_ROLES.STUDENT &&
                  user.id !== mentor.userId && (
                    <p className="text-center text-base text-neutral-500">
                      Only students can send connection requests
                    </p>
                  )}

                {user && user.id === mentor.userId && (
                  <p className="text-center text-base text-neutral-500">
                    This is your own profile
                  </p>
                )}

                {user &&
                  user.role === USER_ROLES.STUDENT &&
                  !mentor.isAcceptingMentees && (
                    <p className="text-center text-base text-neutral-500">
                      This mentor is currently not accepting new students
                    </p>
                  )}

                {user &&
                  user.role === USER_ROLES.STUDENT &&
                  activeMentorship && (
                    <p className="text-center text-base text-neutral-500">
                      You already have an active mentorship with this mentor
                    </p>
                  )}

                {(mentor.linkedinUrl || mentor.portfolioUrl) && (
                  <>
                    <Separator className="my-5 bg-neutral-800" />
                    <div className="space-y-4">
                      <p className="text-base font-medium tracking-wider text-neutral-500 uppercase">
                        Social Links
                      </p>
                      <div className="space-y-3">
                        {mentor.linkedinUrl && (
                          <a
                            href={mentor.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-lg text-neutral-300 transition-colors hover:text-white"
                          >
                            <FaLinkedinIn className="size-5" />
                            LinkedIn
                            <ExternalLink className="ml-auto size-4 text-neutral-500" />
                          </a>
                        )}
                        {mentor.portfolioUrl && (
                          <a
                            href={mentor.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-lg text-neutral-300 transition-colors hover:text-white"
                          >
                            <Globe className="size-5" />
                            Portfolio
                            <ExternalLink className="ml-auto size-4 text-neutral-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                <h3 className="mb-5 text-lg font-semibold capitalize">
                  personal information
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-neutral-400">Experience</span>
                    <span className="text-lg font-medium">
                      {mentor.yearsExperience}{' '}
                      {mentor.yearsExperience === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-neutral-400">Languages</span>
                    <span className="text-lg font-medium">
                      {mentor.languages?.length || 0}
                    </span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-neutral-400">
                      Max Students
                    </span>
                    <span className="text-lg font-medium">
                      {mentor.maxMentees || 'N/A'}
                    </span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-neutral-400">Status</span>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1.5 text-base ${
                        mentor.isAcceptingMentees
                          ? 'border-green-500/50 text-green-400'
                          : 'border-neutral-600 text-neutral-400'
                      }`}
                    >
                      {mentor.isAcceptingMentees ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />

      <Dialog open={isConnectDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {requestSent
                ? 'Request Sent!'
                : `Connect with ${mentor.user?.firstName}`}
            </DialogTitle>
            <DialogDescription className="text-base">
              {requestSent
                ? 'Your connection request has been sent successfully.'
                : "Send a message introducing yourself and explaining why you'd like to connect."}
            </DialogDescription>
          </DialogHeader>

          {requestSent ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="size-10 text-green-500" />
              </div>
              <p className="mb-8 text-lg text-neutral-400">
                {mentor.user?.firstName} will review your request and respond
                soon.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="h-12! text-base!"
                >
                  Close
                </Button>
                <Button
                  onClick={() => router.push('/mentor/requests')}
                  className="h-12! text-base!"
                >
                  View My Requests
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <Textarea
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                placeholder="Hi! I'm interested in learning from you because..."
                className="min-h-[140px] text-lg!"
                disabled={isSendingRequest}
              />

              <p className="text-base text-neutral-500">
                Tip: Mention your goals, what you hope to learn, and why you
                think this mentor would be a good fit.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSendingRequest}
                  className="h-12! text-base!"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={isSendingRequest || !connectMessage.trim()}
                  className="h-12! text-base!"
                >
                  {isSendingRequest ? (
                    <>
                      Sending...
                      <Loader2 className="size-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      Send Request
                      <Send className="size-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {myReview
                ? 'Update Your Review'
                : `Write a Review for ${mentor.user?.firstName}`}
            </DialogTitle>
            <DialogDescription className="text-base">
              {myReview
                ? 'Update your review and rating for this mentor.'
                : 'Share your experience and help others make informed decisions.'}
            </DialogDescription>
          </DialogHeader>

          <ReviewForm
            mentorId={mentorId}
            existingReview={myReview}
            onSuccess={handleReviewSuccess}
            onCancel={() => setIsReviewDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
