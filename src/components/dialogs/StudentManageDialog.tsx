
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Coins, Trash, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  getStudentPokemonCollection,
  removeCoinsFromStudent,
  removePokemonFromStudent,
  awardCoinsToStudent
} from "@/utils/pokemon";
import { Pokemon, StudentPokemon } from "@/types/pokemon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onRemoveFromClass: () => void;
}

const StudentManageDialog: React.FC<StudentManageDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  onRemoveFromClass
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pokemon");
  const [collection, setCollection] = useState<StudentPokemon | null>(null);
  const [coinsToAward, setCoinsToAward] = useState(10);
  const [coinsToRemove, setCoinsToRemove] = useState(5);

  useEffect(() => {
    if (open) {
      loadStudentData();
    }
  }, [open, studentId]);

  const loadStudentData = () => {
    const studentCollection = getStudentPokemonCollection(studentId);
    setCollection(studentCollection);
  };

  const handleRemovePokemon = (index: number) => {
    if (removePokemonFromStudent(studentId)) {
      toast.success(t("pokemon-removed"));
      loadStudentData();
    } else {
      toast.error(t("error-removing-pokemon"));
    }
  };

  const handleAwardCoins = () => {
    awardCoinsToStudent(studentId, coinsToAward);
    toast.success(`${coinsToAward} ${t("coins-awarded")}`);
    loadStudentData();
  };

  const handleRemoveCoins = () => {
    if (collection && collection.coins >= coinsToRemove) {
      if (removeCoinsFromStudent(studentId, coinsToRemove)) {
        toast.success(`${coinsToRemove} ${t("coins-removed")}`);
        loadStudentData();
      } else {
        toast.error(t("error-removing-coins"));
      }
    } else {
      toast.error(t("not-enough-coins"));
    }
  };

  const handleViewProfile = () => {
    navigate(`/teacher/student/${studentId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("manage-student")}: {studentName}</DialogTitle>
          <DialogDescription>
            {t("manage-student-description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-2">
              <AvatarFallback>{studentName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{studentName}</h3>
              <p className="text-sm text-gray-500">
                {collection ? `${t("coins")}: ${collection.coins}` : t("loading")}
              </p>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={handleViewProfile}>
                {t("view-profile")}
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="pokemon">{t("pokemon")}</TabsTrigger>
              <TabsTrigger value="coins">{t("coins")}</TabsTrigger>
              <TabsTrigger value="class">{t("class")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pokemon" className="py-4">
              {collection && collection.pokemons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collection.pokemons.map((pokemon, index) => (
                    <Card key={pokemon.id || index} className="overflow-hidden">
                      <div className="flex p-4">
                        <div className="w-16 h-16 mr-3 flex-shrink-0">
                          {pokemon.image ? (
                            <img 
                              src={pokemon.image} 
                              alt={pokemon.name} 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span>?</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{pokemon.name}</h4>
                          <p className="text-xs text-gray-500">
                            {t("type")}: {pokemon.type} | {t("rarity")}: {pokemon.rarity}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleRemovePokemon(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t("no-pokemon-found")}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="coins" className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-green-500" />
                      {t("award-coins")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <input
                        type="number"
                        value={coinsToAward}
                        onChange={(e) => setCoinsToAward(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={handleAwardCoins}
                    >
                      <Coins className="h-4 w-4 mr-1" />
                      {t("award-coins")}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Coins className="h-5 w-5 mr-2 text-red-500" />
                      {t("remove-coins")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <input
                        type="number"
                        value={coinsToRemove}
                        onChange={(e) => setCoinsToRemove(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {t("current-coins")}: {collection?.coins || 0}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500"
                      onClick={handleRemoveCoins}
                      disabled={!collection || collection.coins < coinsToRemove}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      {t("remove-coins")}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="class" className="py-4">
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription>
                  {t("remove-student-warning")}
                </AlertDescription>
              </Alert>
              
              <p className="mb-6 text-gray-600">
                {t("removing-student-explanation")}
              </p>
              
              <Button 
                variant="destructive" 
                onClick={onRemoveFromClass}
              >
                <Trash className="h-4 w-4 mr-1" />
                {t("remove-from-class")}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentManageDialog;
