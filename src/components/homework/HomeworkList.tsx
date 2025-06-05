
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Coins, Eye, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Homework, HomeworkSubmission } from '@/types/homework';
import { formatDistanceToNow } from 'date-fns';
import CreateHomeworkDialog from './CreateHomeworkDialog';
import HomeworkReviewDialog from './HomeworkReviewDialog';
import { notifyStudentsOfNewHomework } from '@/utils/notificationService';

interface HomeworkListProps {
  classId: string;
  teacherId: string;
  isTeacher: boolean;
}

const HomeworkList: React.FC<HomeworkListProps> = ({ classId, teacherId, isTeacher }) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomework();
    if (isTeacher) {
      loadAllSubmissions();
    }

    // Subscribe to real-time updates
    const homeworkChannel = supabase
      .channel('homework-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'homework', 
        filter: `class_id=eq.${classId}` 
      }, (payload) => {
        console.log("Homework change detected, reloading...");
        loadHomework();
        
        // If a new homework was created, send notifications to students
        if (payload.eventType === 'INSERT' && payload.new) {
          const newHomework = payload.new as Homework;
          console.log("New homework created, sending notifications...");
          notifyStudentsOfNewHomework(classId, newHomework.title);
        }
      })
      .subscribe();

    const submissionChannel = supabase
      .channel('submission-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'homework_submissions' 
      }, () => {
        console.log("Submission change detected, reloading...");
        if (isTeacher) {
          loadAllSubmissions();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(homeworkChannel);
      supabase.removeChannel(submissionChannel);
    };
  }, [classId, isTeacher]);

  const loadHomework = async () => {
    try {
      console.log("Loading homework for class:", classId);
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('class_id', classId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Loaded homework:", data);
      setHomework(data || []);
    } catch (error) {
      console.error('Error loading homework:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllSubmissions = async () => {
    try {
      console.log("Loading all submissions for homework in class:", classId);
      
      // Get all homework IDs for this class
      const { data: homeworkData, error: homeworkError } = await supabase
        .from('homework')
        .select('id')
        .eq('class_id', classId);
        
      if (homeworkError) throw homeworkError;
      
      const homeworkIds = homeworkData?.map(hw => hw.id) || [];
      console.log("Found homework IDs:", homeworkIds);
      
      if (homeworkIds.length === 0) {
        setSubmissions([]);
        return;
      }

      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .in('homework_id', homeworkIds);

      if (error) throw error;
      console.log("Loaded submissions:", data);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const getSubmissionCount = (homeworkId: string) => {
    return submissions.filter(sub => sub.homework_id === homeworkId).length;
  };

  const getPendingCount = (homeworkId: string) => {
    return submissions.filter(sub => sub.homework_id === homeworkId && sub.status === 'pending').length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '📷';
      case 'audio': return '🎤';
      case 'multiple_choice': return '✅';
      default: return '📝';
    }
  };

  const handleReviewHomework = (hw: Homework) => {
    console.log("Opening review for homework:", hw.id);
    setSelectedHomework(hw);
    setIsReviewDialogOpen(true);
  };

  const handleSubmissionUpdated = () => {
    console.log("Submission updated, reloading submissions...");
    loadAllSubmissions();
  };

  const handleHomeworkCreated = (newHomework: Homework) => {
    console.log("New homework created:", newHomework);
    setHomework(prev => [newHomework, ...prev]);
    
    // Send notifications to students in the class
    notifyStudentsOfNewHomework(classId, newHomework.title);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Loading homework...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isTeacher && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Class Homework</h3>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
          </Button>
        </div>
      )}

      {homework.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No active homework assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {homework.map((hw) => (
            <Card key={hw.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span>{getTypeIcon(hw.type)}</span>
                      {hw.title}
                      <Badge variant="outline" className="ml-2">
                        {hw.type.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    Expires {formatDistanceToNow(new Date(hw.expires_at), { addSuffix: true })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Coins className="h-4 w-4" />
                      {hw.coin_reward} coins
                    </div>
                    {isTeacher && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Users className="h-4 w-4" />
                        {getSubmissionCount(hw.id)} submissions
                        {getPendingCount(hw.id) > 0 && (
                          <Badge variant="destructive" className="ml-1 text-xs">
                            {getPendingCount(hw.id)} pending
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {isTeacher && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReviewHomework(hw)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateHomeworkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        classId={classId}
        teacherId={teacherId}
        onHomeworkCreated={handleHomeworkCreated}
      />

      {selectedHomework && (
        <HomeworkReviewDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          homework={selectedHomework}
          submissions={submissions.filter(sub => sub.homework_id === selectedHomework.id)}
          onSubmissionUpdated={handleSubmissionUpdated}
        />
      )}
    </div>
  );
};

export default HomeworkList;
