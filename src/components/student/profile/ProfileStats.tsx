
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileStatsProps {
  pokemonCount: number;
  schoolRanking: number | null;
  battlesCount?: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ 
  pokemonCount, 
  schoolRanking,
  battlesCount 
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <p className="text-sm font-medium text-gray-500">{t("pokemon-count")}:</p>
        <p>{pokemonCount}</p>
      </div>
      
      {battlesCount !== undefined && (
        <div>
          <p className="text-sm font-medium text-gray-500">{t("battles")}:</p>
          <p>{battlesCount}</p>
        </div>
      )}
      
      {schoolRanking && (
        <div>
          <p className="text-sm font-medium text-gray-500">{t("school-ranking")}:</p>
          <p>#{schoolRanking}</p>
        </div>
      )}
    </>
  );
};

export default ProfileStats;
