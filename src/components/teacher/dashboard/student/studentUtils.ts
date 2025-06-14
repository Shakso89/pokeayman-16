
import { v4 as uuidv4 } from 'uuid';

interface ValidationErrors {
  username?: string;
  password?: string;
  displayName?: string;
  schoolId?: string;
}

interface StudentData {
  username: string;
  password: string;
  displayName: string;
  schoolId?: string;
}

export const validateStudentData = (data: StudentData): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};

  // Username validation
  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
  }

  // Display name validation
  if (!data.displayName || data.displayName.trim() === '') {
    errors.displayName = 'Display name is required';
  } else if (data.displayName.length < 2) {
    errors.displayName = 'Display name must be at least 2 characters long';
  }

  // Password validation
  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  // School validation
  if (!data.schoolId || data.schoolId.trim() === '') {
    errors.schoolId = 'School selection is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getValidUUID = (id: string): string => {
  // Check if the ID is already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // Generate a new UUID if the provided ID is not valid
  return uuidv4();
};
