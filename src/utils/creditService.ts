
import { toast } from "@/hooks/use-toast";
import { TeacherCredit, CreditTransaction, CREDIT_COSTS } from "@/types/teacher";
import { supabase } from "@/integrations/supabase/client";

export const getTeacherCredits = async (teacherId: string): Promise<TeacherCredit | null> => {
  try {
    // Try to get from Supabase
    const { data: teacherCredit, error } = await supabase
      .from('teacher_credits')
      .select('*')
      .eq('teacher_id', teacherId)
      .single();

    if (error) {
      console.error("Error fetching teacher credits from database:", error);
      
      // Fallback to localStorage for backward compatibility
      const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
      return teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId) || null;
    }
    
    // Get transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('timestamp', { ascending: false });
      
    if (transactionError) {
      console.error("Error fetching credit transactions:", transactionError);
    }
    
    // Get teacher details
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('username, display_name')
      .eq('id', teacherId)
      .single();
      
    if (teacherError) {
      console.error("Error fetching teacher details:", teacherError);
    }
    
    // Format for compatibility with existing code
    return {
      teacherId: teacherCredit.teacher_id,
      username: teacher?.username || "",
      displayName: teacher?.display_name || "",
      credits: teacherCredit.credits,
      usedCredits: teacherCredit.used_credits,
      transactionHistory: transactions?.map(t => ({
        id: t.id,
        teacherId: t.teacher_id,
        amount: t.amount,
        reason: t.reason,
        timestamp: t.timestamp
      })) || []
    };
  } catch (error) {
    console.error("Exception in getTeacherCredits:", error);
    
    // Fallback to localStorage if there's an exception
    const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
    return teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId) || null;
  }
};

export const getAllTeacherCredits = async (): Promise<TeacherCredit[]> => {
  try {
    // Get all teacher credits from Supabase
    const { data: teacherCredits, error } = await supabase
      .from('teacher_credits')
      .select(`
        teacher_id,
        credits,
        used_credits,
        teachers!inner(username, display_name)
      `);
      
    if (error) {
      console.error("Error fetching all teacher credits:", error);
      
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem("teacherCredits") || "[]");
    }
    
    // Format for compatibility with existing code
    return teacherCredits.map(tc => ({
      teacherId: tc.teacher_id,
      username: tc.teachers.username,
      displayName: tc.teachers.display_name,
      credits: tc.credits,
      usedCredits: tc.used_credits,
      transactionHistory: [] // We're not loading all transactions for all teachers for performance
    }));
  } catch (error) {
    console.error("Exception in getAllTeacherCredits:", error);
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem("teacherCredits") || "[]");
  }
};

export const initializeTeacherCredits = async (
  teacherId: string, 
  username: string, 
  displayName: string = ""
): Promise<boolean> => {
  try {
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

export const addCreditsToTeacher = async (
  teacherId: string, 
  amount: number, 
  reason: string
): Promise<boolean> => {
  try {
    // Start a transaction to update credits and add transaction record
    // First, get current credits
    const { data: teacherCredit, error: getError } = await supabase
      .from('teacher_credits')
      .select('credits')
      .eq('teacher_id', teacherId)
      .single();
      
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

// Initialize credits for a teacher when they login
export const ensureTeacherCredits = async (
  teacherId: string, 
  username: string, 
  displayName: string = ""
): Promise<void> => {
  if (!teacherId || !username) return;
  
  await initializeTeacherCredits(teacherId, username, displayName);
};

// Helper function to migrate old localStorage data to database
export const migrateTeacherCreditsToDatabase = async (teacherId: string): Promise<boolean> => {
  try {
    // Check if credits already exist in database
    const { data: existingCredit, error: checkError } = await supabase
      .from('teacher_credits')
      .select('*')
      .eq('teacher_id', teacherId)
      .maybeSingle();
      
    if (!checkError && existingCredit) {
      // Credits already migrated
      return true;
    }
    
    // Get credits from localStorage
    const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
    const teacherCredit = teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId);
    
    if (!teacherCredit) {
      // No credits to migrate
      return false;
    }
    
    // Insert credits into database
    const { error: insertCreditError } = await supabase
      .from('teacher_credits')
      .insert({
        teacher_id: teacherId,
        credits: teacherCredit.credits,
        used_credits: teacherCredit.usedCredits
      });
      
    if (insertCreditError) {
      console.error("Error migrating teacher credits:", insertCreditError);
      return false;
    }
    
    // Migrate transactions
    if (teacherCredit.transactionHistory && teacherCredit.transactionHistory.length > 0) {
      const transactions = teacherCredit.transactionHistory.map((t: CreditTransaction) => ({
        teacher_id: t.teacherId,
        amount: t.amount,
        reason: t.reason,
        timestamp: t.timestamp
      }));
      
      // Insert transactions
      const { error: insertTransactionError } = await supabase
        .from('credit_transactions')
        .insert(transactions);
        
      if (insertTransactionError) {
        console.error("Error migrating credit transactions:", insertTransactionError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error migrating teacher credits:", error);
    return false;
  }
};
