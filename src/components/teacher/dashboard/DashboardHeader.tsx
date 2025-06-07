import React, { useState, useEffect } from "react";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
interface DashboardHeaderProps {
  isAdmin: boolean;
}

// Array of motivational quotes for teachers
const MOTIVATIONAL_QUOTES = ["Every student can learn, just not on the same day or in the same way.", "Teachers who love teaching teach children to love learning.", "Education is not the filling of a pail, but the lighting of a fire.", "The influence of a great teacher can never be erased.", "Children are not a distraction from more important work. They are the most important work.", "Teaching kids to count is fine, but teaching them what counts is best.", "A teacher affects eternity; no one can tell where their influence stops.", "The art of teaching is the art of assisting discovery.", "Education is not preparation for life; education is life itself.", "The dream begins with a teacher who believes in you.", "To teach is to learn twice.", "Great teachers empathize with kids, respect them, and believe that each one has something special.", "Teaching is the one profession that creates all other professions.", "What we learn with pleasure we never forget.", "Education is the most powerful weapon which you can use to change the world."];
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isAdmin
}) => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [quote, setQuote] = useState("");
  useEffect(() => {
    // Get teacher name
    const username = localStorage.getItem("teacherUsername") || "";
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const teacher = teachers.find((t: any) => t.username === username);
    if (teacher?.displayName) {
      setDisplayName(teacher.displayName);
    } else {
      setDisplayName(username);
    }

    // Select a random quote for the day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const quoteIndex = seed % MOTIVATIONAL_QUOTES.length;
    setQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
  }, []);
  const handleViewProfile = () => {
    // Fix: Use the correct profile route that matches App.tsx
    const teacherId = localStorage.getItem("teacherId");
    if (teacherId) {
      navigate(`/teacher/profile/${teacherId}`);
    }
  };
  return <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
      <CardContent className="hover:shadow-lg transition-all pokemon-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t("welcome")} {displayName}</h2>
            <p className="italic mb-2 text-zinc-900">"{quote}"</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
            <Button onClick={handleViewProfile} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("view-profile")}
            </Button>
            {isAdmin && <Button onClick={() => navigate("/admin-dashboard")} className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("admin-dashboard")}
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default DashboardHeader;