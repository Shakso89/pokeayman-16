
// Admin authentication utilities

export const ADMIN_EMAILS = [
  "ayman.soliman.cc@gmail.com",
  "ayman.soliman.tr@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com"
];

export const ADMIN_USERNAMES = ["Admin", "Ayman"];

export const ADMIN_PASSWORDS = ["AdminAyman", "AymanPassword"];

export const isAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const isAdminUsername = (username: string): boolean => {
  return ADMIN_USERNAMES.includes(username);
};

export const isValidAdminPassword = (password: string): boolean => {
  return ADMIN_PASSWORDS.includes(password);
};

// Special handling for admin users
export const isAymanEmail = (username: string): boolean => 
  username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
  username.toLowerCase() === "ayman.soliman.cc@gmail.com";

export const isAymanUsername = (username: string): boolean => 
  username.toLowerCase() === "ayman";

export const checkDevAdminLogin = (username: string, password: string): boolean => {
  const isDevelopment = import.meta.env.MODE === "development";
  const isAdminCredential = (ADMIN_USERNAMES.includes(username) || 
                             ADMIN_EMAILS.includes(username.toLowerCase()));
  const isAdminPassword = password === "AdminAyman" || password === "AymanPassword";
  
  return isDevelopment && isAdminCredential && isAdminPassword;
};
