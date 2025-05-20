
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ClassData } from "@/utils/classSync/types";
import { useNavigate } from "react-router-dom";

interface ClassListProps {
  classes: ClassData[];
  teacherId: string;
  isAdmin: boolean;
  loading: boolean;
  onOpenAddStudentDialog: (classId: string) => void;
  onDeleteClass: (classId: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  teacherId,
  isAdmin,
  loading,
  onOpenAddStudentDialog,
  onDeleteClass
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Check if the current teacher is the creator of a class
  const isClassCreator = (classData: ClassData) => {
    return classData.teacherId === teacherId;
  };
  
  if (loading) {
    return <div className="text-center py-10">{t("loading-classes")}...</div>;
  }
  
  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-gray-500">{t("no-classes-yet")}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((cls) => (
        <Card key={cls.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{cls.name}</span>
              {(isAdmin || isClassCreator(cls)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteClass(cls.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
            {cls.description && (
              <CardDescription>{cls.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <span>
                {cls.students?.length || 0} {t("students")}
              </span>
              {/* Show teacher ID if available */}
              {cls.teacherId && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>
                    {t("creator")}: {cls.teacherId === teacherId ? t("you") : cls.teacherId.substring(0, 8) + '...'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {/* Only show manage buttons to class creator or admin */}
            {(isClassCreator(cls) || isAdmin) ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => onOpenAddStudentDialog(cls.id)}
                >
                  {t("add-students")}
                </Button>
                <Button 
                  variant="default"
                  onClick={() => navigate(`/class-details/${cls.id}`)}
                >
                  {t("manage-class")}
                </Button>
              </>
            ) : (
              // For non-creators, only show view details
              <Button 
                variant="default"
                className="w-full"
                onClick={() => navigate(`/class-details/${cls.id}`)}
              >
                {t("view-details")}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ClassList;
