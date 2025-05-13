
// Main export file for credit service
import { calculateCreditCost } from "./credits/creditCalculator";
import { getTeacherCredits, getAllTeacherCredits } from "./credits/creditQueries";
import { 
  initializeTeacherCredits, 
  addCreditsToTeacher, 
  useCredits 
} from "./credits/creditOperations";
import { 
  ensureTeacherCredits, 
  migrateTeacherCreditsToDatabase 
} from "./credits/migrationUtils";

// Re-export all functions to maintain backward compatibility
export {
  calculateCreditCost,
  getTeacherCredits,
  getAllTeacherCredits,
  initializeTeacherCredits,
  addCreditsToTeacher,
  useCredits,
  ensureTeacherCredits,
  migrateTeacherCreditsToDatabase
};
