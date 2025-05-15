
import { toast } from "@/hooks/use-toast";

// Helper function to safely handle database errors and responses
export const handleDatabaseError = <T>(error: any, fallback: T): T => {
  console.error("Database error:", error);
  return fallback;
};

// Helper for displaying database errors with toast
export const showDatabaseError = (error: any, message: string): void => {
  console.error(message, error);
  toast({
    title: "Database Error",
    description: message,
    variant: "destructive"
  });
};
