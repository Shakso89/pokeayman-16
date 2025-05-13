
import { v4 as uuidv4 } from "uuid";

// Function to ensure teacher ID is a valid UUID
export const getValidUUID = (id: string | null): string => {
  if (!id) return uuidv4(); // Generate a new UUID if id is null
  
  // Check if the ID is already a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  
  // If the ID starts with "teacher-", extract a hash from it to create a consistent UUID
  if (id.startsWith("teacher-")) {
    // Use the teacher ID to deterministically generate a UUID
    // This ensures the same teacher ID always maps to the same UUID
    const teacherNum = id.replace("teacher-", "");
    const namespace = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // A fixed namespace UUID
    
    // Create a UUID based on the teacher number (simplified approach)
    const hash = `${namespace.substring(0, 24)}${teacherNum.substring(0, 12)}`;
    return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  }
  
  // Default fallback - generate a new UUID
  return uuidv4();
};
