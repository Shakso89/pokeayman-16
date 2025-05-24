
import { User } from '@supabase/supabase-js';
import { ADMIN_EMAILS, ADMIN_USERNAMES } from './constants';

// Check if user is admin based on email or username
export const checkIsAdmin = (user: User | null, username?: string): boolean => {
  if (!user && !username) return false;
  
  const email = user?.email?.toLowerCase() || '';
  const storedEmail = localStorage.getItem("userEmail")?.toLowerCase() || '';
  const storedUsername = localStorage.getItem("teacherUsername") || '';
  
  // Check for admin email or username
  const isAdminEmail = ADMIN_EMAILS.includes(email) || ADMIN_EMAILS.includes(storedEmail);
  const isAdminUsername = username 
    ? ADMIN_USERNAMES.includes(username) 
    : ADMIN_USERNAMES.includes(storedUsername);
  
  // Special case handling for known admin emails
  const isSpecialAdminEmail = 
    email === 'ayman.soliman.tr@gmail.com' || 
    storedEmail === 'ayman.soliman.tr@gmail.com' ||
    email === 'ayman.soliman.cc@gmail.com' || 
    storedEmail === 'ayman.soliman.cc@gmail.com';
  
  // Set isAdmin flag in localStorage for later reference
  const isAdmin = isAdminEmail || isAdminUsername || isSpecialAdminEmail;
  if (isAdmin) {
    localStorage.setItem("isAdmin", "true");
  }
  
  return isAdmin;
};

// Handle special admin emails with additional logging
export const isSpecialAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return email.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
         email.toLowerCase() === "ayman.soliman.cc@gmail.com";
};
