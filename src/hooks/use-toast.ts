
import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
}

// Track active toasts to prevent duplicates
const activeToasts = new Set<string>();

export function useToast() {
  const toast = ({ title, description, action, variant, duration }: ToastProps) => {
    // Create unique key for this toast
    const toastKey = `${title}-${description}-${variant}`;
    
    // Check if toast is already being shown
    if (activeToasts.has(toastKey)) {
      console.log('🔕 Duplicate toast prevented:', { title, description });
      return;
    }
    
    // Add to active set
    activeToasts.add(toastKey);
    
    // Dismiss any existing toasts first
    sonnerToast.dismiss();
    
    const options: any = {
      duration: duration || 3000,
      className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
      onDismiss: () => {
        // Remove from active set when dismissed
        activeToasts.delete(toastKey);
      },
      onAutoClose: () => {
        // Remove from active set when auto-closed
        activeToasts.delete(toastKey);
      }
    };

    if (action) {
      options.action = action;
    }

    // Remove from active set after a short delay to prevent immediate duplicates
    setTimeout(() => {
      activeToasts.delete(toastKey);
    }, 500);

    return sonnerToast(title || "", {
      description,
      ...options
    });
  };

  return { toast };
}

// Export a standalone toast function as well, for convenience
export const toast = ({ title, description, action, variant, duration }: ToastProps) => {
  // Create unique key for this toast
  const toastKey = `${title}-${description}-${variant}`;
  
  // Check if toast is already being shown
  if (activeToasts.has(toastKey)) {
    console.log('🔕 Duplicate toast prevented:', { title, description });
    return;
  }
  
  // Add to active set
  activeToasts.add(toastKey);
  
  // Dismiss any existing toasts first
  sonnerToast.dismiss();
  
  const options: any = {
    duration: duration || 3000,
    className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
    onDismiss: () => {
      // Remove from active set when dismissed
      activeToasts.delete(toastKey);
    },
    onAutoClose: () => {
      // Remove from active set when auto-closed
      activeToasts.delete(toastKey);
    }
  };

  if (action) {
    options.action = action;
  }

  // Remove from active set after a short delay to prevent immediate duplicates
  setTimeout(() => {
    activeToasts.delete(toastKey);
  }, 500);

  return sonnerToast(title || "", {
    description,
    ...options
  });
};
