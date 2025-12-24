'use client';

import { useState } from 'react';
import {
  Loader2,
  FileText,
  Award,
  Briefcase,
  File,
  Trash2,
  Download,
  Edit2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import type { IMentorDocument, MentorDocumentType } from '@/types';
import { formatFileSize } from '@/lib';

import { EditDocumentDialog } from './EditDocumentDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const getVerificationBadge = (status: string) => {
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

interface DocumentListProps {
  applicationId: string;
  documents: IMentorDocument[];
  onDocumentsChange: () => void;
  canEdit?: boolean;
}

export function DocumentList({
  applicationId,
  documents,
  onDocumentsChange,
  canEdit = true,
}: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<IMentorDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<IMentorDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (doc: IMentorDocument) => {
    try {
      setIsDownloading(doc.id);
      const blob = await mentorService.downloadDocument(applicationId, doc.id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to download document';
      toast.error('Failed to download document', {
        description: errorMessage,
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      await mentorService.deleteDocument(applicationId, documentToDelete.id);
      toast.success('Document deleted successfully');
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      onDocumentsChange();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete document';
      toast.error('Failed to delete document', {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/30 py-10 text-center">
        <File className="mx-auto mb-4 size-12 text-neutral-500" />
        <p className="text-lg text-neutral-400">No documents uploaded yet</p>
        <p className="mt-1 text-base text-neutral-500">
          Upload certificates, awards, or portfolio items to strengthen your
          application
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-4 rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 transition-colors hover:border-neutral-600"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-neutral-700/50">
              {getDocumentIcon(doc.type)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="truncate text-lg font-medium">
                  {doc.title || doc.originalFilename}
                </h4>
                {getVerificationBadge(doc.verificationStatus)}
              </div>
              <div className="flex items-center gap-3 text-base text-neutral-400">
                <span className="capitalize">{doc.type}</span>
                <span>•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
                {doc.issuedYear && (
                  <>
                    <span>•</span>
                    <span>{doc.issuedYear}</span>
                  </>
                )}
                {doc.issuingOrganization && (
                  <>
                    <span>•</span>
                    <span className="max-w-[200px] truncate">
                      {doc.issuingOrganization}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-10"
                onClick={() => handleDownload(doc)}
                disabled={isDownloading === doc.id}
              >
                {isDownloading === doc.id ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Download className="size-5" />
                )}
              </Button>

              {canEdit && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 text-red-500 hover:text-red-400 dark:hover:bg-red-500/10"
                    onClick={() => {
                      setDocumentToDelete(doc);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedDocument && (
        <EditDocumentDialog
          applicationId={applicationId}
          document={selectedDocument}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onDocumentUpdated={onDocumentsChange}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2.5 text-2xl">
              <Trash2 className="size-7" />
              Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete &quot;
              {documentToDelete?.title || documentToDelete?.originalFilename}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-12! text-base!"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-12! bg-red-600 text-base! text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  Deleting...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                'Delete Document'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
