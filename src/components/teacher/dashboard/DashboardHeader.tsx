import React, { useState, useEffect } from "react";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
interface DashboardHeaderProps {
  isAdmin: boolean;
}
const MOTIVATIONAL_QUOTES = ["Every student can learn, just not on the same day or in the same way.", "Teachers who love teaching teach children to love learning.", "Education is not the filling of a pail, but the lighting of a fire.", "The influence of a great teacher can never be erased.", "Teaching is the one profession that creates all other professions."];
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
    const username = localStorage.getItem("teacherUsername") || "";
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const teacher = teachers.find((t: any) => t.username === username);
    if (teacher) {
      const role = teacher.role || "teacher";
      const roleLabel = role === "admin" ? "Admin" : role === "supervisor" ? "Supervisor" : "Teacher";
      const name = teacher.displayName || username;
      setDisplayName(`${roleLabel} ${name}`);
    } else {
      setDisplayName(username);
    }
    const today = new Date().toDateString();
    const seed = [...today].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const quoteIndex = seed % MOTIVATIONAL_QUOTES.length;
    setQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
  }, []);
  const handleViewProfile = () => {
    const teacherId = localStorage.getItem("teacherId");
    if (teacherId) navigate(`/teacher/profile/${teacherId}`);
  };
  return <Card className="mb-6 bg-transparent shadow-none border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-800">
              {t("welcome")} {displayName}
            </h2>
            <p className="italic mb-2 text-slate-800 font-semibold text-xl">"{quote}"</p>
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