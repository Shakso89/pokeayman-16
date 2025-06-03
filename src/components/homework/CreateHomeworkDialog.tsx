
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Image, Mic, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Homework } from '@/types/homework';

interface CreateHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  teacherId: string;
  onHomeworkCreated?: (homework: Homework) => void;
}

const CreateHomeworkDialog: React.FC<CreateHomeworkDialogProps> = ({
  open,
  onOpenChange,
  classId,
  teacherId,
  onHomeworkCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coinReward, setCoinReward] = useState(10);
  const [type, setType] = useState<'image' | 'audio' | 'multiple_choice'>('image');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (type === 'multiple_choice' && (!question.trim() || !optionA.trim() || !optionB.trim())) {
      toast({
        title: "Error", 
        description: "Please provide a question and at least 2 options for multiple choice",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours from now

      const homeworkData = {
        title,
        description,
        coin_reward: coinReward,
        type,
        class_id: classId,
        teacher_id: teacherId,
        expires_at: expiresAt.toISOString(),
        ...(type === 'multiple_choice' && {
          question,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC || null,
          option_d: optionD || null,
          correct_option: correctOption
        })
      };

      const { data, error } = await supabase
        .from('homework')
        .insert([homeworkData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework created successfully!"
      });

      onHomeworkCreated?.(data);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCoinReward(10);
      setType('image');
      setQuestion('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption('A');

    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Error",
        description: "Failed to create homework. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Homework</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter homework title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Instructions/Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed instructions for students"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coinReward">Coin Reward</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-500" />
                <Input
                  id="coinReward"
                  type="number"
                  min="1"
                  max="100"
                  value={coinReward}
                  onChange={(e) => setCoinReward(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Homework Type</Label>
              <Select value={type} onValueChange={(value: 'image' | 'audio' | 'multiple_choice') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Image Upload
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Audio Recording
                    </div>
                  </SelectItem>
                  <SelectItem value="multiple_choice">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Multiple Choice
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === 'multiple_choice' && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="optionA">Option A *</Label>
                    <Input
                      id="optionA"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="Option A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="optionB">Option B *</Label>
                    <Input
                      id="optionB"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="Option B"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="optionC">Option C</Label>
                    <Input
                      id="optionC"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      placeholder="Option C (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="optionD">Option D</Label>
                    <Input
                      id="optionD"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      placeholder="Option D (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select value={correctOption} onValueChange={(value: 'A' | 'B' | 'C' | 'D') => setCorrectOption(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Option A</SelectItem>
                      <SelectItem value="B">Option B</SelectItem>
                      {optionC && <SelectItem value="C">Option C</SelectItem>}
                      {optionD && <SelectItem value="D">Option D</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Homework"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHomeworkDialog;
