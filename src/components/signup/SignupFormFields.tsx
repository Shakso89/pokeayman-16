
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock } from "lucide-react";

interface SignupFormFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  activationCode: string;
  setActivationCode: (value: string) => void;
  isLoading: boolean;
  onOpenContactDialog: () => void;
  onNavigateToLogin: () => void;
}

const SignupFormFields: React.FC<SignupFormFieldsProps> = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  activationCode,
  setActivationCode,
  isLoading,
  onOpenContactDialog,
  onNavigateToLogin
}) => {
  return (
    <>
      {/* Username field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10"
            required
          />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
      </div>
      
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
      </div>
      
      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
      </div>
      
      {/* Confirm Password field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            required
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
      </div>
      
      {/* Activation Code field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="activationCode">Activation Code</Label>
          <Button 
            type="button" 
            variant="link" 
            size="sm" 
            onClick={onOpenContactDialog}
            className="text-xs"
          >
            Need a code?
          </Button>
        </div>
        <Input
          id="activationCode"
          placeholder="Enter your activation code"
          value={activationCode}
          onChange={(e) => setActivationCode(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">
          Use code starting with TRIAL for a 7-day trial
        </p>
      </div>
      
      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      
      <div className="text-center text-sm mt-2">
        <p>
          Already have an account?{" "}
          <button 
            type="button" 
            onClick={onNavigateToLogin}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
};

export default SignupFormFields;
