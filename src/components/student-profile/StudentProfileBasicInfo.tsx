
import React from "react";
import { School, Users, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface StudentProfileBasicInfoProps {
  displayName: string;
  avatar?: string;
  school?: { id: string; name: string };
  classes: { id: string; name: string }[];
  isStarOfClass?: boolean;
}

const StudentProfileBasicInfo: React.FC<StudentProfileBasicInfoProps> = ({
  displayName,
  avatar,
  school,
  classes,
  isStarOfClass = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-3 pb-2 border-b mb-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatar || undefined} alt={displayName} />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        {isStarOfClass && (
          <Star className="h-7 w-7 text-yellow-500 absolute -right-2 -top-2 drop-shadow" fill="gold" />
        )}
      </div>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        {displayName}
      </h2>
      {school && (
        <div
          className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/school/${school.id}`)}
        >
          <School className="h-5 w-5" /> <span>{school.name}</span>
        </div>
      )}
      <div className="w-full flex flex-wrap justify-center gap-2">
        {classes.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/class/${c.id}`)}
            className="px-3 py-1 rounded bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 flex items-center gap-1"
          >
            <Users className="w-4 h-4" />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProfileBasicInfo;
