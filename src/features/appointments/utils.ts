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
