import { FC, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useCurrentDoctor, useUpdateDoctor } from '@/features/doctors/api/doctorsApi';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { UserCircle } from 'lucide-react';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'General Practice',
];

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialty: z.string().min(1, 'Specialty is required'),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be under 500 characters'),
  image_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const DoctorProfileEdit: FC = () => {
  const { data: doctor, isLoading, isError, error, refetch } = useCurrentDoctor();
  const updateMutation = useUpdateDoctor();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      specialty: '',
      bio: '',
      image_url: '',
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        name: doctor.name,
        specialty: doctor.specialty,
        bio: doctor.bio,
        image_url: doctor.image_url || '',
      });
    }
  }, [doctor, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!doctor) return;

    try {
      await updateMutation.mutateAsync({
        id: doctor.id,
        updates: {
          name: values.name,
          specialty: values.specialty,
          bio: values.bio,
          image_url: values.image_url || null,
        },
      });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const imageUrl = useWatch({ control: form.control, name: 'image_url' });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">My Profile</h1>
        <p className="text-[var(--color-foreground-muted)] mt-1">
          Update your public profile information.
        </p>
      </div>

      {/* Avatar Preview */}
      <div className="flex items-center gap-4">
        <Avatar
          src={imageUrl || null}
          alt={doctor.name}
          fallback={doctor.name}
          className="h-20 w-20 text-2xl"
        />
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">Profile Photo</p>
          <p className="text-xs text-[var(--color-foreground-muted)]">
            Paste an image URL below to update your avatar.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. Sarah Chen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/photo.jpg" {...field} />
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
                    name: doctor.name,
                    specialty: doctor.specialty,
                    bio: doctor.bio,
                    image_url: doctor.image_url || '',
                  })
                }
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
