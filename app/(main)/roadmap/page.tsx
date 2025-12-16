'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  background: z.string().optional(),
  targetOutcome: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  learningPace: z.enum(['flexible', 'balanced', 'intensive']).optional(),
  timeframe: z.string().optional(),
  preferences: z.string().optional()
});

type RoadmapFormData = z.infer<typeof roadmapSchema>;

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const fromAssessment = searchParams.get('from') === 'assessment';
  const suggestedTopic = searchParams.get('topic');

  useEffect(() => {
    if (suggestedTopic) {
      setValue('topic', suggestedTopic);
    }
  }, [suggestedTopic, setValue]);

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
      
      toast.success('Create roadmap successfully!');
      router.push(`/roadmap/${response.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating the roadmap');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`${fromAssessment && suggestedTopic ? 'pb-12' : ''} pt-10 flex flex-col items-center justify-center`}>
      {fromAssessment && suggestedTopic ? (
        <>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-neutral-300 text-base mb-6">
            <span>Suggested from your assessment results</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">Create Your Learning Roadmap</h1>
          <p className="text-xl text-neutral-500 text-center max-w-2xl">
            Based on your assessment, we recommend learning <span className="text-white font-medium">{suggestedTopic}</span>. 
            Customize the options below to personalize your roadmap.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-5xl font-bold mb-6">What do you want to learn today?</h1>
          <p className="text-xl text-neutral-500">
            Enter any topic below to automatically create a roadmap you want
          </p>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-[58rem] space-y-7 mt-6">
        <div className="space-y-[.65rem]">
          <Label htmlFor="topic" className="text-[1.35rem]">
            Topic <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('topic')}
            placeholder="Enter any topic..."
            className="w-full !h-18 !text-[1.25rem] !px-5"
          />
          {errors.topic && (
            <p className="text-red-500 text-[1rem]">{errors.topic.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-[.65rem]">
            <Label htmlFor="background" className="text-[1.35rem]">
              Background
            </Label>
            <Input
              {...register('background')}
              placeholder="Enter background..."
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
          </div>
          <div className="space-y-[.65rem]">
            <Label htmlFor="experienceLevel" className="text-[1.35rem]">
              Experience
            </Label>
            <Select onValueChange={(value) => setValue('experienceLevel', value as any)}>
              <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner" className="!text-[1.25rem]">
                  Beginner
                </SelectItem>
                <SelectItem value="intermediate" className="!text-[1.25rem]">
                  Intermediate
                </SelectItem>
                <SelectItem value="advanced" className="!text-[1.25rem]">
                  Advanced
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-[.65rem]">
            <Label htmlFor="targetOutcome" className="text-[1.35rem]">
              Target Outcome
            </Label>
            <Input
              {...register('targetOutcome')}
              placeholder="Enter target outcome..."
              className="w-full !h-18 !text-[1.25rem] !px-5"
            />
          </div>
          <div className="space-y-[.65rem]">
            <Label htmlFor="learningPace" className="text-[1.35rem]">
              Learning Pace
            </Label>
            <Select onValueChange={(value) => setValue('learningPace', value as any)}>
              <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
                <SelectValue placeholder="Select learning pace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible" className="!text-[1.25rem]">
                  Flexible
                </SelectItem>
                <SelectItem value="balanced" className="!text-[1.25rem]">
                  Balanced
                </SelectItem>
                <SelectItem value="intensive" className="!text-[1.25rem]">
                  Intensive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-[.65rem]">
            <Label htmlFor="timeframe" className="text-[1.35rem]">
              Timeframe
            </Label>
            <DateRangePicker
              onUpdate={(values) => {
                setDateRange({
                  from: values.range.from,
                  to: values.range.to
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
              Personalization
            </Label>
            <Input
              {...register('preferences')}
              placeholder="Enter preferences..."
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
              Creating roadmap...
              <Loader2 className="size-5.5 animate-spin" />
            </>
          ) : (
            <>
              Create roadmap
              <Send className="size-6" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}