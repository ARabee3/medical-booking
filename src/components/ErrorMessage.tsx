import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-[var(--color-destructive)] mb-4" />
      <p className="text-lg font-medium text-[var(--color-foreground)] mb-2">Something went wrong</p>
      <p className="text-sm text-[var(--color-foreground-muted)] mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry}>Try Again</Button>}
    </div>
  );
};
