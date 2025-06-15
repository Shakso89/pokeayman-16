
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getClassesBySchool } from '@/utils/classSync/classOperations';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Users, School } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const SchoolClassesPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [school, setSchool] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userType = localStorage.getItem("userType") || "student";
  const userName = localStorage.getItem(userType === 'teacher' ? 'teacherDisplayName' : 'studentDisplayName') || 'User';
  const userAvatar = localStorage.getItem('userAvatar');

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch school details
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id, name')
          .eq('id', schoolId)
          .single();

        if (schoolError) throw schoolError;
        setSchool(schoolData);

        // Fetch classes for the school
        const schoolClasses = await getClassesBySchool(schoolId);
        setClasses(schoolClasses);

      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold mb-4">{t("school-not-found")}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("go-back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getNavigationPath = (classId: string) => {
    if (userType === 'student') {
      return `/student/class/${classId}`;
    }
    return `/class-details/${classId}`;
  };

  return (
    <>
      <AppHeader userType={userType as "student" | "teacher"} userName={userName} userAvatar={userAvatar || undefined} />
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <School className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{school.name}</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Classes in this School ({classes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="space-y-3">
                {classes.map((classInfo) => (
                  <Link to={getNavigationPath(classInfo.id)} key={classInfo.id}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{classInfo.name}</h3>
                        {classInfo.description && <p className="text-sm text-gray-500 mt-1">{classInfo.description}</p>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No classes found for this school.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SchoolClassesPage;
