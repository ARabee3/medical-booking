import { FC } from 'react';
import { format, parseISO, parse } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Appointment } from '@/features/appointments/types';
import { getStatusBadgeConfig } from '@/features/appointments/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: FC<AppointmentCardProps> = ({ appointment }) => {
  const { doctor, date, time, status, notes } = appointment;

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
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={doctor.image_url ?? undefined} alt={doctor.name} />
            <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

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
      </CardContent>
    </Card>
  );
};
