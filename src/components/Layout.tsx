import { type ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        {children}
      </main>
    </div>
  );
};
