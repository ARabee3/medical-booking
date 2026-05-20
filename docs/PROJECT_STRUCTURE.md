# Project Structure

**Applies to:** Ahmed, Abdulazim, Gerges, Mokhtar  
**Created by:** Ahmed (Phase 0 scaffold)  
**Maintained by:** Entire team with shared file rules

---

## 1. Top-Level Tree

```
MedicalBooking/
├── docs/                           # Planning documents
│   ├── USER_STORIES.md
│   ├── CONVENTIONS.md
│   ├── GIT_WORKFLOW.md
│   ├── API_CONTRACT.md
│   ├── DATABASE_ARCHITECTURE.md
│   └── PROJECT_STRUCTURE.md        # This file
├── src/
│   ├── main.tsx                    # Entry point (React + providers)
│   ├── App.tsx                     # Route registry
│   ├── features/                   # Domain-driven feature folders
│   │   ├── auth/                   # Ahmed
│   │   ├── doctors/                # Abdulazim
│   │   ├── appointments/           # Gerges
│   │   └── admin/                  # Mokhtar
│   ├── components/                 # Shared components (cross-cutting)
│   │   ├── ui/                     # Shadcn/ui components (auto-generated)
│   │   ├── Layout.tsx              # Page shell
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── PrivateRoute.tsx        # Role-based route guard
│   │   ├── LoadingSpinner.tsx      # Global loading indicator
│   │   ├── ErrorMessage.tsx        # Reusable error display
│   │   ├── EmptyState.tsx          # Reusable empty state
│   │   └── SkeletonCard.tsx        # Loading skeleton for cards
│   ├── context/                    # Global React Contexts
│   │   └── AuthContext.tsx         # Authentication state
│   ├── hooks/                      # Global custom hooks
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── lib/                        # Core utilities & config
│   │   ├── api.ts                  # Axios instance + interceptors
│   │   ├── queryClient.ts          # TanStack Query client
│   │   └── utils.ts                # cn() helper, formatters
│   ├── mocks/                      # Static seed data
│   │   └── data.ts                 # Realistic mock dataset
│   ├── types/                      # Global TypeScript types
│   │   └── global.ts               # User, Doctor, Appointment, etc.
│   └── styles/
│       └── globals.css             # Tailwind + Shadcn CSS variables
├── tests/                          # Test utilities & setup
│   └── setup.ts
├── public/                         # Static assets
│   └── (images, favicon)
├── .env.example                    # Environment variable template
├── .env                            # Local overrides (gitignored)
├── .eslintrc.cjs                   # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .husky/                         # Git hooks
│   └── pre-commit
├── components.json                 # Shadcn/ui configuration
├── tailwind.config.js              # Tailwind theme extensions
├── postcss.config.js               # PostCSS configuration
├── vite.config.ts                  # Vite + path aliases
├── tsconfig.json                   # TypeScript configuration
├── package.json
└── README.md
```

---

## 2. Feature Folder Structure

Each feature follows this exact pattern. Ownership is strict — only the assigned dev modifies these.

### Example: `features/auth/` (Ahmed)

```
features/auth/
├── api/                            # API functions (hooks around mockApi.ts)
│   ├── authApi.ts                  # login(), register(), refresh() — TanStack Query wrappers
├── components/                     # UI components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── LogoutButton.tsx
├── context/                        # Auth-specific context
│   ├── AuthContext.tsx             # Context definition + provider
│   └── useAuth.ts                  # Convenience hook
├── hooks/                          # Auth-specific hooks
│   └── useRedirectByRole.ts        # Redirect based on user role
├── types.ts                        # Auth DTOs
│   # LoginRequest, RegisterRequest, JWTPair, etc.
└── utils.ts                        # Auth helpers
    # decodeToken(), isTokenExpired(), etc.
```

### Example: `features/doctors/` (Abdulazim)

```
features/doctors/
├── api/
│   └── doctorsApi.ts
├── components/
│   ├── DoctorCard.tsx
│   ├── DoctorList.tsx
│   ├── DoctorProfile.tsx
│   └── AvailabilityCalendar.tsx
├── hooks/
│   ├── useDoctors.ts
│   └── useDoctorAvailability.ts
├── types.ts                        # Doctor, AvailabilitySlot
└── utils.ts                        # Filter helpers
```

### Example: `features/appointments/` (Gerges)

```
features/appointments/
├── api/
│   └── appointmentsApi.ts
├── components/
│   ├── AppointmentCard.tsx
│   ├── AppointmentList.tsx
│   ├── BookingForm.tsx
│   ├── RescheduleForm.tsx
│   └── DoctorAppointmentDashboard.tsx
├── hooks/
│   ├── useAppointments.ts
│   ├── useBookAppointment.ts
│   ├── useCancelAppointment.ts
│   └── useRescheduleAppointment.ts
├── types.ts                        # Appointment, BookingRequest
└── utils.ts                        # Status color helpers
```

### Example: `features/admin/` (Mokhtar)

```
features/admin/
├── api/
│   └── adminApi.ts
├── components/
│   ├── AdminDashboard.tsx
│   ├── UserTable.tsx
│   ├── AppointmentOverview.tsx
│   └── StatCards.tsx
├── hooks/
│   ├── useAdminUsers.ts
│   └── useAdminAppointments.ts
├── types.ts                        # AdminUser, AdminStats
└── utils.ts                        # Table column helpers
```

---

## 3. Shared Files & Stewardship

These files are **cross-cutting** — all features depend on them. Changes affect everyone.

| File | Steward | Why Sacred |
|------|---------|------------|
| `src/types/global.ts` | Ahmed | Every feature imports User, UserRole, Appointment, etc. |
| `src/lib/api.ts` | Ahmed | Axios instance. JWT interceptor. If broken, auth dies for everyone. |
| `src/lib/queryClient.ts` | Ahmed | TanStack Query cache config. Affects all server state. |
| `src/context/AuthContext.tsx` | Ahmed | Everyone reads `user`, `isAuthenticated`. Changes ripple to all routes. |
| `src/lib/mockApi.ts` | Ahmed | All async mock functions. Central mock API. Changes affect all features. |
| `src/mocks/data.ts` | Abdulazim | Seed data. Doctor list, appointments. Changes affect Abdulazim + Gerges + Mokhtar. |
| `src/App.tsx` | Ahmed | Route registry. New routes added here. Conflicts guaranteed if uncoordinated. |
| `src/components/ui/*` | Mokhtar | Shadcn components. Shared design system. Style changes affect all UI. |
| `src/components/Layout.tsx` | Ahmed | Page shell. Wrapper for all pages. |
| `src/components/Navbar.tsx` | Ahmed | Dynamic nav. Links depend on auth state + user role. |
| `src/components/PrivateRoute.tsx` | Ahmed | Route guards. Reads from AuthContext. |
| `vite.config.ts` | Ahmed | Path aliases, build config. Affects imports across project. |
| `tsconfig.json` | Ahmed | TypeScript config. Affects type checking everywhere. |
| `tailwind.config.js` | Mokhtar | Theme extensions. Color changes affect all components. |
| `src/styles/globals.css` | Mokhtar | CSS variables, Tailwind directives. |

### Stewardship Rules

1. **The steward is the default reviewer** when their file is touched in a PR.
2. **Anyone can read** shared files. No restrictions on reading.
3. **Modifying a shared file:**
   - Announce in team chat before starting work
   - Explain the change and who it affects
   - Open focused PR (or include in feature PR with clear comment)
   - Tag the steward for review
4. **Adding new shared files** (e.g., new hook in `src/hooks/`):
   - Any dev can add, but announce it so others know it exists

---

## 4. Import Hierarchy

Follow this dependency direction to avoid circular imports:

```
Shared (bottom layer)
├── lib/ (api, utils, queryClient)
├── types/ (global types)
├── context/ (AuthContext)
└── components/ui/ (Shadcn)

Cross-cutting components
├── components/ (Layout, Navbar, PrivateRoute, etc.)

Features (top layer)
├── features/auth/
├── features/doctors/
├── features/appointments/
└── features/admin/
```

**Rule:** Features can import from shared. Shared **must never** import from features.

**Bad (circular):**
```typescript
// lib/api.ts
import { useAuth } from '@/features/auth/hooks/useAuth';  // ❌ WRONG
```

**Good:**
```typescript
// lib/api.ts
import { AuthContextType } from '@/types/global';  // ✅ OK
```

---

## 5. Adding New Shadcn Components

Only Mokhtar (UI steward) or team consensus adds new Shadcn components to `src/components/ui/`.

```bash
# 1. Announce in chat: "Adding calendar component"
# 2. Run CLI
npx shadcn-ui@latest add calendar

# 3. Review the generated file for consistency with theme
# 4. Commit with docs prefix: "docs(ui): add calendar component"
```

---

## 6. Environment Variables

```
# .env.example (committed to repo)
VITE_API_BASE_URL=/api
VITE_MOCK_API_ENABLED=true

# .env (gitignored, local only)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MOCK_API_ENABLED=false
```

**Rule:** All env vars must be prefixed with `VITE_` to be exposed to client code.

---

## 7. Key Paths

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@/` | `./src/` | `import { Button } from '@/components/ui/button'` |
| `@/features/*` | `./src/features/*` | Feature imports |
| `@/lib/*` | `./src/lib/*` | Utilities |
| `@/types/*` | `./src/types/*` | Type imports |
| `@/hooks/*` | `./src/hooks/*` | Global hooks |

Configured in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```
