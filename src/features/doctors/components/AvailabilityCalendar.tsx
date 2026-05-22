import { FC, useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { useDoctorAvailability } from '@/features/doctors/api/doctorsApi';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  doctorId: number;
  availableDates?: Date[];
  onSlotSelect?: (date: string, time: string) => void;
  selectedSlot?: { date: string; time: string } | null;
}

export const AvailabilityCalendar: FC<AvailabilityCalendarProps> = ({
  doctorId,
  availableDates,
  onSlotSelect,
  selectedSlot,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const {
    data: slots,
    isLoading: isSlotsLoading,
    isError: isSlotsError,
  } = useDoctorAvailability(doctorId, formattedDate);

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Calendar */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <Calendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            modifiers={{ available: availableDates }}
          />
        </div>

        {/* Slots Panel */}
        <div className="flex-1 w-full min-w-0">
          {selectedDate ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                Available Slots — {format(selectedDate, 'EEE, MMM d, yyyy')}
              </h3>

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
              ) : slots && slots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map((time) => {
                    const isSelected =
                      selectedSlot?.date === formattedDate && selectedSlot?.time === time;

                    return (
                      <Button
                        key={time}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'justify-center',
                          isSelected &&
                            'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]'
                        )}
                        onClick={() => {
                          if (onSlotSelect) {
                            onSlotSelect(formattedDate, time);
                          }
                        }}
                      >
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {time}
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-background-muted)]">
              <Clock className="h-10 w-10 text-[var(--color-foreground-muted)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-foreground-muted)]">
                Select a date to view available time slots
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
