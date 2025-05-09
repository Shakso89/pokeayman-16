
import React, { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Battle } from "@/types/pokemon";
import { Clock, Trophy, Camera, Mic } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const StudentBattlePage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentId = localStorage.getItem("studentId");
  const studentName = localStorage.getItem("studentName");
  const classId = localStorage.getItem("studentClassId");
  const schoolId = localStorage.getItem("studentSchoolId");
  
  const { t } = useTranslation();
  
  const [battles, setBattles] = useState<Battle[]>([]);
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);
  const [completedBattles, setCompletedBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"photo" | "voice">("photo");
  const [mediaContent, setMediaContent] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isLoggedIn && userType === "student" && studentId) {
      loadBattles();
    }
  }, [isLoggedIn, userType, studentId]);
  
  const loadBattles = () => {
    if (!studentId || !classId || !schoolId) return;
    
    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];
    
    // Filter battles relevant to this student
    const relevantBattles = allBattles.filter((battle: Battle) => {
      // School-wide or specific class
      return (battle.schoolId === schoolId && (!battle.classId || battle.classId === classId));
    });
    
    setBattles(relevantBattles);
    
    const active = relevantBattles.filter((battle: Battle) => 
      battle.status === "active" && !isExpired(battle.timeLimit)
    );
    setActiveBattles(active);
    
    const completed = relevantBattles.filter((battle: Battle) => 
      battle.status === "completed" || isExpired(battle.timeLimit)
    );
    setCompletedBattles(completed);
  };
  
  const joinBattle = (battle: Battle) => {
    if (!studentId) return;
    
    // Check if already a participant
    if (battle.participants && battle.participants.includes(studentId)) {
      return;
    }
    
    // Add to participants
    const participants = [...(battle.participants || []), studentId];
    
    // Update in localStorage
    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedBattles = allBattles.map((b: Battle) =>
      b.id === battle.id ? { ...b, participants } : b
    );
    localStorage.setItem("battles", JSON.stringify(updatedBattles));
    
    // Update state
    const updatedBattle = { ...battle, participants };
    setBattles(battles.map(b => b.id === battle.id ? updatedBattle : b));
    setActiveBattles(activeBattles.map(b => b.id === battle.id ? updatedBattle : b));
    
    toast({
      title: t("joined-battle"),
      description: t("joined-battle-description"),
    });
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
  
  const hasSubmittedAnswer = (battle: Battle) => {
    if (!studentId) return false;
    
    return battle.answers && battle.answers.some(answer => answer.studentId === studentId);
  };
  
  const getTimeRemaining = (timeLimit: string) => {
    const endTime = new Date(timeLimit).getTime();
    const now = Date.now();
    
    if (now >= endTime) {
      return t("expired");
    }
    
    const diffMs = endTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return t("days-remaining", { count: diffDays });
    } else if (diffHours > 0) {
      return t("hours-remaining", { count: diffHours, minutes: diffMinutes });
    } else {
      return t("minutes-remaining", { count: diffMinutes });
    }
  };
  
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaContent(reader.result as string);
        setMediaType("photo");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaContent(reader.result as string);
          setMediaType("voice");
        };
        reader.readAsDataURL(audioBlob);
      });
      
      mediaRecorder.start();
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 30000);
      
      return mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone", error);
      toast({
        title: t("error"),
        description: t("microphone-access-error"),
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleMicClick = async () => {
    const recorder = await startRecording();
    if (!recorder) return;
    
    toast({
      title: t("recording"),
      description: t("recording-description"),
    });
    
    // Stop recording after 5 seconds for demo purposes
    setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
        toast({
          title: t("recording-stopped"),
          description: t("recording-stopped-description"),
        });
      }
    }, 5000);
  };
  
  const handleSubmit = () => {
    if (!selectedBattle || !mediaContent || !studentId || !studentName) return;
    
    setIsSubmitting(true);
    
    // Create answer object
    const answer = {
      studentId,
      studentName,
      submissionTime: new Date().toISOString(),
      submission: {
        type: mediaType,
        content: mediaContent
      }
    };
    
    // Update battle in localStorage
    const savedBattles = localStorage.getItem("battles");
    const allBattles = savedBattles ? JSON.parse(savedBattles) : [];
    const updatedBattles = allBattles.map((b: Battle) => {
      if (b.id === selectedBattle.id) {
        return {
          ...b,
          answers: [...(b.answers || []), answer]
        };
      }
      return b;
    });
    localStorage.setItem("battles", JSON.stringify(updatedBattles));
    
    // Update local state
    const updatedBattle = {
      ...selectedBattle,
      answers: [...(selectedBattle.answers || []), answer]
    };
    
    setBattles(battles.map(b => b.id === selectedBattle.id ? updatedBattle : b));
    setActiveBattles(activeBattles.map(b => b.id === selectedBattle.id ? updatedBattle : b));
    
    // Reset form
    setSelectedBattle(updatedBattle);
    setMediaContent(null);
    setIsSubmitting(false);
    
    toast({
      title: t("answer-submitted"),
      description: t("answer-submitted-description"),
    });
  };
  
  const cancelSubmission = () => {
    setMediaContent(null);
  };
  
  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="student" userName={studentName || ""} />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{t("battle-arena")}</h1>
        
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              {t("active-battles")}
              {activeBattles.length > 0 && (
                <Badge variant="destructive" className="ml-2">{activeBattles.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">{t("completed-battles")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {selectedBattle ? (
              <div className="space-y-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBattle(null)}
                >
                  {t("back-to-battles")}
                </Button>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl">{selectedBattle.name}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {getTimeRemaining(selectedBattle.timeLimit)}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">{selectedBattle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasSubmittedAnswer(selectedBattle) ? (
                      <div className="text-center py-6">
                        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t("answer-submitted-title")}</h3>
                        <p className="text-gray-500">{t("answer-submitted-waiting")}</p>
                        
                        {selectedBattle.winner && (
                          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-yellow-500" />
                              {t("battle-winner")}
                            </h4>
                            
                            <div className="flex items-center gap-3 justify-center">
                              <Avatar>
                                <AvatarFallback>
                                  {selectedBattle.winner.studentName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="font-medium">{selectedBattle.winner.studentName}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDateTime(selectedBattle.winner.submissionTime)}
                                </p>
                              </div>
                            </div>
                            
                            {selectedBattle.winner.studentId === studentId && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="font-medium text-green-800">{t("you-won-battle")}</p>
                                <p className="text-sm text-green-700">
                                  {t("reward-received", {
                                    coins: (selectedBattle.baseReward || 0) + (selectedBattle.participants?.length || 0)
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-center py-6">
                          <h3 className="text-lg font-medium mb-2">{t("submit-answer")}</h3>
                          <p className="text-gray-500 mb-4">{t("submit-answer-description")}</p>
                          
                          {!mediaContent ? (
                            <div className="flex justify-center gap-4">
                              <Button 
                                onClick={handlePhotoClick}
                                className="flex gap-2 items-center"
                              >
                                <Camera className="h-4 w-4" />
                                {t("take-photo")}
                                <input 
                                  type="file"
                                  ref={fileInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handlePhotoChange}
                                />
                              </Button>
                              
                              <Button 
                                onClick={handleMicClick}
                                className="flex gap-2 items-center"
                              >
                                <Mic className="h-4 w-4" />
                                {t("record-voice")}
                              </Button>
                            </div>
                          ) : (
                            <div className="max-w-md mx-auto">
                              {mediaType === "photo" ? (
                                <img 
                                  src={mediaContent} 
                                  alt="Your answer" 
                                  className="max-h-60 object-contain mb-4 rounded-lg mx-auto"
                                />
                              ) : (
                                <audio 
                                  controls 
                                  src={mediaContent}
                                  className="w-full mb-4"
                                />
                              )}
                              
                              <div className="flex justify-center gap-4">
                                <Button 
                                  variant="outline" 
                                  onClick={cancelSubmission}
                                >
                                  {t("cancel")}
                                </Button>
                                <Button 
                                  onClick={handleSubmit}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? t("submitting") : t("submit-answer")}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {t("ends-at")}: {formatDateTime(selectedBattle.timeLimit)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedBattle.participants?.length || 0} {t("participants")}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ) : activeBattles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBattles.map(battle => (
                  <Card key={battle.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle>{battle.name}</CardTitle>
                        <Badge variant="outline">
                          {getTimeRemaining(battle.timeLimit)}
                        </Badge>
                      </div>
                      <CardDescription>{battle.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasSubmittedAnswer(battle) ? (
                        <Badge variant="success" className="mb-2">
                          {t("answer-submitted")}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="mb-2">
                          {t("answer-required")}
                        </Badge>
                      )}
                      
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {t("ends-at")}: {formatDateTime(battle.timeLimit)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-gray-500">
                        {t("reward")}: {(battle.baseReward || 0) + (battle.participants?.length || 0)} {t("coins")}
                      </div>
                      <Button
                        onClick={() => {
                          joinBattle(battle);
                          setSelectedBattle(battle);
                        }}
                      >
                        {hasSubmittedAnswer(battle) ? t("view-submission") : t("answer-battle")}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">{t("no-active-battles")}</h3>
                  <p className="text-gray-500">{t("no-active-battles-description")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedBattles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedBattles.map(battle => {
                  const userWon = battle.winner?.studentId === studentId;
                  const userParticipated = battle.participants?.includes(studentId);
                  const userSubmitted = battle.answers?.some(answer => answer.studentId === studentId);
                  
                  return (
                    <Card key={battle.id} className={`hover:shadow-md transition-shadow ${
                      userWon ? "border-yellow-400" : ""
                    }`}>
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle>{battle.name}</CardTitle>
                          <Badge variant="outline" className={isExpired(battle.timeLimit) ? "bg-red-50" : ""}>
                            {battle.status === "completed" ? t("completed") : t("expired")}
                          </Badge>
                        </div>
                        <CardDescription>{battle.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {userWon ? (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                            <p className="font-medium flex items-center">
                              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                              {t("you-won-battle")}
                            </p>
                            <p className="text-sm text-gray-700">
                              {t("reward-received", {
                                coins: (battle.baseReward || 0) + (battle.participants?.length || 0)
                              })}
                            </p>
                          </div>
                        ) : battle.winner ? (
                          <div className="mb-3">
                            <p className="font-medium">{t("winner")}: {battle.winner.studentName}</p>
                            {userSubmitted && (
                              <p className="text-sm text-gray-500">{t("better-luck-next-time")}</p>
                            )}
                          </div>
                        ) : (
                          <p className="mb-3 text-gray-500">{t("no-winner-declared")}</p>
                        )}
                        
                        <div className="text-sm text-gray-500">
                          {userParticipated ? (
                            <Badge variant="outline" className="bg-blue-50">
                              {userSubmitted ? t("you-participated-and-submitted") : t("you-participated")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50">
                              {t("you-did-not-participate")}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="text-sm text-gray-500">
                          {formatDateTime(battle.timeLimit)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {battle.participants?.length || 0} {t("participants")}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">{t("no-completed-battles")}</h3>
                  <p className="text-gray-500">{t("no-completed-battles-description")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentBattlePage;
