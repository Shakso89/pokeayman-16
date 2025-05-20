
import { supabase } from "@/integrations/supabase/client";
import { HomeworkAssignment } from "@/types/homework";

// Fetch homework assignments for a class
export const fetchHomeworkForClass = async (classId: string): Promise<HomeworkAssignment[]> => {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('classId', classId)
      .gt('expiresAt', new Date().toISOString());
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching homework from Supabase:", error);
    
    // Fallback to localStorage
    const savedHomework = localStorage.getItem("homeworkAssignments");
    if (savedHomework) {
      const allHomework = JSON.parse(savedHomework);
      return allHomework.filter(
        (hw: HomeworkAssignment) => 
          hw.classId === classId && 
          new Date(hw.expiresAt) > new Date()
      );
    }
    
    return [];
  }
};

// Fetch homework submissions for a student
export const fetchStudentSubmissions = async (studentId: string): Promise<any[]> => {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('studentId', studentId);
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching homework submissions from Supabase:", error);
    
    // Fallback to localStorage
    const savedSubmissions = localStorage.getItem("homeworkSubmissions");
    if (savedSubmissions) {
      const allSubmissions = JSON.parse(savedSubmissions);
      return allSubmissions.filter(
        (sub: any) => sub.studentId === studentId
      );
    }
    
    return [];
  }
};

// Save a homework submission
export const saveHomeworkSubmission = async (submission: any): Promise<boolean> => {
  try {
    // Try to save to Supabase first
    const { error } = await supabase
      .from('homework_submissions')
      .insert(submission);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving submission to Supabase:", error);
    
    // Fallback to localStorage
    try {
      const savedSubmissions = localStorage.getItem("homeworkSubmissions");
      let submissions = savedSubmissions ? JSON.parse(savedSubmissions) : [];
      
      // Add new submission
      submissions.push(submission);
      
      // Save back to localStorage
      localStorage.setItem("homeworkSubmissions", JSON.stringify(submissions));
      return true;
    } catch (localError) {
      console.error("Error saving to localStorage:", localError);
      return false;
    }
  }
};
