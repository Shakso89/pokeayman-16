
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";

type ToastProps = Omit<ExternalToast, "id"> & {
  title?: string;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

const useToast = () => {
  const toast = (props: ToastProps) => {
    const { title, description, variant = "default", ...rest } = props;
    
    return sonnerToast(title || "", {
      description,
      ...rest,
    });
  };

  return {
    toast,
  };
};

// Re-export the toast function with our custom types
const toast = (props: ToastProps) => {
  const { title, description, variant = "default", ...rest } = props;
  
  return sonnerToast(title || "", {
    description,
    ...rest,
  });
};

export { useToast, toast };
