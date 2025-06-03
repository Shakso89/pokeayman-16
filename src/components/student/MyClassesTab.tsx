
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StudentHomeworkTab from "./StudentHomeworkTab";

interface MyClassesTabProps {
  studentId: string;
  studentName: string;
  classId: string;
}

const MyClassesTab: React.FC<MyClassesTabProps> = ({ studentId, studentName, classId }) => {
  const [classData, setClassData] = useState<any>(null);
  const [activeHomework, setActiveHomework] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClassData();
    loadHomeworkCount();
  }, [classId]);

  const loadClassData = async () => {
    if (!classId) return;
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;
      setClassData(data);
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHomeworkCount = async () => {
    if (!classId) return;
    
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('id')
        .eq('class_id', classId)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      setActiveHomework(data?.length || 0);
    } catch (error) {
      console.error('Error loading homework count:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Loading class information...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No class assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {classData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Active Homework:</span>
              <Badge variant="outline">{activeHomework}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Status:</span>
              <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
            </div>
          </div>
          {classData.description && (
            <p className="text-sm text-gray-600 mt-3">{classData.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Homework Section */}
      <StudentHomeworkTab 
        studentId={studentId}
        studentName={studentName}
        classId={classId}
      />
    </div>
  );
};

export default MyClassesTab;
