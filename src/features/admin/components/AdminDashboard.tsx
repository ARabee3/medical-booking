import { FC } from 'react';
import { StatCards } from '@/features/admin/components/StatCards';
import { AppointmentOverview } from '@/features/admin/components/AppointmentOverview';
import { useAdminStats } from '@/features/admin/api/adminApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export const AdminDashboard: FC = () => {
  const { data: stats, isLoading, isError, error, refetch } = useAdminStats();

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load stats'}
        onRetry={refetch}
      />
    );

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and key statistics</p>
      </div>

      {stats && <StatCards stats={stats} />}

      <AppointmentOverview />
    </div>
  );
};
