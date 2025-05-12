
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ClassData {
  id: string;
  name: string;
  teacherId: string;
  schoolId: string;
  students: string[];
  isPublic?: boolean;
  createdAt?: string;
  likes?: string[];
  description?: string;
}

interface Teacher {
  id: string;
  displayName: string;
  avatar?: string;
}

interface ClassFeedProps {
  schoolId: string;
  teacherId: string;
  onClassSelect: (classData: ClassData) => void;
}

const ClassFeed: React.FC<ClassFeedProps> = ({ schoolId, teacherId, onClassSelect }) => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teacherData, setTeacherData] = useState<{[key: string]: Teacher}>({});

  useEffect(() => {
    loadClassesData();
    loadTeacherData();
  }, [schoolId]);

  const loadClassesData = () => {
    // Get all classes from localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");

    // Filter classes that belong to this school and are public
    const filteredClasses = allClasses.filter((cls: ClassData) => 
      cls.schoolId === schoolId && (cls.isPublic !== false)
    );
    
    // Sort by creation date (newest first)
    filteredClasses.sort((a: ClassData, b: ClassData) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setClasses(filteredClasses);
  };

  const loadTeacherData = () => {
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const teacherMap: {[key: string]: Teacher} = {};
    
    teachers.forEach((teacher: Teacher) => {
      teacherMap[teacher.id] = teacher;
    });
    
    setTeacherData(teacherMap);
  };
  
  const getTeacherName = (teacherId: string): string => {
    return teacherData[teacherId]?.displayName || "Teacher";
  };
  
  const getTeacherAvatar = (teacherId: string): string | undefined => {
    return teacherData[teacherId]?.avatar;
  };
  
  const getCommentsCount = (classId: string): number => {
    const allComments = JSON.parse(localStorage.getItem("classComments") || "[]");
    return allComments.filter((comment: any) => comment.classId === classId).length;
  };

  // Handle like toggle
  const handleToggleLike = (e: React.MouseEvent, classId: string) => {
    e.stopPropagation();
    
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    const updatedClasses = existingClasses.map((cls: ClassData) => {
      if (cls.id === classId) {
        const likes = cls.likes || [];
        const hasLiked = likes.includes(teacherId);
        
        return {
          ...cls,
          likes: hasLiked 
            ? likes.filter(id => id !== teacherId)
            : [...likes, teacherId]
        };
      }
      return cls;
    });
    
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Update local state
    setClasses(classes.map(cls => {
      if (cls.id === classId) {
        const likes = cls.likes || [];
        const hasLiked = likes.includes(teacherId);
        
        return {
          ...cls,
          likes: hasLiked 
            ? likes.filter(id => id !== teacherId)
            : [...likes, teacherId]
        };
      }
      return cls;
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.length > 0 ? (
        classes.map(classData => (
          <Card 
            key={classData.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onClassSelect(classData)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getTeacherAvatar(classData.teacherId)} alt={getTeacherName(classData.teacherId)} />
                  <AvatarFallback>
                    {getTeacherName(classData.teacherId).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{getTeacherName(classData.teacherId)}</p>
                  {classData.createdAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(classData.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <CardTitle>{classData.name}</CardTitle>
            </CardHeader>
            
            <CardContent>
              {classData.description ? (
                <p className="text-gray-600 text-sm line-clamp-2">{classData.description}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">{t("no-description")}</p>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-3">
              <div className="flex items-center text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {classData.students?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-500">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span className="text-sm">{getCommentsCount(classData.id)}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={(e) => handleToggleLike(e, classData.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${(classData.likes || []).includes(teacherId) ? "fill-pink-500 text-pink-500" : ""}`} 
                  />
                  <span className="text-xs ml-1">{(classData.likes || []).length || 0}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">{t("no-public-classes")}</p>
        </div>
      )}
    </div>
  );
};

export default ClassFeed;
