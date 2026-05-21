// Appointments feature utilities

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border-amber-500';
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-700';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Returns the Shadcn Badge variant + className for a given AppointmentStatus.
 * Follows the exact patterns defined in CONVENTIONS.md § Design System.
 */
export const getStatusBadgeConfig = (
  status: string
): {
  variant: 'default' | 'outline' | 'destructive' | 'secondary';
  className: string;
  label: string;
} => {
  switch (status) {
    case 'PENDING':
      return {
        variant: 'outline',
        className: 'border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-50',
        label: 'Pending',
      };
    case 'CONFIRMED':
      return {
        variant: 'default',
        className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
        label: 'Confirmed',
      };
    case 'COMPLETED':
      return {
        variant: 'default',
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        label: 'Completed',
      };
    case 'CANCELLED':
      return {
        variant: 'destructive',
        className: '',
        label: 'Cancelled',
      };
    default:
      return {
        variant: 'secondary',
        className: '',
        label: status,
      };
  }
};
