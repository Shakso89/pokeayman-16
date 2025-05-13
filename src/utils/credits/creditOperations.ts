import { supabase } from "@/integrations/supabase/client";
import { TeacherCredit, CreditTransaction } from "@/types/teacher";
import { CreditServiceResponse } from "./types";
import { toast } from "@/hooks/use-toast";

/**
 * Initializes credit account for a new teacher
 */
export const initializeTeacherCredits = async (
  teacherId: string, 
  username: string, 
  displayName: string = ""
): Promise<boolean> => {
  try {
    console.log("Initializing credits for teacher:", teacherId, username);
    // Check if teacher already has credits in Supabase
    const { data: existingCredit, error: checkError } = await supabase
      .from('teacher_credits')
      .select('*')
      .eq('teacher_id', teacherId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing teacher credits:", checkError);
    }
    
    // If credits already exist, return true
    if (existingCredit) {
      console.log("Teacher already has credits initialized");
      return true;
    }
    
    // Create initial credits record with 100 credits
    const initialCredits = 100;
    
    // Insert into teacher_credits table
    const { error: insertCreditError } = await supabase
      .from('teacher_credits')
      .insert({
        teacher_id: teacherId,
        credits: initialCredits,
        used_credits: 0
      });
      
    if (insertCreditError) {
      console.error("Error inserting teacher credits:", insertCreditError);
      
      // Fallback to localStorage
      const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
      const existingTeacher = teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId);
      
      if (existingTeacher) {
        return true;
      }
      
      const newTeacherCredit = {
        teacherId,
        username,
        displayName,
        credits: initialCredits,
        usedCredits: 0,
        transactionHistory: [
          {
            id: `tr-${Date.now()}`,
            teacherId,
            amount: initialCredits,
            reason: "Initial signup bonus",
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      teacherCredits.push(newTeacherCredit);
      localStorage.setItem("teacherCredits", JSON.stringify(teacherCredits));
      
      return true;
    }
    
    // Insert initial transaction
    const { error: insertTransactionError } = await supabase
      .from('credit_transactions')
      .insert({
        teacher_id: teacherId,
        amount: initialCredits,
        reason: "Initial signup bonus"
      });
      
    if (insertTransactionError) {
      console.error("Error inserting credit transaction:", insertTransactionError);
    }
    
    console.log("Successfully initialized credits for teacher");
    return true;
  } catch (error) {
    console.error("Error initializing teacher credits:", error);
    
    // Fallback to localStorage
    try {
      const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
      
      // Check if teacher already has credits initialized
      const existingTeacher = teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId);
      
      if (existingTeacher) {
        return true; // Already initialized
      }
      
      // Create initial credits record with 100 credits
      const initialCredits = 100;
      
      const newTeacherCredit: TeacherCredit = {
        teacherId,
        username,
        displayName,
        credits: initialCredits,
        usedCredits: 0,
        transactionHistory: [
          {
            id: `tr-${Date.now()}`,
            teacherId,
            amount: initialCredits,
            reason: "Initial signup bonus",
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      teacherCredits.push(newTeacherCredit);
      localStorage.setItem("teacherCredits", JSON.stringify(teacherCredits));
      
      return true;
    } catch (error) {
      console.error("Error initializing teacher credits in localStorage:", error);
      return false;
    }
  }
};

/**
 * Adds credits to a teacher's account
 */
export const addCreditsToTeacher = async (
  teacherId: string, 
  amount: number, 
  reason: string
): Promise<boolean> => {
  try {
    console.log("Adding credits to teacher:", teacherId, amount, reason);
    // Start a transaction to update credits and add transaction record
    // First, get current credits
    const { data: teacherCredit, error: getError } = await supabase
      .from('teacher_credits')
      .select('credits')
      .eq('teacher_id', teacherId)
      .maybeSingle();
      
    if (getError) {
      console.error("Error fetching teacher credits:", getError);
      
      // Fallback to localStorage
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
    }
    
    if (!teacherCredit) {
      console.error("Teacher credit record not found:", teacherId);
      toast({
        title: "Error",
        description: "Teacher credit record not found. Please make sure the teacher exists.",
        variant: "destructive",
      });
      return false;
    }
    
    // Update credits
    const { error: updateError } = await supabase
      .from('teacher_credits')
      .update({ 
        credits: teacherCredit.credits + amount,
        updated_at: new Date().toISOString()
      })
      .eq('teacher_id', teacherId);
      
    if (updateError) {
      console.error("Error updating teacher credits:", updateError);
      return false;
    }
    
    // Add transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        teacher_id: teacherId,
        amount,
        reason
      });
      
    if (transactionError) {
      console.error("Error adding credit transaction:", transactionError);
    }
    
    console.log("Successfully added credits to teacher");
    return true;
  } catch (error) {
    console.error("Error adding credits:", error);
    
    // Fallback to localStorage
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
      console.error("Error adding credits to localStorage:", error);
      return false;
    }
  }
};

/**
 * Uses credits from a teacher's account
 */
export const useCredits = async (
  teacherId: string, 
  amount: number, 
  reason: string
): Promise<boolean> => {
  try {
    // Get current credits
    const { data: teacherCredit, error: getError } = await supabase
      .from('teacher_credits')
      .select('credits, used_credits')
      .eq('teacher_id', teacherId)
      .single();
      
    if (getError) {
      toast({
        title: "Error",
        description: "Teacher credit record not found",
        variant: "destructive",
      });
      
      // Fallback to localStorage
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
    }
    
    // Check if teacher has enough credits
    if (teacherCredit.credits < amount) {
      toast({
        title: "Insufficient credits",
        description: `You need ${amount} credits but only have ${teacherCredit.credits}`,
        variant: "destructive",
      });
      return false;
    }
    
    // Update credits
    const { error: updateError } = await supabase
      .from('teacher_credits')
      .update({ 
        credits: teacherCredit.credits - amount,
        used_credits: teacherCredit.used_credits + amount,
        updated_at: new Date().toISOString()
      })
      .eq('teacher_id', teacherId);
      
    if (updateError) {
      console.error("Error updating teacher credits:", updateError);
      return false;
    }
    
    // Add transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        teacher_id: teacherId,
        amount: -amount,
        reason
      });
      
    if (transactionError) {
      console.error("Error adding credit transaction:", transactionError);
    }
    
    return true;
  } catch (error) {
    console.error("Error using credits:", error);
    
    // Fallback to localStorage
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
      console.error("Error using credits in localStorage:", error);
      return false;
    }
  }
};
