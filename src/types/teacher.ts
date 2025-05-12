
export interface TeacherCredit {
  teacherId: string;
  username: string;
  displayName?: string;
  credits: number;
  usedCredits: number;
  transactionHistory: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  teacherId: string;
  amount: number; // Positive for credits added, negative for credits used
  reason: string;
  timestamp: string;
}

export const CREDIT_COSTS = {
  CREATE_STUDENT: 5,
  ASSIGN_HOMEWORK: 5,
  APPROVE_HOMEWORK: "dynamic", // Based on coin reward
  AWARD_COINS: 1, // Per coin
  DELETE_POKEMON: 2
};
