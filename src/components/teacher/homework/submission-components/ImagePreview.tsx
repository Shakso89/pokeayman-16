
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  imageSrc: string;
  studentName: string;
  onClose: () => void;
  onViewFull: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageSrc,
  studentName,
  onClose,
  onViewFull
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-2 p-2 border rounded-md bg-white mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium">{t("submission-preview")}</p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <img 
        src={imageSrc} 
        alt={`${studentName}'s submission`}
        className="max-h-48 max-w-full rounded-md"
      />
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewFull}
        >
          {t("view-full")}
        </Button>
      </div>
    </div>
  );
};
