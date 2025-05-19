
// Admin authentication utilities

export const ADMIN_EMAILS = [
  "ayman.soliman.cc@gmail.com",
  "ayman.soliman.tr@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com"
];

export const ADMIN_USERNAMES = ["Admin", "Ayman"];

export const isAdminUser = (email?: string, username?: string) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase() || "") ||
         ADMIN_USERNAMES.includes(username || "");
};

// Special handling for admin users
export const isAymanEmail = (username: string) => 
  username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
  username.toLowerCase() === "ayman.soliman.cc@gmail.com";

export const isAymanUsername = (username: string) => 
  username.toLowerCase() === "ayman";

export const isAdminUsername = (username: string) => 
  username.toLowerCase() === "admin";

export const isValidAdminPassword = (password: string) => 
  password === "AymanPassword" || password === "AdminAyman";

export const checkDevAdminLogin = (username: string, password: string) => {
  const isDevelopment = import.meta.env.MODE === "development";
  const isAdminCredential = (ADMIN_USERNAMES.includes(username) || 
                             ADMIN_EMAILS.includes(username.toLowerCase()));
  const isAdminPassword = password === "AdminAyman" || password === "AymanPassword";
  
  return isDevelopment && isAdminCredential && isAdminPassword;
};
