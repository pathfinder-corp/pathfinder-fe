'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { assessmentService } from '@/services';
import type { ICreateAssessmentRequest } from '@/types';
import { DIFFICULTY_OPTIONS, QUESTION_COUNT_OPTIONS } from '@/constants';

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

const assessmentSchema = z.object({
  domain: z.string().min(3, 'Domain must be at least 3 characters'),
  difficulty: z.enum(DIFFICULTY_OPTIONS.map((option) => option.value)),
  questionCount: z
    .number()
    .min(5, 'Minimum 5 questions')
    .max(50, 'Maximum 50 questions'),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export default function AssessmentPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      difficulty: 'easy',
      questionCount: 10,
    },
  });

  const selectedDifficulty = watch('difficulty');
  const selectedQuestionCount = watch('questionCount');

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      setIsLoading(true);

      const requestData: ICreateAssessmentRequest = {
        domain: data.domain,
        difficulty: data.difficulty,
        questionCount: data.questionCount,
      };

      const response = await assessmentService.createAssessment(requestData);

      toast.success('Assessment created successfully!');
      router.push(`/assessment/${response.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create assessment';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <h1 className="mb-6 text-6xl font-bold">Test your Knowledge</h1>
      <p className="text-2xl text-neutral-500">
        Create a personalized assessment to evaluate your understanding of any
        topic
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-232 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="domain" className="text-xl">
            What topic would you like to assess?{' '}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('domain')}
            placeholder="e.g., JavaScript Variables, Go Routines, System Design"
            className="h-20! w-full px-6! text-xl!"
          />
          {errors.domain && (
            <p className="text-lg text-red-500">{errors.domain.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-xl">Choose the difficulty</Label>
          <div className="grid grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue(
                    'difficulty',
                    option.value as 'easy' | 'medium' | 'hard'
                  )
                }
                className={`cursor-pointer rounded-xl border p-6 text-left transition-all ${
                  selectedDifficulty === option.value
                    ? 'border-neutral-700 bg-white/10'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                }`}
              >
                <p className="mb-2 text-xl font-semibold">{option.label}</p>
                <p className="text-lg text-neutral-500">{option.description}</p>
              </button>
            ))}
          </div>
          {errors.difficulty && (
            <p className="text-lg text-red-500">{errors.difficulty.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-xl">Number of questions</Label>
          <Select
            value={String(selectedQuestionCount)}
            onValueChange={(value) => setValue('questionCount', Number(value))}
          >
            <SelectTrigger className="h-20! w-full px-6! text-xl!">
              <SelectValue placeholder="Select number of questions" />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <SelectItem
                  key={count}
                  value={String(count)}
                  className="text-xl!"
                >
                  {count} questions
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.questionCount && (
            <p className="text-lg text-red-500">
              {errors.questionCount.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-16! w-full text-xl!"
        >
          {isLoading ? (
            <>
              Generating assessment...
              <Loader2 className="size-6 animate-spin" />
            </>
          ) : (
            <>
              Generate Assessment
              <Sparkles className="size-6" />
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
