
import { toast as sonnerToast, type ToastT } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
};

export function toast(props: ToastProps) {
  const { title, description, variant, duration, action } = props;
  
  return sonnerToast(title, {
    description,
    duration: duration || 5000,
    action,
    className: variant === "destructive" ? "destructive" : undefined
  });
}

// Create our own useToast hook since sonner doesn't export one directly
export const useToast = () => {
  return { toast };
};
