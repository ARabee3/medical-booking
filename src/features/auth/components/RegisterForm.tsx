import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['PATIENT', 'DOCTOR']),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm: FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirm: '',
      role: undefined,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        email: values.email,
        password: values.password,
        password_confirm: values.password_confirm,
        role: values.role,
        first_name: values.first_name,
        last_name: values.last_name,
      });

      toast.success('Account created. Welcome!');

      if (values.role === 'DOCTOR') {
        navigate('/doctor/appointments');
      } else {
        navigate('/doctors');
      }
    } catch (err: unknown) {
      const error = err as { message?: string; fieldErrors?: Record<string, string[]> };

      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof RegisterFormValues, {
              type: 'manual',
              message: messages[0],
            });
          }
        });
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Register as a patient or doctor to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <label
                          className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors ${
                            field.value === 'PATIENT'
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-lighter)] text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] hover:bg-[var(--color-background-muted)]'
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            value="PATIENT"
                            checked={field.value === 'PATIENT'}
                            onChange={() => field.onChange('PATIENT')}
                          />
                          Patient
                        </label>
                        <label
                          className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors ${
                            field.value === 'DOCTOR'
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-lighter)] text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] hover:bg-[var(--color-background-muted)]'
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            value="DOCTOR"
                            checked={field.value === 'DOCTOR'}
                            onChange={() => field.onChange('DOCTOR')}
                          />
                          Doctor
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
