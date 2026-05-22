import { FC, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Trash2, PlusCircle, CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDoctorSlots, useAddSlot, useDeleteSlot } from '@/features/doctors/api/doctorsApi';
import type { AvailabilitySlot } from '@/types/global';

// ─── Constants ────────────────────────────────────────────────
const DOCTOR_ID = 2;

// ─── Helpers ──────────────────────────────────────────────────

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const hasOverlap = (
  slots: AvailabilitySlot[],
  date: string,
  start: string,
  end: string
): boolean => {
  const newStart = toMinutes(start);
  const newEnd = toMinutes(end);

  return slots
    .filter((s) => s.date === date)
    .some((s) => {
      const existStart = toMinutes(s.start_time);
      const existEnd = toMinutes(s.end_time);
      return newStart < existEnd && newEnd > existStart;
    });
};

// ─── Sub-components ───────────────────────────────────────────

const SlotBadge: FC<{ isBooked: boolean }> = ({ isBooked }) =>
  isBooked ? (
    <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 text-xs">
      Booked
    </Badge>
  ) : (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
      Available
    </Badge>
  );

// ─── Main Component ───────────────────────────────────────────

export const ScheduleManagement: FC = () => {
  // ── Form State ──
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // ── Hooks ──
  const { data: slots = [], isLoading, isError, refetch } = useDoctorSlots(DOCTOR_ID);

  const { mutate: addSlot, isPending: isAdding } = useAddSlot();
  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteSlot(DOCTOR_ID);

  // ── Submit Handler ──
  const handleSubmit = () => {
    setFormError(null);

    if (!date || !startTime || !endTime) {
      setFormError('Please fill in all fields.');
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setFormError('Cannot add slots for past dates.');
      return;
    }

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      setFormError('End time must be after start time.');
      return;
    }

    if (toMinutes(endTime) - toMinutes(startTime) < 30) {
      setFormError('Slot duration must be at least 30 minutes.');
      return;
    }

    if (hasOverlap(slots, date, startTime, endTime)) {
      setFormError('This slot overlaps with an existing slot on the same date.');
      return;
    }

    addSlot(
      {
        doctor_id: DOCTOR_ID,
        date,
        start_time: startTime,
        end_time: endTime,
        is_booked: false,
      },
      {
        onSuccess: () => {
          toast.success('Slot added successfully');
          setDate('');
          setStartTime('');
          setEndTime('');
          setFormError(null);
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to add slot. Please try again.');
        },
      }
    );
  };

  const handleDelete = (slot: AvailabilitySlot) => {
    deleteSlot(slot.id, {
      onSuccess: () => toast.success('Slot removed successfully'),
      onError: (err: Error) =>
        toast.error(err.message || 'Failed to remove slot. Please try again.'),
    });
  };

  // ── Group slots by date ──
  const groupedSlots = useMemo(() => {
    const groups: Record<string, AvailabilitySlot[]> = {};
    const sorted = [...slots].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start_time.localeCompare(b.start_time);
    });
    sorted.forEach((slot) => {
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    });
    return groups;
  }, [slots]);

  const dateGroups = Object.entries(groupedSlots);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Schedule Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add and manage your available appointment slots
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Add Slot Form ── */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Add Availability Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="slot-date" className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                Date
              </Label>
              <Input
                id="slot-date"
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setFormError(null);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slot-start" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Start Time
              </Label>
              <Input
                id="slot-start"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setFormError(null);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slot-end" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                End Time
              </Label>
              <Input
                id="slot-end"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setFormError(null);
                }}
              />
            </div>

            {formError && <p className="text-sm text-destructive font-medium">{formError}</p>}

            <Button className="w-full" onClick={handleSubmit} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add Slot'}
            </Button>
          </CardContent>
        </Card>

        {/* ── Right: Existing Slots List ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Existing Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">Loading slots...</p>
            )}

            {isError && (
              <div className="text-center py-8">
                <p className="text-sm text-destructive mb-2">Failed to load slots.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading && !isError && dateGroups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No availability slots yet. Add your first slot using the form.
              </p>
            )}

            {!isLoading && !isError && dateGroups.length > 0 && (
              <div className="space-y-6">
                {dateGroups.map(([groupDate, groupSlots]) => {
                  const parsedDate = parseISO(groupDate);
                  const isPastDate = isPast(parsedDate) && !isToday(parsedDate);

                  return (
                    <div key={groupDate}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3
                          className={`text-sm font-semibold ${
                            isPastDate ? 'text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {format(parsedDate, 'EEEE, MMMM d, yyyy')}
                        </h3>
                        {isToday(parsedDate) && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">
                            Today
                          </Badge>
                        )}
                        {isPastDate && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Past
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {groupSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isPastDate
                                ? 'bg-muted/30 border-border/50'
                                : 'bg-background border-border hover:bg-muted/20'
                            } transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-foreground">
                                {format(parseISO(`${slot.date}T${slot.start_time}`), 'h:mm a')} —{' '}
                                {format(parseISO(`${slot.date}T${slot.end_time}`), 'h:mm a')}
                              </span>
                              <SlotBadge isBooked={slot.is_booked} />
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => handleDelete(slot)}
                              disabled={isDeleting || slot.is_booked}
                              title={slot.is_booked ? 'Cannot delete a booked slot' : 'Delete slot'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
