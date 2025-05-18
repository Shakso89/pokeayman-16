
export interface AdminTeacherData {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
  timeSpent?: number;
  numSchools?: number;
  numStudents?: number;
  subscriptionType: 'trial' | 'monthly' | 'annual';
  expiryDate?: string;
}
