import { FC, useState } from 'react';
import { format, parseISO, parse } from 'date-fns';
import { CalendarDays, Clock, Loader2 } from 'lucide-react';
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
import { useCancelAppointment } from '@/features/appointments/api/appointmentsApi';
import type { Appointment } from '@/features/appointments/types';
import { getStatusBadgeConfig } from '@/features/appointments/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: FC<AppointmentCardProps> = ({ appointment }) => {
  const { id, doctor, date, time, status, notes } = appointment;
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelAppointment();

  const handleCancel = () => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Appointment cancelled successfully.');
        setIsCancelDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to cancel appointment.');
      },
    });
  };

  // Format date: "Mon, Jan 20, 2026"
  const formattedDate = format(parseISO(date), 'EEE, MMM d, yyyy');

  // Format time from HH:mm → "9:00 AM"
  const formattedTime = format(parse(time, 'HH:mm', new Date()), 'h:mm a');

  // Doctor initials — skip "Dr." prefix words
  const initials = doctor.name
    .split(' ')
    .filter((part) => !part.match(/^Dr\.?$/i))
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const badgeConfig = getStatusBadgeConfig(status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Doctor Avatar */}
          <Avatar
            className="h-14 w-14 flex-shrink-0"
            src={doctor.image_url ?? undefined}
            alt={doctor.name}
            fallback={initials}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Row: doctor info + status badge */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-base font-semibold text-[var(--color-foreground)] truncate">
                  {doctor.name}
                </p>
                <p className="text-sm text-[var(--color-foreground-muted)]">{doctor.specialty}</p>
              </div>
              <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
                {badgeConfig.label}
              </Badge>
            </div>

            {/* Date and time row */}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--color-foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-teal-600 flex-shrink-0" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-600 flex-shrink-0" />
                {formattedTime}
              </span>
            </div>

            {/* Doctor notes (if any) */}
            {notes && (
              <p className="mt-3 text-xs text-[var(--color-foreground-muted)] italic border-l-2 border-teal-300 pl-2.5">
                {notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {status !== 'CANCELLED' && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {(status === 'PENDING' || status === 'CONFIRMED') && (
              <>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  Reschedule
                </Button>

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
                        Are you sure you want to cancel your appointment with {doctor.name}? This
                        action cannot be undone.
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
