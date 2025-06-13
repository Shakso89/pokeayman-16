
// Import with correct names from classOperations
import { 
  createClass as addClass, 
  updateClassDetails as updateClass, 
  deleteClass, 
  getClassById as getClass, 
  getClassesBySchool,
  getClassesForUser,
  addAssistantToClass,
  removeAssistantFromClass
} from './classOperations';
import { addStudentToClass, removeStudentFromClass } from './studentOperations';
import { subscribeToClass, subscribeToStudent, subscribeToTables, enableRealtimeForTables } from './classSubscription';
import { getStudentsInClass as getAllStudentsForClass, fetchTeacherClasses as getTeacherClasses } from './classFetching';
import { formatClassData as mapClassData, formatClassesData as mapClassesData, formatStudentData as mapStudentData, formatStudentsData as mapStudentsData } from './mappers';
import { handleDatabaseError, showDatabaseError } from './errorHandling';

export {
  addClass, updateClass, deleteClass, getClass, getClassesBySchool, getClassesForUser,
  addStudentToClass, removeStudentFromClass,
  addAssistantToClass, removeAssistantFromClass,
  subscribeToClass, subscribeToStudent, subscribeToTables, enableRealtimeForTables,
  getAllStudentsForClass, getTeacherClasses,
  mapClassData, mapClassesData, mapStudentData, mapStudentsData,
  handleDatabaseError, showDatabaseError
};
