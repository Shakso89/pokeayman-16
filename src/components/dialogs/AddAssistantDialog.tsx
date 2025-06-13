
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addAssistantToClass } from "@/utils/classSync";
import { toast } from "@/hooks/use-toast";

interface Teacher {
  id: string;
  username: string;
  display_name: string;
  email?: string;
}

interface AddAssistantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  currentAssistants: string[];
  onAssistantAdded: (assistantId: string) => void;
}

const AddAssistantDialog: React.FC<AddAssistantDialogProps> = ({
  isOpen,
  onOpenChange,
  classId,
  currentAssistants,
  onAssistantAdded
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTeachers();
    }
  }, [isOpen]);

  const fetchAvailableTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("teachers")
        .select("id, username, display_name, email")
        .eq("is_active", true);

      if (error) throw error;

      // Filter out current assistants and the class creator
      const currentTeacherId = localStorage.getItem("teacherId");
      const filtered = data.filter(teacher => 
        !currentAssistants.includes(teacher.id) && 
        teacher.id !== currentTeacherId
      );

      setAvailableTeachers(filtered);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load available teachers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = availableTeachers.filter(teacher =>
    teacher.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddAssistant = async (teacherId: string, teacherName: string) => {
    try {
      setAddingTeacher(teacherId);
      const success = await addAssistantToClass(classId, teacherId);
      
      if (success) {
        toast({
          title: "Success",
          description: `${teacherName} has been added as an assistant to this class`
        });
        onAssistantAdded(teacherId);
        onOpenChange(false);
      } else {
        throw new Error("Failed to add assistant");
      }
    } catch (error) {
      console.error("Error adding assistant:", error);
      toast({
        title: "Error",
        description: "Failed to add assistant to class",
        variant: "destructive"
      });
    } finally {
      setAddingTeacher(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add Assistant to Class
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Teachers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Teachers List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading teachers...</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchQuery ? "No teachers found matching your search" : "No available teachers"}
                </p>
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {teacher.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{teacher.display_name}</h4>
                          <p className="text-sm text-gray-500">@{teacher.username}</p>
                          {teacher.email && (
                            <p className="text-sm text-gray-400">{teacher.email}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddAssistant(teacher.id, teacher.display_name)}
                        disabled={addingTeacher === teacher.id}
                        size="sm"
                      >
                        {addingTeacher === teacher.id ? "Adding..." : "Add Assistant"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssistantDialog;
