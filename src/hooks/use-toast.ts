
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";

// Define our custom toast props which match how the app is currently using toast
export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

// Create a custom hook that returns our toast function
export const useToast = () => {
  const toast = (props: ToastProps) => {
    const { title, description, variant = "default", duration, ...rest } = props;
    
    return sonnerToast(title as string || "", {
      description,
      duration,
      ...rest,
    });
  };

  return {
    toast,
  };
};

// Export a standalone toast function with the same interface
export const toast = (props: ToastProps) => {
  const { title, description, variant = "default", duration, ...rest } = props;
  
  return sonnerToast(title as string || "", {
    description,
    duration,
    ...rest,
  });
};
