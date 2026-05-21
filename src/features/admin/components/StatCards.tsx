import { FC } from 'react';
import { Users, Stethoscope, CalendarDays, ClockAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminStats } from '@/features/admin/types';

interface StatCardItem {
  title: string;
  value: number;
  icon: FC<{ className?: string }>;
  warnWhenPositive?: boolean;
}

interface StatCardsProps {
  stats: AdminStats;
}

export const StatCards: FC<StatCardsProps> = ({ stats }) => {
  const cards: StatCardItem[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: Stethoscope,
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: CalendarDays,
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: ClockAlert,
      warnWhenPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ title, value, icon: Icon, warnWhenPositive }) => {
        const isWarning = warnWhenPositive && value > 0;

        return (
          <Card
            key={title}
            className={`hover:shadow-md transition-shadow ${
              isWarning ? 'border-amber-400 bg-amber-50' : ''
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className={`text-sm font-medium ${
                  isWarning ? 'text-amber-700' : 'text-muted-foreground'
                }`}
              >
                {title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${isWarning ? 'text-amber-500' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${isWarning ? 'text-amber-700' : 'text-foreground'}`}
              >
                {value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
