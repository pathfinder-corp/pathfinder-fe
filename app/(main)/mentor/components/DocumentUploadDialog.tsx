'use client';

import { useState, useRef } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { Loader2, FileText, Award, Briefcase, File, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import type { MentorDocumentType } from '@/types';
import { DOCUMENT_TYPES } from '@/constants';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
);

const getDocumentIcon = (iconName: string, className: string = 'size-5') => {
  switch (iconName) {
    case 'FileText':
      return <FileText className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'UserCheck':
      return <UserCheck className={className} />;
    default:
      return <File className={className} />;
  }
};

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 50 }, (_, i) => currentYear - i);

interface DocumentUploadDialogProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentUploaded?: () => void;
}

export function DocumentUploadDialog({ 
  applicationId, 
  open, 
  onOpenChange,
  onDocumentUploaded 
}: DocumentUploadDialogProps) {
  const pondRef = useRef<FilePond | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [documentType, setDocumentType] = useState<MentorDocumentType>('certificate');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [issuedYear, setIssuedYear] = useState<number | undefined>(undefined);
  const [issuingOrganization, setIssuingOrganization] = useState<string>('');

  const resetForm = () => {
    setFiles([]);
    setDocumentType('certificate');
    setTitle('');
    setDescription('');
    setIssuedYear(undefined);
    setIssuingOrganization('');
    if (pondRef.current) {
      pondRef.current.removeFiles();
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      
      await mentorService.uploadDocument(applicationId, {
        file: files[0],
        type: documentType,
        title: title || undefined,
        description: description || undefined,
        issuedYear: issuedYear,
        issuingOrganization: issuingOrganization || undefined,
      });

      toast.success('Document uploaded successfully');
      resetForm();
      onOpenChange(false);
      onDocumentUploaded?.();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload document';
      toast.error('Failed to upload document', {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <FileText className="size-7" />
            Upload Document
          </DialogTitle>
          <DialogDescription className="text-base">
            Upload certificates, awards, or other documents to strengthen your application.
            Supported formats: PDF, JPG, PNG (max 5MB)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 p-6 pt-4">
            <div className="filepond-wrapper">
              <FilePond
                ref={pondRef}
                files={files}
                onupdatefiles={(fileItems) => {
                  setFiles(fileItems.map(item => item.file as File));
                }}
                allowMultiple={false}
                maxFiles={1}
                maxFileSize="5MB"
                acceptedFileTypes={[
                  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                  'application/pdf',
                  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.oasis.opendocument.presentation'
                ]}
                labelIdle='<span class="filepond--label-action">Browse</span> or drag & drop your file here'
                labelFileTypeNotAllowed="Invalid file type"
                fileValidateTypeLabelExpectedTypes="Expects images, PDF, Word, Excel, PowerPoint or OpenDocument"
                labelMaxFileSizeExceeded="File is too large"
                labelMaxFileSize="Maximum file size is 5MB"
                credits={false}
                stylePanelLayout="compact"
                className="filepond-dark"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={documentType} 
                onValueChange={(value) => setDocumentType(value as MentorDocumentType)}
              >
                <SelectTrigger className="h-14! text-lg!">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-lg!">
                      <div className="flex items-center gap-2">
                        {getDocumentIcon(type.iconName)}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AWS Solutions Architect Certificate"
                className="h-14! text-lg!"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this document..."
                className="min-h-[100px] text-lg!"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <Label className="text-lg">Year Issued</Label>
                <Select 
                  value={issuedYear?.toString() || ''} 
                  onValueChange={(value) => setIssuedYear(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="h-14! text-lg!">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-lg!">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Issuing Organization</Label>
                <Input
                  value={issuingOrganization}
                  onChange={(e) => setIssuingOrganization(e.target.value)}
                  placeholder="e.g., Amazon Web Services"
                  className="h-14! text-lg!"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-neutral-800">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isUploading}
            className="h-12! text-base!"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="h-12! text-base!"
          >
            {isUploading ? (
              <>
                Uploading...
                <Loader2 className="size-5 animate-spin" />
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}