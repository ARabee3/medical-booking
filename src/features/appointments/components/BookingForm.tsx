import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDoctor } from '@/features/doctors/api/doctorsApi';
import { AvailabilityCalendar } from '@/features/doctors/components/AvailabilityCalendar';
import { useBookAppointment } from '@/features/appointments/api/appointmentsApi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { CalendarCheck, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const BookingForm: FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const id = doctorId ? parseInt(doctorId, 10) : 0;

  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
    error: doctorError,
    refetch,
  } = useDoctor(id);

  const bookMutation = useBookAppointment();

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
  };

  const handleBookClick = () => {
    if (selectedSlot) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !id) return;

    try {
      await bookMutation.mutateAsync({
        doctor_id: id,
        date: selectedSlot.date,
        time: selectedSlot.time,
      });
      toast.success('Appointment requested');
      setShowConfirm(false);
      navigate('/my-appointments');
    } catch {
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  const handleBack = () => {
    navigate(`/doctors/${id}`);
  };

  if (isDoctorLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-80 w-full max-w-sm" />
      </div>
    );
  }

  if (isDoctorError) {
    return (
      <div className="py-12">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <ErrorMessage
          message={doctorError?.message || 'Failed to load doctor details'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-[var(--color-foreground-muted)]">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)] mt-2">
            Book Appointment
          </h1>
          <p className="text-[var(--color-foreground-muted)] mt-1">
            with {doctor.name} — {doctor.specialty}
          </p>
        </div>
      </div>

      <AvailabilityCalendar
        doctorId={id}
        onSlotSelect={handleSlotSelect}
        selectedSlot={selectedSlot}
      />

      {selectedSlot && (
        <div className="flex items-center gap-4 p-4 bg-[var(--color-primary-lighter)] border border-[var(--color-primary-light)] rounded-lg">
          <CalendarCheck className="h-5 w-5 text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-primary)] flex-1">
            Selected: {format(parseISO(selectedSlot.date), 'EEE, MMM d, yyyy')} at{' '}
            {selectedSlot.time}
          </p>
          <Button
            onClick={handleBookClick}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
            disabled={bookMutation.isPending}
          >
            {bookMutation.isPending ? 'Booking...' : 'Book Now'}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Doctor</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {doctor.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Specialty</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {doctor.specialty}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Date</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {selectedSlot && format(parseISO(selectedSlot.date), 'EEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Time</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {selectedSlot?.time}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={bookMutation.isPending}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
            >
              {bookMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
