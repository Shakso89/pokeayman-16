
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { History } from "lucide-react";

interface MysteryBallResult {
  id: string;
  studentId: string;
  date: string;
  type: "pokemon" | "coins" | "nothing";
  pokemonData?: {
    id: string;
    name: string;
    image: string;
    type: string;
    rarity: string;
  };
  coinsAmount?: number;
}

interface MysteryBallHistoryProps {
  studentId: string;
}

const MysteryBallHistory: React.FC<MysteryBallHistoryProps> = ({ studentId }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<MysteryBallResult[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [showPokemonDialog, setShowPokemonDialog] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [studentId]);

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem(`mysteryBallHistory_${studentId}`);
      if (savedHistory) {
        const parsedHistory: MysteryBallResult[] = JSON.parse(savedHistory);
        // Sort by date descending (newest first)
        parsedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Take only the last 10 results
        setHistory(parsedHistory.slice(0, 10));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading mystery ball history:", error);
      setHistory([]);
    }
  };

  const handlePokemonClick = (pokemon: any) => {
    setSelectedPokemon(pokemon);
    setShowPokemonDialog(true);
  };

  const closePokemonDialog = () => {
    setShowPokemonDialog(false);
    setSelectedPokemon(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy HH:mm');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium">{t("mystery-ball-history")}</h3>
        </div>
        <span className="text-sm text-gray-500">{t("last-10-results")}</span>
      </div>

      {history.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-500">{t("no-mystery-ball-history")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {result.type === "pokemon" && result.pokemonData && (
                    <div 
                      className="w-16 h-16 bg-gray-100 rounded-md p-1 flex-shrink-0 cursor-pointer"
                      onClick={() => handlePokemonClick(result.pokemonData)}
                    >
                      <img 
                        src={result.pokemonData.image} 
                        alt={result.pokemonData.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  {result.type === "coins" && (
                    <div className="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-bold">
                        +{result.coinsAmount}
                      </span>
                    </div>
                  )}
                  {result.type === "nothing" && (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500">-</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {result.type === "pokemon" ? result.pokemonData?.name : 
                         result.type === "coins" ? `${result.coinsAmount} ${t("coins")}` : 
                         t("nothing-found")}
                      </p>
                      <span className="text-xs text-gray-500">{formatDate(result.date)}</span>
                    </div>
                    {result.type === "pokemon" && result.pokemonData && (
                      <div className="flex mt-1">
                        <span className={`text-xs py-0.5 px-2 rounded-full ${
                          result.pokemonData.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : 
                          result.pokemonData.rarity === 'rare' ? 'bg-purple-100 text-purple-800' : 
                          result.pokemonData.rarity === 'uncommon' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {result.pokemonData.rarity}
                        </span>
                        <span className="text-xs py-0.5 px-2 rounded-full bg-gray-100 text-gray-800 ml-1">
                          {result.pokemonData.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pokemon Detail Dialog */}
      <Dialog open={showPokemonDialog} onOpenChange={closePokemonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPokemon?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-40 h-40 bg-gray-100 rounded-lg p-4 mb-4">
              <img 
                src={selectedPokemon?.image} 
                alt={selectedPokemon?.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                <span className={`text-sm py-1 px-3 rounded-full font-medium ${
                  selectedPokemon?.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : 
                  selectedPokemon?.rarity === 'rare' ? 'bg-purple-100 text-purple-800' : 
                  selectedPokemon?.rarity === 'uncommon' ? 'bg-blue-100 text-blue-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedPokemon?.rarity}
                </span>
                <span className="text-sm py-1 px-3 rounded-full font-medium bg-gray-100 text-gray-800">
                  {selectedPokemon?.type}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closePokemonDialog}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MysteryBallHistory;
