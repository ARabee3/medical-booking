import { FC } from 'react';
import { useDoctors } from '@/features/doctors/api/doctorsApi';
import { DoctorCard } from './DoctorCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';

export const DoctorList: FC = () => {
  const { data, isLoading, isError, error, refetch } = useDoctors();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Find a Doctor</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorMessage message={error?.message || 'Failed to load doctors'} onRetry={refetch} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="py-12">
        <EmptyState message="No doctors available" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Find a Doctor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};
