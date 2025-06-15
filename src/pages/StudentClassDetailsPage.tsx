
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useClassDetailsWithId } from "@/components/class-details/hooks/useClassDetailsWithId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import StudentsTab from "@/components/student/StudentsTab";
import ClassTeachers from "@/components/class-details/ClassTeachers";

const StudentClassDetailsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { classData, loading, t } = useClassDetailsWithId(classId);

  const userType = localStorage.getItem("userType") || "student";
  const userName = localStorage.getItem(userType === 'teacher' ? 'teacherDisplayName' : 'studentDisplayName') || 'User';
  const userAvatar = localStorage.getItem('userAvatar');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold mb-4">{t("class-not-found")}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("go-back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AppHeader userType={userType as "student" | "teacher"} userName={userName} userAvatar={userAvatar || undefined} />
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <ClassTeachers classData={classData} />
            </CardContent>
          </Card>

          <StudentsTab classId={classId!} viewOnly={true} />
        </div>
      </div>
    </>
  );
};

export default StudentClassDetailsPage;
