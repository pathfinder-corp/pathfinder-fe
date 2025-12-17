'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  Loader2, 
  Plus, 
  X, 
  GraduationCap, 
  AlertCircle,
  Eye,
  Users,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import type { IMentorProfile, IUpdateMentorProfileRequest } from '@/types';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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

const MAX_MENTEES_OPTIONS = [
  { value: 1, label: '1 mentee' },
  { value: 2, label: '2 mentees' },
  { value: 3, label: '3 mentees' },
  { value: 5, label: '5 mentees' },
  { value: 10, label: '10 mentees' },
  { value: 20, label: '20 mentees' },
  { value: 50, label: '50+ mentees' },
];

const mentorProfileSchema = z.object({
  headline: z.string().min(10, 'Headline must be at least 10 characters').max(100, 'Headline must be less than 100 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must be less than 1000 characters'),
  yearsExperience: z.number().min(1, 'Please select your experience'),
  maxMentees: z.number().min(1, 'Please select max mentees'),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  isAcceptingMentees: z.boolean(),
});

type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;

export default function MentorProfilePage() {
  const router = useRouter();

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await mentorService.getMyProfile();
        setProfile(data);
        setHasProfile(true);
        
        // Populate form with existing data
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
      } catch (error) {
        // No profile found - user might need to apply first
        console.error('Failed to fetch mentor profile:', error);
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

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
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-10 pb-12 flex flex-col items-center justify-center">
        <Skeleton className="h-14 w-72 mb-6 bg-neutral-800" />
        <Skeleton className="h-7 w-[28rem] bg-neutral-800" />
        <div className="w-[58rem] space-y-7 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-40 bg-neutral-800" />
              <Skeleton className="h-18 w-full bg-neutral-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="pt-10 flex flex-col items-center justify-center">
        <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
          <AlertCircle className="size-10 text-neutral-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">No Mentor Profile</h1>
        <p className="text-xl text-neutral-500 text-center max-w-xl mb-8">
          You don&apos;t have a mentor profile yet. To become a mentor, you need to submit an application first.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/mentor/applications')}
            className="!h-12 !text-base"
          >
            View My Applications
          </Button>
          <Button
            onClick={() => router.push('/mentor')}
            className="!h-12 !text-base"
          >
            <GraduationCap className="size-5 mr-2" />
            Apply to Become a Mentor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
          <GraduationCap className="size-8 text-neutral-300" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Mentor Profile</h1>
          <p className="text-lg text-neutral-500">Manage your public mentor profile</p>
        </div>
      </div>

      <div className="w-[58rem] flex items-center justify-between mb-6 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
        <div className="flex items-center gap-3">
          {isAcceptingMentees ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 py-1.5 px-3">
              Accepting Mentees
            </Badge>
          ) : (
            <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30 py-1.5 px-3">
              Not Accepting
            </Badge>
          )}
          <span className="text-neutral-400">Toggle to change availability</span>
        </div>
        <div className="flex items-center gap-4">
          <Switch
            checked={isAcceptingMentees}
            onCheckedChange={(checked) => setValue('isAcceptingMentees', checked)}
          />
          <Button
            variant="outline"
            onClick={() => router.push(`/mentors/${profile?.id}`)}
            className="!h-10"
          >
            View Public Profile
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-[58rem] space-y-7">
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
            placeholder="Tell potential mentees about yourself, your background, and mentoring style..."
            className="w-full min-h-[140px] !text-[1.15rem] !px-5 !py-4"
          />
          {errors.bio && (
            <p className="text-red-500 text-[1rem]">{errors.bio.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
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
              Max Mentees <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={String(selectedMaxMentees)} 
              onValueChange={(value) => setValue('maxMentees', Number(value))}
            >
              <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
                <SelectValue placeholder="Select max mentees" />
              </SelectTrigger>
              <SelectContent>
                {MAX_MENTEES_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="!text-[1.25rem]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maxMentees && (
              <p className="text-red-500 text-[1rem]">{errors.maxMentees.message}</p>
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
                    <button type="button" onClick={() => removeItem(lang, languages, setLanguages)} className="ml-2">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-neutral-800" />

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
                  <button type="button" onClick={() => removeItem(item, expertise, setExpertise)} className="ml-2">
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
                  <button type="button" onClick={() => removeItem(skill, skills, setSkills)} className="ml-2">
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
                  <button type="button" onClick={() => removeItem(industry, industries, setIndustries)} className="ml-2">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-neutral-800" />

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

        <Button 
          type="submit" 
          disabled={isSaving}
          className="w-full !h-14 !text-[1.3rem]"
        >
          {isSaving ? (
            <>
              Saving changes...
              <Loader2 className="size-5.5 animate-spin" />
            </>
          ) : (
            <>
              Save Profile
              <Save className="size-6" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}