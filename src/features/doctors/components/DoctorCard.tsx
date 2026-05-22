import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '@/types/global';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DoctorCardProps {
  doctor: Doctor;
}

export const DoctorCard: FC<DoctorCardProps> = ({ doctor }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/doctors/${doctor.id}`);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/doctors/${doctor.id}`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar src={doctor.image_url} alt={doctor.name} fallback={doctor.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-[var(--color-foreground)] truncate">
            {doctor.name}
          </h3>
          <Badge
            variant="outline"
            className="border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-lighter)] mt-1"
          >
            {doctor.specialty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-[var(--color-foreground-muted)] line-clamp-2 mb-4 flex-1">
          {doctor.bio}
        </p>
        <Button variant="outline" className="w-full" onClick={handleViewProfile}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};
