
import { toast } from "@/hooks/use-toast";
import { TeacherCredit, CreditTransaction, CREDIT_COSTS } from "@/types/teacher";

export const getTeacherCredits = (teacherId: string): TeacherCredit | null => {
  const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
  return teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId) || null;
};

export const getAllTeacherCredits = (): TeacherCredit[] => {
  return JSON.parse(localStorage.getItem("teacherCredits") || "[]");
};

export const addCreditsToTeacher = (teacherId: string, amount: number, reason: string): boolean => {
  try {
    const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
    const teacherCreditIndex = teacherCredits.findIndex((tc: TeacherCredit) => tc.teacherId === teacherId);
    
    if (teacherCreditIndex === -1) {
      return false;
    }
    
    const transaction: CreditTransaction = {
      id: `tr-${Date.now()}`,
      teacherId,
      amount,
      reason,
      timestamp: new Date().toISOString()
    };
    
    teacherCredits[teacherCreditIndex].credits += amount;
    teacherCredits[teacherCreditIndex].transactionHistory.push(transaction);
    
    localStorage.setItem("teacherCredits", JSON.stringify(teacherCredits));
    
    return true;
  } catch (error) {
    console.error("Error adding credits:", error);
    return false;
  }
};

export const useCredits = (teacherId: string, amount: number, reason: string): boolean => {
  try {
    const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
    const teacherCreditIndex = teacherCredits.findIndex((tc: TeacherCredit) => tc.teacherId === teacherId);
    
    if (teacherCreditIndex === -1) {
      toast({
        title: "Error",
        description: "Teacher credit record not found",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if teacher has enough credits
    if (teacherCredits[teacherCreditIndex].credits < amount) {
      toast({
        title: "Insufficient credits",
        description: `You need ${amount} credits but only have ${teacherCredits[teacherCreditIndex].credits}`,
        variant: "destructive",
      });
      return false;
    }
    
    const transaction: CreditTransaction = {
      id: `tr-${Date.now()}`,
      teacherId,
      amount: -amount,
      reason,
      timestamp: new Date().toISOString()
    };
    
    // Update credits
    teacherCredits[teacherCreditIndex].credits -= amount;
    teacherCredits[teacherCreditIndex].usedCredits += amount;
    teacherCredits[teacherCreditIndex].transactionHistory.push(transaction);
    
    localStorage.setItem("teacherCredits", JSON.stringify(teacherCredits));
    
    return true;
  } catch (error) {
    console.error("Error using credits:", error);
    return false;
  }
};

export const calculateCreditCost = (action: string, params?: any): number => {
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
