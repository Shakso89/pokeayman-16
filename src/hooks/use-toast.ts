import { toast as sonnerToast } from "sonner";

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

// Export a standalone toast function as well, for convenience
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
