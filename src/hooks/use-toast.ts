
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function toast({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastProps) {
  return sonnerToast(title, {
    description,
    duration,
    className: variant === "destructive" ? "bg-red-100 border-red-200" : undefined
  });
}

export function useToast() {
  return {
    toast
  };
}
