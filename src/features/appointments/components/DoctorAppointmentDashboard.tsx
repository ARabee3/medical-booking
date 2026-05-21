import { FC, useState, useMemo } from 'react';
import { isPast, parseISO, parse, isToday, format } from 'date-fns';
import { CalendarHeart, Check, X, CalendarDays, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  useDoctorAppointments,
  useUpdateDoctorAppointment,
} from '@/features/appointments/api/appointmentsApi';
import type { Appointment } from '@/types/global';
import { getStatusBadgeConfig } from '@/features/appointments/utils';

// ─── Loading State ──────────────────────────────────────────────────────────
const DashboardSkeleton: FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

// ─── Empty State ────────────────────────────────────────────────────────────
const EmptyState: FC<{ message: string; subMessage?: string }> = ({ message, subMessage }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-[var(--color-card)]">
    <CalendarHeart className="h-14 w-14 text-teal-300 mb-4" />
    <p className="text-lg font-semibold text-[var(--color-foreground)] mb-1">{message}</p>
    {subMessage && <p className="text-sm text-[var(--color-foreground-muted)]">{subMessage}</p>}
  </div>
);

// ─── Shared Logic for Pending Rows/Cards ────────────────────────────────────
const usePendingAction = (appointmentId: number) => {
  const [notes, setNotes] = useState('');
  const updateMutation = useUpdateDoctorAppointment();

  const handleAction = (status: 'CONFIRMED' | 'CANCELLED') => {
    updateMutation.mutate(
      { id: appointmentId, updates: { status, notes: notes || undefined } },
      {
        onSuccess: () => {
          toast.success(
            status === 'CONFIRMED'
              ? 'Appointment approved successfully'
              : 'Appointment rejected successfully'
          );
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update appointment');
        },
      }
    );
  };

  return { notes, setNotes, updateMutation, handleAction };
};

// ─── Pending Table Row (Desktop) ────────────────────────────────────────────
const PendingRow: FC<{ appointment: Appointment }> = ({ appointment }) => {
  const { notes, setNotes, updateMutation, handleAction } = usePendingAction(appointment.id);
  const formattedDate = format(parseISO(appointment.date), 'MMM d, yyyy');
  const formattedTime = format(parse(appointment.time, 'HH:mm', new Date()), 'h:mm a');
  const patientName = appointment.patient?.name || 'Unknown Patient';

  return (
    <TableRow>
      <TableCell className="font-medium text-[var(--color-foreground)]">{patientName}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-[var(--color-foreground-muted)] whitespace-nowrap">
          <CalendarDays className="h-4 w-4" /> {formattedDate}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-[var(--color-foreground-muted)] whitespace-nowrap">
          <Clock className="h-4 w-4" /> {formattedTime}
        </div>
      </TableCell>
      <TableCell>
        <Input
          placeholder="Add a note (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-8 min-w-[150px]"
          disabled={updateMutation.isPending}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAction('CONFIRMED')}
            disabled={updateMutation.isPending}
          >
            <Check className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction('CANCELLED')}
            disabled={updateMutation.isPending}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// ─── Pending Card (Mobile) ──────────────────────────────────────────────────
const PendingCard: FC<{ appointment: Appointment }> = ({ appointment }) => {
  const { notes, setNotes, updateMutation, handleAction } = usePendingAction(appointment.id);
  const formattedDate = format(parseISO(appointment.date), 'MMM d, yyyy');
  const formattedTime = format(parse(appointment.time, 'HH:mm', new Date()), 'h:mm a');
  const patientName = appointment.patient?.name || 'Unknown Patient';

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-[var(--color-foreground)]">{patientName}</h3>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-foreground-muted)]">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {formattedDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {formattedTime}
          </div>
        </div>

        <Input
          placeholder="Add a note (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-9"
          disabled={updateMutation.isPending}
        />

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAction('CONFIRMED')}
            disabled={updateMutation.isPending}
          >
            <Check className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => handleAction('CANCELLED')}
            disabled={updateMutation.isPending}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Standard Table Row (Desktop) ───────────────────────────────────────────
const AppointmentRow: FC<{ appointment: Appointment }> = ({ appointment }) => {
  const formattedDate = format(parseISO(appointment.date), 'MMM d, yyyy');
  const formattedTime = format(parse(appointment.time, 'HH:mm', new Date()), 'h:mm a');
  const patientName = appointment.patient?.name || 'Unknown Patient';
  const badgeConfig = getStatusBadgeConfig(appointment.status);

  return (
    <TableRow>
      <TableCell className="font-medium text-[var(--color-foreground)]">{patientName}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-[var(--color-foreground-muted)] whitespace-nowrap">
          <CalendarDays className="h-4 w-4" /> {formattedDate}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-[var(--color-foreground-muted)] whitespace-nowrap">
          <Clock className="h-4 w-4" /> {formattedTime}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
          {badgeConfig.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-[var(--color-foreground-muted)] italic max-w-[200px] truncate">
        {appointment.notes || '-'}
      </TableCell>
    </TableRow>
  );
};

// ─── Standard Card (Mobile) ─────────────────────────────────────────────────
const AppointmentCardView: FC<{ appointment: Appointment }> = ({ appointment }) => {
  const formattedDate = format(parseISO(appointment.date), 'MMM d, yyyy');
  const formattedTime = format(parse(appointment.time, 'HH:mm', new Date()), 'h:mm a');
  const patientName = appointment.patient?.name || 'Unknown Patient';
  const badgeConfig = getStatusBadgeConfig(appointment.status);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-[var(--color-foreground)]">{patientName}</h3>
          <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
            {badgeConfig.label}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-foreground-muted)]">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {formattedDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {formattedTime}
          </div>
        </div>

        {appointment.notes && (
          <p className="text-sm text-[var(--color-foreground-muted)] italic border-l-2 border-[var(--color-border)] pl-2">
            Notes: {appointment.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Dashboard Component ───────────────────────────────────────────────
export const DoctorAppointmentDashboard: FC = () => {
  const { data: appointments, isLoading, isError, error, refetch } = useDoctorAppointments();
  const [activeTab, setActiveTab] = useState<string>('pending');

  const { pending, upcoming, past } = useMemo(() => {
    if (!appointments) return { pending: [], upcoming: [], past: [] };

    const pending: Appointment[] = [];
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appointments.forEach((appt) => {
      const apptDate = parse(`${appt.date} ${appt.time}`, 'yyyy-MM-dd HH:mm', new Date());
      const isFutureOrToday = !isPast(apptDate) || isToday(parseISO(appt.date));

      if (appt.status === 'PENDING') {
        pending.push(appt);
      } else if (appt.status === 'CONFIRMED' && isFutureOrToday) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });

    // Sort pending: oldest first
    pending.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    // Sort upcoming: soonest first
    upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    // Sort past: most recent first
    past.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    return { pending, upcoming, past };
  }, [appointments]);

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load dashboard'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
          Manage your appointment requests and schedule.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto h-auto flex-wrap justify-start">
          <TabsTrigger value="pending" className="flex-1 sm:flex-none">
            Pending Requests
            {!isLoading && pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 leading-none">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
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
          </TabsTrigger>
        </TabsList>

        {/* ── Pending Tab ── */}
        <TabsContent value="pending">
          {isLoading ? (
            <DashboardSkeleton />
          ) : pending.length === 0 ? (
            <EmptyState
              message="No pending requests"
              subMessage="You're all caught up! New appointment requests will appear here."
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block rounded-md border bg-[var(--color-card)] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Notes to Patient</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((appt) => (
                      <PendingRow key={appt.id} appointment={appt} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {pending.map((appt) => (
                  <PendingCard key={appt.id} appointment={appt} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Upcoming Tab ── */}
        <TabsContent value="upcoming">
          {isLoading ? (
            <DashboardSkeleton />
          ) : upcoming.length === 0 ? (
            <EmptyState
              message="No upcoming appointments"
              subMessage="You have no confirmed appointments coming up."
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block rounded-md border bg-[var(--color-card)] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((appt) => (
                      <AppointmentRow key={appt.id} appointment={appt} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {upcoming.map((appt) => (
                  <AppointmentCardView key={appt.id} appointment={appt} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Past Tab ── */}
        <TabsContent value="past">
          {isLoading ? (
            <DashboardSkeleton />
          ) : past.length === 0 ? (
            <EmptyState message="No past appointments" />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block rounded-md border bg-[var(--color-card)] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {past.map((appt) => (
                      <AppointmentRow key={appt.id} appointment={appt} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {past.map((appt) => (
                  <AppointmentCardView key={appt.id} appointment={appt} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
