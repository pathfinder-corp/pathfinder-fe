'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileText, Award, Briefcase, File, Edit2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import type { IMentorDocument, MentorDocumentType, IUpdateMentorDocumentRequest } from '@/types';
import { DOCUMENT_TYPES } from '@/constants';

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

interface EditDocumentDialogProps {
  applicationId: string;
  document: IMentorDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentUpdated?: () => void;
}

export function EditDocumentDialog({
  applicationId,
  document,
  open,
  onOpenChange,
  onDocumentUpdated
}: EditDocumentDialogProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [documentType, setDocumentType] = useState<MentorDocumentType>(document.type);
  const [title, setTitle] = useState<string>(document.title || '');
  const [description, setDescription] = useState<string>(document.description || '');
  const [issuedYear, setIssuedYear] = useState<number | undefined>(document.issuedYear || undefined);
  const [issuingOrganization, setIssuingOrganization] = useState<string>(document.issuingOrganization || '');

  useEffect(() => {
    if (open) {
      setDocumentType(document.type);
      setTitle(document.title || '');
      setDescription(document.description || '');
      setIssuedYear(document.issuedYear || undefined);
      setIssuingOrganization(document.issuingOrganization || '');
    }
  }, [open, document]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      
      const updateData: IUpdateMentorDocumentRequest = {
        type: documentType,
        title: title || undefined,
        description: description || undefined,
        issuedYear: issuedYear,
        issuingOrganization: issuingOrganization || undefined,
      };

      await mentorService.updateDocument(applicationId, document.id, updateData);
      toast.success('Document updated successfully');
      onOpenChange(false);
      onDocumentUpdated?.();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update document';
      toast.error('Failed to update document', {
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Edit2 className="size-6" />
            Edit Document
          </DialogTitle>
          <DialogDescription className="text-base">
            Update the metadata for this document.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-5 p-6 pt-4">
          <div className="space-y-3">
            <Label className="text-lg">Document Type</Label>
            <Select 
              value={documentType} 
              onValueChange={(value) => setDocumentType(value as MentorDocumentType)}
            >
              <SelectTrigger className="h-14! text-lg!">
                <SelectValue />
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
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
            className="h-12! text-base!"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="h-12! text-base!"
          >
            {isUpdating ? (
              <>
                Updating...
                <Loader2 className="size-5 animate-spin" />
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}