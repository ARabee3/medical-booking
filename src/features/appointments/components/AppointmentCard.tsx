import { FC, useState } from 'react';
import { format, parseISO, parse } from 'date-fns';
import { CalendarDays, Clock, Loader2, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useCancelAppointment,
  useRescheduleAppointment,
} from '@/features/appointments/api/appointmentsApi';
import { AvailabilityCalendar } from '@/features/doctors/components/AvailabilityCalendar';
import type { Appointment } from '@/features/appointments/types';
import { getStatusBadgeConfig } from '@/features/appointments/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: FC<AppointmentCardProps> = ({ appointment }) => {
  const { id, doctor, date, time, status, notes } = appointment;

  // Cancel State
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelAppointment();

  // Reschedule State
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleStep, setRescheduleStep] = useState<'calendar' | 'confirm'>('calendar');
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const rescheduleMutation = useRescheduleAppointment();

  const handleCancel = () => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Appointment cancelled successfully.');
        setIsCancelDialogOpen(false);
      },
      onError: () => {
        toast.error('Failed to cancel appointment. Please try again.');
        setIsCancelDialogOpen(false);
      },
    });
  };

  const handleReschedule = () => {
    if (!selectedSlot) return;
    rescheduleMutation.mutate(
      { id, date: selectedSlot.date, time: selectedSlot.time },
      {
        onSuccess: () => {
          toast.success('Appointment rescheduled successfully.');
          setIsRescheduleDialogOpen(false);
          setTimeout(() => {
            setRescheduleStep('calendar');
            setSelectedSlot(null);
          }, 300);
        },
        onError: () => {
          toast.error('Failed to reschedule appointment. Please try again.');
        },
      }
    );
  };

  const handleRescheduleDialogChange = (open: boolean) => {
    setIsRescheduleDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setRescheduleStep('calendar');
        setSelectedSlot(null);
      }, 300);
    }
  };

  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
  // Assuming time is in HH:mm format (24h), convert to 12h for display
  const parsedTime = parse(time, 'HH:mm', new Date());
  const formattedTime = format(parsedTime, 'h:mm a');

  const badgeConfig = getStatusBadgeConfig(status);

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-[var(--color-border)]">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-start p-6 gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <Avatar
              src={doctor.image_url || undefined}
              alt={doctor.name}
              fallback={doctor.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
              className="h-16 w-16 border-2 border-[var(--color-border)]"
            />
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                Dr. {doctor.name}
              </h3>
              <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
                {badgeConfig.label}
              </Badge>
            </div>

            <p className="text-sm font-medium text-[var(--color-primary)]">{doctor.specialty}</p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-[var(--color-foreground-muted)]">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 opacity-70" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 opacity-70" />
                <span>{formattedTime}</span>
              </div>
            </div>

            {notes && (
              <div className="pt-2">
                <p className="text-sm text-[var(--color-foreground-muted)] italic bg-[var(--color-muted)]/50 p-2 rounded border border-[var(--color-border)]">
                  <span className="font-semibold not-italic">Notes: </span>
                  {notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {status !== 'CANCELLED' && (
          <div className="bg-[var(--color-muted)]/30 border-t border-[var(--color-border)] p-4 flex flex-wrap items-center justify-end gap-3">
            {(status === 'PENDING' || status === 'CONFIRMED') && (
              <>
                {/* ─── Reschedule Dialog ─── */}
                <Dialog open={isRescheduleDialogOpen} onOpenChange={handleRescheduleDialogChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    {rescheduleStep === 'calendar' ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>Reschedule Appointment</DialogTitle>
                          <DialogDescription>
                            Select a new date and time for your appointment with Dr. {doctor.name}.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                          <AvailabilityCalendar
                            doctorId={doctor.id}
                            onSlotSelect={(d, t) => setSelectedSlot({ date: d, time: t })}
                            selectedSlot={selectedSlot}
                          />
                        </div>

                        <DialogFooter className="mt-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsRescheduleDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!selectedSlot}
                            onClick={() => setRescheduleStep('confirm')}
                            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
                          >
                            Continue
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Confirm Reschedule</DialogTitle>
                          <DialogDescription>
                            Please review your new appointment time.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-6">
                          <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-[var(--color-muted)]/30 p-4 rounded-lg border border-[var(--color-border)]">
                            <div className="text-center md:text-left flex-1">
                              <p className="text-xs text-[var(--color-foreground-muted)] uppercase tracking-wider mb-1 font-semibold">
                                Current Slot
                              </p>
                              <p className="font-medium text-sm">
                                {format(parseISO(date), 'MMM d, yyyy')}
                              </p>
                              <p className="text-sm text-[var(--color-foreground-muted)]">
                                {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                              </p>
                            </div>

                            <ArrowRight className="text-[var(--color-primary)] h-6 w-6 shrink-0 rotate-90 md:rotate-0" />

                            <div className="text-center md:text-right flex-1">
                              <p className="text-xs text-[var(--color-primary)] uppercase tracking-wider mb-1 font-semibold">
                                New Slot
                              </p>
                              <p className="font-medium text-sm">
                                {selectedSlot
                                  ? format(parseISO(selectedSlot.date), 'MMM d, yyyy')
                                  : ''}
                              </p>
                              <p className="text-sm text-[var(--color-primary)] font-semibold">
                                {selectedSlot
                                  ? format(parse(selectedSlot.time, 'HH:mm', new Date()), 'h:mm a')
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setRescheduleStep('calendar')}
                            disabled={rescheduleMutation.isPending}
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleReschedule}
                            disabled={rescheduleMutation.isPending}
                            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
                          >
                            {rescheduleMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rescheduling...
                              </>
                            ) : (
                              'Confirm Reschedule'
                            )}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>

                {/* ─── Cancel Dialog ─── */}
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your appointment with Dr. {doctor.name}?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                      <Button
                        variant="outline"
                        onClick={() => setIsCancelDialogOpen(false)}
                        disabled={cancelMutation.isPending}
                      >
                        Keep Appointment
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Yes, Cancel it'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {status === 'COMPLETED' && (
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                Leave Review
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
