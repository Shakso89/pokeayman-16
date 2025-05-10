
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Battle } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

export const useBattles = (studentId: string | null, schoolId: string | null, classId: string | null) => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);
  const [completedBattles, setCompletedBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoggedIn() && studentId) {
      loadBattles();
    }
  }, [studentId, schoolId, classId]);

  const isLoggedIn = () => {
    return studentId && classId && schoolId;
  };

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

  const updateBattle = (updatedBattle: Battle) => {
    setBattles(battles.map(b => b.id === updatedBattle.id ? updatedBattle : b));
    setActiveBattles(activeBattles.map(b => b.id === updatedBattle.id ? updatedBattle : b));
    setSelectedBattle(updatedBattle);
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
      return t("days-remaining").replace("{{count}}", diffDays.toString());
    } else if (diffHours > 0) {
      return t("hours-remaining").replace("{{count}}", diffHours.toString()).replace("{{minutes}}", diffMinutes.toString());
    } else {
      return t("minutes-remaining").replace("{{count}}", diffMinutes.toString());
    }
  };

  return {
    battles,
    activeBattles,
    completedBattles,
    selectedBattle,
    setSelectedBattle,
    joinBattle,
    updateBattle,
    formatDateTime,
    isExpired,
    hasSubmittedAnswer,
    getTimeRemaining,
    loadBattles
  };
};
