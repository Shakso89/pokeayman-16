
import { TeacherCredit, CreditTransaction } from "@/types/teacher";

// Credit Service response types
export interface CreditServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Types related to credit operations
export type CreditOperationType = 
  | 'CREATE_STUDENT'
  | 'ASSIGN_HOMEWORK'
  | 'APPROVE_HOMEWORK'
  | 'AWARD_COINS'
  | 'DELETE_POKEMON';

export interface CreditOperationParams {
  coinReward?: number;
  coins?: number;
  [key: string]: any;
}
