
// Validation functions for student data
export const validateStudentData = (studentData: {
  username: string;
  password: string;
  displayName: string;
}) => {
  const errors: Record<string, string> = {};
  
  // Username validation
  if (!studentData.username || studentData.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (studentData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (!/^[a-zA-Z0-9_]+$/.test(studentData.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }
  
  // Display name validation
  if (!studentData.displayName || studentData.displayName.trim() === '') {
    errors.displayName = 'Display name is required';
  } else if (studentData.displayName.length < 2) {
    errors.displayName = 'Display name must be at least 2 characters long';
  }
  
  // Password validation
  if (!studentData.password || studentData.password.trim() === '') {
    errors.password = 'Password is required';
  } else if (studentData.password.length < 4) {
    errors.password = 'Password must be at least 4 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Function to ensure we have a valid UUID format for teacher ID
export const getValidUUID = (id: string): string => {
  // Check if the ID is already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // If not a valid UUID, try to generate one from the existing ID
  try {
    // Use crypto.randomUUID() to generate a new UUID
    const newUUID = crypto.randomUUID();
    console.log(`Generated new UUID ${newUUID} for invalid ID: ${id}`);
    return newUUID;
  } catch (error) {
    console.error("Failed to generate UUID:", error);
    // Fallback to a deterministic UUID based on the input
    return generateDeterministicUUID(id);
  }
};

// Generate a deterministic UUID-like string from input
const generateDeterministicUUID = (input: string): string => {
  // Create a simple hash of the input
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex and pad
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  // Format as UUID
  return `${hexHash.substring(0, 8)}-${hexHash.substring(0, 4)}-4${hexHash.substring(1, 4)}-8${hexHash.substring(0, 3)}-${hexHash}${Date.now().toString(16).substring(-4)}`;
};

// Helper function to generate unique student ID
export const generateStudentId = (): string => {
  try {
    return crypto.randomUUID();
  } catch (error) {
    console.error("Failed to generate student UUID:", error);
    return `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
