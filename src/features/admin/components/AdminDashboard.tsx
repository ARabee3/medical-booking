import { FC } from 'react';
import { StatCards } from '@/features/admin/components/StatCards';
import { AppointmentOverview } from '@/features/admin/components/AppointmentOverview';
import { useAdminStats } from '@/features/admin/api/adminApi';
import { useAdminAppointments } from '@/features/admin/api/adminApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export const AdminDashboard: FC = () => {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    refetch: refetchStats,
  } = useAdminStats();

  const {
    data: appointments,
    isLoading: appsLoading,
    isError: appsError,
    error: appsErr,
    refetch: refetchApps,
  } = useAdminAppointments();

  if (statsLoading || appsLoading) return <LoadingSpinner />;

  if (statsError)
    return (
      <ErrorMessage
        message={statsErr instanceof Error ? statsErr.message : 'Failed to load stats'}
        onRetry={refetchStats}
      />
    );

  if (appsError)
    return (
      <ErrorMessage
        message={appsErr instanceof Error ? appsErr.message : 'Failed to load appointments'}
        onRetry={refetchApps}
      />
    );

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and key statistics</p>
      </div>

      {/* Stat Cards */}
      {stats && <StatCards stats={stats} />}

      {/* Recent Appointments Table */}
      {appointments && <AppointmentOverview appointments={appointments} />}
    </div>
  );
};
