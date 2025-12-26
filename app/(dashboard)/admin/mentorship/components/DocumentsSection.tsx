'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Award,
  Briefcase,
  File,
  UserCheck,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Presentation,
  FileType,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type {
  IAdminDocument,
  IAdminDocumentDetail,
  IDocumentStats,
  MentorDocumentType,
  DocumentVerificationStatus,
} from '@/types';
import { formatFileSize } from '@/lib';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const getDocumentIcon = (type: MentorDocumentType) => {
  const baseClassName = 'size-5 text-neutral-400';
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

const getVerificationBadge = (status: DocumentVerificationStatus) => {
  const baseClasses = 'px-2 py-1 pt-[.45rem]';
  switch (status) {
    case 'verified':
      return (
        <Badge
          className={`${baseClasses} border-green-500/30 bg-green-500/20 text-green-400`}
        >
          Verified
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          className={`${baseClasses} border-red-500/30 bg-red-500/20 text-red-400`}
        >
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge
          className={`${baseClasses} border-yellow-500/30 bg-yellow-500/20 text-yellow-400`}
        >
          Pending
        </Badge>
      );
  }
};

interface DocumentsSectionProps {
  applicationId: string;
}

export function DocumentsSection({ applicationId }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<IAdminDocument[]>([]);
  const [stats, setStats] = useState<IDocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const [selectedDocument, setSelectedDocument] =
    useState<IAdminDocumentDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState<boolean>(false);
  const [documentToVerify, setDocumentToVerify] =
    useState<IAdminDocument | null>(null);
  const [verifyAction, setVerifyAction] = useState<'verify' | 'reject'>(
    'verify'
  );
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const [docsResponse, statsResponse] = await Promise.all([
        adminService.getApplicationDocuments(applicationId),
        adminService.getDocumentStats(applicationId),
      ]);
      setDocuments(docsResponse);
      setStats(statsResponse);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load documents';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleViewDetail = async (doc: IAdminDocument) => {
    try {
      setIsLoadingDetail(true);
      const detail = await adminService.getDocumentById(applicationId, doc.id);
      setSelectedDocument(detail);
      setIsDetailDialogOpen(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load document details';
      toast.error(errorMessage);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDownload = (doc: IAdminDocument) => {
    const downloadUrl =
      doc.imagekitUrl ||
      adminService.getDocumentDownloadUrl(applicationId, doc.id);
    window.open(downloadUrl, '_blank');
  };

  const openVerifyDialog = (
    doc: IAdminDocument,
    action: 'verify' | 'reject'
  ) => {
    setDocumentToVerify(doc);
    setVerifyAction(action);
    setVerifyNotes('');
    setIsVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!documentToVerify) return;

    try {
      setIsVerifying(true);
      await adminService.verifyDocument(applicationId, documentToVerify.id, {
        verified: verifyAction === 'verify',
        notes: verifyNotes || undefined,
      });
      toast.success(
        verifyAction === 'verify'
          ? 'Document verified successfully'
          : 'Document rejected'
      );
      setIsVerifyDialogOpen(false);
      setDocumentToVerify(null);
      fetchDocuments();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${verifyAction} document`;
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-neutral-400" />
        <span className="ml-2 text-neutral-400">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg bg-neutral-800/30 py-6 text-center">
        <File className="mx-auto mb-3 size-10 text-neutral-500" />
        <p className="text-base text-neutral-400">No documents uploaded</p>
      </div>
    );
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="-mx-3 flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-neutral-800/30">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-neutral-400" />
              <h4 className="text-base font-semibold tracking-wider text-neutral-400 uppercase">
                Documents ({documents.length})
              </h4>
            </div>
            {isOpen ? (
              <ChevronUp className="size-5 text-neutral-400" />
            ) : (
              <ChevronDown className="size-5 text-neutral-400" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-3">
          {stats && (
            <div className="grid grid-cols-4 gap-3 rounded-lg bg-neutral-800/30 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-neutral-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-neutral-400">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-neutral-400">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-neutral-400">Rejected</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-700/50 bg-neutral-800/50 p-3 transition-colors hover:border-neutral-600"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-700/50">
                  {getDocumentIcon(doc.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <p className="truncate text-base font-medium">
                      {doc.title || doc.originalFilename}
                    </p>
                    {getVerificationBadge(doc.verificationStatus)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <span className="capitalize">{doc.type}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                    {doc.issuedYear && (
                      <>
                        <span>•</span>
                        <span>{doc.issuedYear}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleViewDetail(doc)}
                    disabled={isLoadingDetail}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="size-4" />
                  </Button>

                  {doc.verificationStatus === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-green-500 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                        onClick={() => openVerifyDialog(doc, 'verify')}
                      >
                        <CheckCircle className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        onClick={() => openVerifyDialog(doc, 'reject')}
                      >
                        <XCircle className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedDocument && getDocumentIcon(selectedDocument.type)}
              Document Details
            </DialogTitle>
            <DialogDescription className="text-base">
              View detailed information about this document
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {selectedDocument.title ||
                      selectedDocument.originalFilename}
                  </p>
                  <p className="text-base text-neutral-400 capitalize">
                    {selectedDocument.type}
                  </p>
                </div>
                {getVerificationBadge(selectedDocument.verificationStatus)}
              </div>

              <Separator className="bg-neutral-800" />

              <div className="grid grid-cols-2 gap-4 text-base">
                <div>
                  <p className="mb-1 text-neutral-500">File Name</p>
                  <p className="truncate">
                    {selectedDocument.originalFilename}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-neutral-500">File Size</p>
                  <p>{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <p className="mb-1 text-neutral-500">MIME Type</p>
                  <p>{selectedDocument.mimeType}</p>
                </div>
                <div>
                  <p className="mb-1 text-neutral-500">Issued Year</p>
                  <p>{selectedDocument.issuedYear || 'N/A'}</p>
                </div>
                {selectedDocument.issuingOrganization && (
                  <div className="col-span-2">
                    <p className="mb-1 text-neutral-500">
                      Issuing Organization
                    </p>
                    <p>{selectedDocument.issuingOrganization}</p>
                  </div>
                )}
                {selectedDocument.description && (
                  <div className="col-span-2">
                    <p className="mb-1 text-neutral-500">Description</p>
                    <p>{selectedDocument.description}</p>
                  </div>
                )}
              </div>

              {selectedDocument.verificationNotes && (
                <div className="rounded-lg bg-neutral-800/50 p-3">
                  <p className="mb-1 text-sm text-neutral-500">
                    Verification Notes
                  </p>
                  <p className="text-base">
                    {selectedDocument.verificationNotes}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-md! h-11! flex-1"
                  onClick={() => handleDownload(selectedDocument)}
                >
                  Download
                  <Download className="size-4" />
                </Button>
                {selectedDocument.verificationStatus === 'pending' && (
                  <>
                    <Button
                      className="text-md! h-11! flex-1 bg-green-500 text-white hover:bg-green-700"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        openVerifyDialog(selectedDocument, 'verify');
                      }}
                    >
                      Verify
                      <CheckCircle className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="text-md! h-11! flex-1 border-red-500/30 text-red-500 dark:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        openVerifyDialog(selectedDocument, 'reject');
                      }}
                    >
                      Reject
                      <XCircle className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {verifyAction === 'verify'
                ? 'Verify Document'
                : 'Reject Document'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {verifyAction === 'verify'
                ? 'Confirm that this document is valid and authentic.'
                : 'Reject this document with a reason.'}
            </DialogDescription>
          </DialogHeader>

          {documentToVerify && (
            <div className="space-y-4">
              <div className="rounded-lg bg-neutral-800/50 p-3">
                <p className="font-medium">
                  {documentToVerify.title || documentToVerify.originalFilename}
                </p>
                <p className="text-sm text-neutral-400 capitalize">
                  {documentToVerify.type}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-base text-neutral-400">
                  Notes{' '}
                  {verifyAction === 'reject' && (
                    <span className="text-red-400">*</span>
                  )}
                </label>
                <Textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder={
                    verifyAction === 'verify'
                      ? 'Optional verification notes...'
                      : 'Please provide a reason for rejection...'
                  }
                  className="min-h-[100px] text-base"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={
                isVerifying ||
                (verifyAction === 'reject' && !verifyNotes.trim())
              }
              className={
                verifyAction === 'verify'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'text-white bg-red-600 hover:bg-red-700'
              }
            >
              {isVerifying ? (
                <>
                  Processing...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>{verifyAction === 'verify' ? 'Verify' : 'Reject'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
