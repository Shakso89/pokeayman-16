
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  t: (key: string, fallback?: string) => string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ t }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p>{t("loading-students")}</p>
      </div>
    </div>
  );
};

export default LoadingState;
