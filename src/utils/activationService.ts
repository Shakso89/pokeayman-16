
// A utility to manage account activation status

/**
 * Checks if a teacher account is activated
 * @returns boolean indicating if the account is activated
 */
export const isTeacherActivated = (): boolean => {
  // Check if user is admin (admins are always activated)
  if (localStorage.getItem("isAdmin") === "true") {
    return true;
  }
  
  // For regular teachers, check activation status
  return localStorage.getItem("teacherActivated") === "true";
};

/**
 * Activates a teacher account with a valid code
 * @param code - The activation code to validate
 * @returns boolean indicating if activation was successful
 */
export const activateTeacher = (code: string): boolean => {
  // In a production app, this would validate against a database of valid codes
  // For demo purposes, we'll use hardcoded codes
  const validCodes = ["POKEAYMAN2025", "TEACHER123", "ACTIVATENOW"];
  
  if (validCodes.includes(code)) {
    localStorage.setItem("teacherActivated", "true");
    return true;
  }
  
  return false;
};

/**
 * Sets activation status directly (for admin purposes)
 */
export const setActivationStatus = (isActivated: boolean): void => {
  localStorage.setItem("teacherActivated", isActivated.toString());
};
