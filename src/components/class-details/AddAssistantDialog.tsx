
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Search } from "lucide-react";

interface AddAssistantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  onAssistantAdded: () => void;
}

const AddAssistantDialog: React.FC<AddAssistantDialogProps> = ({
  isOpen,
  onOpenChange,
  classId,
  className,
  onAssistantAdded
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTeachers();
    }
  }, [isOpen]);

  const fetchAvailableTeachers = async () => {
    try {
      setLoading(true);
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('id, username, display_name, email')
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (error) throw error;

      setAvailableTeachers(teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: t("error"),
        description: "Failed to load teachers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssistant = async () => {
    if (!selectedTeacher) return;

    try {
      setLoading(true);

      // Get current class data
      const { data: classData, error: fetchError } = await supabase
        .from('classes')
        .select('assistants')
        .eq('id', classId)
        .single();

      if (fetchError) throw fetchError;

      // Add assistant to class
      const currentAssistants = classData.assistants || [];
      const updatedAssistants = [...currentAssistants, selectedTeacher];

      const { error: updateError } = await supabase
        .from('classes')
        .update({ assistants: updatedAssistants })
        .eq('id', classId);

      if (updateError) throw updateError;

      // Get teacher name for notification
      const teacher = availableTeachers.find(t => t.id === selectedTeacher);
      const teacherName = teacher?.display_name || teacher?.username || "Unknown";

      toast({
        title: t("success"),
        description: `${teacherName} has been added as an assistant to ${className}`
      });

      onAssistantAdded();
      onOpenChange(false);
      setSelectedTeacher(null);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding assistant:", error);
      toast({
        title: t("error"),
        description: "Failed to add assistant",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = availableTeachers.filter(teacher =>
    teacher.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Assistant to {className}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Teachers</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4">Loading teachers...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No teachers found
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`p-3 border rounded-lg flex items-center cursor-pointer transition-colors ${
                    selectedTeacher === teacher.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTeacher(teacher.id)}
                >
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                    {(teacher.display_name || teacher.username || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{teacher.display_name || teacher.username}</p>
                    <p className="text-sm text-gray-500">@{teacher.username}</p>
                    {teacher.email && (
                      <p className="text-xs text-gray-400">{teacher.email}</p>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 border rounded-full ${
                      selectedTeacher === teacher.id
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedTeacher === teacher.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleAddAssistant}
            disabled={!selectedTeacher || loading}
          >
            {loading ? "Adding..." : "Add Assistant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssistantDialog;
