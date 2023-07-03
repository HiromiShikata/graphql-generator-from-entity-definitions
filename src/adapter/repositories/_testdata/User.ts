export type User = {
  id: string;
  name: string;
  pet: string | null;
  createdAt: Date;
  createdUserId: User['id'] | null;
  gender: 'Make' | 'Female' | 'Other';
};
