import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Homework } from "@/types/homework";
import { logActivity } from "@/services/activityLogger";

interface CreateHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHomeworkCreated?: (homework: Homework) => void;
  teacherId: string;
  classId?: string;
  showClassSelector?: boolean;
}

const CreateHomeworkDialog: React.FC<CreateHomeworkDialogProps> = ({
  open,
  onOpenChange,
  onHomeworkCreated,
  teacherId,
  classId,
  showClassSelector = false
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "image" as "image" | "audio" | "multiple_choice",
    coin_reward: 10,
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A" as "A" | "B" | "C" | "D",
    selected_class_id: classId || ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  useEffect(() => {
    if (showClassSelector && teacherId) {
      loadTeacherClasses();
    }
  }, [showClassSelector, teacherId]);

  useEffect(() => {
    if (classId) {
      setFormData(prev => ({ ...prev, selected_class_id: classId }));
    }
  }, [classId]);

  const loadTeacherClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .or(`teacher_id.eq.${teacherId},assistants.cs.{${teacherId}}`);

      if (error) throw error;
      setTeacherClasses(data || []);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        toast({
          title: "Error",
          description: "Description is required",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (showClassSelector && !formData.selected_class_id) {
        toast({
          title: "Error",
          description: "Please select a class",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // For multiple choice, validate question and options
      if (formData.type === "multiple_choice") {
        if (!formData.question.trim()) {
          toast({
            title: "Error", 
            description: "Question is required for multiple choice assignments",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        if (!formData.option_a.trim() || !formData.option_b.trim()) {
          toast({
            title: "Error", 
            description: "At least options A and B are required",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Auto-generate expiry date (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const homeworkData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        coin_reward: formData.coin_reward,
        expires_at: expiryDate.toISOString(),
        teacher_id: teacherId,
        class_id: formData.selected_class_id,
        ...(formData.type === "multiple_choice" && {
          question: formData.question.trim(),
          option_a: formData.option_a.trim(),
          option_b: formData.option_b.trim(),
          option_c: formData.option_c.trim() || null,
          option_d: formData.option_d.trim() || null,
          correct_option: formData.correct_option
        })
      };

      const { data, error } = await supabase
        .from('homework')
        .insert(homeworkData)
        .select()
        .single();

      if (error) throw error;

      await logActivity(
        teacherId,
        'created_homework',
        {
          classId: formData.selected_class_id,
          homeworkTitle: formData.title.trim(),
        }
      );

      toast({
        title: "Success",
        description: "Homework created successfully! Due date set to 7 days from now."
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "image",
        coin_reward: 10,
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        selected_class_id: classId || ""
      });

      onHomeworkCreated?.(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating homework:", error);
      toast({
        title: "Error",
        description: "Failed to create homework. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Homework</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {showClassSelector && (
            <div>
              <Label htmlFor="class">Select Class *</Label>
              <Select value={formData.selected_class_id} onValueChange={(value) => setFormData({...formData, selected_class_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter homework title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the homework assignment"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Assignment Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image Upload</SelectItem>
                <SelectItem value="audio">Audio Recording</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "multiple_choice" && (
            <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
              <Label className="font-medium">Multiple Choice Question</Label>
              
              <div>
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="Enter your question"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="option_a">Option A *</Label>
                  <Input
                    id="option_a"
                    value={formData.option_a}
                    onChange={(e) => setFormData({...formData, option_a: e.target.value})}
                    placeholder="Option A"
                  />
                </div>
                <div>
                  <Label htmlFor="option_b">Option B *</Label>
                  <Input
                    id="option_b"
                    value={formData.option_b}
                    onChange={(e) => setFormData({...formData, option_b: e.target.value})}
                    placeholder="Option B"
                  />
                </div>
                <div>
                  <Label htmlFor="option_c">Option C</Label>
                  <Input
                    id="option_c"
                    value={formData.option_c}
                    onChange={(e) => setFormData({...formData, option_c: e.target.value})}
                    placeholder="Option C (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="option_d">Option D</Label>
                  <Input
                    id="option_d"
                    value={formData.option_d}
                    onChange={(e) => setFormData({...formData, option_d: e.target.value})}
                    placeholder="Option D (optional)"
                  />
                </div>
              </div>

              <div>
                <Label>Correct Answer</Label>
                <Select value={formData.correct_option} onValueChange={(value: any) => setFormData({...formData, correct_option: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Option A</SelectItem>
                    <SelectItem value="B">Option B</SelectItem>
                    {formData.option_c && <SelectItem value="C">Option C</SelectItem>}
                    {formData.option_d && <SelectItem value="D">Option D</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="coin_reward">Coin Reward</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-500" />
              <Input
                id="coin_reward"
                type="number"
                min="1"
                max="100"
                value={formData.coin_reward}
                onChange={(e) => setFormData({...formData, coin_reward: parseInt(e.target.value) || 10})}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Due date will be automatically set to 7 days from creation</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Homework"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHomeworkDialog;
