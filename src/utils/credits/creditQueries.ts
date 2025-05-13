
import { supabase } from "@/integrations/supabase/client";
import { TeacherCredit, CreditTransaction } from "@/types/teacher";
import { CreditServiceResponse } from "./types";
import { toast } from "@/hooks/use-toast";

/**
 * Retrieves credit information for a specific teacher
 */
export const getTeacherCredits = async (teacherId: string): Promise<TeacherCredit | null> => {
  try {
    // Try to get from Supabase
    const { data: teacherCredit, error } = await supabase
      .from('teacher_credits')
      .select('*')
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching teacher credits from database:", error);
      
      // Fallback to localStorage for backward compatibility
      const teacherCredits = JSON.parse(localStorage.getItem("teacherCredits") || "[]");
      return teacherCredits.find((tc: TeacherCredit) => tc.teacherId === teacherId) || null;
    }
    
    if (!teacherCredit) {
      console.warn("No teacher credit record found for", teacherId);
      return null;
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
      .maybeSingle();
      
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

/**
 * Retrieves credit information for all teachers
 */
export const getAllTeacherCredits = async (): Promise<TeacherCredit[]> => {
  try {
    console.log("Getting all teacher credits...");
    // Get all teacher credits from Supabase
    const { data: teacherCredits, error } = await supabase
      .from('teacher_credits')
      .select(`
        teacher_id,
        credits,
        used_credits
      `);
      
    if (error) {
      console.error("Error fetching all teacher credits:", error);
      
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem("teacherCredits") || "[]");
    }
    
    console.log("Teacher credits from database:", teacherCredits);
    
    // If we have teacher credits, get the teacher details for each one
    if (teacherCredits && teacherCredits.length > 0) {
      // Get all teachers
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, username, display_name');
        
      if (teachersError) {
        console.error("Error fetching teacher details:", teachersError);
      }
      
      // Map teacher credits with teacher details
      return teacherCredits.map(tc => {
        const teacher = teachers?.find(t => t.id === tc.teacher_id);
        
        return {
          teacherId: tc.teacher_id,
          username: teacher?.username || tc.teacher_id,
          displayName: teacher?.display_name || "",
          credits: tc.credits,
          usedCredits: tc.used_credits,
          transactionHistory: [] // We're not loading all transactions for all teachers for performance
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Exception in getAllTeacherCredits:", error);
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem("teacherCredits") || "[]");
  }
};
