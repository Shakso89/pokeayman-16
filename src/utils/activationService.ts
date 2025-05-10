
// A utility to manage account activation status

/**
 * Checks if a teacher account is activated/unfrozen
 * @returns boolean indicating if the account is activated
 */
export const isTeacherActivated = (): boolean => {
  // Check if user is admin (admins are always activated)
  if (localStorage.getItem("isAdmin") === "true") {
    return true;
  }
  
  // For regular teachers, check if they are frozen (now all accounts start activated)
  const teacherData = localStorage.getItem("teachers");
  if (teacherData) {
    const teachers = JSON.parse(teacherData);
    const teacherId = localStorage.getItem("teacherId");
    
    if (teacherId) {
      const teacher = teachers.find((t: any) => t.id === teacherId);
      return teacher ? teacher.isActive !== false : true;
    }
  }
  
  // Default to activated if no teacher data is found
  return true;
};

/**
 * Sets activation status directly (for admin purposes)
 * @param isActivated boolean indicating if the account should be activated
 */
export const setActivationStatus = (isActivated: boolean): void => {
  const teacherId = localStorage.getItem("teacherId");
  if (!teacherId) return;
  
  const teacherData = localStorage.getItem("teachers");
  if (teacherData) {
    const teachers = JSON.parse(teacherData);
    const teacherIndex = teachers.findIndex((t: any) => t.id === teacherId);
    
    if (teacherIndex !== -1) {
      teachers[teacherIndex].isActive = isActivated;
      localStorage.setItem("teachers", JSON.stringify(teachers));
    }
  }
};
