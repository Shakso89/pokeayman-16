
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coins, Upload, Mic, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkSubmission } from "@/types/homework";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import StudentSubmissionDialog from "./homework/StudentSubmissionDialog";

interface StudentHomeworkTabProps {
  studentId: string;
  studentName: string;
  classIds: string[];
}

const StudentHomeworkTab: React.FC<StudentHomeworkTabProps> = ({
  studentId,
  studentName,
  classIds
}) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const mountedRef = useRef(true);

  const loadHomework = async () => {
    if (!classIds || classIds.length === 0) {
      console.log("No class IDs provided, skipping homework load");
      if (mountedRef.current) {
        setHomework([]);
      }
      return;
    }

    try {
      console.log("Loading homework for classes:", classIds);
      
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .in('class_id', classIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading homework:", error);
        throw error;
      }
      
      console.log("Homework loaded:", data?.length || 0);
      if (mountedRef.current) {
        setHomework(data || []);
      }
    } catch (error) {
      console.error('Error loading homework:', error);
      if (mountedRef.current) {
        setHomework([]);
      }
    }
  };

  const loadSubmissions = async () => {
    if (!studentId || studentId === 'undefined') {
      console.log("Invalid student ID, skipping submissions load");
      if (mountedRef.current) {
        setSubmissions([]);
      }
      return;
    }

    try {
      console.log("Loading submissions for student:", studentId);
      
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('student_id', studentId);

      if (error) {
        console.error("Error loading submissions:", error);
        throw error;
      }
      
      console.log("Submissions loaded:", data?.length || 0);
      if (mountedRef.current) {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      if (mountedRef.current) {
        setSubmissions([]);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const loadData = async () => {
      if (studentId && studentId !== 'undefined') {
        setIsLoading(true);
        try {
          await Promise.all([loadHomework(), loadSubmissions()]);
        } finally {
          if (mountedRef.current) {
            setIsLoading(false);
          }
        }
      } else {
        if (mountedRef.current) {
          setIsLoading(false);
          setHomework([]);
          setSubmissions([]);
        }
      }
    };

    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, [classIds, studentId]);

  useEffect(() => {
    if (!classIds?.length || !studentId || studentId === 'undefined') return;

    console.log("Setting up homework subscriptions");

    // Subscribe to real-time updates
    const homeworkChannel = supabase
      .channel('student-homework')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'homework', 
        filter: `class_id=in.(${classIds.join(',')})` 
      }, () => {
        console.log("Homework changed, reloading");
        if (mountedRef.current) {
          loadHomework();
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'homework_submissions', 
        filter: `student_id=eq.${studentId}` 
      }, () => {
        console.log("Submissions changed, reloading");
        if (mountedRef.current) {
          loadSubmissions();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(homeworkChannel);
    };
  }, [classIds, studentId]);

  const getSubmissionStatus = (homeworkId: string) => {
    return submissions.find(sub => sub.homework_id === homeworkId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Upload className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'multiple_choice': return <CheckSquare className="h-4 w-4" />;
      default: return <Upload className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleSubmit = (hw: Homework) => {
    setSelectedHomework(hw);
    setIsSubmissionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Loading homework...</p>
      </div>
    );
  }

  if (!classIds || classIds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">You are not enrolled in any class yet, so you can't see homework assignments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Homework Assignments</h3>
        <Badge variant="outline">{homework.length} active</Badge>
      </div>

      {homework.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No homework assignments available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homework.map((hw) => {
            const submission = getSubmissionStatus(hw.id);
            const canSubmit = !submission;
            
            return (
              <Card key={hw.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(hw.type)}
                      {hw.title}
                      {submission && (
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(hw.expires_at), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{hw.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{hw.coin_reward} coins</span>
                      <Badge variant="outline" className="text-xs">
                        {hw.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {canSubmit ? (
                      <Button onClick={() => handleSubmit(hw)} size="sm">
                        Submit Answer
                      </Button>
                    ) : (
                      <div className="text-sm">
                        {submission?.status === 'approved' && (
                          <span className="text-green-600 font-medium">
                            ✓ Approved - {hw.coin_reward} coins earned!
                          </span>
                        )}
                        {submission?.status === 'rejected' && (
                          <span className="text-red-600 font-medium">
                            ✗ Rejected
                          </span>
                        )}
                        {submission?.status === 'pending' && (
                          <span className="text-yellow-600 font-medium">
                            ⏳ Under Review
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {submission?.feedback && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Feedback:</strong> {submission.feedback}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedHomework && (
        <StudentSubmissionDialog
          open={isSubmissionDialogOpen}
          onOpenChange={setIsSubmissionDialogOpen}
          homework={selectedHomework}
          studentId={studentId}
          studentName={studentName}
          onSubmissionComplete={() => {
            loadSubmissions();
            setIsSubmissionDialogOpen(false);
            toast({
              title: "Success",
              description: "Your submission has been sent for review!"
            });
          }}
        />
      )}
    </div>
  );
};

export default StudentHomeworkTab;
