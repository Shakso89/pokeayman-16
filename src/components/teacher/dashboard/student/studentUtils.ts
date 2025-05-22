
/**
 * Validates a UUID format and returns a valid UUID.
 * If the input is not a valid UUID, it generates a new one.
 */
export const getValidUUID = (id: string | null): string => {
  if (!id) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback in case crypto.randomUUID is not available
      return '00000000-0000-0000-0000-000000000000';
    }
  }
  
  // Check if the ID is a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(id)) {
    return id;
  } else {
    // Generate a new UUID based on the provided string
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback UUID creation
      const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }
  }
};

/**
 * Validates student data and returns any errors found
 */
export const validateStudentData = (data: {
  username: string;
  password: string;
  displayName: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }
  
  if (!data.displayName || data.displayName.trim() === '') {
    errors.displayName = 'Display name is required';
  }
  
  if (!data.password || data.password.length < 4) {
    errors.password = 'Password must be at least 4 characters';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
