import { debugService } from "./debugService";
import { createCoinAwardNotification } from "@/utils/notificationService";
import { createAdminNotification } from "./adminNotificationService";
import { supabase } from "@/integrations/supabase/client";

interface AwardCoinsResult {
  success: boolean;
  error?: string;
  newBalance?: number;
}

const validateInputs = (studentId: string, amount: number): boolean => {
  if (!debugService.validateStudentId(studentId)) {
    return false;
  }
  if (!debugService.validateAmount(amount)) {
    return false;
  }
  return true;
};

export const awardCoinsToStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "reward",
  type: string = "teacher_award",
  classId?: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  console.log("🚀 Starting enhanced coin award process");
  
  if (!validateInputs(studentId, amount)) {
    return { success: false, error: "Invalid input parameters" };
  }

  try {
    debugService.log("Awarding coins to student", {
      studentId,
      amount,
      reason,
      type,
      classId
    });

    // Get current teacher and student data
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('username, display_name')
      .eq('user_id', studentId)
      .single();

    if (studentError) {
      debugService.logError("Failed to fetch student data", studentError);
      return { success: false, error: `Failed to fetch student data: ${studentError.message}` };
    }

    if (!studentData) {
      return { success: false, error: "Student not found" };
    }

    // Get teacher info for notifications
    const teacherId = localStorage.getItem("teacherId");
    const teacherName = localStorage.getItem("teacherUsername") || "Unknown Teacher";
    
    let teacherDisplayName = teacherName;
    if (teacherId) {
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('display_name')
        .eq('id', teacherId)
        .single();
      
      if (teacherData?.display_name) {
        teacherDisplayName = teacherData.display_name;
      }
    }

    // Update student_profiles table
    const { data: updateData, error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: () => `coins + ${amount}` })
      .eq('user_id', studentId)
      .select('coins');

    if (updateError) {
      debugService.logError("Failed to update student profile", updateError);
      return { success: false, error: `Failed to update student profile: ${updateError.message}` };
    }

    if (!updateData || updateData.length === 0) {
      return { success: false, error: "No student profile was updated - student may not exist" };
    }

    const newBalance = updateData[0].coins;
    debugService.log("Student profile updated successfully", { studentId, newBalance });

    // Insert into coin_history table
    const { error: historyError } = await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: amount,
        reason: reason,
        related_entity_type: type,
        related_entity_id: classId
      });

    if (historyError) {
      debugService.logError("Failed to insert coin history", historyError);
      console.warn("Failed to insert coin history:", historyError);
    }

    // Send notification to student
    try {
      await createCoinAwardNotification(studentId, amount, reason);
    } catch (notificationError) {
      console.warn("Failed to send student notification:", notificationError);
    }

    // Send notification to owners
    try {
      await createAdminNotification({
        teacherName: teacherDisplayName,
        studentName: studentData.username || studentData.display_name || "Unknown Student",
        type: 'coin_award',
        amount,
        reason
      });
    } catch (adminNotificationError) {
      console.warn("Failed to send admin notification:", adminNotificationError);
    }

    debugService.log("Coin award completed successfully", {
      studentId,
      amount,
      newBalance,
      reason
    });

    return { success: true, newBalance };

  } catch (error) {
    debugService.logError("Unexpected error in coin award process", error);
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
