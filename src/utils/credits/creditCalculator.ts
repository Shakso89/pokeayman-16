
import { CREDIT_COSTS } from "@/types/teacher";
import { CreditOperationType, CreditOperationParams } from "./types";

/**
 * Calculates the credit cost for various teacher operations
 */
export const calculateCreditCost = (action: CreditOperationType, params?: CreditOperationParams): number => {
  switch (action) {
    case 'CREATE_STUDENT':
      return CREDIT_COSTS.CREATE_STUDENT;
    case 'ASSIGN_HOMEWORK':
      return CREDIT_COSTS.ASSIGN_HOMEWORK;
    case 'APPROVE_HOMEWORK':
      // Dynamic cost based on coin reward
      return params?.coinReward || 0;
    case 'AWARD_COINS':
      // Cost is 1 credit per coin
      return params?.coins || 0;
    case 'DELETE_POKEMON':
      return CREDIT_COSTS.DELETE_POKEMON;
    default:
      return 0;
  }
};
