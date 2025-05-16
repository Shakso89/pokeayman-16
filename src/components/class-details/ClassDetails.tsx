
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ClassDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        // Fetch class data
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (classError) throw classError;
        setClassData(classData);
        
        // Fetch student details if class has students
        if (classData.students && classData.students.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .in('id', classData.students);
            
          if (studentsError) throw studentsError;
          setStudents(studentsData || []);
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast({
          title: "Error",
          description: "Failed to load class details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!classData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-4">Class not found</h2>
            <Button onClick={() => navigate("/teacher-dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/teacher-dashboard")}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Class Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500">Name</h3>
              <p className="text-lg">{classData.name}</p>
            </div>
            {classData.description && (
              <div>
                <h3 className="font-medium text-gray-500">Description</h3>
                <p>{classData.description}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-500">Created</h3>
              <p>{new Date(classData.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Students List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No students in this class yet.
              </p>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                      {(student.display_name || student.username || '??')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{student.display_name || student.username}</p>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassDetails;
