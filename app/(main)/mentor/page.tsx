'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, Plus, X, GraduationCap, FileText, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import { useUserStore } from '@/stores';
import { USER_ROLES } from '@/constants';
import type { ICreateMentorApplicationRequest, IMentorApplication, MentorApplicationStatus } from '@/types';

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
  SelectContent 
} from '@/components/ui/select';

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
  headline: z.string().min(10, 'Headline must be at least 10 characters').max(100, 'Headline must be less than 100 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must be less than 1000 characters'),
  yearsExperience: z.number().min(1, 'Please select your experience'),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  motivation: z.string().min(50, 'Motivation must be at least 50 characters').max(1000, 'Motivation must be less than 1000 characters'),
});

type MentorApplicationFormData = z.infer<typeof mentorApplicationSchema>;

export default function MentorApplicationPage() {
  const router = useRouter();
  const { user, isInitialized } = useUserStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState<boolean>(true);
  const [existingApplication, setExistingApplication] = useState<IMentorApplication | null>(null);
  
  const [expertise, setExpertise] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  
  const [newExpertise, setNewExpertise] = useState<string>('');
  const [newSkill, setNewSkill] = useState<string>('');
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MentorApplicationFormData>({
    resolver: zodResolver(mentorApplicationSchema),
    defaultValues: {
      yearsExperience: 1
    }
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
        
        const pendingOrUnderReview = applications.find(
          app => ['pending', 'under_review', 'flagged'].includes(app.status)
        );
        
        if (pendingOrUnderReview) {
          setExistingApplication(pendingOrUnderReview);
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
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
        motivation: data.motivation
      };

      await mentorService.createApplication(requestData);
      
      toast.success('Application submitted successfully!');
      router.push('/mentor/applications');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit application';
      toast.error('Failed to submit application', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: MentorApplicationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="px-4 py-2 text-base bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending Review
            <Clock className="size-4" />
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="px-4 py-2 text-base bg-blue-500/20 text-blue-400 border-blue-500/30">
            Under Review
          </Badge>
        );
      case 'flagged':
        return (
          <Badge className="px-4 py-2 text-base bg-orange-500/20 text-orange-400 border-orange-500/30">
            Under Review
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isCheckingApplication || !isInitialized || user?.role === USER_ROLES.MENTOR) {
    return (
      <div className="absolute inset-0 size-full flex flex-col items-center justify-center">
        <Loader2 className="size-16 animate-spin text-neutral-400" />
        <p className="mt-5 text-2xl text-neutral-400">Checking application status...</p>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="pt-48 flex flex-col items-center justify-center">
        <div className="size-24 rounded-full bg-neutral-800 flex items-center justify-center mb-8">
          <GraduationCap className="size-12 text-neutral-400" />
        </div>
        <h1 className="text-5xl font-bold mb-5">Application In Progress</h1>
        <p className="text-2xl text-neutral-500 text-center max-w-2xl mb-8">
          You already have a mentor application that is currently being reviewed. 
          You cannot submit a new application until the current one is processed.
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
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-8">Become a Mentor</h1>
      <p className="text-2xl text-neutral-500 text-center max-w-2xl">
        Share your expertise and help others grow. Fill out the application below to join our mentor community.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-232 space-y-8 mt-10">
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
            placeholder="Tell us about yourself, your background, and what makes you a great mentor..."
            className="w-full min-h-[160px] text-lg! px-6! py-5!"
          />
          {errors.bio && (
            <p className="text-red-500 text-lg">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-7">
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
                    <button type="button" onClick={() => removeItem(lang, languages, setLanguages)} className="ml-2 cursor-pointer">
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
                  <button type="button" onClick={() => removeItem(item, expertise, setExpertise)} className="ml-2 cursor-pointer">
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
                  <button type="button" onClick={() => removeItem(skill, skills, setSkills)} className="ml-2 cursor-pointer">
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
                  <button type="button" onClick={() => removeItem(industry, industries, setIndustries)} className="ml-2 cursor-pointer">
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

        <div className="space-y-3">
          <Label htmlFor="motivation" className="text-xl">
            Why do you want to become a mentor? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('motivation')}
            placeholder="Share your motivation for becoming a mentor and how you plan to help mentees..."
            className="w-full min-h-[160px] text-lg! px-6! py-5!"
          />
          {errors.motivation && (
            <p className="text-red-500 text-lg">{errors.motivation.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-16! text-xl!"
        >
          {isLoading ? (
            <>
              Submitting application...
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