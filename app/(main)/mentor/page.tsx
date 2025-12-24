'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import {
  Send,
  Loader2,
  Plus,
  X,
  GraduationCap,
  FileText,
  Clock,
  Award,
  Briefcase,
  File,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import { useUserStore } from '@/stores';
import { USER_ROLES, DOCUMENT_TYPES } from '@/constants';
import { formatFileSize } from '@/lib';
import type {
  ICreateMentorApplicationRequest,
  IMentorApplication,
  MentorApplicationStatus,
  MentorDocumentType,
} from '@/types';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
);

interface PendingDocument {
  id: string;
  file: File;
  type: MentorDocumentType;
  title: string;
}

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

const getDocumentTypeIcon = (type: MentorDocumentType) => {
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

const mentorApplicationSchema = z.object({
  headline: z
    .string()
    .min(10, 'Headline must be at least 10 characters')
    .max(100, 'Headline must be less than 100 characters'),
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must be less than 1000 characters'),
  yearsExperience: z.number().min(1, 'Please select your experience'),
  linkedinUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  motivation: z
    .string()
    .min(50, 'Motivation must be at least 50 characters')
    .max(1000, 'Motivation must be less than 1000 characters'),
});

type MentorApplicationFormData = z.infer<typeof mentorApplicationSchema>;

export default function MentorApplicationPage() {
  const router = useRouter();
  const { user, isInitialized } = useUserStore();
  const pondRef = useRef<FilePond | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingApplication, setIsCheckingApplication] =
    useState<boolean>(true);
  const [existingApplication, setExistingApplication] =
    useState<IMentorApplication | null>(null);

  const [expertise, setExpertise] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [newExpertise, setNewExpertise] = useState<string>('');
  const [newSkill, setNewSkill] = useState<string>('');
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('');

  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
    []
  );
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentDocType, setCurrentDocType] =
    useState<MentorDocumentType>('certificate');
  const [currentDocTitle, setCurrentDocTitle] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MentorApplicationFormData>({
    resolver: zodResolver(mentorApplicationSchema),
    defaultValues: {
      yearsExperience: 1,
    },
  });

  const selectedExperience = watch('yearsExperience');

  useEffect(() => {
    if (!isInitialized) return;

    if (user?.role === USER_ROLES.MENTOR) {
      router.replace('/mentor/applications');
      return;
    }

    const checkExistingApplication = async () => {
      try {
        setIsCheckingApplication(true);
        const applications = await mentorService.getMyApplications();

        const pendingOrUnderReview = applications.find((app) =>
          ['pending', 'under_review', 'flagged'].includes(app.status)
        );

        if (pendingOrUnderReview) {
          setExistingApplication(pendingOrUnderReview);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to check existing applications';
        toast.error('Failed to check existing applications', {
          description: errorMessage,
        });
      } finally {
        setIsCheckingApplication(false);
      }
    };

    checkExistingApplication();
  }, [isInitialized, user?.role, router]);

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
    listSetter(list.filter((i) => i !== item));
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

  const addDocument = () => {
    if (!currentFile) {
      toast.error('Please select a file first');
      return;
    }

    const newDoc: PendingDocument = {
      id: crypto.randomUUID(),
      file: currentFile,
      type: currentDocType,
      title: currentDocTitle || currentFile.name,
    };

    setPendingDocuments((prev) => [...prev, newDoc]);
    setCurrentFile(null);
    setCurrentDocType('certificate');
    setCurrentDocTitle('');
    if (pondRef.current) {
      pondRef.current.removeFiles();
    }
  };

  const removeDocument = (id: string) => {
    setPendingDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const onSubmit = async (data: MentorApplicationFormData) => {
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
      setIsLoading(true);

      const requestData: ICreateMentorApplicationRequest = {
        headline: data.headline,
        bio: data.bio,
        expertise,
        skills,
        industries,
        languages,
        yearsExperience: data.yearsExperience,
        linkedinUrl: data.linkedinUrl || undefined,
        portfolioUrl: data.portfolioUrl || undefined,
        motivation: data.motivation,
      };

      if (pendingDocuments.length > 0) {
        setUploadProgress(
          `Submitting application with ${pendingDocuments.length} document(s)...`
        );

        const documentsData = pendingDocuments.map((doc) => ({
          file: doc.file,
          type: doc.type,
          title: doc.title,
        }));

        const application = await mentorService.createApplicationWithDocuments(
          requestData,
          documentsData
        );

        if (application.uploadSummary && application.uploadSummary.failed > 0) {
          toast.warning(
            `Application submitted but ${application.uploadSummary.failed} of ${application.uploadSummary.total} document(s) failed`,
            {
              description:
                'You can upload them later from your application page.',
              duration: 5000,
            }
          );
        } else {
          toast.success(
            `Application submitted successfully with ${pendingDocuments.length} document(s)!`,
            {
              description: 'Your application is now pending review.',
            }
          );
        }
      } else {
        await mentorService.createApplication(requestData);
        toast.success('Application submitted successfully!', {
          description: 'Your application is now pending review.',
        });
      }

      router.push('/mentor/applications');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit application';
      toast.error('Failed to submit application', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  const getStatusBadge = (status: MentorApplicationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="border-yellow-500/30 bg-yellow-500/20 px-4 py-2 text-base text-yellow-400">
            Pending Review
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="border-blue-500/30 bg-blue-500/20 px-4 py-2 text-base text-blue-400">
            Under Review
          </Badge>
        );
      case 'flagged':
        return (
          <Badge className="border-orange-500/30 bg-orange-500/20 px-4 py-2 text-base text-orange-400">
            Under Review
          </Badge>
        );
      default:
        return null;
    }
  };

  if (
    isCheckingApplication ||
    !isInitialized ||
    user?.role === USER_ROLES.MENTOR
  ) {
    return (
      <div className="absolute inset-0 flex size-full flex-col items-center justify-center">
        <Loader2 className="size-16 animate-spin text-neutral-400" />
        <p className="mt-5 text-2xl text-neutral-400">
          Checking application status...
        </p>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="flex flex-col items-center justify-center pt-48">
        <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-neutral-800">
          <GraduationCap className="size-12 text-neutral-400" />
        </div>
        <h1 className="mb-5 text-5xl font-bold">Application In Progress</h1>
        <p className="mb-8 max-w-2xl text-center text-2xl text-neutral-500">
          You already have a mentor application that is currently being
          reviewed. You cannot submit a new application until the current one is
          processed.
        </p>
        <div className="mb-10">
          {getStatusBadge(existingApplication.status)}
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/mentor/applications')}
            className="h-14! text-lg!"
          >
            View My Application
            <FileText className="size-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-16">
      <h1 className="mb-8 text-6xl font-bold">Become a Mentor</h1>
      <p className="max-w-2xl text-center text-2xl text-neutral-500">
        Share your expertise and help others grow. Fill out the application
        below to join our mentor community.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 w-232 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="headline" className="text-xl">
            Professional Headline <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('headline')}
            placeholder="e.g., Senior Software Engineer at Google | 8+ Years in Cloud Architecture"
            className="h-20! w-full px-6! text-xl!"
          />
          {errors.headline && (
            <p className="text-lg text-red-500">{errors.headline.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="bio" className="text-xl">
            Bio <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('bio')}
            placeholder="Tell us about yourself, your background, and what makes you a great mentor..."
            className="min-h-[160px] w-full px-6! py-5! text-lg!"
          />
          {errors.bio && (
            <p className="text-lg text-red-500">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-3">
            <Label className="text-xl">
              Years of Experience <span className="text-red-500">*</span>
            </Label>
            <Select
              value={String(selectedExperience)}
              onValueChange={(value) =>
                setValue('yearsExperience', Number(value))
              }
            >
              <SelectTrigger className="h-20! w-full px-6! text-xl!">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={String(option.value)}
                    className="text-xl!"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.yearsExperience && (
              <p className="text-lg text-red-500">
                {errors.yearsExperience.message}
              </p>
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
                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    newLanguage,
                    setNewLanguage,
                    languages,
                    setLanguages
                  )
                }
                placeholder="Add language..."
                className="h-20! flex-1 px-6! text-xl!"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addItem(newLanguage, setNewLanguage, languages, setLanguages)
                }
                className="size-20!"
              >
                <Plus className="size-7" />
              </Button>
            </div>
            {languages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="px-4 py-2 text-lg"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeItem(lang, languages, setLanguages)}
                      className="ml-2 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xl">
            Areas of Expertise <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2.5">
            <Input
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  newExpertise,
                  setNewExpertise,
                  expertise,
                  setExpertise
                )
              }
              placeholder="e.g., Software Engineering, Cloud Architecture, Data Science..."
              className="h-20! flex-1 px-6! text-xl!"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addItem(newExpertise, setNewExpertise, expertise, setExpertise)
              }
              className="size-20!"
            >
              <Plus className="size-7" />
            </Button>
          </div>
          {expertise.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {expertise.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="px-4 py-2 text-lg"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem(item, expertise, setExpertise)}
                    className="ml-2 cursor-pointer"
                  >
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
              onKeyDown={(e) =>
                handleKeyDown(e, newSkill, setNewSkill, skills, setSkills)
              }
              placeholder="e.g., JavaScript, Python, Leadership, System Design..."
              className="h-20! flex-1 px-6! text-xl!"
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
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-4 py-2 text-lg"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeItem(skill, skills, setSkills)}
                    className="ml-2 cursor-pointer"
                  >
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
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  newIndustry,
                  setNewIndustry,
                  industries,
                  setIndustries
                )
              }
              placeholder="e.g., FinTech, Healthcare, E-commerce..."
              className="h-20! flex-1 px-6! text-xl!"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addItem(newIndustry, setNewIndustry, industries, setIndustries)
              }
              className="size-20!"
            >
              <Plus className="size-7" />
            </Button>
          </div>
          {industries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge
                  key={industry}
                  variant="secondary"
                  className="px-4 py-2 text-lg"
                >
                  {industry}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(industry, industries, setIndustries)
                    }
                    className="ml-2 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-3">
            <Label htmlFor="linkedinUrl" className="text-xl">
              LinkedIn Profile
            </Label>
            <Input
              {...register('linkedinUrl')}
              placeholder="https://linkedin.com/in/yourprofile"
              className="h-20! w-full px-6! text-xl!"
            />
            {errors.linkedinUrl && (
              <p className="text-lg text-red-500">
                {errors.linkedinUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="portfolioUrl" className="text-xl">
              Portfolio / Website
            </Label>
            <Input
              {...register('portfolioUrl')}
              placeholder="https://yourportfolio.com"
              className="h-20! w-full px-6! text-xl!"
            />
            {errors.portfolioUrl && (
              <p className="text-lg text-red-500">
                {errors.portfolioUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="motivation" className="text-xl">
            Why do you want to become a mentor?{' '}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('motivation')}
            placeholder="Share your motivation for becoming a mentor and how you plan to help students..."
            className="min-h-[160px] w-full px-6! py-5! text-lg!"
          />
          {errors.motivation && (
            <p className="text-lg text-red-500">{errors.motivation.message}</p>
          )}
        </div>

        <div className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
          <div>
            <Label className="flex items-center gap-2 text-xl">
              <FileText className="size-6" />
              Supporting Documents
            </Label>
            <p className="mt-2 text-lg text-neutral-400">
              Upload certificates, awards, or portfolio items to strengthen your
              application (optional)
            </p>
          </div>

          <div className="space-y-4">
            <div className="filepond-wrapper">
              <FilePond
                ref={pondRef}
                files={currentFile ? [currentFile] : []}
                onupdatefiles={(fileItems) => {
                  const file = fileItems[0]?.file as File | undefined;
                  setCurrentFile(file || null);
                }}
                allowMultiple={false}
                maxFiles={1}
                maxFileSize="5MB"
                acceptedFileTypes={[
                  'image/jpeg',
                  'image/png',
                  'image/gif',
                  'image/webp',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-powerpoint',
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'application/vnd.oasis.opendocument.text',
                  'application/vnd.oasis.opendocument.spreadsheet',
                  'application/vnd.oasis.opendocument.presentation',
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-lg">Document Type</Label>
                <Select
                  value={currentDocType}
                  onValueChange={(value) =>
                    setCurrentDocType(value as MentorDocumentType)
                  }
                >
                  <SelectTrigger className="h-14! text-lg!">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="text-lg!"
                      >
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(type.iconName)}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-lg">Title (Optional)</Label>
                <Input
                  value={currentDocTitle}
                  onChange={(e) => setCurrentDocTitle(e.target.value)}
                  placeholder="e.g., AWS Certificate"
                  className="h-14! text-lg!"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addDocument}
              disabled={!currentFile}
              className="h-14! w-full text-lg!"
            >
              Add Document
              <Plus className="size-5" />
            </Button>
          </div>

          {pendingDocuments.length > 0 && (
            <div className="space-y-3 border-t border-neutral-800 pt-4">
              <p className="text-lg font-medium text-neutral-300">
                Documents to upload ({pendingDocuments.length})
              </p>
              {pendingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-700/50 bg-neutral-800/50 p-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-neutral-700/50">
                    {getDocumentTypeIcon(doc.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-medium">{doc.title}</p>
                    <div className="flex items-center gap-2 text-base text-neutral-400">
                      <span className="capitalize">{doc.type}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file.size)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 text-red-500 hover:text-red-400 dark:hover:bg-red-500/10"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-16! w-full text-xl!"
        >
          {isLoading ? (
            <>
              {uploadProgress || 'Submitting application...'}
              <Loader2 className="size-6 animate-spin" />
            </>
          ) : (
            <>
              Submit Application
              <Send className="size-7" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
