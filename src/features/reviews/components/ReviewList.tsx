import { FC } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { ReviewCard } from './ReviewCard';
import { useDoctorReviews } from '@/features/reviews/api/reviewsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface ReviewListProps {
  doctorId: number;
}

export const ReviewList: FC<ReviewListProps> = ({ doctorId }) => {
  const { data: reviews = [], isLoading } = useDoctorReviews(doctorId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
        <p className="text-muted-foreground text-xs mt-1">Be the first to share your experience!</p>
      </div>
    );
  }

  // Calculate distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Average Rating Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-[var(--color-foreground)]">
            {average.toFixed(1)}
          </span>
          <StarRating rating={average} size="sm" readonly halfStars />
          <span className="text-xs text-muted-foreground mt-1">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 w-full space-y-1">
          {distribution.map(({ star, count }) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-right font-medium text-muted-foreground">{star}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};
