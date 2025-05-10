
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import PokemonWheel from "@/components/student/PokemonWheel";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonWheelTabProps {
  wheelPokemons: Pokemon[];
  studentId: string;
  schoolId: string;
  coins: number;
  isLoadingWheel: boolean;
  onPokemonWon: (pokemon: Pokemon) => void;
  onRefreshWheel: () => void;
}

const PokemonWheelTab: React.FC<PokemonWheelTabProps> = ({
  wheelPokemons,
  studentId,
  schoolId,
  coins,
  isLoadingWheel,
  onPokemonWon,
  onRefreshWheel,
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="mx-auto max-w-xl shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-md">
        <CardTitle className="text-2xl">{t("daily-pokemon-wheel") || "Daily Pokémon Wheel"}</CardTitle>
        <CardDescription className="text-white opacity-90">
          {t("spend-coin-to-spin") || "Spend 1 coin to spin the wheel and win a Pokémon from today's selection!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {wheelPokemons.length === 0 ? (
          <div className="text-center p-8">
            <p className="mb-4 text-lg text-gray-700">{t("no-available-pokemon") || "No available Pokémon"}</p>
            <Button
              onClick={onRefreshWheel}
              className="mx-auto flex items-center gap-2"
              disabled={isLoadingWheel}
            >
              <RefreshCw className="h-4 w-4" />
              {isLoadingWheel ? (t("checking") || "Checking...") : (t("check-availability") || "Check Availability")}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <PokemonWheel 
              studentId={studentId} 
              schoolId={schoolId}
              coins={coins}
              onPokemonWon={onPokemonWon}
              wheelPokemons={wheelPokemons}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PokemonWheelTab;
