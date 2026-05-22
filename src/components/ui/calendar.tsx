import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type CalendarProps = {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  modifiers?: {
    available?: Date[];
  };
  className?: string;
};

function Calendar({ selected, onSelect, disabled, modifiers, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const availableSet = React.useMemo(() => {
    if (!modifiers?.available) return new Set<string>();
    return new Set(modifiers.available.map((d) => format(d, 'yyyy-MM-dd')));
  }, [modifiers?.available]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={cn('p-3 w-full max-w-sm mx-auto', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</div>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs text-[var(--color-foreground-muted)] font-medium"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          const isSelected = selected && isSameDay(date, selected);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isPast = isBefore(date, startOfDay(new Date()));
          const isDisabled = isPast || (disabled && disabled(date));
          const isAvailable = availableSet.has(format(date, 'yyyy-MM-dd'));

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && onSelect) {
                  onSelect(date);
                  setCurrentMonth(date);
                }
              }}
              className={cn(
                'h-9 w-full rounded-md text-sm relative flex items-center justify-center transition-colors',
                'hover:bg-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
                !isCurrentMonth && 'text-[var(--color-foreground-muted)] opacity-50',
                isSelected &&
                  'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]',
                isDisabled &&
                  'text-[var(--color-foreground-muted)] opacity-40 cursor-not-allowed hover:bg-transparent',
                isAvailable &&
                  !isSelected &&
                  !isDisabled &&
                  'border border-[var(--color-primary)] text-[var(--color-primary)] font-medium'
              )}
            >
              {format(date, 'd')}
              {isAvailable && !isSelected && !isDisabled && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
