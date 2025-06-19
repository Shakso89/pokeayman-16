
export type UserRole = 'student' | 'teacher' | 'senior_teacher' | 'manager' | 'owner';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  passwordHash?: string; // nullable for students
  schoolId?: string;
  profilePhoto?: string;
  isFrozen: boolean;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassMembership {
  id: string;
  classId: string;
  userId: string;
  roleInClass: 'student' | 'assistant' | 'lead';
  joinedAt: string;
}

export interface CoinHistoryEntry {
  id: string;
  userId: string;
  changeAmount: number;
  reason: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface SchoolPokemonPool {
  id: string;
  schoolId: string;
  pokemonId: number;
  isAssigned: boolean;
  assignedTo?: string;
  assignedAt?: string;
}
