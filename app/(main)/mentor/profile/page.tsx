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
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to fetch mentor profile';
        toast.error('Failed to fetch mentor profile', {
          description: errorMessage,
        });
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
            <GraduationCap className="size-6 mr-2" />
            Apply to Become a Mentor
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
              Accepting Mentees
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
            placeholder="Tell potential mentees about yourself, your background, and mentoring style..."
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
              Max Mentees <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={String(selectedMaxMentees)} 
              onValueChange={(value) => setValue('maxMentees', Number(value))}
            >
              <SelectTrigger className="w-full h-20! text-xl! px-6!">
                <SelectValue placeholder="Select max mentees" />
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
    </div>
  );
}