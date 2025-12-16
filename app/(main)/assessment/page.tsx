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
  SelectContent 
} from '@/components/ui/select';

const assessmentSchema = z.object({
  domain: z.string().min(3, 'Domain must be at least 3 characters'),
  difficulty: z.enum(DIFFICULTY_OPTIONS.map(option => option.value)),
  questionCount: z.number().min(5, 'Minimum 5 questions').max(50, 'Maximum 50 questions')
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
      difficulty: 'medium',
      questionCount: 10
    }
  });

  const selectedDifficulty = watch('difficulty');
  const selectedQuestionCount = watch('questionCount');

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      setIsLoading(true);

      const requestData: ICreateAssessmentRequest = {
        domain: data.domain,
        difficulty: data.difficulty,
        questionCount: data.questionCount
      };

      const response = await assessmentService.createAssessment(requestData);
      
      toast.success('Assessment created successfully!');
      router.push(`/assessment/${response.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create assessment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-10 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">Test your Knowledge</h1>
      <p className="text-xl text-neutral-500">
        Create a personalized assessment to evaluate your understanding of any topic
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-[58rem] space-y-8 mt-8">
        <div className="space-y-[.65rem]">
          <Label htmlFor="domain" className="text-[1.35rem]">
            What topic would you like to assess? <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('domain')}
            placeholder="e.g., JavaScript Variables, Go Routines, System Design"
            className="w-full !h-18 !text-[1.25rem] !px-5"
          />
          {errors.domain && (
            <p className="text-red-500 text-[1rem]">{errors.domain.message}</p>
          )}
        </div>

        <div className="space-y-[.65rem]">
          <Label className="text-[1.35rem]">Choose the difficulty</Label>
          <div className="grid grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('difficulty', option.value as 'easy' | 'medium' | 'hard')}
                className={`cursor-pointer p-5 rounded-xl border transition-all text-left ${
                  selectedDifficulty === option.value
                    ? 'border-neutral-700 bg-white/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'
                }`}
              >
                <p className="text-[1.2rem] font-semibold mb-1">{option.label}</p>
                <p className="text-base text-neutral-500">{option.description}</p>
              </button>
            ))}
          </div>
          {errors.difficulty && (
            <p className="text-red-500 text-[1rem]">{errors.difficulty.message}</p>
          )}
        </div>

        <div className="space-y-[.65rem]">
          <Label className="text-[1.35rem]">Number of questions</Label>
          <Select 
            value={String(selectedQuestionCount)} 
            onValueChange={(value) => setValue('questionCount', Number(value))}
          >
            <SelectTrigger className="w-full !h-18 !text-[1.25rem] !px-5">
              <SelectValue placeholder="Select number of questions" />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <SelectItem key={count} value={String(count)} className="!text-[1.25rem]">
                  {count} questions
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.questionCount && (
            <p className="text-red-500 text-[1rem]">{errors.questionCount.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full !h-14 !text-[1.3rem]"
        >
          {isLoading ? (
            <>
              Generating assessment...
              <Loader2 className="size-5.5 animate-spin" />
            </>
          ) : (
            <>
              Generate Assessment
              <Sparkles className="size-5.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}