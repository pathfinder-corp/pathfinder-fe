'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { roadmapService } from '@/services/roadmap.service';
import type { IRoadmapRequest } from '@/types';
import { cleanObject } from '@/lib';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const roadmapSchema = z.object({
  topic: z.string().min(3, 'Chủ đề phải có ít nhất 3 ký tự'),
  background: z.string().optional(),
  targetOutcome: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  learningPace: z.enum(['flexible', 'balanced', 'intensive']).optional(),
  timeframe: z.string().optional(),
  preferences: z.string().optional(),
});

type RoadmapFormData = z.infer<typeof roadmapSchema>;

export default function RoadmapPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
  });

  const onSubmit = async (data: RoadmapFormData) => {
    try {
      setIsLoading(true);
  
      let timeframeStr = data.timeframe || '';
      if (dateRange.from && dateRange.to) {
        const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        timeframeStr = `${diffMonths} months`;
      }
  
      const requestData = cleanObject({
        ...data,
        timeframe: timeframeStr,
      }) as IRoadmapRequest;
  
      const response = await roadmapService.createRoadmap(requestData);
      
      toast.success('Tạo lộ trình thành công!');
      router.push(`/roadmap/${response.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo lộ trình');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="pt-10 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">Bạn cần giúp đỡ vấn đề gì?</h1>
      <p className="text-xl text-neutral-500">
        Nhập 1 chủ đề bất kỳ dưới đây để tự động tạo lộ trình mà bạn mong muốn
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-[58rem] space-y-7 mt-6">
        <div className="space-y-[.65rem]">
          <Label htmlFor="topic" className="text-[1.35rem]">
            Chủ đề <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('topic')}
            placeholder="Nhập 1 chủ đề bất kỳ..."
            className="w-full !h-18 !text-[1.25rem] !px-5"
          />
          {errors.topic && (
            <p className="text-red-500 text-[1rem]">{errors.topic.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-[.65rem]">
            <Label htmlFor="background" className="text-[1.35rem]">
              Nền tảng
            </Label>
            <Input
              {...register('background')}
              placeholder="Nhập nền tảng..."
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
          </div>
          <div className="space-y-[.65rem]">
            <Label htmlFor="experienceLevel" className="text-[1.35rem]">
              Kinh nghiệm
            </Label>
            <Select onValueChange={(value) => setValue('experienceLevel', value as any)}>
              <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
                <SelectValue placeholder="Chọn kinh nghiệm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner" className="!text-[1.25rem]">
                  Cơ bản
                </SelectItem>
                <SelectItem value="intermediate" className="!text-[1.25rem]">
                  Trung bình
                </SelectItem>
                <SelectItem value="advanced" className="!text-[1.25rem]">
                  Nâng cao
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-[.65rem]">
            <Label htmlFor="targetOutcome" className="text-[1.35rem]">
              Mục tiêu
            </Label>
            <Input
              {...register('targetOutcome')}
              placeholder="Nhập mục tiêu..."
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
          </div>
          <div className="space-y-[.65rem]">
            <Label htmlFor="learningPace" className="text-[1.35rem]">
              Nhịp độ học
            </Label>
            <Select onValueChange={(value) => setValue('learningPace', value as any)}>
              <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
                <SelectValue placeholder="Chọn nhịp độ học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible" className="!text-[1.25rem]">
                  Linh hoạt
                </SelectItem>
                <SelectItem value="balanced" className="!text-[1.25rem]">
                  Cân bằng
                </SelectItem>
                <SelectItem value="intensive" className="!text-[1.25rem]">
                  Tập trung
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-[.65rem]">
            <Label htmlFor="timeframe" className="text-[1.35rem]">
              Thời gian
            </Label>
            <DateRangePicker
              onUpdate={(values) => {
                setDateRange({
                  from: values.range.from,
                  to: values.range.to,
                });
              }}
              align="start"
              locale="vi-VN"
              showCompare={false}
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
          </div>
          <div className="space-y-[.65rem]">
            <Label htmlFor="preferences" className="text-[1.35rem]">
              Cá nhân hóa
            </Label>
            <Input
              {...register('preferences')}
              placeholder="Nhập..."
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full !h-14 !text-[1.3rem]"
        >
          {isLoading ? (
            <>
              Đang tạo lộ trình...
              <Loader2 className="size-5.5 animate-spin" />
            </>
          ) : (
            <>
              Tạo lộ trình
              <Send className="size-6" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}