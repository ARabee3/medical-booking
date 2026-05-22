import { FC, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDoctors } from '@/features/doctors/api/doctorsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DoctorCard } from './DoctorCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'General Practice',
];

export const DoctorList: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const specialty = searchParams.get('specialty') || '';

  const { data, isLoading, isError, error, refetch } = useDoctors(specialty || undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredDoctors = useMemo(() => {
    if (!data) return [];
    if (!debouncedSearch.trim()) return data;

    const query = debouncedSearch.trim().toLowerCase();
    return data.filter((doctor) => {
      const nameParts = doctor.name.toLowerCase().split(' ');
      return nameParts.some((part) => part.includes(query));
    });
  }, [data, debouncedSearch]);

  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasFilters = hasSearchTerm || !!specialty;

  const handleSpecialtyChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All' || value === '') {
      next.delete('specialty');
    } else {
      next.set('specialty', value);
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    const next = new URLSearchParams(searchParams);
    next.delete('specialty');
    setSearchParams(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Find a Doctor</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-foreground-muted)]" />
            <Input
              type="text"
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {hasSearchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]" />
              </button>
            )}
          </div>

          <select
            value={specialty}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 cursor-pointer"
            aria-label="Filter by specialty"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s === 'All' ? '' : s}>
                {s === 'All' ? 'All Specialties' : s}
              </option>
            ))}
          </select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-[var(--color-destructive)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive-light)]"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorMessage message={error?.message || 'Failed to load doctors'} onRetry={refetch} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="py-12">
        <EmptyState message="No doctors available" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Find a Doctor</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-foreground-muted)]" />
          <Input
            type="text"
            placeholder="Search by doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {hasSearchTerm && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--color-foreground-muted)]" />
          <select
            value={specialty}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 cursor-pointer"
            aria-label="Filter by specialty"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s === 'All' ? '' : s}>
                {s === 'All' ? 'All Specialties' : s}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-[var(--color-destructive)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive-light)]"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Results */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState message="No results found" />
        </div>
      )}
    </div>
  );
};
