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
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import {
  TimeframePicker,
  type TimeframeValue,
} from '@/components/ui/timeframe-picker';

const roadmapSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
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
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [learningPace, setLearningPace] = useState<string>('');
  const [timeframe, setTimeframe] = useState<TimeframeValue>({
    amount: undefined,
    unit: 'month',
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
      if (timeframe.amount && timeframe.amount > 0) {
        const unit =
          timeframe.amount === 1 ? timeframe.unit : `${timeframe.unit}s`;
        timeframeStr = `${timeframe.amount} ${unit}`;
      }

      const requestData = cleanObject({
        ...data,
        timeframe: timeframeStr,
      }) as IRoadmapRequest;

      const response = await roadmapService.createRoadmap(requestData);

      toast.success('Create roadmap successfully!');

      const isFirstRoadmap =
        localStorage.getItem('roadmap-tour-completed') !== 'true';
      if (isFirstRoadmap) {
        sessionStorage.setItem('start-roadmap-tour', 'true');
      }

      router.push(`/roadmap/${response.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create roadmap';
      toast.error('Failed to create roadmap', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${fromAssessment && suggestedTopic ? 'pb-12' : ''} flex flex-col items-center justify-center pt-10`}
    >
      {fromAssessment && suggestedTopic ? (
        <>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-neutral-800 px-5 py-2.5 text-lg text-neutral-300">
            <span>Suggested from your assessment results</span>
          </div>
          <h1 className="mb-6 text-6xl font-bold">
            Create Your Learning Roadmap
          </h1>
          <p className="max-w-2xl text-center text-2xl text-neutral-500">
            Based on your assessment, we recommend learning{' '}
            <span className="font-medium text-white">{suggestedTopic}</span>.
            Customize the options below to personalize your roadmap.
          </p>
        </>
      ) : (
        <>
          <h1 className="mb-6 text-6xl font-bold">
            What do you want to learn today?
          </h1>
          <p className="text-2xl text-neutral-500">
            Enter any topic below to automatically create a roadmap you want
          </p>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 w-232 space-y-7">
        <div className="space-y-3">
          <Label htmlFor="topic" className="text-xl">
            Topic <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('topic')}
            placeholder="Enter any topic..."
            className="h-20! w-full px-6! text-xl!"
          />
          {errors.topic && (
            <p className="text-lg text-red-500">{errors.topic.message}</p>
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
              className="h-20! w-full px-6! text-xl!"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="experienceLevel" className="text-xl">
              Experience
            </Label>
            <Select
              value={experienceLevel}
              onValueChange={(value) => {
                if (value === 'none') {
                  setExperienceLevel('');
                  setValue('experienceLevel', undefined);
                } else {
                  setExperienceLevel(value);
                  setValue('experienceLevel', value as any);
                }
              }}
            >
              <SelectTrigger className="h-20! w-full px-6! text-xl!">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xl! text-neutral-500">
                  None
                </SelectItem>
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
              className="h-20! w-full px-6! text-xl!"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="learningPace" className="text-xl">
              Learning Pace
            </Label>
            <Select
              value={learningPace}
              onValueChange={(value) => {
                if (value === 'none') {
                  setLearningPace('');
                  setValue('learningPace', undefined);
                } else {
                  setLearningPace(value);
                  setValue('learningPace', value as any);
                }
              }}
            >
              <SelectTrigger className="h-20! w-full px-6! text-xl!">
                <SelectValue placeholder="Select learning pace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xl! text-neutral-500">
                  None
                </SelectItem>
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
            <TimeframePicker
              value={timeframe}
              onChange={setTimeframe}
              placeholder="Enter amount"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="preferences" className="text-xl">
              Personalization
            </Label>
            <Input
              {...register('preferences')}
              placeholder="Enter preferences..."
              className="h-20! w-full px-6! text-xl!"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-16! w-full text-xl!"
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

      <p className="mt-10 text-center text-lg text-neutral-500">
        AI can make mistakes, make sure to verify important information
      </p>
    </div>
  );
}
