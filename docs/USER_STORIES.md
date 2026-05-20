# User Stories — Medical Booking System (React Phase)

**Team:** Ahmed, Abdulazim, Gerges, Mokhtar  
**Phase:** React Frontend (mock API)  
**Backend Phase:** After all React stories are complete

---

## Epic: Auth & Routing (Ahmed)

### US-001: Register
**As a** visitor, **I want** to register as patient or doctor, **so that** I can access the system.

**AC:**
- [ ] Form fields: email, password, confirm password, role (radio: Patient/Doctor)
- [ ] Zod validation: valid email, password min 8 chars, passwords match, role required
- [ ] On submit: POST `/api/register/` via mock API → returns user + tokens
- [ ] Sonner toast on success: "Account created. Welcome!"
- [ ] Redirect to `/doctors` (patient) or `/doctor/appointments` (doctor)
- [ ] Display error message from API on failure

**Points:** 3 | **Owner:** Ahmed

---

### US-002: Login
**As a** registered user, **I want** to log in, **so that** I can access my dashboard.

**AC:**
- [ ] Form fields: email, password
- [ ] Zod validation: both fields required
- [ ] On submit: POST `/api/token/` via mock API → returns `{ access, refresh }`
- [ ] Store tokens in localStorage
- [ ] Update AuthContext with user info + isAuthenticated
- [ ] Redirect based on role: Patient → `/doctors`, Doctor → `/doctor/appointments`, Admin → `/admin/dashboard`
- [ ] Sonner toast on success
- [ ] Display "Invalid credentials" on 401

**Points:** 2 | **Owner:** Ahmed

---

### US-003: JWT Refresh
**As an** authenticated user, **I want** my session to stay alive, **so that** I don't get logged out unexpectedly.

**AC:**
- [ ] Axios interceptor catches 401 responses
- [ ] Automatically POST `/api/token/refresh/` with refresh token
- [ ] On success: retry original request with new access token
- [ ] On failure: clear auth state, redirect to `/login`
- [ ] Process is invisible to user (no flash of login page)

**Points:** 3 | **Owner:** Ahmed

---

### US-004: Logout
**As an** authenticated user, **I want** to log out securely.

**AC:**
- [ ] Logout button in navbar (all authenticated users)
- [ ] On click: clear localStorage tokens
- [ ] Reset AuthContext (user = null, isAuthenticated = false)
- [ ] Invalidate all TanStack Query caches
- [ ] Redirect to `/login`
- [ ] Sonner toast: "Logged out successfully"

**Points:** 1 | **Owner:** Ahmed

---

### US-005: Role-Based Routing
**As the** system, **I want** to restrict routes by role.

**AC:**
- [ ] `/admin/*` accessible only to ADMIN role → else redirect to `/403`
- [ ] `/doctor/*` accessible only to DOCTOR role → else redirect to `/403`
- [ ] `/doctors`, `/book/:id`, `/my-appointments` accessible only to PATIENT → else redirect to `/403`
- [ ] Unauthenticated users redirected to `/login` from any protected route
- [ ] After login, redirect to originally requested URL (if any)

**Points:** 2 | **Owner:** Ahmed

---

### US-006: Navbar
**As a** user, **I want** navigation links relevant to my role.

**AC:**
- [ ] Show app logo/title on left
- [ ] Patient links: Find Doctors, My Appointments
- [ ] Doctor links: My Schedule, My Appointments
- [ ] Admin links: Dashboard, Users, All Appointments
- [ ] Auth links: Login/Register (logged out) or Logout (logged in)
- [ ] Active link highlighted
- [ ] Mobile: hamburger menu with same links
- [ ] Collapses to hamburger on screens < 768px

**Points:** 2 | **Owner:** Ahmed

---

## Epic: Patient — Browse & Book (Abdulazim)

### US-007: Doctor List Page
**As a** patient, **I want** to see all available doctors.

**AC:**
- [ ] Fetch GET `/api/doctors/` on mount (TanStack Query)
- [ ] Display grid of DoctorCard components (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Loading: show 6 skeleton cards
- [ ] Error: retry button + error message
- [ ] Empty: "No doctors available" message
- [ ] Responsive padding and spacing

**Points:** 2 | **Owner:** Abdulazim

---

### US-008: DoctorCard Component
**As a** patient, **I want** to see key info about each doctor at a glance.

**AC:**
- [ ] Avatar image (fallback to initials)
- [ ] Name, specialty badge (Shadcn Badge)
- [ ] Short bio preview (max 2 lines, truncate)
- [ ] "View Profile" button
- [ ] Hover effect (subtle shadow/elevation)
- [ ] Clickable card (navigates to profile)

**Points:** 2 | **Owner:** Abdulazim

---

### US-009: Search Doctors by Name
**As a** patient, **I want** to find doctors by typing their name.

**AC:**
- [ ] Search input above doctor grid
- [ ] Debounced (300ms) to avoid excessive filtering
- [ ] Case-insensitive match on first or last name
- [ ] Filters client-side on existing data (no extra API call needed for mock data)
- [ ] Clear button (X) inside input when text exists
- [ ] Shows "No results found" when filter yields nothing

**Points:** 2 | **Owner:** Abdulazim

---

### US-010: Filter by Specialty
**As a** patient, **I want** to filter doctors by their specialty.

**AC:**
- [ ] Shadcn Select dropdown with all specialties
- [ ] Options: All, Cardiology, Dermatology, Neurology, Pediatrics, Orthopedics, General Practice
- [ ] Client-side filter (works with search simultaneously)
- [ ] URL query param synced (`?specialty=Cardiology`) for shareable links
- [ ] "Clear filters" button when any filter active

**Points:** 2 | **Owner:** Abdulazim

---

### US-011: Doctor Profile Page
**As a** patient, **I want** to view a doctor's full profile before booking.

**AC:**
- [ ] Fetch GET `/api/doctors/:id/`
- [ ] Large avatar, name, specialty badge
- [ ] Full bio text
- [ ] "Book Appointment" button (prominent, CTA style)
- [ ] Back button to doctor list
- [ ] Loading skeleton while fetching

**Points:** 2 | **Owner:** Abdulazim

---

### US-012: Availability Calendar
**As a** patient, **I want** to see when a doctor is available.

**AC:**
- [ ] Shadcn Calendar component showing current month
- [ ] Available dates highlighted (teal dot or border)
- [ ] Clicking a date fetches slots: GET `/api/doctors/:id/availability/?date=YYYY-MM-DD`
- [ ] Unavailable dates disabled (grayed out)
- [ ] Loading state for slots list
- [ ] Past dates disabled

**Points:** 3 | **Owner:** Abdulazim

---

### US-013: Booking Flow
**As a** patient, **I want** to book an appointment with a selected doctor.

**AC:**
- [ ] After selecting a time slot, "Book Now" button activates
- [ ] Click opens Shadcn Dialog with confirmation details (doctor, date, time)
- [ ] Confirm triggers POST `/api/appointments/` via TanStack Query mutation
- [ ] Mock API returns appointment with PENDING status
- [ ] Sonner toast: "Appointment requested"
- [ ] Redirect to `/my-appointments`
- [ ] Disable double-submit (button loading state)

**Points:** 3 | **Owner:** Abdulazim

---

## Epic: Appointments Lifecycle (Gerges)

### US-014: My Appointments List
**As a** patient, **I want** to see all my appointments.

**AC:**
- [ ] Fetch GET `/api/appointments/` (patient-scoped)
- [ ] Grouped by tabs: "Upcoming" vs "Past"
- [ ] Each appointment shows: doctor name, specialty, date, time, status badge
- [ ] Status colors: PENDING (yellow), CONFIRMED (green), COMPLETED (blue), CANCELLED (red)
- [ ] Empty state: "No appointments yet. Find a doctor!" with CTA link
- [ ] Loading skeleton

**Points:** 3 | **Owner:** Gerges

---

### US-015: AppointmentCard Component
**As a** patient, **I want** appointment info presented clearly.

**AC:**
- [ ] Doctor avatar + name
- [ ] Date and time formatted (e.g., "Mon, Jan 20 at 09:00 AM")
- [ ] Status badge (Shadcn Badge with color)
- [ ] Action buttons contextually:
  - PENDING/CONFIRMED: Cancel, Reschedule
  - COMPLETED: "Leave Review" (placeholder for future)
  - CANCELLED: None
- [ ] Card hover effect

**Points:** 2 | **Owner:** Gerges

---

### US-016: Cancel Appointment
**As a** patient, **I want** to cancel my appointment.

**AC:**
- [ ] Cancel button on eligible appointments (PENDING/CONFIRMED)
- [ ] Confirmation Dialog: "Are you sure? This cannot be undone."
- [ ] On confirm: PATCH `/api/appointments/:id/` with `{ status: "CANCELLED" }`
- [ ] Optimistic update: status changes immediately, reverts on error
- [ ] Sonner toast: "Appointment cancelled"
- [ ] Card moves to "Past" tab or shows CANCELLED badge

**Points:** 2 | **Owner:** Gerges

---

### US-017: Reschedule Appointment
**As a** patient, **I want** to change my appointment to a different slot.

**AC:**
- [ ] Reschedule button opens availability picker (reuses US-012 calendar component)
- [ ] Patient selects new date + slot
- [ ] Confirmation Dialog with old vs new time
- [ ] On confirm: PATCH `/api/appointments/:id/` with `{ date, time }`
- [ ] Old slot becomes available, new slot becomes unavailable
- [ ] Sonner toast: "Appointment rescheduled"
- [ ] List updates with new date/time

**Points:** 3 | **Owner:** Gerges

---

### US-018: Doctor Appointment Dashboard
**As a** doctor, **I want** to see and manage my appointments.

**AC:**
- [ ] Fetch GET `/api/doctor/appointments/`
- [ ] Tabs: "Pending Requests", "Upcoming", "Past"
- [ ] Pending Requests tab:
  - Each row: patient name, requested date/time
  - Approve button (green) → PATCH status to CONFIRMED
  - Reject button (red) → PATCH status to CANCELLED
  - Notes text field on each row (optional)
- [ ] Upcoming tab: confirmed appointments, no actions
- [ ] Past tab: completed/cancelled history
- [ ] Sonner toast on approve/reject
- [ ] Table view on desktop, card view on mobile

**Points:** 3 | **Owner:** Gerges

---

## Epic: Doctor Tools & Admin (Mokhtar)

### US-019: Doctor Schedule Management
**As a** doctor, **I want** to set my weekly availability.

**AC:**
- [ ] Form to add availability:
  - Date picker (Shadcn Calendar)
  - Start time input
  - End time input (or slot duration)
  - "Add Slot" button
- [ ] List of existing slots below:
  - Grouped by date
  - Delete button per slot
- [ ] POST `/api/doctor/availability/` on add
- [ ] DELETE `/api/doctor/availability/:id/` on remove
- [ ] Validation: no overlapping slots, no past dates
- [ ] Sonner toast on add/remove
- [ ] Weekly view toggle (optional, bonus)

**Points:** 3 | **Owner:** Mokhtar

---

### US-020: Admin User Table
**As an** admin, **I want** to manage all users.

**AC:**
- [ ] Fetch GET `/api/admin/users/`
- [ ] Shadcn Data Table with columns:
  - Name, Email, Role, Status (Active/Blocked), Actions
- [ ] Actions:
  - Approve: button for unapproved doctors/patients
  - Block: toggle active status
- [ ] Filter by role (All, Patient, Doctor, Admin)
- [ ] Search by name
- [ ] Pagination (if mock data returns many)
- [ ] PATCH `/api/admin/users/:id/` on status change
- [ ] Sonner toast: "User updated"

**Points:** 3 | **Owner:** Mokhtar

---

### US-021: Admin Appointment Overview
**As an** admin, **I want** to see all system appointments.

**AC:**
- [ ] Fetch GET `/api/admin/appointments/`
- [ ] Filterable table:
  - Columns: ID, Patient, Doctor, Date, Time, Status
  - Filter by status, date range
- [ ] Sortable columns
- [ ] Export placeholder (button that says "Export CSV — Coming Soon")
- [ ] Loading skeleton

**Points:** 2 | **Owner:** Mokhtar

---

### US-022: Admin Dashboard Stats
**As an** admin, **I want** a quick overview of system activity.

**AC:**
- [ ] Four stat cards at top:
  - Total Users (with icon)
  - Total Doctors (with icon)
  - Total Appointments (with icon)
  - Pending Approvals (with icon, highlighted if > 0)
- [ ] Data from mock API aggregated responses
- [ ] Responsive: 4 columns desktop, 2 tablet, 1 mobile
- [ ] Color-coded: pending approvals in amber/warning color

**Points:** 2 | **Owner:** Mokhtar

---

## Story Summary by Owner

| Owner | Stories | Total Points |
|-------|---------|-------------|
| Ahmed | US-001 to US-006 | 13 |
| Abdulazim | US-007 to US-013 | 16 |
| Gerges | US-014 to US-018 | 13 |
| Mokhtar | US-019 to US-022 | 10 |
| **Total** | **22 stories** | **52 points** |

---

## Definition of Done (All Stories)

- [ ] Feature works against mock API
- [ ] No console errors or warnings
- [ ] Responsive on desktop (≥1024px), tablet (768px), mobile (<768px)
- [ ] Uses Shadcn components where applicable
- [ ] Follows naming conventions in `CONVENTIONS.md`
- [ ] PR reviewed and approved by at least 1 teammate
- [ ] Branch merged into `develop`
