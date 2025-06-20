
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Users, Crown, Trash, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { removeAssistantFromClass } from "@/utils/classSync/classOperations";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  role: string;
}

interface ClassTeachersProps {
  classData: {
    teacherId?: string | null;
    teacher_id?: string | null;
    assistants?: string[];
    id?: string;
  };
  canRemoveAssistants?: boolean;
  onAssistantRemoved?: () => void;
}

const ClassTeachers: React.FC<ClassTeachersProps> = ({ 
  classData, 
  canRemoveAssistants = false, 
  onAssistantRemoved 
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // Get the actual teacher ID (handle both possible field names)
  const actualTeacherId = classData.teacherId || classData.teacher_id;

  // Debug logging
  useEffect(() => {
    console.log("ClassTeachers - classData:", classData);
    console.log("ClassTeachers - actualTeacherId:", actualTeacherId);
    console.log("ClassTeachers - assistants:", classData.assistants);
  }, [classData, actualTeacherId]);

  useEffect(() => {
    loadTeachers();
  }, [actualTeacherId, classData.assistants]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Get all teacher IDs (main teacher + assistants)
      const teacherIds = [
        ...(actualTeacherId ? [actualTeacherId] : []),
        ...(classData.assistants || [])
      ].filter(Boolean);

      console.log("ClassTeachers - Fetching teachers for IDs:", teacherIds);

      if (teacherIds.length === 0) {
        console.log("ClassTeachers - No teacher IDs found");
        setTeachers([]);
        setLoading(false);
        return;
      }

      // Try to fetch from Supabase first
      const { data: supabaseTeachers, error } = await supabase
        .from('teachers')
        .select('id, username, display_name, email, role')
        .in('id', teacherIds);

      if (error) {
        console.error("ClassTeachers - Error fetching from Supabase:", error);
        // Fallback to localStorage
        const localTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const filteredTeachers = localTeachers.filter((teacher: any) =>
          teacherIds.includes(teacher.id)
        );
        console.log("ClassTeachers - Using localStorage teachers:", filteredTeachers);
        setTeachers(filteredTeachers);
      } else {
        console.log("ClassTeachers - Loaded teachers from Supabase:", supabaseTeachers);
        setTeachers(supabaseTeachers || []);
      }
    } catch (error) {
      console.error("ClassTeachers - Error loading teachers:", error);
      // Final fallback to localStorage
      const localTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacherIds = [
        ...(actualTeacherId ? [actualTeacherId] : []),
        ...(classData.assistants || [])
      ].filter(Boolean);
      const filteredTeachers = localTeachers.filter((teacher: any) =>
        teacherIds.includes(teacher.id)
      );
      console.log("ClassTeachers - Final fallback to localStorage:", filteredTeachers);
      setTeachers(filteredTeachers);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssistant = async (assistantId: string) => {
    if (!classData.id) {
      toast({
        title: "Error",
        description: "Missing class ID.",
        variant: "destructive",
      });
      return;
    }
    
    setRemoving(assistantId);
    try {
      const success = await removeAssistantFromClass(classData.id, assistantId);
      if (success) {
        toast({
          title: "Assistant removed",
          description: "The assistant has been removed from the class.",
        });
        
        // Remove assistant locally
        setTeachers(prev => prev.filter(t => t.id !== assistantId));
        
        // Notify parent component
        if (onAssistantRemoved) {
          onAssistantRemoved();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to remove assistant.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing assistant:", error);
      toast({
        title: "Error",
        description: "An error occurred while removing assistant.",
        variant: "destructive",
      });
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teachers Involved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <p className="text-sm text-gray-500">Loading teachers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mainTeacher = teachers.find(t => t.id === actualTeacherId);
  const assistantTeachers = teachers.filter(t =>
    classData.assistants && classData.assistants.includes(t.id)
  );

  console.log("ClassTeachers - Rendering with:");
  console.log("  - mainTeacher:", mainTeacher);
  console.log("  - assistantTeachers:", assistantTeachers);
  console.log("  - total teachers:", teachers.length);
  console.log("  - assistants array:", classData.assistants);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold">
          <Users className="h-5 w-5" />
          Teachers ({teachers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mainTeacher && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Creator</h4>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {mainTeacher.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{mainTeacher.display_name}</p>
                <p className="text-sm text-muted-foreground">@{mainTeacher.username}</p>
              </div>
              <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold">
                <Crown className="h-3 w-3 mr-1.5" />
                Creator
              </Badge>
            </div>
          </div>
        )}

        {assistantTeachers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Assistants ({assistantTeachers.length})</h4>
            <div className="space-y-1">
              {assistantTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-black/5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {teacher.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{teacher.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{teacher.username}</p>
                  </div>
                  {canRemoveAssistants && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground h-8 w-8 rounded-full hover:text-red-500 hover:bg-red-100"
                      title="Remove Assistant"
                      onClick={() => handleRemoveAssistant(teacher.id)}
                      disabled={removing === teacher.id}
                    >
                      {removing === teacher.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {teachers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No teachers assigned to this class</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassTeachers;
