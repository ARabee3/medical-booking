import { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Award, Building2, FileBadge, X, MessageSquare } from 'lucide-react';
import { useDoctor } from '@/features/doctors/api/doctorsApi';
import { AvailabilityCalendar } from '@/features/doctors/components/AvailabilityCalendar';
import { ReviewList } from '@/features/reviews/components/ReviewList';
import { StarRating } from '@/components/ui/star-rating';
import { useBookAppointment } from '@/features/appointments/api/appointmentsApi';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import type { DoctorImageKind } from '@/types/global';

const KIND_ICONS: Record<DoctorImageKind, typeof Building2> = {
  CLINIC: Building2,
  CERTIFICATE: FileBadge,
};

const KIND_LABELS: Record<DoctorImageKind, string> = {
  CLINIC: 'Clinic Photos',
  CERTIFICATE: 'Certificates',
};

interface ImageGalleryProps {
  images: { id: number; image_url: string; caption?: string }[];
  kind: DoctorImageKind;
}

const ImageGallery: FC<ImageGalleryProps> = ({ images, kind }) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);
  const Icon = KIND_ICONS[kind];

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--color-foreground-muted)]" />
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
          {KIND_LABELS[kind]}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelectedImage({ url: img.image_url, caption: img.caption || '' })}
            className="group relative aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
          >
            <img
              src={img.image_url}
              alt={img.caption || KIND_LABELS[kind]}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                <p className="text-xs text-white truncate">{img.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedImage?.caption || KIND_LABELS[kind]}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || KIND_LABELS[kind]}
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const DoctorProfile: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doctorId = id ? parseInt(id, 10) : 0;

  const { data: doctor, isLoading, isError, error, refetch } = useDoctor(doctorId);
  const bookMutation = useBookAppointment();

  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
    price?: string | null;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => {
    navigate('/doctors');
  };

  const handleSlotSelect = (date: string, time: string, price: string | null) => {
    setSelectedSlot({ date, time, price });
  };

  const handleBookClick = () => {
    if (selectedSlot) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !doctorId) return;

    try {
      await bookMutation.mutateAsync({
        doctor_id: doctorId,
        date: selectedSlot.date,
        time: selectedSlot.time,
      });
      toast.success('Appointment booked successfully!');
      setShowConfirm(false);
      navigate('/my-appointments');
    } catch {
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
        <ErrorMessage
          message={error?.message || 'Failed to load doctor profile'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-12 text-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>
        <p className="text-lg font-medium text-[var(--color-foreground-muted)]">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Doctors
      </Button>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar
          src={doctor.image_url}
          alt={doctor.name}
          fallback={doctor.name}
          size="lg"
          className="h-24 w-24 text-2xl flex-shrink-0"
        />
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{doctor.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-lighter)] text-sm px-3 py-1"
            >
              <Award className="h-3.5 w-3.5 mr-1" />
              {doctor.specialty}
            </Badge>
            <span className="text-sm text-[var(--color-foreground-muted)] flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {doctor.email}
            </span>
          </div>
          {doctor.review_count > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <StarRating
                rating={doctor.average_rating || 0}
                size="sm"
                readonly
                halfStars
                showValue
              />
              <span className="text-sm text-muted-foreground">
                ({doctor.review_count} {doctor.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">About</h2>
        <p className="text-base text-[var(--color-foreground-muted)] leading-relaxed">
          {doctor.bio}
        </p>
      </div>

      {/* Clinic & Certificate Images */}
      {doctor.images && doctor.images.length > 0 && (
        <>
          <div className="border-t border-[var(--color-border)]" />
          <ImageGallery images={doctor.images.filter((i) => i.kind === 'CLINIC')} kind="CLINIC" />
          <ImageGallery
            images={doctor.images.filter((i) => i.kind === 'CERTIFICATE')}
            kind="CERTIFICATE"
          />
        </>
      )}

      {/* Reviews Section */}
      <div className="border-t border-[var(--color-border)]" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--color-foreground-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Reviews</h2>
        </div>
        <ReviewList doctorId={doctorId} />
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Availability Calendar with Booking */}
      <AvailabilityCalendar
        doctorId={doctorId}
        onSlotSelect={handleSlotSelect}
        selectedSlot={selectedSlot}
        onBook={handleBookClick}
      />

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Doctor</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {doctor.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Specialty</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {doctor.specialty}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Date</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {selectedSlot && format(parseISO(selectedSlot.date), 'EEE, MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Time</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {selectedSlot?.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-foreground-muted)]">Price</span>
              <span className="text-sm font-medium text-emerald-700">
                {selectedSlot?.price ? `$${Number(selectedSlot.price).toFixed(2)}` : 'Free'}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={bookMutation.isPending}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
            >
              {bookMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
