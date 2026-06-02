import { FC, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAppointments } from '@/features/admin/api/adminApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { AdminAppointment } from '@/features/admin/types';
import type { AppointmentStatus } from '@/types/global';

// ─── Constants ────────────────────────────────────────────────

type StatusFilter = 'ALL' | AppointmentStatus;
type PersonFilter = 'ALL' | 'DOCTOR' | 'PATIENT';

// ─── Status Badge ─────────────────────────────────────────────

const StatusBadge: FC<{ status: AppointmentStatus }> = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>
      );
    case 'CONFIRMED':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Confirmed</Badge>;
    case 'PENDING':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
          Pending
        </Badge>
      );
    case 'CANCELLED':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// ─── Table UI ─────────────────────────────────────────────────

const AppointmentTable: FC<{ appointments: AdminAppointment[] }> = ({ appointments }) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="font-semibold text-foreground">Patient</TableHead>
          <TableHead className="font-semibold text-foreground">Doctor</TableHead>
          <TableHead className="font-semibold text-foreground">Specialty</TableHead>
          <TableHead className="font-semibold text-foreground">Date & Time</TableHead>
          <TableHead className="font-semibold text-foreground">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
              No appointments found.
            </TableCell>
          </TableRow>
        ) : (
          appointments.map((appointment) => (
            <TableRow key={appointment.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-foreground">
                {appointment.patient.name}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {appointment.doctor.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {appointment.doctor.specialty ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <span className="block">
                  {format(parseISO(appointment.date), 'EEE, MMM d, yyyy')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(`${appointment.date}T${appointment.time}`), 'h:mm a')}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={appointment.status} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

// ─── Main Export ──────────────────────────────────────────────

export const AppointmentOverview: FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [personFilter, setPersonFilter] = useState<PersonFilter>('ALL');
  const [search, setSearch] = useState('');

  // ── جيب كل الـ appointments مرة واحدة بدون فلترة من الـ backend ──
  const { data: appointments, isLoading, isError, error, refetch } = useAdminAppointments();

  // ── كل الفلترة client-side على نفس الداتا ──
  const filtered = useMemo(() => {
    if (!appointments) return [];

    return appointments.filter((appt) => {
      // Status filter
      if (statusFilter !== 'ALL' && appt.status !== statusFilter) return false;

      // Search filter
      const query = search.toLowerCase();
      if (!query) return true;

      if (personFilter === 'DOCTOR') {
        return appt.doctor.name.toLowerCase().includes(query);
      }
      if (personFilter === 'PATIENT') {
        return appt.patient.name.toLowerCase().includes(query);
      }
      // ALL — search both
      return (
        appt.doctor.name.toLowerCase().includes(query) ||
        appt.patient.name.toLowerCase().includes(query)
      );
    });
  }, [appointments, search, personFilter, statusFilter]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load appointments'}
        onRetry={refetch}
      />
    );

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-sm text-muted-foreground mt-1">All system appointments overview</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Recent Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── Filters Row ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input + person toggle */}
            <div className="flex gap-2 flex-1">
              <Tabs
                value={personFilter}
                onValueChange={(v) => {
                  setPersonFilter(v as PersonFilter);
                  setSearch('');
                }}
              >
                <TabsList>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="DOCTOR">Doctor</TabsTrigger>
                  <TabsTrigger value="PATIENT">Patient</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative min-w-[250px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    personFilter === 'DOCTOR'
                      ? 'Search by doctor name...'
                      : personFilter === 'PATIENT'
                        ? 'Search by patient name...'
                        : 'Search by doctor or patient...'
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status filter */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
                <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* ── Results count ── */}
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span>{' '}
            appointment{filtered.length !== 1 ? 's' : ''}
          </p>

          <AppointmentTable appointments={filtered} />
        </CardContent>
      </Card>
    </div>
  );
};
