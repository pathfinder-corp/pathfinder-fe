'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Loader2, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileSearch,
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user, refreshUser } = useUserStore();
  
  const [applications, setApplications] = useState<IMentorApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedApplication, setSelectedApplication] = useState<IMentorApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
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
      toast.error('Failed to load applications');
      console.error('Fetch applications error:', error);
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
      toast.error('Failed to withdraw application');
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

  const getStatusIcon = (status: MentorApplicationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="size-4" />;
      case 'declined':
        return <XCircle className="size-4" />;
      case 'pending':
        return <Clock className="size-4" />;
      case 'under_review':
        return <FileSearch className="size-4" />;
      case 'flagged':
        return <AlertTriangle className="size-4" />;
      default:
        return null;
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
      <div className="pt-10 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-6">My Applications</h1>
        <p className="text-xl text-neutral-500 mb-8">Track the status of your mentor applications</p>
        <div className="w-[58rem] space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="size-14 rounded-full bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-96 bg-neutral-800" />
                  <Skeleton className="h-5 w-64 bg-neutral-800" />
                </div>
                <Skeleton className="h-8 w-28 bg-neutral-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">My Applications</h1>
      <p className="text-xl text-neutral-500 mb-8">Track the status of your mentor applications</p>

      {applications.length === 0 ? (
        <div className="w-[58rem] text-center py-16">
          <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="size-10 text-neutral-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">No applications yet</h2>
          <p className="text-lg text-neutral-400 mb-8">
            You haven&apos;t submitted any mentor applications. Start your journey to become a mentor today!
          </p>
          <Button 
            onClick={() => router.push('/mentor')}
            className="!h-14 !text-[1.3rem] !px-8"
          >
            Apply to Become a Mentor
            <Plus className="size-6" />
          </Button>
        </div>
      ) : (
        <div className="w-[58rem] space-y-4">
          {applications.map((application) => (
            <div 
              key={application.id}
              className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-900/70 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  <GraduationCap className="size-7 text-neutral-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold mb-1 truncate">
                    {application.applicationData?.headline || 'Mentor Application'}
                  </h3>
                  <p className="text-base text-neutral-400">
                    Submitted on {formatDate(application.createdAt)}
                  </p>
                  {application.applicationData?.expertise && application.applicationData.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {application.applicationData.expertise.slice(0, 3).map((exp, i) => (
                        <Badge key={i} variant="outline" className="py-1 px-2 text-sm bg-neutral-800/50">
                          {exp}
                        </Badge>
                      ))}
                      {application.applicationData.expertise.length > 3 && (
                        <Badge variant="outline" className="py-1 px-2 text-sm bg-neutral-800/50">
                          +{application.applicationData.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge 
                    variant="outline" 
                    className={`py-1.5 px-3 text-sm flex items-center gap-1.5 ${getStatusBadgeColor(application.status)}`}
                  >
                    {getStatusIcon(application.status)}
                    {formatStatus(application.status)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    {canWithdraw(application.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:text-red-500 !border-red-500/30 dark:hover:bg-red-500/10"
                        onClick={() => {
                          setApplicationToWithdraw(application);
                          setIsWithdrawDialogOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {application.status === 'declined' && application.declineReason && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm font-medium text-red-400 mb-1">Decline Reason:</p>
                  <p className="text-base text-neutral-300">{application.declineReason}</p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-base text-green-400 flex items-center gap-2">
                    <CheckCircle className="size-5" />
                    Congratulations! Your application has been approved. You are now a mentor!
                  </p>
                </div>
              )}
            </div>
          ))}

          {!applications.some(app => ['pending', 'under_review', 'flagged'].includes(app.status)) && (
            <div className="text-center pt-6">
              <Button 
                onClick={() => router.push('/mentor')}
                className="!h-12 !text-[1.15rem] !px-6"
              >
                Submit New Application
                <Plus className="size-6" />
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b border-neutral-800">
            <DialogTitle className="text-xl">Application Details</DialogTitle>
            <DialogDescription>
              View your mentor application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    <GraduationCap className="size-7 text-neutral-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold">
                      {selectedApplication.applicationData?.headline || 'No headline'}
                    </p>
                    <p className="text-base text-neutral-400 mt-1">
                      {selectedApplication.applicationData?.yearsExperience || 0} years of experience
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`py-1.5 px-3 text-sm flex items-center gap-1.5 ${getStatusBadgeColor(selectedApplication.status)}`}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    {formatStatus(selectedApplication.status)}
                  </Badge>
                </div>

                <Separator className="bg-neutral-800" />

                <div>
                  <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Bio</h4>
                  <p className="text-base text-neutral-300 leading-relaxed">
                    {selectedApplication.applicationData?.bio || 'No bio provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Motivation</h4>
                  <p className="text-base text-neutral-300 leading-relaxed">
                    {selectedApplication.applicationData?.motivation || 'No motivation provided'}
                  </p>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Briefcase className="size-4" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {selectedApplication.applicationData?.yearsExperience || 0} years
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Globe className="size-4" />
                      <span className="text-sm">Languages</span>
                    </div>
                    <p className="text-base">
                      {selectedApplication.applicationData?.languages?.join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Calendar className="size-4" />
                      <span className="text-sm">Submitted</span>
                    </div>
                    <p className="text-base">{formatDateTime(selectedApplication.createdAt)}</p>
                  </div>
                  {selectedApplication.decidedAt && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <CheckCircle className="size-4" />
                        <span className="text-sm">Decided</span>
                      </div>
                      <p className="text-base">{formatDateTime(selectedApplication.decidedAt)}</p>
                    </div>
                  )}
                </div>

                {(selectedApplication.applicationData?.expertise?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.applicationData?.expertise?.map((item, i) => (
                        <Badge key={i} variant="outline" className="py-1.5 px-3 text-sm bg-neutral-800/50">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedApplication.applicationData?.skills?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.applicationData?.skills?.map((skill, i) => (
                        <Badge key={i} variant="outline" className="py-1.5 px-3 text-sm bg-neutral-800/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedApplication.applicationData?.industries?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.applicationData?.industries?.map((industry, i) => (
                        <Badge key={i} variant="outline" className="py-1.5 px-3 text-sm bg-neutral-800/50">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {selectedApplication.applicationData?.linkedinUrl && (
                    <a 
                      href={selectedApplication.applicationData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-base text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Linkedin className="size-5" />
                      LinkedIn Profile
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  {selectedApplication.applicationData?.portfolioUrl && (
                    <a 
                      href={selectedApplication.applicationData.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-base text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Globe className="size-5" />
                      Portfolio
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>

                {selectedApplication.status === 'declined' && selectedApplication.declineReason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
                      Decline Reason
                    </h4>
                    <p className="text-base text-neutral-300">{selectedApplication.declineReason}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <Trash2 className="size-6 text-red-500" />
              Withdraw Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
              You will need to submit a new application if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing} className="!h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-red-600 hover:bg-red-700 text-white !h-11"
            >
              {isWithdrawing && <Loader2 className="size-4 mr-2 animate-spin" />}
              Withdraw Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}