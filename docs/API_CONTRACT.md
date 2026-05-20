# API Contract (Mock Service Functions)

**Status:** Contract for React phase. All frontend code calls these functions.  
**Later:** Django will implement identical endpoints. Replacing mock function bodies with real `api.get()` / `api.post()` calls = instant backend connection.

**Base URL:** `/api` (Vite proxy handles this in dev)

---

## Authentication

### POST /api/register/

Register a new user.

**Request:**
```json
{
  "email": "patient@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "role": "PATIENT",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response 201:**
```json
{
  "user": {
    "id": 1,
    "email": "patient@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "PATIENT",
    "is_active": true
  },
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 400:**
```json
{
  "email": ["User with this email already exists."],
  "password": ["Passwords do not match."]
}
```

---

### POST /api/token/

Login and receive JWT pair.

**Request:**
```json
{
  "email": "patient@example.com",
  "password": "securepass123"
}
```

**Response 200:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401:**
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### POST /api/token/refresh/

Refresh access token.

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401:**
```json
{
  "detail": "Token is invalid or expired"
}
```

---

## Doctors

### GET /api/doctors/

List all approved doctors.

**Query Parameters:**
- `specialty` (optional): Filter by specialty string
- `search` (optional): Search by name (client-side for mock, server-side for Django)

**Response 200:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "name": "Dr. Sarah Chen",
    "email": "sarah.chen@hospital.com",
    "specialty": "Cardiology",
    "bio": "Board-certified cardiologist with 12 years of experience in interventional cardiology.",
    "image_url": "https://i.pravatar.cc/150?u=sarah",
    "is_active": true
  }
]
```

---

### GET /api/doctors/:id/

Get single doctor profile.

**Response 200:**
```json
{
  "id": 1,
  "user_id": 2,
  "name": "Dr. Sarah Chen",
  "email": "sarah.chen@hospital.com",
  "specialty": "Cardiology",
  "bio": "Board-certified cardiologist with 12 years of experience in interventional cardiology.",
  "image_url": "https://i.pravatar.cc/150?u=sarah",
  "is_active": true
}
```

**Response 404:**
```json
{
  "detail": "Doctor not found"
}
```

---

### GET /api/doctors/:id/availability/

Get available slots for a doctor on a specific date.

**Query Parameters:**
- `date` (required): `YYYY-MM-DD` format

**Response 200:**
```json
{
  "doctor_id": 1,
  "date": "2026-01-20",
  "slots": [
    "09:00",
    "10:30",
    "14:00",
    "15:30"
  ]
}
```

**Response 200 (no availability):**
```json
{
  "doctor_id": 1,
  "date": "2026-01-20",
  "slots": []
}
```

---

## Appointments (Patient)

### GET /api/appointments/

List current patient's appointments.

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 1,
      "name": "Dr. Sarah Chen",
      "specialty": "Cardiology",
      "image_url": "https://i.pravatar.cc/150?u=sarah"
    },
    "date": "2026-01-20",
    "time": "09:00",
    "status": "CONFIRMED",
    "notes": null,
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

---

### POST /api/appointments/

Book a new appointment.

**Request:**
```json
{
  "doctor_id": 1,
  "date": "2026-01-20",
  "time": "09:00"
}
```

**Response 201:**
```json
{
  "id": 1,
  "doctor": {
    "id": 1,
    "name": "Dr. Sarah Chen",
    "specialty": "Cardiology"
  },
  "date": "2026-01-20",
  "time": "09:00",
  "status": "PENDING",
  "notes": null,
  "created_at": "2026-01-15T10:30:00Z"
}
```

**Response 400 (slot taken):**
```json
{
  "time": ["This time slot is no longer available."]
}
```

**Response 400 (past date):**
```json
{
  "date": ["Cannot book appointments in the past."]
}
```

---

### PATCH /api/appointments/:id/

Update appointment (cancel or reschedule).

**Request (cancel):**
```json
{
  "status": "CANCELLED"
}
```

**Request (reschedule):**
```json
{
  "date": "2026-01-22",
  "time": "14:00"
}
```

**Response 200:**
```json
{
  "id": 1,
  "doctor": {
    "id": 1,
    "name": "Dr. Sarah Chen",
    "specialty": "Cardiology"
  },
  "date": "2026-01-22",
  "time": "14:00",
  "status": "PENDING",
  "notes": null,
  "created_at": "2026-01-15T10:30:00Z"
}
```

**Response 403:**
```json
{
  "detail": "You do not have permission to modify this appointment"
}
```

---

## Doctor Endpoints

### GET /api/doctor/appointments/

Get appointments for the authenticated doctor.

**Headers:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
[
  {
    "id": 1,
    "patient": {
      "id": 3,
      "name": "John Doe",
      "email": "patient@example.com"
    },
    "date": "2026-01-20",
    "time": "09:00",
    "status": "PENDING",
    "notes": null,
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

---

### PATCH /api/doctor/appointments/:id/

Doctor approves/rejects an appointment.

**Request:**
```json
{
  "status": "CONFIRMED",
  "notes": "Please arrive 15 minutes early for paperwork."
}
```

**Response 200:** Returns updated appointment.

**Response 403:** "You can only manage your own appointments."

---

### POST /api/doctor/availability/

Add availability slot.

**Request:**
```json
{
  "date": "2026-01-20",
  "start_time": "09:00",
  "end_time": "10:00"
}
```

**Response 201:**
```json
{
  "id": 1,
  "date": "2026-01-20",
  "start_time": "09:00",
  "end_time": "10:00",
  "is_booked": false
}
```

---

### DELETE /api/doctor/availability/:id/

Remove availability slot.

**Response 204:** No content

**Response 400:**
```json
{
  "detail": "Cannot delete a slot that is already booked"
}
```

---

## Admin Endpoints

### GET /api/admin/users/

List all users.

**Response 200:**
```json
[
  {
    "id": 1,
    "email": "patient@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "PATIENT",
    "is_active": true,
    "is_approved": true,
    "date_joined": "2026-01-10"
  }
]
```

---

### PATCH /api/admin/users/:id/

Update user status.

**Request:**
```json
{
  "is_active": false,
  "is_approved": true
}
```

**Response 200:** Returns updated user.

---

### GET /api/admin/appointments/

List all system appointments.

**Query Parameters:**
- `status` (optional): PENDING, CONFIRMED, COMPLETED, CANCELLED
- `date_from` (optional): `YYYY-MM-DD`
- `date_to` (optional): `YYYY-MM-DD`

**Response 200:** Array of appointments with full doctor and patient objects.

---

## How Mock Service Functions Work

We use simple async functions that return Promises with mock data, simulating network latency with `setTimeout`.

```typescript
// src/lib/mockApi.ts
import { mockDoctors, mockUsers, mockAppointments } from '@/mocks/data';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getDoctors = async (specialty?: string) => {
  await delay(400); // simulate network latency
  let data = [...mockDoctors];
  if (specialty) data = data.filter((d) => d.specialty === specialty);
  return data;
};

export const login = async (credentials: LoginRequest) => {
  await delay(300);
  const user = mockUsers.find((u) => u.email === credentials.email);
  if (!user || user.password !== credentials.password) {
    throw new Error('Invalid credentials');
  }
  return { access: 'fake-access-token', refresh: 'fake-refresh-token', user };
};
```

**Why this approach?**
- Zero setup, zero dependencies
- Still teaches async/await, loading states, error handling
- Components use TanStack Query exactly as they would with real Axios
- Swap to Django: replace mock function body with `api.get()` — zero component changes

**Pattern in feature API files:**
```typescript
// features/doctors/api/doctorsApi.ts
import { getDoctors, getDoctorById, getDoctorAvailability } from '@/lib/mockApi';

export const useDoctors = (specialty?: string) => {
  return useQuery({
    queryKey: ['doctors', specialty],
    queryFn: () => getDoctors(specialty),
  });
};
```

---

## Global Types (TypeScript)

```typescript
// src/types/global.ts

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  image_url: string | null;
  is_active: boolean;
}

export interface Patient {
  id: number;
  user_id: number;
  name: string;
  email: string;
}

export interface Appointment {
  id: number;
  doctor: Doctor;
  patient?: Patient;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  created_at: string; // ISO 8601
}

export interface AvailabilitySlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface ApiError {
  detail?: string;
  [key: string]: string[] | string | undefined;
}
```
