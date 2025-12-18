'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  Briefcase, 
  Globe, 
  Linkedin,
  ExternalLink,
  Users,
  Calendar,
  Loader2,
  Send,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { useUserStore } from '@/stores';
import { mentorService, mentorshipService } from '@/services';
import type { IMentorProfile } from '@/types';

import { PublicHeader } from '@/components/PublicHeader';
import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { USER_ROLES } from '@/constants';

type TabType = 'about' | 'background';

const TABS: { id: TabType; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'background', label: 'Background' },
];

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id as string;
  const user = useUserStore((state) => state.user);
  const initializeUser = useUserStore((state) => state.initializeUser);

  const [mentor, setMentor] = useState<IMentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState<boolean>(false);
  const [connectMessage, setConnectMessage] = useState<string>('');
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  const activeIndex = TABS.findIndex(tab => tab.id === activeTab);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!mentorId) return;

      try {
        setIsLoading(true);
        const data = await mentorService.getMentorById(mentorId);
        setMentor(data);
      } catch (error) {
        console.error('Failed to fetch mentor:', error);
        toast.error('Failed to load mentor profile');
        router.push('/mentors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId, router]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

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
        message: connectMessage.trim()
      });
      setRequestSent(true);
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Failed to send request:', error);
      toast.error('Failed to send connection request');
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

  const canConnect = user && 
    user.role === USER_ROLES.STUDENT && 
    user.id !== mentor?.userId && 
    mentor?.isAcceptingMentees;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <PublicHeader />
        <main className="pt-24">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-40 mb-8 bg-neutral-800" />
            
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <Skeleton className="size-40 rounded-xl bg-neutral-800 flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-72 bg-neutral-800" />
                <Skeleton className="h-6 w-full max-w-lg bg-neutral-800" />
                <Skeleton className="h-5 w-48 bg-neutral-800" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-28 bg-neutral-800 rounded-full" />
                  <Skeleton className="h-8 w-32 bg-neutral-800 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-neutral-800 pb-1">
              <Skeleton className="h-10 w-20 bg-neutral-800" />
              <Skeleton className="h-10 w-28 bg-neutral-800" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full bg-neutral-800 rounded-lg" />
                <Skeleton className="h-32 w-full bg-neutral-800 rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full bg-neutral-800 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <PublicHeader />
        <main className="pt-24">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <Users className="size-10 text-neutral-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Mentor not found</h2>
            <p className="text-lg text-neutral-400 mb-8">
              The mentor profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button size="lg" onClick={() => router.push('/mentors')} className="!h-12 !px-8">
              <ArrowLeft className="size-5 mr-2" />
              Back to Mentors
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <PublicHeader />
      
      <main className="pt-36 pb-16">
        <div className="max-w-6xl mx-auto px-6">

          <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
            {mentor.user?.avatar ? (
              <div className="relative size-40 rounded-xl overflow-hidden border border-neutral-800 flex-shrink-0">
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
              <div className="size-40 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-4xl font-bold flex-shrink-0">
                {getInitials(mentor.user?.firstName || '', mentor.user?.lastName || '')}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-4xl font-bold mb-1">
                    {mentor.user?.firstName} {mentor.user?.lastName}
                  </h1>
                  <p className="text-xl text-neutral-400">
                    {mentor.headline || 'Professional Mentor'}
                  </p>
                </div>
                {mentor.isActive && (
                  <Badge variant="outline" className="py-1.5 px-3 border-green-500/50 text-green-500 w-fit">
                    Verified Mentor
                  </Badge>
                )}
              </div>

              {mentor.languages && mentor.languages.length > 0 && (
                <div className="flex items-center gap-2 text-base text-neutral-400 mb-4">
                  <Globe className="size-4" />
                  <span>Speaks:</span>
                  <span className="text-white">{mentor.languages[0]}</span>
                  {mentor.languages.length > 1 && (
                    <span className="text-neutral-500">, {mentor.languages.slice(1).join(', ')}</span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {mentor.yearsExperience >= 5 && (
                  <Badge variant="outline" className="border-neutral-700 text-neutral-300 py-1.5 px-3">
                    {mentor.yearsExperience}+ years experience
                  </Badge>
                )}
                {mentor.isAcceptingMentees && (
                  <Badge variant="outline" className="py-1.5 px-3 border-green-500/50 text-green-400">
                    Accepting mentees
                  </Badge>
                )}
                {!mentor.isAcceptingMentees && (
                  <Badge variant="outline" className="py-1.5 px-3 border-neutral-600 text-neutral-400">
                    Not accepting
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-neutral-800 mb-8">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer relative px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.span 
                      layoutId="activeMentorTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">About Me</h2>
                    <p className="text-base text-neutral-300 leading-relaxed whitespace-pre-line">
                      {mentor.bio || 'This mentor hasn\'t added a bio yet.'}
                    </p>
                  </div>

                  {(mentor.linkedinUrl || mentor.portfolioUrl) && (
                    <div className="flex items-center gap-4 pt-2">
                      {mentor.linkedinUrl && (
                        <a
                          href={mentor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-base text-neutral-400 hover:text-white transition-colors"
                        >
                          <Linkedin className="size-5" />
                        </a>
                      )}
                      {mentor.portfolioUrl && (
                        <a
                          href={mentor.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-base text-neutral-400 hover:text-white transition-colors"
                        >
                          <Globe className="size-5" />
                        </a>
                      )}
                    </div>
                  )}

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="pt-4">
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="border-neutral-700 text-neutral-300 py-1 px-3"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
                        Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.map((exp, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="py-1.5 px-3 text-base"
                          >
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentor.industries && mentor.industries.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
                        Industries
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.industries.map((industry, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="border-neutral-700 text-neutral-300 py-1 px-3"
                          >
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
                      Experience
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <Briefcase className="size-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-base font-medium">{mentor.yearsExperience || 0} years</p>
                        <p className="text-sm text-neutral-500">Professional experience</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
                      Member Since
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <Calendar className="size-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-base font-medium">{formatDate(mentor.createdAt)}</p>
                        <p className="text-sm text-neutral-500">Joined as mentor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionPanel>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-base font-semibold mb-4">Contact</h3>
                
                <Button
                  size="lg"
                  className="w-full !h-12 text-[1.1rem] bg-white text-neutral-950 hover:bg-neutral-200 mb-4"
                  disabled={!canConnect}
                  onClick={() => setIsConnectDialogOpen(true)}
                >
                  Connect Now
                </Button>

                {!user && (
                  <p className="text-sm text-neutral-500 text-center">
                    Please login to connect with this mentor
                  </p>
                )}

                {user && user.role !== USER_ROLES.STUDENT && (
                  <p className="text-sm text-neutral-500 text-center">
                    Only students can send connection requests
                  </p>
                )}

                {user && user.id === mentor.userId && (
                  <p className="text-sm text-neutral-500 text-center">
                    This is your own profile
                  </p>
                )}

                {user && user.role === USER_ROLES.STUDENT && !mentor.isAcceptingMentees && (
                  <p className="text-sm text-neutral-500 text-center">
                    This mentor is currently not accepting new mentees
                  </p>
                )}

                {(mentor.linkedinUrl || mentor.portfolioUrl) && (
                  <>
                    <Separator className="my-4 bg-neutral-800" />
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
                        Social Links
                      </p>
                      <div className="space-y-2">
                        {mentor.linkedinUrl && (
                          <a
                            href={mentor.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-base text-neutral-300 hover:text-white transition-colors"
                          >
                            <Linkedin className="size-4" />
                            LinkedIn
                            <ExternalLink className="size-3 ml-auto text-neutral-500" />
                          </a>
                        )}
                        {mentor.portfolioUrl && (
                          <a
                            href={mentor.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-base text-neutral-300 hover:text-white transition-colors"
                          >
                            <Globe className="size-4" />
                            Portfolio
                            <ExternalLink className="size-3 ml-auto text-neutral-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-base font-semibold mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Experience</span>
                    <span className="font-medium">{mentor.yearsExperience || 0} years</span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Languages</span>
                    <span className="font-medium">{mentor.languages?.length || 0}</span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Max Mentees</span>
                    <span className="font-medium">{mentor.maxMentees || 'N/A'}</span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Status</span>
                    <Badge 
                      variant="outline"
                      className={mentor.isAcceptingMentees 
                        ? 'border-green-500/50 text-green-400' 
                        : 'border-neutral-600 text-neutral-400'
                      }
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

      <Dialog open={isConnectDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {requestSent ? 'Request Sent!' : `Connect with ${mentor.user?.firstName}`}
            </DialogTitle>
            <DialogDescription>
              {requestSent 
                ? 'Your connection request has been sent successfully.'
                : 'Send a message introducing yourself and explaining why you\'d like to connect.'
              }
            </DialogDescription>
          </DialogHeader>

          {requestSent ? (
            <div className="py-6 text-center">
              <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-8 text-green-500" />
              </div>
              <p className="text-base text-neutral-400 mb-6">
                {mentor.user?.firstName} will review your request and respond soon.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="!h-11"
                >
                  Close
                </Button>
                <Button
                  onClick={() => router.push('/mentorship/requests')}
                  className="!h-11"
                >
                  View My Requests
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                placeholder="Hi! I'm interested in learning from you because..."
                className="min-h-[120px] !text-base"
                disabled={isSendingRequest}
              />

              <p className="text-sm text-neutral-500">
                Tip: Mention your goals, what you hope to learn, and why you think this mentor would be a good fit.
              </p>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSendingRequest}
                  className="!h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={isSendingRequest || !connectMessage.trim()}
                  className="!h-11"
                >
                  {isSendingRequest ? (
                    <>
                      Sending...
                      <Loader2 className="size-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Send Request
                      <Send className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}