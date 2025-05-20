
// Import with correct names from classOperations
import { createClass as addClass, updateClassDetails as updateClass, removeClass as deleteClass, getClassById as getClass, getClassesBySchool } from './classOperations';
import { addStudentToClass, removeStudentFromClass } from './studentOperations';
import { subscribeToClass, subscribeToStudent, subscribeToTables, enableRealtimeForTables } from './classSubscription';
// Correct the import names from classFetching
import { getStudentsInClass as getAllStudentsForClass, fetchTeacherClasses as getTeacherClasses } from './classFetching';
// Correct the import names from mappers
import { formatClassData as mapClassData, formatClassesData as mapClassesData, formatStudentData as mapStudentData, formatStudentsData as mapStudentsData } from './mappers';
import { handleDatabaseError, showDatabaseError } from './errorHandling';

export {
  addClass, updateClass, deleteClass, getClass, getClassesBySchool,
  addStudentToClass, removeStudentFromClass,
  subscribeToClass, subscribeToStudent, subscribeToTables, enableRealtimeForTables,
  getAllStudentsForClass, getTeacherClasses,
  mapClassData, mapClassesData, mapStudentData, mapStudentsData,
  handleDatabaseError, showDatabaseError
};
