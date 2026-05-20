import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ message, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Inbox className="h-12 w-12 text-[var(--color-secondary)] mb-4" />
      <p className="text-lg font-medium text-[var(--color-foreground-muted)] mb-4">{message}</p>
      {action}
    </div>
  );
};
