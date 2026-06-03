import { FC, useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  halfStars?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

const StarIcon: FC<{
  filled: boolean;
  half?: boolean;
  className?: string;
}> = ({ filled, half, className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '0' : '1.5'}
    >
      <defs>
        <linearGradient id="half-star-gradient">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={half ? 'url(#half-star-gradient)' : filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
};

export const StarRating: FC<StarRatingProps> = ({
  rating,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
  halfStars = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClass = SIZE_MAP[size];
  const effectiveRating = hoverRating || rating;

  const handleClick = (index: number) => {
    if (readonly || !onChange) return;
    onChange(index);
  };

  const handleMouseEnter = (index: number) => {
    if (readonly || !onChange) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readonly || !onChange) return;
    setHoverRating(0);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => {
          let filled: boolean;
          let half = false;

          if (halfStars) {
            filled = index <= Math.floor(effectiveRating);
            half = !filled && index - 0.5 <= effectiveRating && index > effectiveRating;
          } else {
            filled = index <= Math.round(effectiveRating);
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                sizeClass,
                'transition-colors',
                filled || half ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600',
                !readonly && onChange && 'cursor-pointer hover:text-amber-400'
              )}
            >
              <StarIcon filled={filled} half={half} className={sizeClass} />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
};
