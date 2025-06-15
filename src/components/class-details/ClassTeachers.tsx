
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
    teacherId: string | null;
    assistants: string[];
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

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const teacherIds = [
          ...(classData.teacherId ? [classData.teacherId] : []),
          ...(classData.assistants || [])
        ].filter(Boolean);

        if (teacherIds.length === 0) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        const { data: supabaseTeachers, error } = await supabase
          .from('teachers')
          .select('id, username, display_name, email, role')
          .in('id', teacherIds);

        if (error) {
          console.error("Error fetching teachers from Supabase:", error);
          const localTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
          const filteredTeachers = localTeachers.filter((teacher: any) =>
            teacherIds.includes(teacher.id)
          );
          setTeachers(filteredTeachers);
        } else {
          setTeachers(supabaseTeachers || []);
        }
      } catch (error) {
        console.error("Error loading teachers:", error);
        const localTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const teacherIds = [
          ...(classData.teacherId ? [classData.teacherId] : []),
          ...(classData.assistants || [])
        ].filter(Boolean);
        const filteredTeachers = localTeachers.filter((teacher: any) =>
          teacherIds.includes(teacher.id)
        );
        setTeachers(filteredTeachers);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, [classData.teacherId, classData.assistants]);

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
          <p className="text-sm text-gray-500">Loading teachers...</p>
        </CardContent>
      </Card>
    );
  }

  const mainTeacher = teachers.find(t => t.id === classData.teacherId);
  const assistantTeachers = teachers.filter(t =>
    classData.assistants && classData.assistants.includes(t.id)
  );

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
