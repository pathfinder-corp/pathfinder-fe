'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Loader2, 
  Plus, 
  CheckCircle, 
  Trash2,
  ExternalLink,
  Linkedin,
  Globe,
  Briefcase,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { mentorService } from '@/services';
import { useUserStore } from '@/stores';
import type { IMentorApplication, MentorApplicationStatus } from '@/types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user, refreshUser } = useUserStore();
  
  const [applications, setApplications] = useState<IMentorApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState<boolean>(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<IMentorApplication | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await mentorService.getMyApplications();
      setApplications(data || []);
      
      const hasApprovedApplication = data?.some(app => app.status === 'approved');
      if (hasApprovedApplication && user?.role === 'student') {
        await refreshUser();
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load applications';
      toast.error('Failed to load applications', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdraw = async () => {
    if (!applicationToWithdraw) return;

    try {
      setIsWithdrawing(true);
      await mentorService.withdrawApplication(applicationToWithdraw.id);
      toast.success('Application withdrawn successfully');
      setIsWithdrawDialogOpen(false);
      setApplicationToWithdraw(null);
      fetchApplications();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to withdraw application';
      toast.error('Failed to withdraw application', {
        description: errorMessage,
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadgeColor = (status: MentorApplicationStatus) => {
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

  const formatStatus = (status: MentorApplicationStatus) => {
    switch (status) {
      case 'under_review':
        return 'Under Review';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canWithdraw = (status: MentorApplicationStatus) => {
    return ['pending', 'under_review', 'flagged'].includes(status);
  };

  if (isLoading) {
    return (
      <div className="pt-12 pb-16 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-8">My Application</h1>
        <p className="text-2xl text-neutral-500 mb-10">Track the status of your mentor applications</p>
        <div className="w-232 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
              <div className="flex items-start gap-5">
                <Skeleton className="size-16 rounded-full bg-neutral-800" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-md bg-neutral-800" />
                  <Skeleton className="h-6 w-72 bg-neutral-800" />
                </div>
                <Skeleton className="h-10 w-32 bg-neutral-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-8">My Application</h1>
      <p className="text-2xl text-neutral-500 mb-10">Track the status of your mentor applications</p>

      {applications.length === 0 ? (
        <div className="w-232 text-center py-20">
          <div className="size-24 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="size-12 text-neutral-500" />
          </div>
          <h2 className="text-3xl font-semibold mb-4">No application yet</h2>
          <p className="text-xl text-neutral-400 mb-10">
            You haven&apos;t submitted any mentor application. Start your journey to become a mentor today!
          </p>
          <Button 
            onClick={() => router.push('/mentor')}
            className="h-16! text-xl! px-10!"
          >
            Apply to Become a Mentor
            <Plus className="size-7" />
          </Button>
        </div>
      ) : (
        <div className="w-232">
          {applications.map((application) => (
            <div 
              key={application.id}
              className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden"
            >
              <div className="p-7 border-b border-neutral-800">
                <div className="flex items-start gap-5">
                  <div className="size-20 rounded-xl bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xl font-bold shrink-0">
                    <GraduationCap className="size-10 text-neutral-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-semibold mb-2">
                          {application.applicationData?.headline || 'Mentor Application'}
                        </h3>
                        <p className="text-lg text-neutral-400">
                          Submitted on {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`py-2.5 px-5 text-lg flex items-center ${getStatusBadgeColor(application.status)}`}
                      >
                        {formatStatus(application.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 space-y-7">
                {application.applicationData?.bio && (
                  <div>
                    <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-3">Bio</h4>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                      {application.applicationData.bio}
                    </p>
                  </div>
                )}

                {application.applicationData?.motivation && (
                  <div>
                    <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-3">Motivation</h4>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                      {application.applicationData.motivation}
                    </p>
                  </div>
                )}

                <Separator className="bg-neutral-800" />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                      <Briefcase className="size-5" />
                      <span className="text-base">Experience</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {application.applicationData?.yearsExperience || 0} years
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                      <Globe className="size-5" />
                      <span className="text-base">Languages</span>
                    </div>
                    <p className="text-lg">
                      {application.applicationData?.languages?.join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                      <Calendar className="size-5" />
                      <span className="text-base">Submitted</span>
                    </div>
                    <p className="text-lg">{formatDateTime(application.createdAt)}</p>
                  </div>
                  {application.decidedAt && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-2">
                        <CheckCircle className="size-5" />
                        <span className="text-base">Decided</span>
                      </div>
                      <p className="text-lg">{formatDateTime(application.decidedAt)}</p>
                    </div>
                  )}
                </div>

                {application.applicationData?.expertise && application.applicationData.expertise.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-4">Expertise</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {application.applicationData.expertise.map((exp, i) => (
                        <Badge key={i} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {application.applicationData?.skills && application.applicationData.skills.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-4">Skills</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {application.applicationData.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {application.applicationData?.industries && application.applicationData.industries.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-neutral-400 uppercase tracking-wider mb-4">Industries</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {application.applicationData.industries.map((industry, i) => (
                        <Badge key={i} variant="outline" className="py-2 px-4 text-base bg-neutral-800/50">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(application.applicationData?.linkedinUrl || application.applicationData?.portfolioUrl) && (
                  <div className="flex items-center gap-5">
                    {application.applicationData?.linkedinUrl && (
                      <a 
                        href={application.applicationData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lg text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Linkedin className="size-6" />
                        LinkedIn Profile
                        <ExternalLink className="size-5" />
                      </a>
                    )}
                    {application.applicationData?.portfolioUrl && (
                      <a 
                        href={application.applicationData.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lg text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Globe className="size-6" />
                        Portfolio
                        <ExternalLink className="size-5" />
                      </a>
                    )}
                  </div>
                )}

                {application.status === 'declined' && application.declineReason && (
                  <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-base font-medium text-red-400 mb-2">Decline Reason:</p>
                    <p className="text-lg text-neutral-300">{application.declineReason}</p>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="p-5 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-lg text-green-400 flex items-center gap-2">
                      <CheckCircle className="size-6" />
                      Congratulations! Your application has been approved. You are now a mentor!
                    </p>
                  </div>
                )}
              </div>

              <div className="p-7 border-t border-neutral-800 bg-neutral-900/30">
                <div className="flex items-center justify-between">
                  <p className="text-base text-neutral-500">
                    {canWithdraw(application.status) 
                      ? 'You can withdraw this application if you want to submit a new one'
                      : application.status === 'approved' 
                        ? 'Visit your mentor profile to start accepting mentees'
                        : 'This application has been processed'}
                  </p>
                  <div className="flex items-center gap-3">
                    {application.status === 'approved' && (
                      <Button
                        onClick={() => router.push('/mentor/profile')}
                        className="h-12! text-base!"
                      >
                        Go to Mentor Profile
                      </Button>
                    )}
                    {canWithdraw(application.status) && (
                      <Button
                        variant="outline"
                        className="dark:text-red-500 border-red-500/30! dark:hover:bg-red-500/10 h-12! text-base!"
                        onClick={() => {
                          setApplicationToWithdraw(application);
                          setIsWithdrawDialogOpen(true);
                        }}
                      >
                        <Trash2 className="size-5 mr-2" />
                        Withdraw Application
                      </Button>
                    )}
                    {(application.status === 'declined' || application.status === 'withdrawn') && (
                      <Button
                        onClick={() => router.push('/mentor')}
                        className="h-12! text-base!"
                      >
                        <Plus className="size-5 mr-2" />
                        Submit New Application
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2.5">
              <Trash2 className="size-7 text-red-500" />
              Withdraw Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to withdraw this application? This action cannot be undone.
              You will need to submit a new application if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing} className="h-12! text-base!">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-red-600 hover:bg-red-700 text-white h-12! text-base!"
            >
              {isWithdrawing && <Loader2 className="size-5 mr-2 animate-spin" />}
              Withdraw Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}