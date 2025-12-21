'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  CheckCircle, 
  XCircle,
  Loader2,
  Eye,
  User,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { 
  IAdminPendingDocument,
  IAdminDocumentDetail,
  MentorDocumentType
} from '@/types';
import { formatFileSize } from '@/lib';

import { formatDate, getDocumentIconComponent } from './utils';
import { StatusBadge } from './StatusBadge';
import type { PendingDocumentsTabProps } from './types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getDocumentIcon = (type: MentorDocumentType) => {
  const IconComponent = getDocumentIconComponent(type);
  return <IconComponent className="size-5 text-neutral-400" />;
};

export function PendingDocumentsTab({ refreshTrigger = 0 }: PendingDocumentsTabProps) {
  const [documents, setDocuments] = useState<IAdminPendingDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedDocument, setSelectedDocument] = useState<IAdminDocumentDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState<boolean>(false);
  const [documentToVerify, setDocumentToVerify] = useState<IAdminPendingDocument | null>(null);
  const [verifyAction, setVerifyAction] = useState<'verify' | 'reject'>('verify');
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);


  const fetchDocuments = useCallback(async (showRefreshIndicator = false) => {
    try {
      setIsLoading(true);
      const data = await adminService.getPendingDocuments();
      setDocuments(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load pending documents';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshTrigger]);

  const handleViewDetail = async (doc: IAdminPendingDocument) => {
    try {
      setIsLoadingDetail(true);
      const detail = await adminService.getDocumentById(doc.applicationId, doc.id);
      setSelectedDocument(detail);
      setIsDetailDialogOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load document details';
      toast.error(errorMessage);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDownload = (doc: IAdminPendingDocument | IAdminDocumentDetail) => {
    const downloadUrl = doc.imagekitUrl || adminService.getDocumentDownloadUrl(doc.applicationId, doc.id);
    window.open(downloadUrl, '_blank');
  };

  const openVerifyDialog = (doc: IAdminPendingDocument, action: 'verify' | 'reject') => {
    setDocumentToVerify(doc);
    setVerifyAction(action);
    setVerifyNotes('');
    setIsVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!documentToVerify) return;

    try {
      setIsVerifying(true);
      await adminService.verifyDocument(documentToVerify.applicationId, documentToVerify.id, {
        verified: verifyAction === 'verify',
        notes: verifyNotes || undefined
      });
      toast.success(verifyAction === 'verify' ? 'Document verified successfully' : 'Document rejected');
      setIsVerifyDialogOpen(false);
      setDocumentToVerify(null);
      setIsDetailDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${verifyAction} document`;
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 bg-neutral-800" />
          <Skeleton className="h-12 w-32 bg-neutral-800" />
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="py-5 pl-6"><Skeleton className="h-5 w-24 bg-neutral-800" /></TableHead>
                <TableHead className="py-5"><Skeleton className="h-5 w-32 bg-neutral-800" /></TableHead>
                <TableHead className="py-5"><Skeleton className="h-5 w-28 bg-neutral-800" /></TableHead>
                <TableHead className="py-5"><Skeleton className="h-5 w-24 bg-neutral-800" /></TableHead>
                <TableHead className="py-5 pr-6"><Skeleton className="h-5 w-20 bg-neutral-800" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-lg bg-neutral-800" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40 bg-neutral-800" />
                        <Skeleton className="h-4 w-24 bg-neutral-800" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-36 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-28 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-9 w-28 bg-neutral-800" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Pending Documents</h2>
            <p className="text-lg text-neutral-400">
              {documents.length} document{documents.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl py-16 text-center">
            <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="size-10 text-neutral-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No Pending Documents</h3>
            <p className="text-lg text-neutral-400">
              All documents have been reviewed. Great job!
            </p>
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-6">
                    Document
                  </TableHead>
                  <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5">
                    Uploader
                  </TableHead>
                  <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5">
                    Application Status
                  </TableHead>
                  <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5">
                    Uploaded
                  </TableHead>
                  <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow 
                    key={doc.id} 
                    className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                  >
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-neutral-700/50 flex items-center justify-center shrink-0">
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-lg text-neutral-100 truncate max-w-[200px]">
                            {doc.title || doc.originalFilename}
                          </p>
                          <p className="text-base text-neutral-400 capitalize">
                            {doc.type} • {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                          {doc.uploader.firstName?.[0] || ''}{doc.uploader.lastName?.[0] || ''}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base text-neutral-100 truncate">
                            {doc.uploader.firstName} {doc.uploader.lastName}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">
                            {doc.uploader.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doc.application.status} />
                    </TableCell>
                    <TableCell className="text-neutral-300 text-lg">
                      {formatDate(doc.createdAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10"
                          onClick={() => handleViewDetail(doc)}
                          disabled={isLoadingDetail}
                        >
                          <Eye className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-green-500 dark:hover:text-green-400 dark:hover:bg-green-500/10"
                          onClick={() => openVerifyDialog(doc, 'verify')}
                        >
                          <CheckCircle className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-red-500 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                          onClick={() => openVerifyDialog(doc, 'reject')}
                        >
                          <XCircle className="size-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedDocument && getDocumentIcon(selectedDocument.type)}
              Document Details
            </DialogTitle>
            <DialogDescription className="text-base">
              Review document information before verification
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {selectedDocument.title || selectedDocument.originalFilename}
                  </p>
                  <p className="text-base text-neutral-400 capitalize">{selectedDocument.type}</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 py-1.5 px-3">
                  Pending Review
                </Badge>
              </div>

              <Separator className="bg-neutral-800" />

              <div className="grid grid-cols-2 gap-4 text-base">
                <div>
                  <p className="text-neutral-500 mb-1">File Name</p>
                  <p className="truncate">{selectedDocument.originalFilename}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">File Size</p>
                  <p>{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">MIME Type</p>
                  <p>{selectedDocument.mimeType}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Issued Year</p>
                  <p>{selectedDocument.issuedYear || 'N/A'}</p>
                </div>
                {selectedDocument.issuingOrganization && (
                  <div className="col-span-2">
                    <p className="text-neutral-500 mb-1">Issuing Organization</p>
                    <p>{selectedDocument.issuingOrganization}</p>
                  </div>
                )}
                {selectedDocument.description && (
                  <div className="col-span-2">
                    <p className="text-neutral-500 mb-1">Description</p>
                    <p>{selectedDocument.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11! text-md!"
                  onClick={() => handleDownload(selectedDocument)}
                >
                  Download
                  <Download className="size-4" />
                </Button>
                <Button
                  className="flex-1 h-11! text-md! text-white bg-green-500 hover:bg-green-700"
                  onClick={() => {
                    const pendingDoc = documents.find(d => d.id === selectedDocument.id);
                    if (pendingDoc) {
                      setIsDetailDialogOpen(false);
                      openVerifyDialog(pendingDoc, 'verify');
                    }
                  }}
                >
                  Verify
                  <CheckCircle className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-11! text-md! text-red-500 border-red-500/30 dark:hover:text-red-400 dark:border-red-400/30 dark:hover:bg-red-500/10"
                  onClick={() => {
                    const pendingDoc = documents.find(d => d.id === selectedDocument.id);
                    if (pendingDoc) {
                      setIsDetailDialogOpen(false);
                      openVerifyDialog(pendingDoc, 'reject');
                    }
                  }}
                >
                  Reject
                  <XCircle className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {verifyAction === 'verify' ? (
                <CheckCircle className="size-6" />
              ) : (
                <XCircle className="size-6" />
              )}
              {verifyAction === 'verify' ? 'Verify Document' : 'Reject Document'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {verifyAction === 'verify' 
                ? 'Confirm that this document is valid and authentic.'
                : 'Reject this document with a reason.'}
            </DialogDescription>
          </DialogHeader>

          {documentToVerify && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-800/50 rounded-lg">
                <p className="font-medium">{documentToVerify.title || documentToVerify.originalFilename}</p>
                <p className="text-sm text-neutral-400 capitalize">{documentToVerify.type}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                  <User className="size-4" />
                  <span>{documentToVerify.uploader.firstName} {documentToVerify.uploader.lastName}</span>
                </div>
              </div>

              <div>
                <label className="text-base text-neutral-400 mb-2 block">
                  Notes {verifyAction === 'reject' && <span className="text-red-400">*</span>}
                </label>
                <Textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder={verifyAction === 'verify' 
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
              disabled={isVerifying || (verifyAction === 'reject' && !verifyNotes.trim())}
              className={verifyAction === 'verify' 
                ? 'text-white bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isVerifying ? (
                <>
                  Processing...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  {verifyAction === 'verify' ? 'Verify' : 'Reject'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}