'use client';

import { mentorService } from '@/services';
import { useUserStore } from '@/stores';
import type {
  IMentorApplication,
  IMentorDocument,
  MentorApplicationStatus,
} from '@/types';
import { format, parseISO } from 'date-fns';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  FileUp,
  Globe,
  GraduationCap,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FaLinkedinIn } from 'react-icons/fa6';
import { DocumentList, DocumentUploadDialog } from '../components';

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user, refreshUser } = useUserStore();

  const isMentor = user?.role === 'mentor';

  const [applications, setApplications] = useState<IMentorApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] =
    useState<boolean>(false);
  const [applicationToWithdraw, setApplicationToWithdraw] =
    useState<IMentorApplication | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [documentsByApplication, setDocumentsByApplication] = useState<
    Record<string, IMentorDocument[]>
  >({});

  const fetchDocuments = useCallback(async (applicationId: string) => {
    try {
      const docs = await mentorService.getDocuments(applicationId);
      setDocumentsByApplication((prev) => ({
        ...prev,
        [applicationId]: docs,
      }));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await mentorService.getMyApplications();
      setApplications(data || []);

      const docsMap: Record<string, IMentorDocument[]> = {};
      for (const app of data || []) {
        if (app.documents && app.documents.length > 0) {
          docsMap[app.id] = app.documents;
        } else {
          fetchDocuments(app.id);
        }
      }
      if (Object.keys(docsMap).length > 0) {
        setDocumentsByApplication((prev) => ({ ...prev, ...docsMap }));
      }

      const hasApprovedApplication = data?.some(
        (app) => app.status === 'approved'
      );
      if (hasApprovedApplication && user?.role === 'student') {
        await refreshUser();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load applications';

      const normalized = errorMessage.toLowerCase();
      if (normalized.includes('forbidden')) {
        try {
          await refreshUser();
        } catch (refreshError) {
          console.error(
            'Failed to refresh user after forbidden:',
            refreshError
          );
        }
        router.replace('/mentor');
        return;
      }

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
      const errorMessage =
        error instanceof Error
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
      <div className="flex flex-col items-center justify-center pt-12 pb-16">
        <h1 className="mb-8 text-6xl font-bold">My Application</h1>
        <p className="mb-10 text-2xl text-neutral-500">
          Track the status of your mentor applications
        </p>
        <div className="w-232 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
            >
              <div className="flex items-start gap-5">
                <Skeleton className="size-16 rounded-full bg-neutral-800" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-md bg-neutral-800" />
                  <Skeleton className="h-6 w-72 bg-neutral-800" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-16">
      <h1 className="mb-8 text-6xl font-bold">My Application</h1>
      <p className="mb-10 text-2xl text-neutral-500">
        Track the status of your mentor applications
      </p>

      {applications.length === 0 ? (
        isMentor ? (
          <div className="w-232 py-20 text-center">
            <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-neutral-800">
              <GraduationCap className="size-12 text-neutral-500" />
            </div>
            <h2 className="mb-4 text-3xl font-semibold">
              You&apos;re already a mentor
            </h2>
            <p className="mb-10 text-xl text-neutral-400">
              Your account has been upgraded to mentor. Manage your mentor
              profile and start accepting students.
            </p>
            <Button
              onClick={() => router.push('/mentor/profile')}
              className="h-16! px-10! text-xl!"
            >
              Go to Mentor Profile
              <Plus className="size-7" />
            </Button>
          </div>
        ) : (
          <div className="w-232 py-20 text-center">
            <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-neutral-800">
              <GraduationCap className="size-12 text-neutral-500" />
            </div>
            <h2 className="mb-4 text-3xl font-semibold">No application yet</h2>
            <p className="mb-10 text-xl text-neutral-400">
              You haven&apos;t submitted any mentor application. Start your
              journey to become a mentor today!
            </p>
            <Button
              onClick={() => router.push('/mentor')}
              className="h-16! px-10! text-xl!"
            >
              Apply to Become a Mentor
              <Plus className="size-7" />
            </Button>
          </div>
        )
      ) : (
        <div className="w-232">
          {applications.map((application) => (
            <div
              key={application.id}
              className="mb-5 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 last:mb-0"
            >
              <div className="border-b border-neutral-800 p-7">
                <div className="flex items-start gap-5">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-neutral-700 to-neutral-800 text-xl font-bold">
                    <GraduationCap className="size-10 text-neutral-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-2 text-3xl font-semibold">
                          {application.applicationData?.headline ||
                            'Mentor Application'}
                        </h3>
                        <p className="text-lg text-neutral-400">
                          Submitted on {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex items-center px-5 py-2.5 text-lg ${getStatusBadgeColor(application.status)}`}
                      >
                        {formatStatus(application.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-7">
                {application.applicationData?.bio && (
                  <div>
                    <h4 className="mb-3 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                      Bio
                    </h4>
                    <p className="text-lg leading-relaxed text-neutral-300">
                      {application.applicationData.bio}
                    </p>
                  </div>
                )}

                {application.applicationData?.motivation && (
                  <div>
                    <h4 className="mb-3 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                      Motivation
                    </h4>
                    <p className="text-lg leading-relaxed text-neutral-300">
                      {application.applicationData.motivation}
                    </p>
                  </div>
                )}

                <Separator className="bg-neutral-800" />

                <div className="grid grid-cols-2 gap-7 lg:grid-cols-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-neutral-400">
                      <Briefcase className="size-5" />
                      <span className="text-base">Experience</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {application.applicationData?.yearsExperience}{' '}
                      {application.applicationData?.yearsExperience === 1
                        ? 'year'
                        : 'years'}
                    </p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-neutral-400">
                      <Globe className="size-5" />
                      <span className="text-base">Languages</span>
                    </div>
                    <p className="text-lg">
                      {application.applicationData?.languages?.join(', ') ||
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-neutral-400">
                      <Calendar className="size-5" />
                      <span className="text-base">Submitted</span>
                    </div>
                    <p className="text-lg">
                      {formatDateTime(application.createdAt)}
                    </p>
                  </div>
                  {application.decidedAt && (
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-neutral-400">
                        <CheckCircle className="size-5" />
                        <span className="text-base">Decided</span>
                      </div>
                      <p className="text-lg">
                        {formatDateTime(application.decidedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {application.applicationData?.expertise &&
                  application.applicationData.expertise.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {application.applicationData.expertise.map((exp, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-neutral-800/50 px-4 py-2 text-base"
                          >
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {application.applicationData?.skills &&
                  application.applicationData.skills.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {application.applicationData.skills.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-neutral-800/50 px-4 py-2 text-base"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {application.applicationData?.industries &&
                  application.applicationData.industries.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                        Industries
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {application.applicationData.industries.map(
                          (industry, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-neutral-800/50 px-4 py-2 text-base"
                            >
                              {industry}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {(application.applicationData?.linkedinUrl ||
                  application.applicationData?.portfolioUrl) && (
                  <div className="flex items-center gap-5">
                    {application.applicationData?.linkedinUrl && (
                      <a
                        href={application.applicationData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lg text-blue-400 transition-colors hover:text-blue-300"
                      >
                        <FaLinkedinIn className="size-6" />
                        LinkedIn Profile
                        <ExternalLink className="size-5" />
                      </a>
                    )}
                    {application.applicationData?.portfolioUrl && (
                      <a
                        href={application.applicationData.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-lg text-purple-400 transition-colors hover:text-purple-300"
                      >
                        <Globe className="size-6" />
                        Portfolio
                        <ExternalLink className="size-5" />
                      </a>
                    )}
                  </div>
                )}

                <Separator className="bg-neutral-800" />

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-base font-semibold tracking-wider text-neutral-400 uppercase">
                      <FileText className="size-5" />
                      Supporting Documents
                    </h4>
                    {canWithdraw(application.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplicationId(application.id);
                          setIsUploadDialogOpen(true);
                        }}
                        className="h-10! text-base!"
                      >
                        Upload Document
                        <FileUp className="size-5" />
                      </Button>
                    )}
                  </div>

                  <DocumentList
                    applicationId={application.id}
                    documents={documentsByApplication[application.id] || []}
                    onDocumentsChange={() => fetchDocuments(application.id)}
                    canEdit={canWithdraw(application.status)}
                  />
                </div>
              </div>

              <div className="border-t border-neutral-800 bg-neutral-900/30 p-7">
                <div className="flex items-center justify-between">
                  <p className="text-lg text-neutral-500">
                    {canWithdraw(application.status)
                      ? 'You can withdraw this application if you want to submit a new one'
                      : application.status === 'approved'
                        ? 'Visit your mentor profile to start accepting students'
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
                        className="h-12! border-red-500/30! text-base! dark:text-red-500 dark:hover:bg-red-500/10"
                        onClick={() => {
                          setApplicationToWithdraw(application);
                          setIsWithdrawDialogOpen(true);
                        }}
                      >
                        Withdraw Application
                        <Trash2 className="size-5" />
                      </Button>
                    )}
                    {(application.status === 'declined' ||
                      application.status === 'withdrawn') && (
                      <Button
                        onClick={() => router.push('/mentor')}
                        className="h-12! text-base!"
                      >
                        Submit New Application
                        <Plus className="size-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2.5 text-2xl">
              <Trash2 className="size-7" />
              Withdraw Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to withdraw this application? This action
              cannot be undone. You will need to submit a new application if you
              change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isWithdrawing}
              className="h-12! text-base!"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="h-12! bg-red-600 text-base! text-white hover:bg-red-700"
            >
              Withdraw Application
              {isWithdrawing && <Loader2 className="size-5 animate-spin" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedApplicationId && (
        <DocumentUploadDialog
          applicationId={selectedApplicationId}
          open={isUploadDialogOpen}
          onOpenChange={(open) => {
            setIsUploadDialogOpen(open);
            if (!open) setSelectedApplicationId(null);
          }}
          onDocumentUploaded={() => {
            if (selectedApplicationId) {
              fetchDocuments(selectedApplicationId);
            }
          }}
        />
      )}
    </div>
  );
}
