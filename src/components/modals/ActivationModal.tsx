
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { activateTeacher } from "@/utils/activationService";
import { useTranslation } from "@/hooks/useTranslation";

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose }) => {
  const [activationCode, setActivationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    if (activateTeacher(activationCode)) {
      toast({
        title: t("success"),
        description: t("account-activated-successfully"),
      });
      onClose();
      // Refresh the page to reflect the new activation status
      window.location.reload();
    } else {
      toast({
        title: t("invalid-code"),
        description: t("please-enter-a-valid-activation-code"),
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };
  
  const handleContactUs = () => {
    onClose();
    navigate("/contact");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("account-activation-required")}</DialogTitle>
          <DialogDescription>
            {t("enter-activation-code-to-access-features")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Label htmlFor="activation-code">{t("activation-code")}</Label>
          <Input
            id="activation-code"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            placeholder={t("enter-your-activation-code")}
          />
        </div>
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={handleContactUs}
          >
            {t("need-code-contact-us")}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !activationCode}
          >
            {isSubmitting ? t("activating") : t("activate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivationModal;
