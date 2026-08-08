import { UserSession } from '../types/accounting';

export const INITIAL_USERS: UserSession[] = [
  {
    id: 'usr-1',
    name: 'Budi Santoso, S.Ak',
    email: 'admin@tokosejahtera.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-2',
    name: 'Siti Rahma (Staff Kasir)',
    email: 'staff@tokosejahtera.com',
    role: 'staff',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];
