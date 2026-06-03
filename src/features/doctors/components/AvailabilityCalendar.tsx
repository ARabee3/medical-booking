import { FC, useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isBefore, startOfDay } from 'date-fns';
import { useDoctorAvailability, useAvailabilitySummary } from '@/features/doctors/api/doctorsApi';
import type { DoctorAvailabilitySlot } from '@/features/doctors/api/doctorsApi';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CalendarX, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  doctorId: number;
  onSlotSelect?: (date: string, time: string, price: string | null) => void;
  selectedSlot?: { date: string; time: string; price?: string | null } | null;
  onBook?: (date: string, time: string) => void;
}

export const AvailabilityCalendar: FC<AvailabilityCalendarProps> = ({
  doctorId,
  onSlotSelect,
  selectedSlot,
  onBook,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const monthStart = useMemo(
    () => format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    [currentMonth]
  );
  const monthEnd = useMemo(() => format(endOfMonth(currentMonth), 'yyyy-MM-dd'), [currentMonth]);

  const { data: summary, isLoading: isSummaryLoading } = useAvailabilitySummary(
    doctorId,
    monthStart,
    monthEnd
  );

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const {
    data: slots,
    isLoading: isSlotsLoading,
    isError: isSlotsError,
  } = useDoctorAvailability(doctorId, formattedDate);

  const availableDates = useMemo(() => {
    if (!summary) return [];
    return Object.keys(summary.slots_by_date).map((d) => new Date(d));
  }, [summary]);

  const slotCounts = summary?.slots_by_date || {};

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with total slots */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Book Appointment</h2>
        {summary && (
          <div className="text-sm text-[var(--color-foreground-muted)]">
            <span className="font-medium text-[var(--color-primary)]">{summary.total}</span>{' '}
            available slots this month
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Calendar */}
        <div className="w-full lg:w-auto flex-shrink-0">
          {isSummaryLoading ? (
            <div className="p-3 w-full max-w-sm mx-auto space-y-4">
              <Skeleton className="h-7 w-32 mx-auto" />
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <Calendar
              selected={selectedDate}
              onSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              disabled={isDateDisabled}
              modifiers={{ available: availableDates }}
              slotCounts={slotCounts}
            />
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-foreground-muted)] justify-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-muted)]" />
              <span>No slots</span>
            </div>
          </div>
        </div>

        {/* Slots Panel */}
        <div className="flex-1 w-full min-w-0">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                  {format(selectedDate, 'EEE, MMM d, yyyy')}
                </h3>
                {slots && (
                  <span className="text-sm text-[var(--color-foreground-muted)]">
                    <span className="font-medium text-[var(--color-primary)]">
                      {slots.slots.length}
                    </span>{' '}
                    slots available
                  </span>
                )}
              </div>

              {isSlotsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : isSlotsError ? (
                <p className="text-sm text-[var(--color-destructive)]">
                  Failed to load slots. Please try again.
                </p>
              ) : slots && slots.slots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.slots.map((slot: DoctorAvailabilitySlot) => {
                    const { time, price } = slot;
                    const isSelected =
                      selectedSlot?.date === formattedDate && selectedSlot?.time === time;

                    return (
                      <Button
                        key={time}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'justify-center h-auto py-2',
                          isSelected &&
                            'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]'
                        )}
                        onClick={() => {
                          if (onSlotSelect) {
                            onSlotSelect(formattedDate, time, price);
                          }
                        }}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {time}
                          </span>
                          {price ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50"
                            >
                              ${Number(price).toFixed(2)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0 h-4 text-muted-foreground"
                            >
                              Free
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-background-muted)]">
                  <CalendarX className="h-8 w-8 text-[var(--color-foreground-muted)] mb-2" />
                  <p className="text-sm font-medium text-[var(--color-foreground-muted)]">
                    No slots available
                  </p>
                  <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
                    Try selecting a different date.
                  </p>
                </div>
              )}

              {/* Book button inside slots panel */}
              {selectedSlot?.date === formattedDate && onBook && (
                <Button
                  className="w-full mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
                  onClick={() => onBook(selectedSlot.date, selectedSlot.time)}
                >
                  Book at {selectedSlot.time}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-background-muted)] min-h-[200px]">
              <Clock className="h-10 w-10 text-[var(--color-foreground-muted)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-foreground-muted)]">
                Select a date to view available time slots
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
                Days with availability are highlighted in the calendar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
