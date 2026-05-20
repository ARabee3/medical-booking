# Coding Conventions & Design System

**Applies to:** Ahmed, Abdulazim, Gerges, Mokhtar  
**Enforced by:** Team agreement + pre-commit hooks

---

## 1. File & Folder Naming

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase, one per file | `DoctorCard.tsx`, `LoginForm.tsx` |
| Custom Hooks | camelCase, prefix `use` | `useAuth.ts`, `useDoctors.ts` |
| Utilities/Helpers | camelCase, descriptive | `formatDate.ts`, `cn.ts` |
| Feature Folders | kebab-case | `src/features/doctors/`, `src/features/auth/` |
| Types | PascalCase, `.ts` suffix | `User.ts`, `Appointment.ts` |
| Constants | UPPER_SNAKE_CASE or camelCase | `API_BASE_URL`, `userRoles` |

---

## 2. Folder Structure Rule

Every feature folder follows this pattern:

```
features/<feature-name>/
├── api/              # API functions (TanStack Query wrappers around mockApi.ts)
├── components/       # UI components (this feature only)
├── context/          # React Context (if feature-scoped)
├── hooks/            # Custom hooks
├── types.ts          # TypeScript types/interfaces
└── utils.ts          # Feature-specific helpers
```

**Shared components** go in `src/components/` (not inside features).

---

## 3. Imports & Path Aliases

Always use absolute imports with the `@/` alias:

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Doctor } from '@/features/doctors/types';

// ❌ Wrong
import { Button } from '../../../components/ui/button';
```

**Why:** Refactoring is painless. No broken relative paths.

---

## 4. Component Pattern

Functional components only. Named exports. Props interface.

```tsx
// ✅ Correct
import { FC } from 'react';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect?: (id: number) => void;
}

export const DoctorCard: FC<DoctorCardProps> = ({ doctor, onSelect }) => {
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
};

// ❌ Wrong: default exports, no types, implicit return for complex components
```

**Exception:** Page-level components can use default export if needed for React Router lazy loading.

---

## 5. Form Pattern (RHF + Zod + Shadcn)

Every form follows this exact pattern:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

// 1. Schema next to component
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: FC = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    // API call here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## 6. TanStack Query Pattern

```tsx
// In feature/api/doctorsApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctors, bookAppointment } from '@/lib/mockApi';

const DOCTORS_KEY = 'doctors';

export const useDoctors = (specialty?: string) => {
  return useQuery({
    queryKey: [DOCTORS_KEY, specialty],
    queryFn: () => getDoctors(specialty),
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookingRequest) => bookAppointment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

**Rules:**
- Always define `queryKey` as a constant
- Always type the return with `as Doctor[]` or proper generic
- Invalidate related queries on mutations

---

## 6a. Mock Service Functions Pattern

During React phase, API calls are served by mock functions instead of a real backend.

### The Central Mock File (`src/lib/mockApi.ts`)

```typescript
import { mockDoctors, mockUsers, mockAppointments } from '@/mocks/data';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Simulate GET /api/doctors/
export const getDoctors = async (specialty?: string): Promise<Doctor[]> => {
  await delay(400);
  let data = [...mockDoctors];
  if (specialty) data = data.filter((d) => d.specialty === specialty);
  return data;
};

// Simulate GET /api/doctors/:id/
export const getDoctorById = async (id: number): Promise<Doctor | undefined> => {
  await delay(300);
  return mockDoctors.find((d) => d.id === id);
};

// Simulate POST /api/token/
export const login = async (credentials: LoginRequest) => {
  await delay(300);
  const user = mockUsers.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );
  if (!user) throw new Error('Invalid credentials');
  return {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    user,
  };
};

// Simulate POST /api/appointments/
export const bookAppointment = async (request: BookingRequest): Promise<Appointment> => {
  await delay(500);
  // Check for double booking
  const existing = mockAppointments.find(
    (a) => a.doctor.id === request.doctor_id && a.date === request.date && a.time === request.time
  );
  if (existing) throw new Error('This time slot is already booked');

  const appointment: Appointment = {
    id: mockAppointments.length + 1,
    doctor: mockDoctors.find((d) => d.id === request.doctor_id)!,
    date: request.date,
    time: request.time,
    status: 'PENDING',
    notes: null,
    created_at: new Date().toISOString(),
  };
  mockAppointments.push(appointment); // mutate in-memory for simplicity
  return appointment;
};
```

### Feature API Wrappers

Feature folders wrap mock functions in TanStack Query hooks. This is the exact same pattern used with real Axios.

```typescript
// features/doctors/api/doctorsApi.ts
import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '@/lib/mockApi';

export const useDoctors = (specialty?: string) => {
  return useQuery({
    queryKey: ['doctors', specialty],
    queryFn: () => getDoctors(specialty),
  });
};
```

### Migration to Django (Later)

When Django is ready, the change is surgical:

```typescript
// BEFORE (mock)
import { getDoctors } from '@/lib/mockApi';

// AFTER (real backend)
import { api } from '@/lib/api';

export const getDoctors = async (specialty?: string) => {
  const { data } = await api.get('/doctors/', {
    params: specialty ? { specialty } : undefined,
  });
  return data;
};
```

Components stay 100% unchanged. Only `mockApi.ts` is replaced.

---

## 7. Context API Pattern

```tsx
// features/auth/context/AuthContext.tsx
import { createContext, useContext, useState, useCallback, FC, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    // implementation
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 8. Design System — Medical Theme

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#0f766e` | Buttons, links, active states, calendar selected |
| **Primary Light** | `#14b8a6` | Hover states, highlights, badges |
| **Primary Lighter** | `#ccfbf1` | Background tints, subtle highlights |
| **Secondary** | `#64748b` | Secondary text, borders, inactive states |
| **Background** | `#ffffff` | Page background |
| **Background Muted** | `#f8fafc` | Cards, sections, table headers |
| **Foreground** | `#0f172a` | Primary text, headings |
| **Foreground Muted** | `#475569` | Secondary text, descriptions |
| **Destructive** | `#e11d48` | Cancel, delete, block, error states |
| **Destructive Light** | `#ffe4e6` | Destructive background tint |
| **Warning** | `#f59e0b` | Pending status, alerts |
| **Warning Light** | `#fef3c7` | Warning background |
| **Success** | `#10b981` | Confirmed status, approve actions |
| **Success Light** | `#d1fae5` | Success background |
| **Info** | `#3b82f6` | Completed status, informational |
| **Info Light** | `#dbeafe` | Info background |
| **Border** | `#e2e8f0` | Card borders, dividers, input borders |
| **Border Focus** | `#0f766e` | Focused input border |
| **Input** | `#ffffff` | Input background |
| **Ring** | `#14b8a6` | Focus ring (tailwind ring-color) |

### Shadcn CSS Variables

In `src/styles/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 174 84% 24%;
    --primary-foreground: 0 0% 100%;
    --secondary: 215 16% 47%;
    --secondary-foreground: 0 0% 100%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 174 84% 24%;
    --accent-foreground: 0 0% 100%;
    --destructive: 346 84% 50%;
    --destructive-foreground: 0 0% 100%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 174 84% 24%;
    --radius: 0.5rem;
  }
}
```

### Typography

| Element | Tailwind Class | Font Weight |
|---------|---------------|-------------|
| Page Title | `text-3xl font-bold` | 700 |
| Section Title | `text-xl font-semibold` | 600 |
| Card Title | `text-lg font-medium` | 500 |
| Body | `text-sm` or `text-base` | 400 |
| Caption/Label | `text-xs` | 400 |
| Button | `text-sm font-medium` | 500 |

### Spacing

- Page padding: `px-4 md:px-8 lg:px-12`
- Card padding: `p-6`
- Section gap: `gap-6`
- Form field gap: `space-y-4`
- Button internal padding: `px-4 py-2`

### Component Patterns

**Card:**
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Button Hierarchy:**
- Primary action: `<Button>` (default, teal)
- Secondary action: `<Button variant="outline">`
- Destructive: `<Button variant="destructive">`
- Ghost/Link: `<Button variant="ghost">`

**Status Badges:**
```tsx
// PENDING
<Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Pending</Badge>

// CONFIRMED
<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Confirmed</Badge>

// CANCELLED
<Badge variant="destructive">Cancelled</Badge>

// COMPLETED
<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Completed</Badge>
```

---

## 9. Responsive Breakpoints

Use Tailwind default breakpoints consistently:

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Rarely needed, mobile-first default |
| `md` | 768px | Tablet switch (2 columns, hamburger → nav) |
| `lg` | 1024px | Desktop (3 columns, full sidebar) |
| `xl` | 1280px | Wide desktop (max-width containers) |

**Pattern:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

---

## 10. Error Handling Pattern

```tsx
// In component
const { data, isLoading, isError, error, refetch } = useDoctors();

if (isLoading) return <DoctorListSkeleton />;
if (isError) return <ErrorMessage message={error.message} onRetry={refetch} />;
if (!data?.length) return <EmptyState message="No doctors found" />;
```

**ErrorMessage component (shared):**
```tsx
export const ErrorMessage: FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <p className="text-lg font-medium text-gray-900 mb-2">Something went wrong</p>
    <p className="text-sm text-gray-500 mb-4">{message}</p>
    {onRetry && <Button onClick={onRetry}>Try Again</Button>}
  </div>
);
```

---

## 11. Toast Notifications (Sonner)

```tsx
import { toast } from 'sonner';

// Success
toast.success('Appointment booked successfully');

// Error
toast.error('Failed to book appointment. Please try again.');

// Loading (async)
toast.promise(bookAppointment(), {
  loading: 'Booking your appointment...',
  success: 'Appointment booked!',
  error: 'Booking failed.',
});
```

---

## 12. Date Formatting (date-fns)

```tsx
import { format, parseISO, isPast } from 'date-fns';

// Display
format(parseISO(dateString), 'EEE, MMM d, yyyy');   // "Mon, Jan 20, 2026"
format(parseISO(timeString), 'h:mm a');              // "9:00 AM"

// Validation
if (isPast(parseISO(dateString))) {
  // Disable
}
```

---

## 13. Linting & Formatting

**ESLint:** Enforces React hooks rules, unused imports, exhaustive deps  
**Prettier:** Auto-format on save. Tab width: 2. Single quotes. Trailing commas: es5.  
**Husky:** Blocks commits with lint errors.

---

## 14. Comment Rules

```tsx
// ✅ Good: Why, not what
// Retry on 401 because token might have expired

// ❌ Bad: Obvious
// Set loading to true
setLoading(true);
```

For complex logic, use JSDoc:
```tsx
/**
 * Debounces a value by the specified delay.
 * Use for search inputs to avoid excessive API calls.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // ...
}
```
