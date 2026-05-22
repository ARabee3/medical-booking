import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PrivateRoute } from '@/components/PrivateRoute';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';
import { Unauthorized } from '@/components/Unauthorized';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Auth (Ahmed)
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

// Doctors / Patient (Abdulazim)
import { DoctorList } from '@/features/doctors/components/DoctorList';
import { DoctorProfile } from '@/features/doctors/components/DoctorProfile';
import { BookingForm } from '@/features/appointments/components/BookingForm';

// Appointments (Gerges)
import { AppointmentList } from '@/features/appointments/components/AppointmentList';
import { DoctorAppointmentDashboard } from '@/features/appointments/components/DoctorAppointmentDashboard';

// Admin (Mokhtar)
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';
import { UserTable } from './features/admin/components/UserTable';
import { AppointmentOverview } from '@/features/admin/components/AppointmentOverview';

// Doctor Tools (Mokhtar)
import { ScheduleManagement } from '@/features/doctors/components/ScheduleManagement';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Routes (redirect if already logged in) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
              </Route>
              <Route path="/403" element={<Unauthorized />} />

              {/* Patient Routes */}
              <Route element={<PrivateRoute allowedRoles={['PATIENT']} />}>
                <Route path="/doctors" element={<DoctorList />} />
                <Route path="/doctors/:id" element={<DoctorProfile />} />
                <Route path="/book/:doctorId" element={<BookingForm />} />
                <Route path="/my-appointments" element={<AppointmentList />} />
              </Route>

              {/* Doctor Routes */}
              <Route element={<PrivateRoute allowedRoles={['DOCTOR']} />}>
                <Route path="/doctor/schedule" element={<ScheduleManagement />} />
                <Route path="/doctor/appointments" element={<DoctorAppointmentDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserTable />} />
                <Route path="/admin/appointments" element={<AppointmentOverview />} />
              </Route>

              {/* Default */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Layout>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
