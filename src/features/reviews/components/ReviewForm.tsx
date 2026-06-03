import { FC, useState } from 'react';
import { toast } from 'sonner';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateReview, useUpdateReview } from '@/features/reviews/api/reviewsApi';
import type { Review } from '@/types/global';

interface ReviewFormProps {
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  existingReview?: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReviewForm: FC<ReviewFormProps> = ({
  appointmentId,
  doctorName,
  existingReview,
  open,
  onOpenChange,
}) => {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const isEditing = !!existingReview;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    if (comment.length > 200) {
      toast.error('Comment must be under 200 characters.');
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateMutation.mutateAsync({
          reviewId: existingReview.id,
          data: { rating, comment },
        });
        toast.success('Review updated successfully');
      } else {
        await createMutation.mutateAsync({
          appointmentId,
          data: { rating, comment },
        });
        toast.success('Review submitted successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Failed to update review.' : 'Failed to submit review.');
    }
  };

  const canSubmit = rating > 0 && !isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={existingReview?.id ?? 'new'} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Review' : 'Leave a Review'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update your review for ${doctorName}.`
              : `How was your experience with ${doctorName}?`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Tap a star to rate</p>
            <StarRating rating={rating} onChange={setRating} size="lg" showValue />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="review-comment" className="text-sm font-medium">
              Comment (optional)
            </label>
            <Textarea
              id="review-comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/200</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
          >
            {isPending
              ? isEditing
                ? 'Updating...'
                : 'Submitting...'
              : isEditing
                ? 'Update Review'
                : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
