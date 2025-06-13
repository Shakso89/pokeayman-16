
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
import { getMysteryBallHistory, MysteryBallHistoryRecord } from "@/services/studentDatabase";

interface MysteryBallHistoryDatabaseProps {
  studentId: string;
}

const MysteryBallHistoryDatabase: React.FC<MysteryBallHistoryDatabaseProps> = ({ studentId }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<MysteryBallHistoryRecord[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [showPokemonDialog, setShowPokemonDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [studentId]);

  const loadHistory = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      const historyData = await getMysteryBallHistory(studentId);
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading mystery ball history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePokemonClick = (historyItem: MysteryBallHistoryRecord) => {
    if (historyItem.result_type === 'pokemon' && historyItem.pokemon_name) {
      setSelectedPokemon({
        name: historyItem.pokemon_name,
        id: historyItem.pokemon_id
      });
      setShowPokemonDialog(true);
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

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
          {history.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {record.result_type === "pokemon" && (
                    <div 
                      className="w-16 h-16 bg-gray-100 rounded-md p-1 flex-shrink-0 cursor-pointer flex items-center justify-center"
                      onClick={() => handlePokemonClick(record)}
                    >
                      <span className="text-sm text-center">{record.pokemon_name}</span>
                    </div>
                  )}
                  {record.result_type === "coins" && (
                    <div className="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-bold">
                        +{record.coins_amount}
                      </span>
                    </div>
                  )}
                  {record.result_type === "nothing" && (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500">-</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {record.result_type === "pokemon" ? record.pokemon_name : 
                         record.result_type === "coins" ? `${record.coins_amount} ${t("coins")}` : 
                         t("nothing-found")}
                      </p>
                      <span className="text-xs text-gray-500">{formatDate(record.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showPokemonDialog} onOpenChange={closePokemonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPokemon?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-40 h-40 bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center">
              <span className="text-lg font-medium">{selectedPokemon?.name}</span>
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

export default MysteryBallHistoryDatabase;
