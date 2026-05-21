import { FC } from 'react';
import { format, parseISO } from 'date-fns';
import { Eye, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Appointment } from '@/types/global';

interface AppointmentOverviewProps {
  appointments: Appointment[];
}

const StatusBadge: FC<{ status: Appointment['status'] }> = ({ status }) => {
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

export const AppointmentOverview: FC<AppointmentOverviewProps> = ({ appointments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Recent Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Doctor</TableHead>
                <TableHead className="font-semibold text-foreground">Specialty</TableHead>
                <TableHead className="font-semibold text-foreground">Date & Time</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    {appointment.doctor.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {appointment.doctor.specialty}
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Cancel Appointment"
                        disabled={
                          appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED'
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
