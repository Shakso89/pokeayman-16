
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

// Helper for password hash check (bcryptjs is installed)
import bcrypt from "bcryptjs";

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

  // Determine user context from localStorage
  const userType = localStorage.getItem("userType"); // "student" or "teacher"
  const studentId = localStorage.getItem("studentId");
  const teacherId = localStorage.getItem("teacherId");

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
      let user;
      let hashField = "";
      let data = null;
      let selectRes;

      if (userType === "teacher" && teacherId) {
        // Load teacher and verify current password
        selectRes = await supabase
          .from("teachers")
          .select("*")
          .eq("id", teacherId)
          .maybeSingle();

        user = selectRes.data;
        hashField = "password";
      } else if (userType === "student" && studentId) {
        // Load student and verify current password
        selectRes = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .maybeSingle();

        user = selectRes.data;
        hashField = "password_hash";
      } else {
        setPasswordError("No user context found");
        setIsChangingPassword(false);
        return;
      }

      // Check old password
      if (!user) {
        setPasswordError(t("error-finding-user"));
        setIsChangingPassword(false);
        return;
      }
      const hashed = user[hashField];
      const isCorrect = hashed && bcrypt.compareSync(currentPassword, hashed);

      if (!isCorrect) {
        setPasswordError(t("current-password-invalid"));
        setIsChangingPassword(false);
        return;
      }

      // Hash new password
      const newHash = bcrypt.hashSync(newPassword, 10);

      // Update DB
      if (userType === "teacher" && teacherId) {
        const { error } = await supabase
          .from("teachers")
          .update({ password: newHash })
          .eq("id", teacherId);

        if (error) throw error;
      } else if (userType === "student" && studentId) {
        const { error } = await supabase
          .from("students")
          .update({ password_hash: newHash })
          .eq("id", studentId);

        if (error) throw error;
      }

      // Clear input/password state
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      toast.success(t("password-changed-successfully"));
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(
        error?.message || t("error-changing-password")
      );
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
            autoComplete="current-password"
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("new-password")}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirm-password")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
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
