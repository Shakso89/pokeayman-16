
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

interface SortButtonProps {
  sortOrder: "asc" | "desc";
  onClick: () => void;
  t: (key: string) => string;
}

const SortButton: React.FC<SortButtonProps> = ({ sortOrder, onClick, t }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="flex items-center gap-1"
    >
      {sortOrder === "desc" ? (
        <>
          <ArrowDownAZ className="h-4 w-4" />
          {t("sort-desc")}
        </>
      ) : (
        <>
          <ArrowUpAZ className="h-4 w-4" />
          {t("sort-asc")}
        </>
      )}
    </Button>
  );
};

export default SortButton;
