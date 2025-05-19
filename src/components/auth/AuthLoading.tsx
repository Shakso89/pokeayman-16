
import React from "react";
import { AuthLayout } from "@/components/AuthLayout";

interface AuthLoadingProps {
  title: string;
}

const AuthLoading: React.FC<AuthLoadingProps> = ({ title }) => {
  return (
    <AuthLayout title={title}>
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </AuthLayout>
  );
};

export default AuthLoading;
