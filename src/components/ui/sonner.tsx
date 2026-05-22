import { Toaster as Sonner } from 'sonner';

export const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--color-background)] group-[.toaster]:text-[var(--color-foreground)] group-[.toaster]:border-[var(--color-border)] group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-[var(--color-muted-foreground)]',
          actionButton:
            'group-[.toast]:bg-[var(--color-primary)] group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-[var(--color-muted)] group-[.toast]:text-[var(--color-muted-foreground)]',
        },
      }}
      {...props}
    />
  );
};
