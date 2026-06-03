import { FC, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  useCurrentDoctor,
  useUpdateDoctorProfile,
  useUploadAvatar,
  useDeleteAvatar,
} from '@/features/doctors/api/doctorsApi';
import { ImageUploader } from './ImageUploader';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  UserCircle,
  Trash2,
  Camera,
  Building2,
  FileBadge,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { ReviewList } from '@/features/reviews/components/ReviewList';
import { StarRating } from '@/components/ui/star-rating';
import { useAuth } from '@/context/AuthContext';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'General Practice',
];

const profileSchema = z.object({
  specialty: z.string().min(1, 'Specialty is required'),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be under 500 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const DoctorProfileEdit: FC = () => {
  const { data: doctor, isLoading, isError, error, refetch } = useCurrentDoctor();
  const updateMutation = useUpdateDoctorProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      specialty: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        specialty: doctor.specialty,
        bio: doctor.bio,
      });
    }
  }, [doctor, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!doctor) return;

    try {
      await updateMutation.mutateAsync({
        id: doctor.id,
        updates: {
          specialty: values.specialty,
          bio: values.bio,
        },
      });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    uploadAvatarMutation.mutate(file, {
      onSuccess: () => {
        toast.success('Avatar updated');
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
      },
      onError: () => {
        toast.error('Failed to upload avatar');
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = () => {
    deleteAvatarMutation.mutate(undefined, {
      onSuccess: () => toast.success('Avatar removed'),
      onError: () => toast.error('Failed to remove avatar'),
    });
  };

  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (user?.role === 'DOCTOR' && !user.is_approved) {
    return (
      <div className="py-12 text-center">
        <Clock className="h-12 w-12 text-[var(--color-foreground-muted)] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          Profile Pending Approval
        </h2>
        <p className="text-base text-[var(--color-foreground-muted)] max-w-md mx-auto">
          Your profile is currently under review. The admin will approve your profile as soon as
          possible.
        </p>
      </div>
    );
  }

  // Detect the "no doctor profile" 404 from the backend
  const isNoProfileError =
    isError &&
    ((error as { response?: { status: number; data?: { detail?: string } } })?.response?.status ===
      404 ||
      error?.message?.toLowerCase().includes('doctor profile'));

  if (isNoProfileError) {
    return (
      <div className="py-12 text-center">
        <UserCircle className="h-12 w-12 text-[var(--color-foreground-muted)] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          Doctor Profile Not Found
        </h2>
        <p className="text-base text-[var(--color-foreground-muted)] max-w-md mx-auto">
          It looks like your doctor profile hasn't been set up yet. Please contact the administrator
          for assistance.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorMessage message={error?.message || 'Failed to load your profile'} onRetry={refetch} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-12 text-center">
        <UserCircle className="h-12 w-12 text-[var(--color-foreground-muted)] mx-auto mb-4" />
        <p className="text-lg font-medium text-[var(--color-foreground-muted)]">
          No doctor profile found for this account.
        </p>
      </div>
    );
  }

  const avatarSrc = previewUrl || doctor.image_url || null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">My Profile</h1>
        <p className="text-[var(--color-foreground-muted)] mt-1">
          Update your public profile information and manage your images.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar
            src={avatarSrc}
            alt={doctor.name}
            fallback={doctor.name}
            className="h-24 w-24 text-3xl"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0"
            disabled={uploadAvatarMutation.isPending}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-foreground)]">{doctor.name}</p>
          <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
            Click the avatar to upload a new photo.
          </p>
          {doctor.image_url && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive mt-2 p-0"
              onClick={handleDeleteAvatar}
              disabled={deleteAvatarMutation.isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove avatar
            </Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialty</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell patients about your experience and expertise..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !form.formState.isDirty}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            {form.formState.isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset({
                    specialty: doctor.specialty,
                    bio: doctor.bio,
                  })
                }
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Clinic Images Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[var(--color-foreground-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Clinic Images</h2>
        </div>
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Show patients your clinic facilities and waiting areas.
        </p>
        <ImageUploader kind="CLINIC" />
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Certificates Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileBadge className="h-5 w-5 text-[var(--color-foreground-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Certificates</h2>
        </div>
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Upload your medical licenses, board certifications, and qualifications.
        </p>
        <ImageUploader kind="CERTIFICATE" />
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--color-foreground-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Patient Reviews</h2>
        </div>
        {doctor.review_count > 0 ? (
          <div className="flex items-center gap-2">
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
        ) : (
          <p className="text-sm text-[var(--color-foreground-muted)]">
            No reviews yet. Reviews will appear here after patients complete appointments with you.
          </p>
        )}
        <ReviewList doctorId={doctor.id} />
      </div>
    </div>
  );
};
