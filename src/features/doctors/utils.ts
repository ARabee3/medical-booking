// Doctors feature utilities

export const filterDoctors = (doctors: { specialty: string }[], specialty?: string) => {
  if (!specialty) return doctors;
  return doctors.filter((d) => d.specialty === specialty);
};
