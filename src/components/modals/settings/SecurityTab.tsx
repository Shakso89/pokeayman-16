
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface SecurityTabProps {
  onClose: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const validatePasswordChange = () => {
    setPasswordError("");
    
    if (!currentPassword) {
      setPasswordError(t("current-password-required"));
      return false;
    }
    
    if (!newPassword) {
      setPasswordError(t("new-password-required"));
      return false;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(t("password-too-short"));
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwords-do-not-match"));
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) return;
    
    setIsChangingPassword(true);
    
    try {
      // For now we'll simulate password change since we're using local storage
      // In a real app with Supabase, we would use:
      // await supabase.auth.updateUser({ password: newPassword })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t("password-changed-successfully"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t("error-changing-password"));
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("change-password")}</h3>
        
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t("current-password")}</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("new-password")}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirm-password")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        {passwordError && (
          <p className="text-sm text-red-500">{passwordError}</p>
        )}
        
        <Button 
          className="w-full" 
          onClick={handleChangePassword}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? t("changing-password") : t("change-password")}
        </Button>
      </div>
    </div>
  );
};

export default SecurityTab;
