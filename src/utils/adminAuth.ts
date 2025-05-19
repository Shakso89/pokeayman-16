
// Admin authentication utilities

export const ADMIN_EMAILS = [
  "ayman.soliman.cc@gmail.com",
  "ayman.soliman.tr@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com"
];

export const ADMIN_USERNAMES = ["Admin", "Ayman"];

export const ADMIN_PASSWORDS = ["AdminAyman", "AymanPassword"];

/**
 * Check if the provided email is an admin email
 */
export const isAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Check if the provided username is an admin username
 */
export const isAdminUsername = (username: string): boolean => {
  if (!username) return false;
  return ADMIN_USERNAMES.includes(username) || 
         username.toLowerCase() === 'admin' || 
         username.toLowerCase() === 'ayman';
};

/**
 * Validate admin password
 */
export const isValidAdminPassword = (password: string): boolean => {
  return ADMIN_PASSWORDS.includes(password);
};

/**
 * Special handling for specific admin emails
 * This function has been improved to ensure special case emails never get stuck
 */
export const isAymanEmail = (email?: string): boolean => {
  if (!email) return false;
  return email.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
         email.toLowerCase() === "ayman.soliman.cc@gmail.com";
};

/**
 * Check if username is Ayman
 */
export const isAymanUsername = (username: string): boolean => 
  username && username.toLowerCase() === "ayman";

/**
 * Check for development admin login bypasses
 * With improved handling for special admin cases
 */
export const checkDevAdminLogin = (username: string, password: string): boolean => {
  // Special case for Ayman's email
  if (username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
      username.toLowerCase() === "ayman" ||
      username.toLowerCase() === "ayman.soliman.cc@gmail.com") {
    return password === "AdminAyman" || password === "AymanPassword";
  }
  
  // General admin credential check
  const isAdminCredential = (
    ADMIN_USERNAMES.includes(username) || 
    ADMIN_EMAILS.includes(username.toLowerCase()) ||
    username.toLowerCase() === "admin" ||
    username.toLowerCase() === "ayman"
  );
  const isAdminPassword = password === "AdminAyman" || password === "AymanPassword";
  
  return isAdminCredential && isAdminPassword;
};

/**
 * Process admin login for both student and teacher login flows
 * Enhanced for reliable authentication of special admin accounts
 */
export const processAdminLogin = (username: string): {
  displayName: string;
  email: string;
  isAdmin: boolean;
} => {
  // Default values
  let displayName = "Admin";
  let email = username.includes("@") ? username.toLowerCase() : `${username.toLowerCase()}@pokeayman.com`;
  
  // Special case for Ayman with reliable email assignment
  if (username.toLowerCase() === "ayman" || 
      username.toLowerCase().includes("ayman.soliman")) {
    displayName = "Ayman";
    
    // Ensure consistent email for Ayman accounts
    if (username.toLowerCase() === "ayman.soliman.tr@gmail.com") {
      email = "ayman.soliman.tr@gmail.com";
    } else if (username.toLowerCase() === "ayman.soliman.cc@gmail.com") {
      email = "ayman.soliman.cc@gmail.com";
    } else if (!username.includes("@")) {
      email = "ayman.soliman.tr@gmail.com";
    }
  }
  
  return {
    displayName,
    email,
    isAdmin: true
  };
};
