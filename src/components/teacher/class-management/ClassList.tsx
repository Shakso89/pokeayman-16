
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
  const isClassCreator = (cls: ClassData) => cls.teacherId === teacherId;
  
  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">{t("loading-classes")}...</div>;
  }
  
  if (classes.length === 0) {
    return <Card>
        <CardContent className="text-center py-10 text-muted-foreground">
          {t("no-classes-yet")}
        </CardContent>
      </Card>;
  }
  
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map(cls => {
        const creatorView = isAdmin || isClassCreator(cls);
        const studentCount = cls.students?.length || 0;
        const creatorLabel = cls.teacherId === teacherId ? t("you") : `${cls.teacherId?.slice(0, 8) || ''}...`;
        
        return <Card key={cls.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-sky-400">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50">
              <CardTitle className="flex items-center justify-between">
                <span>{cls.name}</span>
                {creatorView && <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteClass(cls.id);
                  }} 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>}
              </CardTitle>
              {cls.description && <CardDescription>{cls.description}</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                {studentCount} {t("students")}
              </div>
              {cls.teacherId && <div className="flex items-center text-xs text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  {t("creator")}: {creatorLabel}
                </div>}
            </CardContent>

            <CardFooter className="flex justify-between pt-2 pb-4">
              {creatorView ? <>
                  <Button onClick={() => navigate(`/class-details/${cls.id}`)} className="bg-sky-500 hover:bg-sky-600">
                    {t("manage-class")}
                  </Button>
                </> : <Button className="w-full bg-sky-500 hover:bg-sky-600" onClick={() => navigate(`/class-details/${cls.id}`)}>
                  {t("view-details")}
                </Button>}
            </CardFooter>
          </Card>;
      })}
    </div>;
};

export default ClassList;
