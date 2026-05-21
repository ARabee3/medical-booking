import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      sm: 'h-8 w-8',
      default: 'h-10 w-10',
      lg: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
        {src && !error ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary)] text-white text-sm font-medium">
            {initials}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
