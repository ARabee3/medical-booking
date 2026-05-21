import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useDoctor } from '@/features/doctors/api/doctorsApi';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';

export const DoctorProfile: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctorId = id ? parseInt(id, 10) : 0;

  const { data: doctor, isLoading, isError, error, refetch } = useDoctor(doctorId);

  const handleBack = () => {
    navigate('/doctors');
  };

  const handleBookAppointment = () => {
    navigate(`/book/${doctorId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-12 w-48 rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
        <ErrorMessage
          message={error?.message || 'Failed to load doctor profile'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-12 text-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
        <p className="text-lg font-medium text-[var(--color-foreground-muted)]">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Doctors
      </Button>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar
          src={doctor.image_url}
          alt={doctor.name}
          fallback={doctor.name}
          size="lg"
          className="h-24 w-24 text-2xl"
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{doctor.name}</h1>
          <Badge
            variant="outline"
            className="border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-lighter)] text-sm px-3 py-1"
          >
            {doctor.specialty}
          </Badge>
        </div>
      </div>

      {/* Full Bio */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">About</h2>
        <p className="text-base text-[var(--color-foreground-muted)] leading-relaxed">
          {doctor.bio}
        </p>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
        onClick={handleBookAppointment}
      >
        <Calendar className="h-5 w-5 mr-2" />
        Book Appointment
      </Button>
    </div>
  );
};
