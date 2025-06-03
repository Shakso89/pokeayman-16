
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Mic, Square, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Homework } from '@/types/homework';

interface StudentSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework: Homework;
  studentId: string;
  studentName: string;
  onSubmissionComplete: () => void;
}

const StudentSubmissionDialog: React.FC<StudentSubmissionDialogProps> = ({
  open,
  onOpenChange,
  homework,
  studentId,
  studentName,
  onSubmissionComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not start recording. Please check your microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // For now, we'll simulate file upload and return a placeholder URL
    // In a real implementation, you'd upload to Supabase Storage or another service
    return URL.createObjectURL(file);
  };

  const handleSubmit = async () => {
    let content = '';
    
    // Validate based on homework type
    switch (homework.type) {
      case 'image':
        if (!selectedFile) {
          toast({
            title: "Error",
            description: "Please select an image to upload",
            variant: "destructive"
          });
          return;
        }
        if (!selectedFile.type.startsWith('image/')) {
          toast({
            title: "Error", 
            description: "Please select a valid image file",
            variant: "destructive"
          });
          return;
        }
        break;
      case 'audio':
        if (!audioBlob) {
          toast({
            title: "Error",
            description: "Please record an audio response",
            variant: "destructive"
          });
          return;
        }
        break;
      case 'multiple_choice':
        if (!selectedOption) {
          toast({
            title: "Error",
            description: "Please select an answer",
            variant: "destructive"
          });
          return;
        }
        content = selectedOption;
        break;
    }

    setIsSubmitting(true);

    try {
      // Upload file if needed
      if (homework.type === 'image' && selectedFile) {
        content = await uploadFile(selectedFile);
      } else if (homework.type === 'audio' && audioBlob) {
        const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });
        content = await uploadFile(audioFile);
      }

      // Submit to database
      const { error } = await supabase
        .from('homework_submissions')
        .insert([{
          homework_id: homework.id,
          student_id: studentId,
          student_name: studentName,
          content: content,
          status: 'pending'
        }]);

      if (error) throw error;

      onSubmissionComplete();
      
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast({
        title: "Error",
        description: "Failed to submit homework. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmissionInterface = () => {
    switch (homework.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected"
                    className="max-w-full max-h-64 mx-auto rounded"
                  />
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">Click to upload an image</p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Select Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 text-center">
              {audioBlob ? (
                <div className="space-y-4">
                  <div className="text-green-600">
                    ✓ Recording Complete
                  </div>
                  <audio controls className="w-full">
                    <source src={URL.createObjectURL(audioBlob)} type="audio/mp3" />
                  </audio>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAudioBlob(null);
                      setIsRecording(false);
                    }}
                  >
                    Record Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className={`p-4 rounded-full ${isRecording ? 'bg-red-100' : 'bg-gray-100'}`}>
                      <Mic className={`h-8 w-8 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {isRecording ? 'Recording... Click stop when finished' : 'Click to start recording your response'}
                  </p>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{homework.question}</p>
            </div>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="space-y-2">
                {[
                  { key: 'A', value: homework.option_a },
                  { key: 'B', value: homework.option_b },
                  { key: 'C', value: homework.option_c },
                  { key: 'D', value: homework.option_d }
                ].filter(option => option.value).map(option => (
                  <div key={option.key} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={option.key} id={option.key} />
                    <Label htmlFor={option.key} className="flex-1 cursor-pointer">
                      <span className="font-medium">{option.key}:</span> {option.value}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return <div>Unsupported homework type</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit: {homework.title}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-gray-600">
              <p>{homework.description}</p>
              <p className="mt-2"><strong>Reward:</strong> {homework.coin_reward} coins</p>
            </div>

            {renderSubmissionInterface()}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSubmissionDialog;
