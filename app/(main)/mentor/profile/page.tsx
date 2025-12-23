'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { 
  Save, 
  Loader2, 
  Plus, 
  X, 
  GraduationCap, 
  AlertCircle,
  Eye,
  CheckCircle,
  FileText,
  Award,
  Briefcase,
  File,
  UserCheck,
  Download,
  ShieldCheck,
  Clock,
  XCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import { formatFileSize } from '@/lib';
import { DOCUMENT_TYPES } from '@/constants';
import type { IMentorProfile, IUpdateMentorProfileRequest, IMentorDocument, MentorDocumentType, DocumentVerificationStatus } from '@/types';
import { useUserStore } from '@/stores';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectValue, 
  SelectTrigger,
  SelectItem, 
  SelectContent 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
);

const getDocumentIcon = (type: MentorDocumentType, className: string = 'size-6 text-neutral-400') => {
  switch (type) {
    case 'certificate':
      return <FileText className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'portfolio':
      return <Briefcase className={className} />;
    case 'recommendation':
      return <UserCheck className={className} />;
    default:
      return <File className={className} />;
  }
};

const getDocumentIconByName = (iconName: string, className: string = 'size-5') => {
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

const getVerificationStatusInfo = (status: DocumentVerificationStatus) => {
  switch (status) {
    case 'verified':
      return {
        icon: <CheckCircle className="size-4" />,
        label: 'Verified',
        className: 'bg-green-500/20 text-green-400 border-green-500/30'
      };
    case 'rejected':
      return {
        icon: <XCircle className="size-4" />,
        label: 'Rejected',
        className: 'bg-red-500/20 text-red-400 border-red-500/30'
      };
    default:
      return {
        icon: <Clock className="size-4" />,
        label: 'Pending',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      };
  }
};

const EXPERIENCE_OPTIONS = [
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 4, label: '4 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: '6 years' },
  { value: 7, label: '7 years' },
  { value: 8, label: '8 years' },
  { value: 9, label: '9 years' },
  { value: 10, label: '10+ years' },
];

const MAX_MENTEES_OPTIONS = [
  { value: 1, label: '1 student' },
  { value: 2, label: '2 students' },
  { value: 3, label: '3 students' },
  { value: 5, label: '5 students' },
  { value: 10, label: '10 students' },
  { value: 20, label: '20 students' },
  { value: 50, label: '50+ students' },
];

const mentorProfileSchema = z.object({
  headline: z.string().min(10, 'Headline must be at least 10 characters').max(100, 'Headline must be less than 100 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must be less than 1000 characters'),
  yearsExperience: z.number().min(1, 'Please select your experience'),
  maxMentees: z.number().min(1, 'Please select max students'),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  isAcceptingMentees: z.boolean(),
});

type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;

export default function MentorProfilePage() {
  const router = useRouter();
  const { refreshUser } = useUserStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<IMentorProfile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  
  const [expertise, setExpertise] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  
  const [newExpertise, setNewExpertise] = useState<string>('');
  const [newSkill, setNewSkill] = useState<string>('');
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('');

  const [documents, setDocuments] = useState<IMentorDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<MentorDocumentType>('certificate');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadYear, setUploadYear] = useState<string>('');
  const [uploadOrganization, setUploadOrganization] = useState<string>('');
  const pondRef = useRef<FilePond | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingDocument, setEditingDocument] = useState<IMentorDocument | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [editType, setEditType] = useState<MentorDocumentType>('certificate');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editYear, setEditYear] = useState<string>('');
  const [editOrganization, setEditOrganization] = useState<string>('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] = useState<IMentorDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      yearsExperience: 1,
      maxMentees: 5,
      isAcceptingMentees: true
    }
  });

  const selectedExperience = watch('yearsExperience');
  const selectedMaxMentees = watch('maxMentees');
  const isAcceptingMentees = watch('isAcceptingMentees');

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoadingDocuments(true);
      const docs = await mentorService.getMyDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await mentorService.getMyProfile();
        setProfile(data);
        setHasProfile(true);
        
        reset({
          headline: data.headline || '',
          bio: data.bio || '',
          yearsExperience: data.yearsExperience || 1,
          maxMentees: data.maxMentees || 5,
          linkedinUrl: data.linkedinUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          isAcceptingMentees: data.isAcceptingMentees ?? true,
        });
        
        setExpertise(data.expertise || []);
        setSkills(data.skills || []);
        setIndustries(data.industries || []);
        setLanguages(data.languages || []);

        fetchDocuments();
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to fetch mentor profile';

        const normalized = errorMessage.toLowerCase();
        if (normalized.includes('forbidden')) {
          try {
            await refreshUser();
          } catch (refreshError) {
            console.error('Failed to refresh user after forbidden:', refreshError);
          }
          router.replace('/mentor/applications');
          return;
        }

        toast.error('Failed to fetch mentor profile', {
          description: errorMessage,
        });
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset, fetchDocuments, refreshUser, router]);

  const addItem = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      listSetter([...list, trimmed]);
      setter('');
    }
  };

  const removeItem = (
    item: string,
    list: string[],
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    listSetter(list.filter(i => i !== item));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(value, setter, list, listSetter);
    }
  };

  const onSubmit = async (data: MentorProfileFormData) => {
    if (expertise.length === 0) {
      toast.error('Please add at least one area of expertise');
      return;
    }
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    if (languages.length === 0) {
      toast.error('Please add at least one language');
      return;
    }

    try {
      setIsSaving(true);

      const requestData: IUpdateMentorProfileRequest = {
        headline: data.headline,
        bio: data.bio,
        expertise,
        skills,
        industries,
        languages,
        yearsExperience: data.yearsExperience,
        maxMentees: data.maxMentees,
        linkedinUrl: data.linkedinUrl || undefined,
        portfolioUrl: data.portfolioUrl || undefined,
        isAcceptingMentees: data.isAcceptingMentees
      };

      const updatedProfile = await mentorService.updateMyProfile(requestData);
      setProfile(updatedProfile);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update profile';
      toast.error('Failed to update profile', {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      await mentorService.uploadMyDocument({
        file: uploadFile,
        type: uploadType,
        title: uploadTitle || undefined,
        description: uploadDescription || undefined,
        issuedYear: uploadYear ? parseInt(uploadYear) : undefined,
        issuingOrganization: uploadOrganization || undefined,
      });
      
      toast.success('Document uploaded successfully');
      setIsUploadDialogOpen(false);
      resetUploadForm();
      fetchDocuments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadType('certificate');
    setUploadTitle('');
    setUploadDescription('');
    setUploadYear('');
    setUploadOrganization('');
    if (pondRef.current) {
      pondRef.current.removeFiles();
    }
  };
  const openEditDialog = (doc: IMentorDocument) => {
    setEditingDocument(doc);
    setEditType(doc.type);
    setEditTitle(doc.title || '');
    setEditDescription(doc.description || '');
    setEditYear(doc.issuedYear?.toString() || '');
    setEditOrganization(doc.issuingOrganization || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;

    try {
      setIsUpdating(true);
      await mentorService.updateMyDocument(editingDocument.id, {
        type: editType,
        title: editTitle || undefined,
        description: editDescription || undefined,
        issuedYear: editYear ? parseInt(editYear) : undefined,
        issuingOrganization: editOrganization || undefined,
      });
      
      toast.success('Document updated successfully');
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update document';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      await mentorService.deleteMyDocument(documentToDelete.id);
      
      toast.success('Document deleted successfully');
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-12 pb-16 flex flex-col items-center justify-center">
        <Skeleton className="h-16 w-80 mb-8 bg-neutral-800" />
        <Skeleton className="h-8 w-lg bg-neutral-800" />
        <div className="w-232 space-y-8 mt-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-44 bg-neutral-800" />
              <Skeleton className="h-20 w-full bg-neutral-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="size-24 rounded-full bg-neutral-800 flex items-center justify-center mb-8">
          <AlertCircle className="size-12 text-neutral-400" />
        </div>
        <h1 className="text-5xl font-bold mb-5">No Mentor Profile</h1>
        <p className="text-2xl text-neutral-500 text-center max-w-2xl mb-10">
          You don&apos;t have a mentor profile yet. To become a mentor, you need to submit an application first.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/mentor/applications')}
            className="h-14! text-lg!"
          >
            View My Application
          </Button>
          <Button
            onClick={() => router.push('/mentor')}
            className="h-14! text-lg!"
          >
            Apply to Become a Mentor
            <GraduationCap className="size-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <div className="flex items-center gap-5 mb-8">
        <div className="size-20 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
          <GraduationCap className="size-10 text-neutral-300" />
        </div>
        <div>
          <h1 className="text-5xl font-bold">Mentor Profile</h1>
          <p className="text-xl text-neutral-500">Manage your public mentor profile</p>
        </div>
      </div>

      <div className="w-232 flex items-center justify-between mb-8 p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl">
        <div className="flex items-center gap-4">
          {isAcceptingMentees ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 py-2 px-4 text-base">
              Accepting Students
            </Badge>
          ) : (
            <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30 py-2 px-4 text-base">
              Not Accepting
            </Badge>
          )}
          <span className="text-lg text-neutral-400">Toggle to change availability</span>
        </div>
        <div className="flex items-center gap-4">
          <Switch
            checked={isAcceptingMentees}
            onCheckedChange={(checked) => setValue('isAcceptingMentees', checked)}
          />
          <Button
            variant="outline"
            onClick={() => router.push(`/mentors/${profile?.id}`)}
            className="h-11! text-base!"
          >
            View Public
            <Eye className="size-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-232 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="headline" className="text-xl">
            Professional Headline <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('headline')}
            placeholder="e.g., Senior Software Engineer at Google | 8+ Years in Cloud Architecture"
            className="w-full h-20! text-xl! px-6!"
          />
          {errors.headline && (
            <p className="text-red-500 text-lg">{errors.headline.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="bio" className="text-xl">
            Bio <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('bio')}
            placeholder="Tell potential students about yourself, your background, and mentoring style..."
            className="w-full min-h-[160px] text-lg! px-6! py-5!"
          />
          {errors.bio && (
            <p className="text-red-500 text-lg">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-7">
          <div className="space-y-3">
            <Label className="text-xl">
              Years of Experience <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={String(selectedExperience)} 
              onValueChange={(value) => setValue('yearsExperience', Number(value))}
            >
              <SelectTrigger className="w-full h-20! text-xl! px-6!">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="text-xl!">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.yearsExperience && (
              <p className="text-red-500 text-lg">{errors.yearsExperience.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xl">
              Max Students <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={String(selectedMaxMentees)} 
              onValueChange={(value) => setValue('maxMentees', Number(value))}
            >
              <SelectTrigger className="w-full h-20! text-xl! px-6!">
                <SelectValue placeholder="Select max students" />
              </SelectTrigger>
              <SelectContent>
                {MAX_MENTEES_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="text-xl!">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maxMentees && (
              <p className="text-red-500 text-lg">{errors.maxMentees.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xl">
              Languages <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2.5">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, newLanguage, setNewLanguage, languages, setLanguages)}
                placeholder="Add language..."
                className="flex-1 h-20! text-xl! px-6!"
              />
              <Button 
                type="button"
                variant="outline"
                onClick={() => addItem(newLanguage, setNewLanguage, languages, setLanguages)}
                className="size-20!"
              >
                <Plus className="size-7" />
              </Button>
            </div>
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="py-2 px-4 text-lg">
                    {lang}
                    <button type="button" onClick={() => removeItem(lang, languages, setLanguages)} className="ml-2">
                      <X className="size-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        <div className="space-y-3">
          <Label className="text-xl">
            Areas of Expertise <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2.5">
            <Input
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, newExpertise, setNewExpertise, expertise, setExpertise)}
              placeholder="e.g., Software Engineering, Cloud Architecture, Data Science..."
              className="flex-1 h-20! text-xl! px-6!"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => addItem(newExpertise, setNewExpertise, expertise, setExpertise)}
              className="size-20!"
            >
              <Plus className="size-7" />
            </Button>
          </div>
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {expertise.map((item) => (
                <Badge key={item} variant="secondary" className="py-2 px-4 text-lg">
                  {item}
                  <button type="button" onClick={() => removeItem(item, expertise, setExpertise)} className="ml-2">
                    <X className="size-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-xl">
            Skills <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2.5">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, newSkill, setNewSkill, skills, setSkills)}
              placeholder="e.g., JavaScript, Python, Leadership, System Design..."
              className="flex-1 h-20! text-xl! px-6!"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => addItem(newSkill, setNewSkill, skills, setSkills)}
              className="size-20!"
            >
              <Plus className="size-7" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="py-2 px-4 text-lg">
                  {skill}
                  <button type="button" onClick={() => removeItem(skill, skills, setSkills)} className="ml-2">
                    <X className="size-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-xl">Industries</Label>
          <div className="flex gap-2.5">
            <Input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, newIndustry, setNewIndustry, industries, setIndustries)}
              placeholder="e.g., FinTech, Healthcare, E-commerce..."
              className="flex-1 h-20! text-xl! px-6!"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => addItem(newIndustry, setNewIndustry, industries, setIndustries)}
              className="size-20!"
            >
              <Plus className="size-7" />
            </Button>
          </div>
          {industries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {industries.map((industry) => (
                <Badge key={industry} variant="secondary" className="py-2 px-4 text-lg">
                  {industry}
                  <button type="button" onClick={() => removeItem(industry, industries, setIndustries)} className="ml-2">
                    <X className="size-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-neutral-800" />

        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-3">
            <Label htmlFor="linkedinUrl" className="text-xl">
              LinkedIn Profile
            </Label>
            <Input
              {...register('linkedinUrl')}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full h-20! text-xl! px-6!"
            />
            {errors.linkedinUrl && (
              <p className="text-red-500 text-lg">{errors.linkedinUrl.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="portfolioUrl" className="text-xl">
              Portfolio / Website
            </Label>
            <Input
              {...register('portfolioUrl')}
              placeholder="https://yourportfolio.com"
              className="w-full h-20! text-xl! px-6!"
            />
            {errors.portfolioUrl && (
              <p className="text-red-500 text-lg">{errors.portfolioUrl.message}</p>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSaving}
          className="w-full h-16! text-xl!"
        >
          {isSaving ? (
            <>
              Saving changes...
              <Loader2 className="size-6 animate-spin" />
            </>
          ) : (
            <>
              Save Profile
              <Save className="size-7" />
            </>
          )}
        </Button>
      </form>

      <div className="w-232 mt-12">
        <Separator className="bg-neutral-800 mb-10" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">My Credentials</h2>
              <p className="text-lg text-neutral-400">Documents shown on your public profile</p>
            </div>
          </div>
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="h-12! text-base!"
          >
            Upload Document
            <Plus className="size-5" />
          </Button>
        </div>

        {isLoadingDocuments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                <div className="flex items-start gap-4">
                  <Skeleton className="size-14 rounded-xl bg-neutral-800" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-40 bg-neutral-800" />
                    <Skeleton className="h-5 w-24 bg-neutral-800" />
                    <Skeleton className="h-4 w-32 bg-neutral-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/30 rounded-xl border border-neutral-800">
            <File className="size-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Documents Yet</h3>
            <p className="text-lg text-neutral-400 mb-6">
              Upload documents to strengthen your profile and build trust with students
            </p>
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              className="h-12! text-base!"
            >
              Upload Document
              <Plus className="size-5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center">
                <p className="text-4xl font-bold mb-1">{documents.length}</p>
                <p className="text-base text-neutral-400">Total</p>
              </div>
              <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center">
                <p className="text-4xl font-bold text-white mb-1">
                  {documents.filter(d => d.verificationStatus === 'verified').length}
                </p>
                <p className="text-base text-neutral-400">Verified</p>
              </div>
              <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center">
                <p className="text-4xl font-bold text-white mb-1">
                  {documents.filter(d => d.verificationStatus === 'pending').length}
                </p>
                <p className="text-base text-neutral-400">Pending</p>
              </div>
              <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center">
                <p className="text-4xl font-bold text-white mb-1">
                  {documents.filter(d => d.verificationStatus === 'rejected').length}
                </p>
                <p className="text-base text-neutral-400">Rejected</p>
              </div>
            </div>

            <div className={`grid gap-4 ${documents.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {documents.map((doc) => {
                const statusInfo = getVerificationStatusInfo(doc.verificationStatus);
                return (
                  <div 
                    key={doc.id}
                    className="group p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-14 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 group-hover:border-neutral-600 transition-colors">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 -mb-2">
                          <h4 className="text-lg font-semibold truncate">
                            {doc.title || doc.originalFilename}
                          </h4>
                          <Badge className={`shrink-0 py-2 px-4 text-base ${statusInfo.className}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-base text-neutral-400 capitalize mb-2">
                          {doc.type}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                          {doc.issuingOrganization && (
                            <span>{doc.issuingOrganization}</span>
                          )}
                          {doc.issuedYear && (
                            <>
                              {doc.issuingOrganization && <span>•</span>}
                              <span>{doc.issuedYear}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-base">{formatFileSize(doc.fileSize)}</span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-neutral-400 mt-3 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-11! text-lg!"
                          onClick={() => openEditDialog(doc)}
                        >
                          Edit
                          <Edit2 className="size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-11! text-lg! text-red-500 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      {doc.downloadUrl && (
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-11! text-lg!">
                            Download
                            <Download className="size-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-lg text-neutral-500 text-center mt-6">
              Only verified documents are shown on your public profile.
            </p>
          </>
        )}
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">Upload Document</DialogTitle>
            <DialogDescription className="text-base">
              Add a new document to strengthen your profile
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-5 p-6 pt-4">
              <div className="filepond-wrapper">
                <FilePond
                  ref={pondRef}
                  files={uploadFile ? [uploadFile] : []}
                  onupdatefiles={(fileItems) => {
                    const file = fileItems[0]?.file as File | undefined;
                    setUploadFile(file || null);
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
                  labelIdle='<span class="filepond--label-action">Browse</span> or drag & drop'
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
                <Label className="text-lg">Document Type</Label>
                <Select value={uploadType} onValueChange={(v) => setUploadType(v as MentorDocumentType)}>
                  <SelectTrigger className="h-14! text-lg!">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-lg!">
                        <div className="flex items-center gap-2">
                          {getDocumentIconByName(type.iconName)}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Title (Optional)</Label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., AWS Solutions Architect"
                  className="h-14! text-lg!"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <Label className="text-lg">Issued Year</Label>
                  <Input
                    type="number"
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    placeholder="2024"
                    className="h-14! text-lg!"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Organization</Label>
                  <Input
                    value={uploadOrganization}
                    onChange={(e) => setUploadOrganization(e.target.value)}
                    placeholder="e.g., Amazon"
                    className="h-14! text-lg!"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Description (Optional)</Label>
                <Textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description of this document..."
                  className="min-h-[100px] text-lg!"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 p-6 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                resetUploadForm();
              }}
              className="flex-1 h-12! text-base!"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadDocument}
              disabled={!uploadFile || isUploading}
              className="flex-1 h-12! text-base!"
            >
              {isUploading ? (
                <>
                  Uploading...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                <>
                  Upload
                  <Plus className="size-5" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">Edit Document</DialogTitle>
            <DialogDescription className="text-base">
              Update document information
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-5 p-6 pt-4">
              <div className="space-y-3">
                <Label className="text-lg">Document Type</Label>
                <Select value={editType} onValueChange={(v) => setEditType(v as MentorDocumentType)}>
                  <SelectTrigger className="h-14! text-lg!">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-lg!">
                        <div className="flex items-center gap-2">
                          {getDocumentIconByName(type.iconName)}
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
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g., AWS Solutions Architect"
                  className="h-14! text-lg!"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <Label className="text-lg">Issued Year</Label>
                  <Input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="2024"
                    className="h-14! text-lg!"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg">Organization</Label>
                  <Input
                    value={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    placeholder="e.g., Amazon"
                    className="h-14! text-lg!"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief description of this document..."
                  className="min-h-[100px] text-lg!"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 p-6 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingDocument(null);
              }}
              className="flex-1 h-12! text-base!"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDocument}
              disabled={isUpdating}
              className="flex-1 h-12! text-base!"
            >
              {isUpdating ? (
                <>
                  Saving...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                <>
                  Save Changes
                  <Save className="size-5" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Document</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete &quot;{documentToDelete?.title || documentToDelete?.originalFilename}&quot;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  Deleting...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}