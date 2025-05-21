
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, User, School, Calendar, Box } from "lucide-react";
import { getClassById } from "@/utils/classSync/classOperations";
import { ClassData } from "@/utils/classSync/types";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

const ClassDetailsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClassDetails = async () => {
      if (!classId) return;

      try {
        setLoading(true);
        const data = await getClassById(classId);
        console.log("Loaded class data:", data);
        
        if (data) {
          setClassData(data);
        } else {
          toast({
            title: t("error"),
            description: t("class-not-found"),
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading class details:", error);
        toast({
          title: t("error"),
          description: t("failed-to-load-class-details"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadClassDetails();
  }, [classId, t]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar userType="teacher" userName="Teacher" />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("class-details")}</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading class details...</p>
          </div>
        ) : classData ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{classData.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classData.description && (
                    <p className="text-gray-600">{classData.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <School className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm">
                        <strong>{t("school-id")}:</strong> {classData.schoolId}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-sm">
                        <strong>{t("teacher")}:</strong> {classData.teacherId ? classData.teacherId.substring(0, 8) + '...' : t("admin-created")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="text-sm">
                        <strong>{t("created")}:</strong> {new Date(classData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Box className="h-5 w-5 mr-2 text-yellow-500" />
                      <span className="text-sm">
                        <strong>{t("students")}:</strong> {classData.students?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Students Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t("students")}</CardTitle>
              </CardHeader>
              <CardContent>
                {classData.students && classData.students.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* We'll show student data here */}
                    <p>Student list will be displayed here</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {t("no-students-yet")}
                  </p>
                )}
                
                <Button className="w-full mt-4">
                  {t("add-students")}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{t("class-not-found")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClassDetailsPage;
