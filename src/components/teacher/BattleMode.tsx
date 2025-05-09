
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Sword, Trophy, Users, School, Clock } from "lucide-react";
import { Battle } from "@/types/pokemon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { awardCoinsToStudent } from "@/utils/pokemonData";

interface BattleProps {
  onBack: () => void;
}

const BattleMode: React.FC<BattleProps> = ({ onBack }) => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const { t } = useTranslation();
  
  const [currentView, setCurrentView] = useState<"list" | "create" | "details">("list");
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  
  const [newBattle, setNewBattle] = useState<Partial<Battle>>({
    name: "",
    description: "",
    schoolId: "",
    classId: undefined,
    baseReward: 10,
    timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
    status: "pending",
    participants: [],
    answers: []
  });
  
  const teacherId = localStorage.getItem("teacherId") || "";

  useEffect(() => {
    loadBattles();
    loadSchools();
  }, []);
  
  useEffect(() => {
    if (newBattle.schoolId) {
      loadClasses(newBattle.schoolId);
    }
  }, [newBattle.schoolId]);
  
  useEffect(() => {
    if (newBattle.classId) {
      loadStudents(newBattle.classId);
    }
  }, [newBattle.classId]);

  const loadBattles = () => {
    const savedBattles = localStorage.getItem("battles");
    const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
    // Filter by teacher
    const teacherBattles = parsedBattles.filter((battle: Battle) => battle.createdBy === teacherId);
    setBattles(teacherBattles);
  };
  
  const loadSchools = () => {
    const savedSchools = localStorage.getItem("schools");
    const parsedSchools = savedSchools ? JSON.parse(savedSchools) : [];
    const teacherSchools = parsedSchools.filter((school: any) => school.teacherId === teacherId);
    setSchools(teacherSchools);
  };
  
  const loadClasses = (schoolId: string) => {
    const savedClasses = localStorage.getItem("classes");
    const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
    const schoolClasses = parsedClasses.filter((cls: any) => 
      cls.schoolId === schoolId && cls.teacherId === teacherId
    );
    setClasses(schoolClasses);
  };
  
  const loadStudents = (classId: string) => {
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    const classStudents = allStudents.filter((student: any) => student.classId === classId);
    setStudents(classStudents);
  };

  const handleCreateBattle = () => {
    if (!newBattle.name || !newBattle.description || !newBattle.schoolId) {
      toast({
        title: t("error"),
        description: t("fill-required-fields"),
        variant: "destructive"
      });
      return;
    }

    const battle: Battle = {
      id: `battle-${Date.now()}`,
      name: newBattle.name!,
      description: newBattle.description!,
      createdBy: teacherId,
      schoolId: newBattle.schoolId!,
      classId: newBattle.classId,
      status: "pending",
      baseReward: newBattle.baseReward || 10,
      timeLimit: newBattle.timeLimit!,
      participants: [],
      answers: []
    };

    // Save to localStorage
    const savedBattles = localStorage.getItem("battles");
    const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
    parsedBattles.push(battle);
    localStorage.setItem("battles", JSON.stringify(parsedBattles));

    // Update state
    setBattles([...battles, battle]);
    setNewBattle({
      name: "",
      description: "",
      schoolId: "",
      classId: undefined,
      baseReward: 10,
      timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      participants: [],
      answers: []
    });
    setCurrentView("list");
    
    toast({
      title: t("success"),
      description: t("battle-created"),
    });
  };

  const handleStartBattle = (battle: Battle) => {
    const updatedBattles = battles.map(b => 
      b.id === battle.id ? { ...b, status: "active" } : b
    );
    
    setBattles(updatedBattles);
    
    // Update in localStorage
    const savedBattles = localStorage.getItem("battles");
    const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedSavedBattles = parsedBattles.map((b: Battle) =>
      b.id === battle.id ? { ...b, status: "active" } : b
    );
    localStorage.setItem("battles", JSON.stringify(updatedSavedBattles));
    
    toast({
      title: t("battle-started"),
      description: t("battle-started-description"),
    });
  };
  
  const handleCompleteBattle = (battle: Battle) => {
    const updatedBattles = battles.map(b => 
      b.id === battle.id ? { ...b, status: "completed" } : b
    );
    
    setBattles(updatedBattles);
    
    // Update in localStorage
    const savedBattles = localStorage.getItem("battles");
    const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedSavedBattles = parsedBattles.map((b: Battle) =>
      b.id === battle.id ? { ...b, status: "completed" } : b
    );
    localStorage.setItem("battles", JSON.stringify(updatedSavedBattles));
    
    toast({
      title: t("battle-completed"),
      description: t("battle-completed-description"),
    });
  };
  
  const handleDeleteBattle = (battleId: string) => {
    const updatedBattles = battles.filter(battle => battle.id !== battleId);
    setBattles(updatedBattles);
    
    // Update in localStorage
    const savedBattles = localStorage.getItem("battles");
    const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedSavedBattles = parsedBattles.filter((battle: Battle) => battle.id !== battleId);
    localStorage.setItem("battles", JSON.stringify(updatedSavedBattles));
    
    toast({
      title: t("battle-deleted"),
      description: t("battle-deleted-description"),
    });
  };
  
  const handleSelectWinner = (battleId: string, answer: any) => {
    if (!answer) return;
    
    // Calculate total prize
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;
    
    const baseReward = battle.baseReward || 10;
    const participantBonus = battle.participants?.length || 0;
    const totalReward = baseReward + participantBonus;
    
    // Award coins to winner
    awardCoinsToStudent(answer.studentId, totalReward);
    
    // Update battle with winner
    const updatedBattles = battles.map(b => 
      b.id === battleId ? { 
        ...b, 
        status: "completed",
        winner: {
          studentId: answer.studentId,
          studentName: answer.studentName,
          submissionTime: answer.submissionTime,
          submission: answer.submission
        }
      } : b
    );
    
    setBattles(updatedBattles);
    
    // Update in localStorage
    const savedBattles = localStorage.getItem("battles");
    const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedSavedBattles = parsedBattles.map((b: Battle) =>
      b.id === battleId ? { 
        ...b, 
        status: "completed",
        winner: {
          studentId: answer.studentId,
          studentName: answer.studentName,
          submissionTime: answer.submissionTime,
          submission: answer.submission
        }
      } : b
    );
    localStorage.setItem("battles", JSON.stringify(updatedSavedBattles));
    
    toast({
      title: t("winner-selected"),
      description: t("winner-selected-description", { name: answer.studentName, coins: totalReward }),
    });
    
    // Refresh the battle details
    setSelectedBattle(updatedBattles.find(b => b.id === battleId) || null);
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending":
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">{t("pending")}</span>;
      case "active":
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">{t("active")}</span>;
      case "completed":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">{t("completed")}</span>;
      default:
        return null;
    }
  };
  
  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : t("unknown-school");
  };
  
  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : t("unknown-class");
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch (error) {
      return dateString;
    }
  };
  
  const isExpired = (timeLimit: string) => {
    return new Date(timeLimit).getTime() < Date.now();
  };

  if (currentView === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back-to-dashboard")}
            </Button>
            <h2 className="text-2xl font-bold">{t("battle-mode")}</h2>
          </div>
          <Button onClick={() => setCurrentView("create")}>
            <Sword className="h-4 w-4 mr-1" />
            {t("create-new-battle")}
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
                  <div className="flex flex-col text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <School className="h-4 w-4 mr-1" />
                      <span>{getSchoolName(battle.schoolId)}</span>
                    </div>
                    {battle.classId && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{getClassName(battle.classId)}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className={isExpired(battle.timeLimit) ? "text-red-500" : ""}>
                        {t("ends-at")}: {formatDateTime(battle.timeLimit)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{battle.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {battle.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartBattle(battle)}
                        >
                          {t("start-battle")}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteBattle(battle.id)}
                        >
                          {t("delete")}
                        </Button>
                      </>
                    )}
                    
                    {battle.status === "active" && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedBattle(battle);
                            setCurrentView("details");
                          }}
                        >
                          {t("view-answers")}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompleteBattle(battle)}
                        >
                          {t("complete-battle")}
                        </Button>
                      </>
                    )}
                    
                    {battle.status === "completed" && (
                      <>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBattle(battle);
                            setCurrentView("details");
                          }}
                        >
                          {t("view-details")}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteBattle(battle.id)}
                        >
                          {t("delete")}
                        </Button>
                      </>
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
              <h3 className="text-lg font-medium mb-2">{t("no-battles-created")}</h3>
              <p className="text-gray-500 mb-6">{t("create-first-battle-prompt")}</p>
              <Button onClick={() => setCurrentView("create")}>
                <Sword className="h-4 w-4 mr-1" />
                {t("create-first-battle")}
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
            {t("back-to-battles")}
          </Button>
          <h2 className="text-2xl font-bold ml-4">{t("create-new-battle")}</h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="battleName">{t("battle-name")}</Label>
                <Input 
                  id="battleName" 
                  placeholder={t("enter-battle-name")} 
                  value={newBattle.name}
                  onChange={(e) => setNewBattle({...newBattle, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="battleDescription">{t("description")}</Label>
                <Input 
                  id="battleDescription" 
                  placeholder={t("enter-battle-description")} 
                  value={newBattle.description}
                  onChange={(e) => setNewBattle({...newBattle, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school">{t("school")}</Label>
                <Select 
                  value={newBattle.schoolId} 
                  onValueChange={(value) => {
                    setNewBattle({...newBattle, schoolId: value, classId: undefined});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select-school")} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t("scope")}</Label>
                <RadioGroup 
                  value={newBattle.classId === undefined ? "school" : "class"}
                  onValueChange={(value) => {
                    if (value === "school") {
                      setNewBattle({...newBattle, classId: undefined});
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="school" id="school" />
                    <Label htmlFor="school">{t("entire-school")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="class" id="class" />
                    <Label htmlFor="class">{t("specific-class")}</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {newBattle.schoolId && newBattle.classId !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="class">{t("class")}</Label>
                  <Select 
                    value={newBattle.classId} 
                    onValueChange={(value) => setNewBattle({...newBattle, classId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select-class")} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="baseReward">{t("base-reward-coins")}</Label>
                <Input 
                  id="baseReward" 
                  type="number"
                  min="1"
                  value={newBattle.baseReward}
                  onChange={(e) => setNewBattle({...newBattle, baseReward: parseInt(e.target.value)})}
                />
                <p className="text-sm text-gray-500">{t("base-reward-description")}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeLimit">{t("time-limit")}</Label>
                <Input 
                  id="timeLimit" 
                  type="datetime-local"
                  value={new Date(newBattle.timeLimit!).toISOString().slice(0, 16)}
                  onChange={(e) => setNewBattle({...newBattle, timeLimit: new Date(e.target.value).toISOString()})}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentView("list")}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCreateBattle}
                >
                  {t("create-battle")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (currentView === "details" && selectedBattle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedBattle(null);
              setCurrentView("list");
            }}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back-to-battles")}
            </Button>
            <h2 className="text-2xl font-bold ml-4">{selectedBattle.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedBattle.status)}
            {isExpired(selectedBattle.timeLimit) && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                {t("expired")}
              </span>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("battle-details")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t("description")}</dt>
                <dd className="mt-1">{selectedBattle.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t("school")}</dt>
                <dd className="mt-1">{getSchoolName(selectedBattle.schoolId)}</dd>
              </div>
              {selectedBattle.classId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t("class")}</dt>
                  <dd className="mt-1">{getClassName(selectedBattle.classId)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">{t("time-limit")}</dt>
                <dd className="mt-1">{formatDateTime(selectedBattle.timeLimit)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t("reward")}</dt>
                <dd className="mt-1">
                  {t("reward-details", {
                    base: selectedBattle.baseReward,
                    participants: selectedBattle.participants?.length || 0,
                    total: (selectedBattle.baseReward || 0) + (selectedBattle.participants?.length || 0)
                  })}
                </dd>
              </div>
              {selectedBattle.winner && (
                <div className="col-span-full">
                  <dt className="text-sm font-medium text-gray-500">{t("winner")}</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">{selectedBattle.winner.studentName}</span>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(selectedBattle.winner.submissionTime)}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        
        {/* Answers */}
        <Tabs defaultValue="answers">
          <TabsList>
            <TabsTrigger value="answers">{t("answers")}</TabsTrigger>
            <TabsTrigger value="participants">{t("participants")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="answers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("submitted-answers")}</CardTitle>
                <CardDescription>
                  {selectedBattle.answers.length > 0 
                    ? t("total-answers", { count: selectedBattle.answers.length })
                    : t("no-answers-yet")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBattle.answers.length > 0 ? (
                  <div className="space-y-4">
                    {selectedBattle.answers.map((answer, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${
                        selectedBattle.winner?.studentId === answer.studentId 
                          ? "border-yellow-400 bg-yellow-50" 
                          : ""
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>
                                {answer.studentName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{answer.studentName}</p>
                              <p className="text-xs text-gray-500">{formatDateTime(answer.submissionTime)}</p>
                            </div>
                          </div>
                          
                          {selectedBattle.status === "active" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleSelectWinner(selectedBattle.id, answer)}
                            >
                              <Trophy className="h-4 w-4 mr-1" />
                              {t("select-as-winner")}
                            </Button>
                          )}
                          
                          {selectedBattle.winner?.studentId === answer.studentId && (
                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium flex items-center">
                              <Trophy className="h-4 w-4 mr-1" />
                              {t("winner")}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          {answer.submission.type === "photo" ? (
                            <img 
                              src={answer.submission.content} 
                              alt="Answer" 
                              className="max-w-full max-h-40 object-contain rounded"
                            />
                          ) : (
                            <audio 
                              controls 
                              src={answer.submission.content}
                              className="w-full"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t("waiting-for-answers")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="participants" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("participants")}</CardTitle>
                <CardDescription>
                  {selectedBattle.participants?.length 
                    ? t("total-participants", { count: selectedBattle.participants.length })
                    : t("no-participants-yet")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBattle.participants?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedBattle.participants.map((participant: string, index) => {
                      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
                      const student = allStudents.find((s: any) => s.id === participant);
                      
                      if (!student) return null;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar>
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>
                              {(student.displayName || student.name)?.substring(0, 2).toUpperCase() || "NA"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.displayName || student.name}</p>
                            <p className="text-xs text-gray-500">{student.username}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t("waiting-for-participants")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
};

export default BattleMode;
