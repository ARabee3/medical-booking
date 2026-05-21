import { FC, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useDoctors } from '@/features/doctors/api/doctorsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DoctorCard } from './DoctorCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';

export const DoctorList: FC = () => {
  const { data, isLoading, isError, error, refetch } = useDoctors();
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

  const handleClear = () => {
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Find a Doctor</h1>
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

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-foreground-muted)]" />
        <Input
          type="text"
          placeholder="Search by doctor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {hasSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-[var(--color-foreground-muted)]" />
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
