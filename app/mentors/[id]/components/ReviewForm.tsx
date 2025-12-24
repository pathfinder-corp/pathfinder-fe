'use client';

import { useState, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { mentorService } from '@/services';
import type { IMentorReview, ICreateMentorReviewRequest, IUpdateMentorReviewRequest } from '@/types';
import { InteractiveStarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ReviewFormProps {
  mentorId: string;
  existingReview?: IMentorReview | null;
  mentorshipId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({
  mentorId,
  existingReview,
  mentorshipId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [feedback, setFeedback] = useState<string>(existingReview?.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setFeedback(existingReview.feedback || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        const updateData: IUpdateMentorReviewRequest = {
          rating,
          feedback: feedback.trim() || undefined,
        };
        await mentorService.updateReview(mentorId, existingReview.id, updateData);
        toast.success('Review updated successfully!');
      } else {
        const createData: ICreateMentorReviewRequest = {
          rating,
          feedback: feedback.trim() || undefined,
          mentorshipId,
        };
        await mentorService.createReview(mentorId, createData);
        toast.success('Review created successfully!');
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save review';
      toast.error('Failed to save review', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-lg mb-4 block">Rating <span className="text-red-500">*</span></Label>
        <InteractiveStarRating
          rating={rating}
          onRatingChange={setRating}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="feedback" className="text-lg mb-3 block">
          Feedback (Optional)
        </Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience with this mentor..."
          className="min-h-[140px] text-lg"
          maxLength={2000}
          disabled={isSubmitting}
        />
        <p className="text-sm text-neutral-500 mt-2 text-right">
          {feedback.length} / 2000 characters
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-12! text-base!"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || rating < 1}
          className="h-12! text-base!"
        >
          {isSubmitting ? (
            <>
              Saving...
              <Loader2 className="size-5 animate-spin ml-2" />
            </>
          ) : (
            <>
              {existingReview ? 'Update Review' : 'Submit Review'}
              <Send className="size-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

