
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Plus, Trophy, Clock, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Battle } from "@/types/pokemon";

interface BattleModeProps {
  onBack: () => void;
}

const BattleMode: React.FC<BattleModeProps> = ({ onBack }) => {
  const [isCreateBattleOpen, setIsCreateBattleOpen] = useState(false);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [isViewBattleOpen, setIsViewBattleOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [newBattle, setNewBattle] = useState({
    name: "",
    description: "",
    schoolId: "",
    classId: "",
    baseReward: 10,
    timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] // Tomorrow
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  
  const teacherId = localStorage.getItem("teacherId");
  
  useEffect(() => {
    // Load saved battles
    const savedBattles = localStorage.getItem("battles");
    if (savedBattles) {
      const parsedBattles = JSON.parse(savedBattles);
      // Filter battles created by this teacher
      const teacherBattles = parsedBattles.filter((battle: Battle) => battle.createdBy === teacherId);
      setBattles(teacherBattles);
    }
    
    // Load schools created by this teacher
    const savedSchools = localStorage.getItem("schools");
    if (savedSchools) {
      const parsedSchools = JSON.parse(savedSchools);
      const teacherSchools = parsedSchools.filter((school: any) => school.teacherId === teacherId);
      setSchools(teacherSchools);
    }
    
    // Load classes
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      const teacherClasses = parsedClasses.filter((c: any) => c.teacherId === teacherId);
      setClasses(teacherClasses);
    }
    
    // Load students
    const savedStudents = localStorage.getItem("students");
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, [teacherId]);
  
  const handleCreateBattle = () => {
    // Validate form
    if (!newBattle.name || !newBattle.description || !newBattle.schoolId || !newBattle.timeLimit) {
      toast({
        title: t("error"),
        description: t("fill-required-fields"),
        variant: "destructive",
      });
      return;
    }
    
    // Create battle object
    const battle: Battle = {
      id: `battle-${Date.now()}`,
      name: newBattle.name,
      description: newBattle.description,
      createdBy: teacherId || "",
      schoolId: newBattle.schoolId,
      classId: newBattle.classId || undefined,
      status: "pending" as "pending" | "active" | "completed",
      participants: [],
      baseReward: newBattle.baseReward,
      timeLimit: new Date(newBattle.timeLimit).toISOString(),
      answers: []
    };
    
    // Save battle
    const savedBattles = localStorage.getItem("battles");
    let allBattles: Battle[] = [];
    if (savedBattles) {
      allBattles = JSON.parse(savedBattles);
    }
    allBattles.push(battle);
    localStorage.setItem("battles", JSON.stringify(allBattles));
    
    // Update local state
    setBattles([...battles, battle]);
    
    // Reset form and close dialog
    setNewBattle({
      name: "",
      description: "",
      schoolId: "",
      classId: "",
      baseReward: 10,
      timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
    setIsCreateBattleOpen(false);
    
    // Show success message
    toast({
      title: t("success"),
      description: t("battle-created"),
    });
  };
  
  const handleStartBattle = (battleId: string) => {
    // Find battle
    const updatedBattles = battles.map(b => {
      if (b.id === battleId) {
        return { ...b, status: "active" as "pending" | "active" | "completed" };
      }
      return b;
    });
    
    // Update storage
    localStorage.setItem("battles", JSON.stringify(updatedBattles));
    
    // Update state
    setBattles(updatedBattles);
    
    // Show success message
    toast({
      description: t("battle-started"),
    });
  };
  
  const handleCompleteBattle = (battleId: string) => {
    // Find battle
    const updatedBattles = battles.map(b => {
      if (b.id === battleId) {
        return { ...b, status: "completed" as "pending" | "active" | "completed" };
      }
      return b;
    });
    
    // Update storage
    localStorage.setItem("battles", JSON.stringify(updatedBattles));
    
    // Update state
    setBattles(updatedBattles);
    
    // Show success message
    toast({
      description: t("battle-completed"),
    });
  };
  
  const handleSelectWinner = (battle: Battle, answerId: number) => {
    const selectedAnswer = battle.answers[answerId];
    
    // Create winner object
    const winner = {
      studentId: selectedAnswer.studentId,
      studentName: selectedAnswer.studentName,
      submissionTime: selectedAnswer.submissionTime,
      submission: selectedAnswer.submission
    };
    
    // Update battle
    const updatedBattles = battles.map(b => {
      if (b.id === battle.id) {
        return { 
          ...b, 
          winner,
          status: "completed" as "pending" | "active" | "completed"
        };
      }
      return b;
    });
    
    // Determine prize amount
    const prize = battle.baseReward + battle.participants.length;
    
    // Award prize to winner
    const awardCoinsToStudent = (studentId: string, amount: number) => {
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const studentIndex = studentPokemons.findIndex((sp: any) => sp.studentId === studentId);
      
      if (studentIndex >= 0) {
        studentPokemons[studentIndex].coins += amount;
      } else {
        studentPokemons.push({
          studentId,
          pokemons: [],
          coins: amount
        });
      }
      
      localStorage.setItem("studentPokemons", JSON.stringify(studentPokemons));
    };
    
    awardCoinsToStudent(selectedAnswer.studentId, prize);
    
    // Update storage
    localStorage.setItem("battles", JSON.stringify(updatedBattles));
    
    // Update state
    setBattles(updatedBattles);
    setSelectedBattle(updatedBattles.find(b => b.id === battle.id) || null);
    
    // Show success message
    toast({
      title: t("winner-selected"),
      description: `${selectedAnswer.studentName} - ${prize} ${t("coins-awarded")}`,
    });
  };
  
  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Unknown School";
  };
  
  const getClassName = (classId?: string) => {
    if (!classId) return t("school-wide");
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : "Unknown Class";
  };
  
  const filteredBattles = battles.filter(battle => 
    battle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSchoolName(battle.schoolId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClassName(battle.classId).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" onClick={onBack} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back-to-dashboard")}
          </Button>
          <h2 className="text-2xl font-bold">{t("battle-mode")}</h2>
        </div>
        <Button onClick={() => setIsCreateBattleOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("create-battle")}
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("search-battles")}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredBattles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {searchTerm ? t("no-matches-found") : t("no-battles-yet")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBattles.map(battle => (
            <Card key={battle.id} className="hover:shadow-md transition-shadow pokemon-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-1">
                      {battle.status === "active" && <span className="bg-green-500 h-2 w-2 rounded-full" />}
                      {battle.status === "completed" && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {battle.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {getSchoolName(battle.schoolId)} - {getClassName(battle.classId)}
                    </CardDescription>
                  </div>
                  <div className="px-2 py-1 rounded text-xs bg-gray-100 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(battle.timeLimit).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">{battle.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {battle.participants.length} {t("participants")}
                  </span>
                  <span className="text-sm font-medium">
                    {battle.baseReward} + {battle.participants.length} {t("coins")}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedBattle(battle);
                    setIsViewBattleOpen(true);
                  }}
                >
                  {t("details")}
                </Button>
                
                {battle.status === "pending" && (
                  <Button 
                    className="flex-1"
                    onClick={() => handleStartBattle(battle.id)}
                  >
                    {t("start")}
                  </Button>
                )}
                
                {battle.status === "active" && (
                  <Button 
                    className="flex-1"
                    onClick={() => handleCompleteBattle(battle.id)}
                  >
                    {t("complete")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Battle Dialog */}
      <Dialog open={isCreateBattleOpen} onOpenChange={setIsCreateBattleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("create-new-battle")}</DialogTitle>
            <DialogDescription>
              {t("create-battle-description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="battleName">{t("battle-name")}</Label>
              <Input
                id="battleName"
                value={newBattle.name}
                onChange={(e) => setNewBattle({...newBattle, name: e.target.value})}
                placeholder={t("enter-battle-name")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="battleDescription">{t("battle-description")}</Label>
              <Textarea
                id="battleDescription"
                value={newBattle.description}
                onChange={(e) => setNewBattle({...newBattle, description: e.target.value})}
                placeholder={t("enter-battle-description")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schoolSelect">{t("select-school")}</Label>
              <Select 
                value={newBattle.schoolId} 
                onValueChange={(value) => {
                  setNewBattle({...newBattle, schoolId: value, classId: ""});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select-school")} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classSelect">{t("select-class")}</Label>
              <Select 
                value={newBattle.classId} 
                onValueChange={(value) => setNewBattle({...newBattle, classId: value})}
                disabled={!newBattle.schoolId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select-class-optional")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("school-wide")}</SelectItem>
                  {classes
                    .filter(c => c.schoolId === newBattle.schoolId)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseReward">{t("base-reward")} ({t("coins")})</Label>
              <Input
                id="baseReward"
                type="number"
                value={newBattle.baseReward}
                onChange={(e) => setNewBattle({...newBattle, baseReward: parseInt(e.target.value) || 0})}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeLimit">{t("time-limit")}</Label>
              <Input
                id="timeLimit"
                type="date"
                value={newBattle.timeLimit}
                onChange={(e) => setNewBattle({...newBattle, timeLimit: e.target.value})}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateBattleOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateBattle}>
              {t("create-battle")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Battle Details Dialog */}
      <Dialog open={isViewBattleOpen} onOpenChange={setIsViewBattleOpen}>
        <DialogContent className="max-w-3xl">
          {selectedBattle && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedBattle.status === "active" && <span className="bg-green-500 h-3 w-3 rounded-full" />}
                  {selectedBattle.status === "completed" && <Trophy className="h-5 w-5 text-yellow-500" />}
                  {selectedBattle.name}
                </DialogTitle>
                <DialogDescription>
                  {getSchoolName(selectedBattle.schoolId)} - {getClassName(selectedBattle.classId)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-1">{t("description")}</h3>
                  <p className="text-sm text-gray-700">{selectedBattle.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">{t("status")}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedBattle.status === "pending" ? "bg-yellow-500" : 
                        selectedBattle.status === "active" ? "bg-green-500" : "bg-blue-500"
                      }`} />
                      <span className="capitalize">{selectedBattle.status}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">{t("time-limit")}</h3>
                    <p>{new Date(selectedBattle.timeLimit).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">{t("participants")}</h3>
                    <p>{selectedBattle.participants.length}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">{t("total-prize")}</h3>
                    <p>{selectedBattle.baseReward + selectedBattle.participants.length} {t("coins")}</p>
                  </div>
                </div>
                
                {selectedBattle.winner && (
                  <div className="border rounded p-3 bg-yellow-50">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      {t("winner")}
                    </h3>
                    <p className="font-medium">{selectedBattle.winner.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {t("submitted-at")} {new Date(selectedBattle.winner.submissionTime).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      {selectedBattle.winner.submission.type === "photo" ? (
                        <img 
                          src={selectedBattle.winner.submission.content} 
                          alt="Winning submission" 
                          className="max-h-32 rounded border" 
                        />
                      ) : (
                        <audio 
                          src={selectedBattle.winner.submission.content} 
                          controls 
                          className="w-full" 
                        />
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">{t("answers-received")} ({selectedBattle.answers.length})</h3>
                  
                  {selectedBattle.answers.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      {t("no-answers-yet")}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {selectedBattle.answers.map((answer, index) => (
                        <div key={index} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{answer.studentName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(answer.submissionTime).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="mt-2">
                            {answer.submission.type === "photo" ? (
                              <img 
                                src={answer.submission.content} 
                                alt={`Answer from ${answer.studentName}`} 
                                className="max-h-32 rounded border" 
                              />
                            ) : (
                              <audio 
                                src={answer.submission.content} 
                                controls 
                                className="w-full" 
                              />
                            )}
                          </div>
                          
                          {selectedBattle.status === "completed" && !selectedBattle.winner && (
                            <Button 
                              className="mt-2 w-full"
                              onClick={() => handleSelectWinner(selectedBattle, index)}
                            >
                              {t("select-as-winner")}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BattleMode;
