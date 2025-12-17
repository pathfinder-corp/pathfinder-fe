'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, Plus, X, GraduationCap, FileText, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
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
        console.error('Failed to check existing applications:', error);
      } finally {
        setIsCheckingApplication(false);
      }
    };

    checkExistingApplication();
  }, []);

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
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: MentorApplicationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="size-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <FileText className="size-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'flagged':
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <AlertCircle className="size-3 mr-1" />
            Under Review
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isCheckingApplication) {
    return (
      <div className="pt-10 flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
        <p className="mt-4 text-neutral-400">Checking application status...</p>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="pt-10 flex flex-col items-center justify-center">
        <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
          <GraduationCap className="size-10 text-neutral-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Application In Progress</h1>
        <p className="text-xl text-neutral-500 text-center max-w-xl mb-6">
          You already have a mentor application that is currently being reviewed. 
          You cannot submit a new application until the current one is processed.
        </p>
        <div className="mb-8">
          {getStatusBadge(existingApplication.status)}
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/mentor/applications')}
            className="!h-12 !text-base"
          >
            <FileText className="size-5 mr-2" />
            View My Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">Become a Mentor</h1>
      <p className="text-xl text-neutral-500 text-center max-w-2xl">
        Share your expertise and help others grow. Fill out the application below to join our mentor community.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-[58rem] space-y-7 mt-8">
        <div className="space-y-[.65rem]">
          <Label htmlFor="headline" className="text-[1.35rem]">
            Professional Headline <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('headline')}
            placeholder="e.g., Senior Software Engineer at Google | 8+ Years in Cloud Architecture"
            className="w-full !h-18 !text-[1.25rem] !px-5"
          />
          {errors.headline && (
            <p className="text-red-500 text-[1rem]">{errors.headline.message}</p>
          )}
        </div>

        <div className="space-y-[.65rem]">
          <Label htmlFor="bio" className="text-[1.35rem]">
            Bio <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('bio')}
            placeholder="Tell us about yourself, your background, and what makes you a great mentor..."
            className="w-full min-h-[140px] !text-[1.15rem] !px-5 !py-4"
          />
          {errors.bio && (
            <p className="text-red-500 text-[1rem]">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-[.65rem]">
            <Label className="text-[1.35rem]">
              Years of Experience <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={String(selectedExperience)} 
              onValueChange={(value) => setValue('yearsExperience', Number(value))}
            >
              <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="!text-[1.25rem]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.yearsExperience && (
              <p className="text-red-500 text-[1rem]">{errors.yearsExperience.message}</p>
            )}
          </div>

          <div className="space-y-[.65rem]">
            <Label className="text-[1.35rem]">
              Languages <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, newLanguage, setNewLanguage, languages, setLanguages)}
                placeholder="Add language..."
                className="flex-1 !h-18 !text-[1.25rem] !px-5"
              />
              <Button 
                type="button"
                variant="outline"
                onClick={() => addItem(newLanguage, setNewLanguage, languages, setLanguages)}
                className="!h-18 !w-18"
              >
                <Plus className="size-6" />
              </Button>
            </div>
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="py-1.5 px-3 text-base">
                    {lang}
                    <button type="button" onClick={() => removeItem(lang, languages, setLanguages)} className="ml-2 cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-[.65rem]">
          <Label className="text-[1.35rem]">
            Areas of Expertise <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, newExpertise, setNewExpertise, expertise, setExpertise)}
              placeholder="e.g., Software Engineering, Cloud Architecture, Data Science..."
              className="flex-1 !h-18 !text-[1.25rem] !px-5"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => addItem(newExpertise, setNewExpertise, expertise, setExpertise)}
              className="!h-18 !w-18"
            >
              <Plus className="size-6" />
            </Button>
          </div>
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {expertise.map((item) => (
                <Badge key={item} variant="secondary" className="py-1.5 px-3 text-base">
                  {item}
                  <button type="button" onClick={() => removeItem(item, expertise, setExpertise)} className="ml-2 cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-[.65rem]">
          <Label className="text-[1.35rem]">
            Skills <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, newSkill, setNewSkill, skills, setSkills)}
              placeholder="e.g., JavaScript, Python, Leadership, System Design..."
              className="flex-1 !h-18 !text-[1.25rem] !px-5"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => addItem(newSkill, setNewSkill, skills, setSkills)}
              className="!h-18 !w-18"
            >
              <Plus className="size-6" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="py-1.5 px-3 text-base">
                  {skill}
                  <button type="button" onClick={() => removeItem(skill, skills, setSkills)} className="ml-2 cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-[.65rem]">
          <Label className="text-[1.35rem]">Industries</Label>
          <div className="flex gap-2">
            <Input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, newIndustry, setNewIndustry, industries, setIndustries)}
              placeholder="e.g., FinTech, Healthcare, E-commerce..."
              className="flex-1 !h-18 !text-[1.25rem] !px-5"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => addItem(newIndustry, setNewIndustry, industries, setIndustries)}
              className="!h-18 !w-18"
            >
              <Plus className="size-6" />
            </Button>
          </div>
          {industries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {industries.map((industry) => (
                <Badge key={industry} variant="secondary" className="py-1.5 px-3 text-base">
                  {industry}
                  <button type="button" onClick={() => removeItem(industry, industries, setIndustries)} className="ml-2 cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-[.65rem]">
            <Label htmlFor="linkedinUrl" className="text-[1.35rem]">
              LinkedIn Profile
            </Label>
            <Input
              {...register('linkedinUrl')}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
            {errors.linkedinUrl && (
              <p className="text-red-500 text-[1rem]">{errors.linkedinUrl.message}</p>
            )}
          </div>

          <div className="space-y-[.65rem]">
            <Label htmlFor="portfolioUrl" className="text-[1.35rem]">
              Portfolio / Website
            </Label>
            <Input
              {...register('portfolioUrl')}
              placeholder="https://yourportfolio.com"
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
            {errors.portfolioUrl && (
              <p className="text-red-500 text-[1rem]">{errors.portfolioUrl.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-[.65rem]">
          <Label htmlFor="motivation" className="text-[1.35rem]">
            Why do you want to become a mentor? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('motivation')}
            placeholder="Share your motivation for becoming a mentor and how you plan to help mentees..."
            className="w-full min-h-[140px] !text-[1.15rem] !px-5 !py-4"
          />
          {errors.motivation && (
            <p className="text-red-500 text-[1rem]">{errors.motivation.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full !h-14 !text-[1.3rem]"
        >
          {isLoading ? (
            <>
              Submitting application...
              <Loader2 className="size-5.5 animate-spin" />
            </>
          ) : (
            <>
              Submit Application
              <Send className="size-6" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}