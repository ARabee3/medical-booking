import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isPast, parseISO, parse, isToday } from 'date-fns';
import { CalendarHeart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { AppointmentCard } from '@/features/appointments/components/AppointmentCard';
import { useAppointments } from '@/features/appointments/api/appointmentsApi';
import type { Appointment } from '@/features/appointments/types';

// ─── Skeleton placeholder for a single appointment card ────────────────────
const AppointmentCardSkeleton: FC = () => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
    <div className="flex items-start gap-4">
      {/* Avatar skeleton */}
      <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          {/* Badge skeleton */}
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        {/* Date/time row */}
        <div className="mt-3 flex gap-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Loading state: 3 skeleton cards ───────────────────────────────────────
const AppointmentListSkeleton: FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <AppointmentCardSkeleton key={i} />
    ))}
  </div>
);

// ─── Empty state for a specific tab ────────────────────────────────────────
interface TabEmptyStateProps {
  tab: 'upcoming' | 'past';
}

const TabEmptyState: FC<TabEmptyStateProps> = ({ tab }) => {
  if (tab === 'upcoming') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarHeart className="h-14 w-14 text-teal-300 mb-4" />
        <p className="text-lg font-semibold text-[var(--color-foreground)] mb-1">
          No upcoming appointments
        </p>
        <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
          No appointments yet. Find a doctor!
        </p>
        <Button asChild>
          <Link to="/doctors">Find a Doctor</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <CalendarHeart className="h-14 w-14 text-slate-300 mb-4" />
      <p className="text-lg font-semibold text-[var(--color-foreground)] mb-1">
        No past appointments
      </p>
      <p className="text-sm text-[var(--color-foreground-muted)]">
        Your completed and cancelled appointments will appear here.
      </p>
    </div>
  );
};

// ─── Appointment list for a single tab ─────────────────────────────────────
interface AppointmentTabContentProps {
  appointments: Appointment[];
  tab: 'upcoming' | 'past';
}

const AppointmentTabContent: FC<AppointmentTabContentProps> = ({ appointments, tab }) => {
  if (appointments.length === 0) {
    return <TabEmptyState tab={tab} />;
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};

// ─── Main page component (US-014) ──────────────────────────────────────────
export const AppointmentList: FC = () => {
  const { data: appointments, isLoading, isError, error, refetch } = useAppointments();
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  /**
   * Split appointments into "Upcoming" vs "Past".
   * Upcoming = PENDING or CONFIRMED and date is today or in the future.
   * Past      = COMPLETED, CANCELLED, or date is in the past.
   */
  const { upcoming, past } = useMemo(() => {
    if (!appointments) return { upcoming: [], past: [] };

    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appointments.forEach((appt) => {
      // Combine date + time into a Date object for accurate comparison
      const apptDate = parse(`${appt.date} ${appt.time}`, 'yyyy-MM-dd HH:mm', new Date());

      const isFutureOrToday = !isPast(apptDate) || isToday(parseISO(appt.date));
      const isActiveStatus = appt.status === 'PENDING' || appt.status === 'CONFIRMED';

      if (isFutureOrToday && isActiveStatus) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });

    // Upcoming: soonest first; Past: most recent first
    upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    past.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    return { upcoming, past };
  }, [appointments]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">My Appointments</h1>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
          Manage and track all your medical appointments in one place.
        </p>
      </div>

      {/* ── Error State ── */}
      {isError && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load appointments.'}
          onRetry={refetch}
        />
      )}

      {/* ── Tabs ── */}
      {!isError && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
              Upcoming
              {!isLoading && upcoming.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 leading-none">
                  {upcoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 sm:flex-none">
              Past
              {!isLoading && past.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 leading-none">
                  {past.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Upcoming Tab ── */}
          <TabsContent value="upcoming">
            {isLoading ? (
              <AppointmentListSkeleton />
            ) : (
              <AppointmentTabContent appointments={upcoming} tab="upcoming" />
            )}
          </TabsContent>

          {/* ── Past Tab ── */}
          <TabsContent value="past">
            {isLoading ? (
              <AppointmentListSkeleton />
            ) : (
              <AppointmentTabContent appointments={past} tab="past" />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
