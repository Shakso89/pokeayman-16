
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface SignupFormFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
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
  isLoading,
  onOpenContactDialog,
  onNavigateToLogin
}) => {
  // Password validation
  const hasMinLength = password.length >= 6;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  return <>
      {/* Username field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input id="username" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} className="pl-10 bg-black/30 border-gray-700 text-white" required />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>
      
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 bg-black/30 border-gray-700 text-white" required />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>
      
      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 bg-black/30 border-gray-700 text-white" required />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        
        {/* Password requirements */}
        <div className="text-xs space-y-1 mt-1">
          <p className={hasMinLength ? "text-green-400" : "text-gray-400"}>
            • At least 6 characters
          </p>
          <p className={hasLettersAndNumbers ? "text-green-400" : "text-gray-400"}>
            • Contains both letters and numbers
          </p>
        </div>
      </div>
      
      {/* Confirm Password field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 bg-black/30 border-gray-700 text-white" required />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        
        {/* Password matching indicator */}
        {confirmPassword.length > 0 && (
          <p className={passwordsMatch ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
            {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
          </p>
        )}
      </div>
      
      {/* Submit button */}
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      
      <div className="text-center text-sm mt-2">
        <p>
          Already have an account?{" "}
          <button type="button" onClick={onNavigateToLogin} className="text-blue-400 hover:underline">
            Sign in
          </button>
        </p>
        <p className="mt-1">
          Need help?{" "}
          <button type="button" onClick={onOpenContactDialog} className="text-blue-400 hover:underline">
            Contact us
          </button>
        </p>
      </div>
    </>;
};

export default SignupFormFields;
