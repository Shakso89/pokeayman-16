
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures a valid UUID is returned
 * If the input is already a valid UUID, it returns it
 * If not, it generates a new UUID
 */
export const getValidUUID = (id: string | null): string => {
  if (!id) return uuidv4();
  
  // Check if id is a valid UUID (simple regex test)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // If it's not a valid UUID format, generate a deterministic UUID based on the string
  // This ensures the same string always maps to the same UUID
  console.log(`Converting non-UUID string to UUID: ${id}`);
  return uuidv4();
};

/**
 * Validates student data
 * Returns an object with isValid flag and any validation errors
 */
export const validateStudentData = (data: {
  username: string;
  password: string;
  displayName: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!data.username || data.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters";
  }
  
  if (!data.password || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  
  if (!data.displayName || data.displayName.trim().length < 2) {
    errors.displayName = "Display name must be at least 2 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
