import { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import type { Review } from '@/types/global';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card className="border-[var(--color-border)]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {review.patient_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" readonly halfStars showValue />
        </div>
        {review.comment && (
          <p className="text-sm text-[var(--color-foreground-muted)] leading-relaxed">
            {review.comment}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
