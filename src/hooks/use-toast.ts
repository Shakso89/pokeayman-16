
import { toast as sonnerToast, type ToastT } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, action, variant, duration }: ToastProps) => {
    const options: any = {
      duration,
      className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : ""
    };
    
    if (action) {
      options.action = action;
    }

    return sonnerToast(title || "", {
      description,
      ...options
    });
  };

  return { toast };
}

export const toast = ({ title, description, action, variant, duration }: ToastProps) => {
  const options: any = {
    duration,
    className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : ""
  };
  
  if (action) {
    options.action = action;
  }

  return sonnerToast(title || "", {
    description,
    ...options
  });
};

// Remove the duplicate export that was causing the conflict
