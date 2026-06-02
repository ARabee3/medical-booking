import { FC } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  Search,
  CalendarCheck,
  HeartPulse,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Activity,
  Pill,
  Scissors,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find a Doctor',
    description:
      'Browse verified specialists across Egypt and view their profiles and availability.',
  },
  {
    icon: CalendarCheck,
    title: 'Book in Seconds',
    description: 'Pick a time slot that fits your schedule and confirm your appointment instantly.',
  },
  {
    icon: HeartPulse,
    title: 'Get the Care You Need',
    description: 'Visit your doctor in person — simple, fast, and reliable healthcare.',
  },
];

const specialties = [
  { icon: Heart, label: 'Cardiology' },
  { icon: Brain, label: 'Neurology' },
  { icon: Baby, label: 'Pediatrics' },
  { icon: Eye, label: 'Ophthalmology' },
  { icon: Bone, label: 'Orthopedics' },
  { icon: Activity, label: 'General Medicine' },
  { icon: Pill, label: 'Pharmacy' },
  { icon: Scissors, label: 'Surgery' },
];

const doctorBenefits = [
  { icon: CalendarCheck, text: 'Manage your schedule effortlessly' },
  { icon: HeartPulse, text: 'Reach new patients every day' },
  { icon: ShieldCheck, text: 'Trusted by thousands of patients' },
];

export const LandingPage: FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    const role = user?.role;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'DOCTOR') return <Navigate to="/doctor/appointments" replace />;
    return <Navigate to="/doctors" replace />;
  }

  return (
    <div>
      <section className="-mx-4 md:-mx-8 lg:-mx-12 -mt-6">
        <div className="px-4 md:px-8 lg:px-12 py-20 md:py-32 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-lighter)] mb-6">
            <Stethoscope className="h-8 w-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-foreground)] max-w-3xl">
            Book Medical Appointments
            <br />
            <span className="text-[var(--color-primary)]">With Ease</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[var(--color-foreground-muted)] max-w-2xl">
            Connect with trusted doctors, book appointments in seconds, and manage your healthcare
            journey — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/register?role=DOCTOR">Join as a Doctor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="-mx-4 md:-mx-8 lg:-mx-12 bg-[var(--color-background-muted)]">
        <div className="px-4 md:px-8 lg:px-12 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
              How It Works
            </h2>
            <p className="mt-3 text-[var(--color-foreground-muted)]">
              Three simple steps to better healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-[var(--color-background)] transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-lighter)] text-[var(--color-primary)] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="-mx-4 md:-mx-8 lg:-mx-12 bg-[var(--color-background)]">
        <div className="px-4 md:px-8 lg:px-12 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
              Explore Specialties
            </h2>
            <p className="mt-3 text-[var(--color-foreground-muted)]">
              We cover a wide range of medical fields
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {specialties.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center shadow-sm hover:border-[var(--color-primary-light)] hover:shadow-md transition-all"
                >
                  <Icon className="h-8 w-8 text-[var(--color-primary)]" />
                  <span className="text-sm font-medium text-[var(--color-foreground)]">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="-mx-4 md:-mx-8 lg:-mx-12 bg-[var(--color-primary)]">
        <div className="px-4 md:px-8 lg:px-12 py-16 md:py-20 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary-foreground)]">
            Are You a Healthcare Provider?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl">
            Join MedBook to manage your schedule, reach more patients, and grow your practice. It is
            free to get started.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {doctorBenefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.text} className="flex items-center gap-2 text-white/80">
                  <Icon className="h-5 w-5 text-white/60" />
                  <span className="text-sm">{b.text}</span>
                </div>
              );
            })}
          </div>
          <Link
            to="/register?role=DOCTOR"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-white text-[var(--color-primary)] h-11 px-8 text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Join as a Doctor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="-mx-4 md:-mx-8 lg:-mx-12 -mb-6 bg-[var(--color-foreground)]">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <Stethoscope className="h-6 w-6 text-[var(--color-primary-light)]" />
              <span className="text-xl font-bold">MedBook</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <Link to="/login" className="hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-white/40">
            A project for ITI. Not a real medical service.
          </div>
        </div>
      </footer>
    </div>
  );
};
