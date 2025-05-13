
import { supabase } from "@/integrations/supabase/client";
import { TeacherCredit, CreditTransaction } from "@/types/teacher";

/**
 * Ensures that a teacher has credits initialized
 */
export const ensureTeacherCredits = async (
  teacherId: string, 
  username: string, 
  displayName: string = ""
): Promise<void> => {
  if (!teacherId || !username) return;
  
  // Import from separate file to avoid circular dependencies
  const { initializeTeacherCredits } = await import('./creditOperations');
  await initializeTeacherCredits(teacherId, username, displayName);
};

/**
 * Migrates credit data from localStorage to the database
 */
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
