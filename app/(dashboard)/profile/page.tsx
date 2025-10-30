'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { academicService } from '@/services';
import type { IAcademicProfile, ICreateAcademicProfileRequest } from '@/types';
import { EDUCATION_LEVEL_LABELS, USER_ROLES } from '@/constants';

const profileSchema = z.object({
  currentLevel: z.enum(['high_school', 'undergraduate', 'graduate', 'postgraduate']),
  currentGrade: z.string().optional(),
  institution: z.string().optional(),
  major: z.string().optional(),
  minor: z.string().optional(),
  gpa: z.number().min(0).max(4).optional().or(z.literal('')),
  achievements: z.array(z.string()),
  certifications: z.array(z.string()),
  academicInterests: z.array(z.string()).min(1, 'Ít nhất 1 lĩnh vực quan tâm'),
  subjectStrengths: z.array(z.string()).min(1, 'Ít nhất 1 môn học thế mạnh'),
  subjectsNeedImprovement: z.array(z.string()),
  intendedMajor: z.string().optional(),
  targetUniversity: z.string().optional(),
  extracurricularActivities: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [profile, setProfile] = useState<IAcademicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [interestInput, setInterestInput] = useState('');
  const [strengthInput, setStrengthInput] = useState('');
  const [improvementInput, setImprovementInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');
  const [activityInput, setActivityInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      currentLevel: 'undergraduate',
      academicInterests: [],
      subjectStrengths: [],
      subjectsNeedImprovement: [],
      achievements: [],
      certifications: [],
      extracurricularActivities: [],
    },
  });

  const academicInterests = watch('academicInterests') || [];
  const subjectStrengths = watch('subjectStrengths') || [];
  const subjectsNeedImprovement = watch('subjectsNeedImprovement') || [];
  const achievements = watch('achievements') || [];
  const certifications = watch('certifications') || [];
  const extracurricularActivities = watch('extracurricularActivities') || [];

  useEffect(() => {
    if (user && user.role !== USER_ROLES.STUDENT) {
      toast.error('Truy cập bị từ chối', {
        description: 'Chỉ học viên mới có thể tạo hồ sơ học tập'
      });
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await academicService.getProfile();
      
      if (data) {
        setProfile(data);
        
        setValue('currentLevel', data.currentLevel);
        setValue('currentGrade', data.currentGrade || '');
        setValue('institution', data.institution || '');
        setValue('major', data.major || '');
        setValue('minor', data.minor || '');
        setValue('gpa', data.gpa || '');
        setValue('academicInterests', data.academicInterests || []);
        setValue('subjectStrengths', data.subjectStrengths || []);
        setValue('subjectsNeedImprovement', data.subjectsNeedImprovement || []);
        setValue('achievements', data.achievements || []);
        setValue('certifications', data.certifications || []);
        setValue('intendedMajor', data.intendedMajor || '');
        setValue('targetUniversity', data.targetUniversity || '');
        setValue('extracurricularActivities', data.extracurricularActivities || []);
      } else {
        toast.info('Chưa có hồ sơ học tập', {
          description: 'Hãy bắt đầu bằng cách tạo hồ sơ cho riêng bạn',
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể tải hồ sơ';
      toast.error('Lỗi tải hồ sơ', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
  
    try {
      const payload: ICreateAcademicProfileRequest = {
        currentLevel: data.currentLevel,
        currentGrade: data.currentGrade,
        institution: data.institution,
        major: data.major,
        minor: data.minor,
        gpa: data.gpa ? Number(data.gpa) : undefined,
        achievements: data.achievements || [],
        certifications: data.certifications || [],
        academicInterests: data.academicInterests || [],
        subjectStrengths: data.subjectStrengths || [],
        subjectsNeedImprovement: data.subjectsNeedImprovement || [],
        intendedMajor: data.intendedMajor,
        targetUniversity: data.targetUniversity,
        extracurricularActivities: data.extracurricularActivities || [],
      };
  
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
  
      if (profile) {
        await academicService.updateProfile(payload);
        toast.success('Cập nhật hồ sơ thành công!');
      } else {
        await academicService.createProfile(payload);
        toast.success('Tạo hồ sơ thành công!');
      }
  
      await fetchProfile();
    } catch (error: unknown) {
      console.error('Submit error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(profile ? 'Cập nhật hồ sơ thất bại' : 'Tạo hồ sơ thất bại', {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await academicService.deleteProfile();
      toast.success('Xóa hồ sơ thành công!');
      setProfile(null);
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error('Xóa hồ sơ thất bại', {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const addItem = (
    field: keyof Pick<ProfileFormData, 'academicInterests' | 'subjectStrengths' | 'subjectsNeedImprovement' | 'achievements' | 'certifications' | 'extracurricularActivities'>,
    value: string
  ) => {
    if (!value.trim()) return;

    const currentValues = watch(field) || [];
    if (!currentValues.includes(value.trim())) {
      setValue(field, [...currentValues, value.trim()]);
    }

    if (field === 'academicInterests') setInterestInput('');
    if (field === 'subjectStrengths') setStrengthInput('');
    if (field === 'subjectsNeedImprovement') setImprovementInput('');
    if (field === 'achievements') setAchievementInput('');
    if (field === 'certifications') setCertificationInput('');
    if (field === 'extracurricularActivities') setActivityInput('');
  };

  const removeItem = (
    field: keyof Pick<ProfileFormData, 'academicInterests' | 'subjectStrengths' | 'subjectsNeedImprovement' | 'achievements' | 'certifications' | 'extracurricularActivities'>,
    value: string
  ) => {
    const currentValues = watch(field) || [];
    setValue(field, currentValues.filter(item => item !== value));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Hồ sơ học tập</h1>
        <p className="text-xl text-neutral-400 mt-2">
          {profile ? 'Quản lý thông tin học tập của bạn' : 'Tạo hồ sơ học tập để bắt đầu'}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-neutral-800 bg-neutral-950/50">
          <CardHeader>
            <CardTitle className="text-2xl">Thông tin cơ bản</CardTitle>
            <CardDescription className="text-lg">
              Cung cấp thông tin về trình độ học vấn hiện tại
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentLevel" className="text-lg">
                Trình độ học vấn <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="currentLevel"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="h-12 !text-lg w-full bg-neutral-900/50 border-neutral-800">
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      {Object.entries(EDUCATION_LEVEL_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="!text-lg">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currentLevel && (
                <p className="text-lg text-red-500">{errors.currentLevel.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentGrade" className="text-lg">Khóa/Năm học</Label>
                <Input
                  id="currentGrade"
                  placeholder="Năm 2, Khóa 2023..."
                  className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                  {...register('currentGrade')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpa" className="text-lg">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="3.5"
                  className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                  {...register('gpa', { valueAsNumber: true })}
                />
                {errors.gpa && (
                  <p className="text-lg text-red-500">{errors.gpa.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-lg">Trường/Tổ chức</Label>
              <Input
                id="institution"
                placeholder="Đại học Bách Khoa TP.HCM"
                className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                {...register('institution')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="major" className="text-lg">Chuyên ngành chính</Label>
                <Input
                  id="major"
                  placeholder="Khoa học máy tính"
                  className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                  {...register('major')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minor" className="text-lg">Chuyên ngành phụ</Label>
                <Input
                  id="minor"
                  placeholder="Kinh tế"
                  className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                  {...register('minor')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="intendedMajor" className="text-lg">Ngành dự định</Label>
                <Input
                  id="intendedMajor"
                  placeholder="AI & Machine Learning"
                  className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                  {...register('intendedMajor')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUniversity" className="text-lg">Trường mục tiêu</Label>
                <Input
                  id="targetUniversity"
                  placeholder="MIT, Stanford..."
                  className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
                  {...register('targetUniversity')}
                />
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            <ArrayFieldInput
              label="Lĩnh vực quan tâm"
              required
              placeholder="AI, Web Development..."
              value={interestInput}
              onChange={setInterestInput}
              onAdd={() => addItem('academicInterests', interestInput)}
              items={academicInterests}
              onRemove={(item) => removeItem('academicInterests', item)}
              error={errors.academicInterests?.message}
            />

            <ArrayFieldInput
              label="Môn học thế mạnh"
              required
              placeholder="Math, Programming..."
              value={strengthInput}
              onChange={setStrengthInput}
              onAdd={() => addItem('subjectStrengths', strengthInput)}
              items={subjectStrengths}
              onRemove={(item) => removeItem('subjectStrengths', item)}
              error={errors.subjectStrengths?.message}
            />

            <ArrayFieldInput
              label="Môn học cần cải thiện"
              placeholder="English, Public Speaking..."
              value={improvementInput}
              onChange={setImprovementInput}
              onAdd={() => addItem('subjectsNeedImprovement', improvementInput)}
              items={subjectsNeedImprovement}
              onRemove={(item) => removeItem('subjectsNeedImprovement', item)}
            />

            <Separator className="bg-neutral-800" />

            <ArrayFieldInput
              label="Thành tích"
              placeholder="First Prize in Math Olympics..."
              value={achievementInput}
              onChange={setAchievementInput}
              onAdd={() => addItem('achievements', achievementInput)}
              items={achievements}
              onRemove={(item) => removeItem('achievements', item)}
            />

            <ArrayFieldInput
              label="Chứng chỉ"
              placeholder="IELTS 7.5, AWS Certified..."
              value={certificationInput}
              onChange={setCertificationInput}
              onAdd={() => addItem('certifications', certificationInput)}
              items={certifications}
              onRemove={(item) => removeItem('certifications', item)}
            />

            <ArrayFieldInput
              label="Hoạt động ngoại khóa"
              placeholder="Football Team Captain, Volunteer..."
              value={activityInput}
              onChange={setActivityInput}
              onAdd={() => addItem('extracurricularActivities', activityInput)}
              items={extracurricularActivities}
              onRemove={(item) => removeItem('extracurricularActivities', item)}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            {profile && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 size-5" />
                        Xóa hồ sơ
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa hồ sơ</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Hồ sơ học tập của bạn sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              type="submit"
              className="ml-auto bg-white text-neutral-950 hover:bg-neutral-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-5" />
                  {profile ? 'Cập nhật' : 'Tạo hồ sơ'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

function ArrayFieldInput({
  label,
  required = false,
  placeholder,
  value,
  onChange,
  onAdd,
  items,
  onRemove,
  error,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (item: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-lg">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="!text-lg h-12 bg-neutral-900/50 border-neutral-800"
        />
        <Button
          type="button"
          onClick={onAdd}
          className="h-12 px-6"
        >
          <Plus className="size-5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="text-base px-3 py-1 bg-neutral-800/50 border-neutral-700"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="ml-2 hover:text-red-500"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      {error && <p className="text-lg text-red-500">{error}</p>}
    </div>
  );
}