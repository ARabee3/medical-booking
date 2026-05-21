import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
      ];
    }

    switch (user?.role) {
      case 'PATIENT':
        return [
          { label: 'Find Doctors', path: '/doctors' },
          { label: 'My Appointments', path: '/my-appointments' },
        ];
      case 'DOCTOR':
        return [
          { label: 'My Schedule', path: '/doctor/schedule' },
          { label: 'My Appointments', path: '/doctor/appointments' },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users', path: '/admin/users' },
          { label: 'All Appointments', path: '/admin/appointments' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-[var(--color-primary)]">
            <Stethoscope className="h-6 w-6" />
            <span className="text-xl font-bold">MedBook</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
                  isActive(link.path)
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-foreground-muted)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(link.path)
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary-lighter)]'
                    : 'text-[var(--color-foreground-muted)] hover:bg-[var(--color-background-muted)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
