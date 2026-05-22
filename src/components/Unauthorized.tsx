import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-16 w-16 text-[var(--color-destructive)]" />
      <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Access Denied</h1>
      <p className="text-[var(--color-foreground-muted)] max-w-md">
        You do not have permission to access this page. Please contact your administrator if you
        believe this is an error.
      </p>
      <Button onClick={() => navigate('/')} variant="outline">
        Go Home
      </Button>
    </div>
  );
};
