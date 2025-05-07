
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Sword, Trophy, Users } from "lucide-react";

interface BattleProps {
  onBack: () => void;
}

interface Battle {
  id: string;
  name: string;
  description: string;
  participantType: "individual" | "class";
  status: "pending" | "active" | "completed";
}

const BattleMode: React.FC<BattleProps> = ({ onBack }) => {
  const [battles, setBattles] = useState<Battle[]>(() => {
    const savedBattles = localStorage.getItem("battles");
    return savedBattles ? JSON.parse(savedBattles) : [];
  });
  
  const [currentView, setCurrentView] = useState<"list" | "create">("list");
  
  const [newBattle, setNewBattle] = useState<Omit<Battle, "id" | "status">>({
    name: "",
    description: "",
    participantType: "individual",
  });

  // Save battles to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem("battles", JSON.stringify(battles));
  }, [battles]);

  const handleCreateBattle = () => {
    if (!newBattle.name || !newBattle.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const battle: Battle = {
      id: Date.now().toString(),
      name: newBattle.name,
      description: newBattle.description,
      participantType: newBattle.participantType,
      status: "pending"
    };

    setBattles([...battles, battle]);
    setNewBattle({
      name: "",
      description: "",
      participantType: "individual"
    });
    setCurrentView("list");
    
    toast({
      title: "Success",
      description: `Battle "${battle.name}" has been created!`
    });
  };

  const handleStartBattle = (id: string) => {
    setBattles(battles.map(battle => 
      battle.id === id ? { ...battle, status: "active" } : battle
    ));
    
    toast({
      title: "Battle Started",
      description: "The battle has begun!"
    });
  };
  
  const handleCompleteBattle = (id: string) => {
    setBattles(battles.map(battle => 
      battle.id === id ? { ...battle, status: "completed" } : battle
    ));
    
    toast({
      title: "Battle Completed",
      description: "The battle has ended!"
    });
  };
  
  const handleDeleteBattle = (id: string) => {
    setBattles(battles.filter(battle => battle.id !== id));
    
    toast({
      title: "Battle Deleted",
      description: "The battle has been removed."
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Pending</span>;
      case "active":
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Active</span>;
      case "completed":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Completed</span>;
      default:
        return null;
    }
  };

  if (currentView === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold">Battle Mode</h2>
          </div>
          <Button onClick={() => setCurrentView("create")}>
            <Sword className="h-4 w-4 mr-1" />
            Create New Battle
          </Button>
        </div>
        
        {battles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {battles.map(battle => (
              <Card key={battle.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <Sword className="h-5 w-5 text-red-500" />
                      {battle.name}
                    </CardTitle>
                    {getStatusBadge(battle.status)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    {battle.participantType === "individual" ? (
                      <Users className="h-4 w-4 mr-1" />
                    ) : (
                      <Trophy className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {battle.participantType === "individual" ? "Individual Battle" : "Class vs Class"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{battle.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {battle.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartBattle(battle.id)}
                        >
                          Start Battle
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteBattle(battle.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    
                    {battle.status === "active" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteBattle(battle.id)}
                      >
                        Complete Battle
                      </Button>
                    )}
                    
                    {battle.status === "completed" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteBattle(battle.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed p-8">
            <div className="text-center">
              <Sword className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Battles Created</h3>
              <p className="text-gray-500 mb-6">Create your first battle to get started.</p>
              <Button onClick={() => setCurrentView("create")}>
                <Sword className="h-4 w-4 mr-1" />
                Create Your First Battle
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }
  
  if (currentView === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => setCurrentView("list")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Battles
          </Button>
          <h2 className="text-2xl font-bold ml-4">Create New Battle</h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="battleName">Battle Name</Label>
                <Input 
                  id="battleName" 
                  placeholder="Enter a name for this battle" 
                  value={newBattle.name}
                  onChange={(e) => setNewBattle({...newBattle, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="battleDescription">Description</Label>
                <Input 
                  id="battleDescription" 
                  placeholder="Enter battle description" 
                  value={newBattle.description}
                  onChange={(e) => setNewBattle({...newBattle, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Participant Type</Label>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="individual" 
                      checked={newBattle.participantType === "individual"}
                      onCheckedChange={() => setNewBattle({
                        ...newBattle, 
                        participantType: "individual"
                      })}
                    />
                    <label
                      htmlFor="individual"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Individual Students
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="class" 
                      checked={newBattle.participantType === "class"}
                      onCheckedChange={() => setNewBattle({
                        ...newBattle,
                        participantType: "class"
                      })}
                    />
                    <label
                      htmlFor="class"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Class vs Class
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentView("list")}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCreateBattle}
                >
                  Create Battle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default BattleMode;
