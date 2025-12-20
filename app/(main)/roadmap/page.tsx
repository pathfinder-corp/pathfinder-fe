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
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create roadmap';
      toast.error('Failed to create roadmap', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`${fromAssessment && suggestedTopic ? 'pb-12' : ''} pt-10 flex flex-col items-center justify-center`}>
      {fromAssessment && suggestedTopic ? (
        <>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-800 text-neutral-300 text-lg mb-6">
            <span>Suggested from your assessment results</span>
          </div>
          <h1 className="text-6xl font-bold mb-6">Create Your Learning Roadmap</h1>
          <p className="text-2xl text-neutral-500 text-center max-w-2xl">
            Based on your assessment, we recommend learning <span className="text-white font-medium">{suggestedTopic}</span>. 
            Customize the options below to personalize your roadmap.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-6xl font-bold mb-6">What do you want to learn today?</h1>
          <p className="text-2xl text-neutral-500">
            Enter any topic below to automatically create a roadmap you want
          </p>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-232 space-y-7 mt-6">
        <div className="space-y-3">
          <Label htmlFor="topic" className="text-xl">
            Topic <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('topic')}
            placeholder="Enter any topic..."
            className="w-full h-20! text-xl! px-6!"
          />
          {errors.topic && (
            <p className="text-red-500 text-lg">{errors.topic.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="background" className="text-xl">
              Background
            </Label>
            <Input
              {...register('background')}
              placeholder="Enter background..."
              className="w-full h-20! text-xl! px-6!"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="experienceLevel" className="text-xl">
              Experience
            </Label>
            <Select onValueChange={(value) => setValue('experienceLevel', value as any)}>
              <SelectTrigger className="w-full h-20! text-xl! px-6!">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner" className="text-xl!">
                  Beginner
                </SelectItem>
                <SelectItem value="intermediate" className="text-xl!">
                  Intermediate
                </SelectItem>
                <SelectItem value="advanced" className="text-xl!">
                  Advanced
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="targetOutcome" className="text-xl">
              Target Outcome
            </Label>
            <Input
              {...register('targetOutcome')}
              placeholder="Enter target outcome..."
              className="w-full h-20! text-xl! px-6!"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="learningPace" className="text-xl">
              Learning Pace
            </Label>
            <Select onValueChange={(value) => setValue('learningPace', value as any)}>
              <SelectTrigger className="w-full h-20! text-xl! px-6!">
                <SelectValue placeholder="Select learning pace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible" className="text-xl!">
                  Flexible
                </SelectItem>
                <SelectItem value="balanced" className="text-xl!">
                  Balanced
                </SelectItem>
                <SelectItem value="intensive" className="text-xl!">
                  Intensive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="timeframe" className="text-xl">
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
              className="w-full h-20! text-xl! px-6!"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="preferences" className="text-xl">
              Personalization
            </Label>
            <Input
              {...register('preferences')}
              placeholder="Enter preferences..."
              className="w-full h-20! text-xl! px-6!"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-16! text-xl!"
        >
          {isLoading ? (
            <>
              Creating roadmap...
              <Loader2 className="size-6 animate-spin" />
            </>
          ) : (
            <>
              Create roadmap
              <Send className="size-7" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-lg text-neutral-500 mt-10">
        AI can make mistakes, make sure to verify important information
      </p>
    </div>
  );
}