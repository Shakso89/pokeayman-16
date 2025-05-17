
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

interface SortControlsProps {
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  t: (key: string, fallback?: string) => string;
}

const SortControls: React.FC<SortControlsProps> = ({ sortOrder, toggleSortOrder, t }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleSortOrder}
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

export default SortControls;
