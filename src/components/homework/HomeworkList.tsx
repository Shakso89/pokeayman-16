
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Coins, Users, Eye, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CreateHomeworkDialog from './CreateHomeworkDialog';
import HomeworkReviewDialog from './HomeworkReviewDialog';
import { Homework, HomeworkSubmission } from '@/types/homework';

interface HomeworkListProps {
  classId: string;
  teacherId: string;
  isTeacher: boolean;
  showClassSelector?: boolean;
  teacherClasses?: any[];
}

const HomeworkList: React.FC<HomeworkListProps> = ({
  classId,
  teacherId,
  isTeacher,
  showClassSelector = false,
  teacherClasses = []
}) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [classes, setClasses] = useState<any[]>(teacherClasses);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [reviewDialogState, setReviewDialogState] = useState<{
    isOpen: boolean;
    homework: Homework | null;
  }>({ isOpen: false, homework: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (showClassSelector && teacherClasses.length > 0) {
      setClasses(teacherClasses);
    }
    loadHomework();
    loadSubmissions();
    if (showClassSelector && teacherClasses.length === 0) {
      loadClasses();
    }
  }, [classId, teacherId, showClassSelector, teacherClasses]);

  const loadClasses = async () => {
    try {
      // Get classes where teacher is the main teacher or an assistant
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .or(`teacher_id.eq.${teacherId},assistants.cs.{${teacherId}}`);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const loadHomework = async () => {
    try {
      console.log("Loading homework for teacher:", teacherId, "showClassSelector:", showClassSelector);
      
      if (showClassSelector) {
        // Load homework from all classes where teacher is involved
        const classesToQuery = classes.length > 0 ? classes : teacherClasses;
        
        if (classesToQuery.length === 0) {
          console.log("No classes found for teacher");
          setHomework([]);
          setIsLoading(false);
          return;
        }

        const classIds = classesToQuery.map(cls => cls.id);
        console.log("Querying homework for class IDs:", classIds);

        const { data, error } = await supabase
          .from('homework')
          .select('*')
          .in('class_id', classIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log("Loaded homework:", data);
        setHomework(data || []);
      } else {
        // Load homework for specific class
        const query = supabase
          .from('homework')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false });

        if (classId) {
          query.eq('class_id', classId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setHomework(data || []);
      }
    } catch (error) {
      console.error("Error loading homework:", error);
      toast({
        title: "Error",
        description: "Failed to load homework",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      if (showClassSelector) {
        // Load submissions for all homework in teacher's classes
        const classesToQuery = classes.length > 0 ? classes : teacherClasses;
        
        if (classesToQuery.length === 0) {
          setSubmissions([]);
          return;
        }

        const classIds = classesToQuery.map(cls => cls.id);

        // First get all homework IDs for these classes
        const { data: homeworkData, error: homeworkError } = await supabase
          .from('homework')
          .select('id')
          .in('class_id', classIds);

        if (homeworkError) throw homeworkError;

        if (homeworkData && homeworkData.length > 0) {
          const homeworkIds = homeworkData.map(hw => hw.id);

          const { data: submissionsData, error: submissionsError } = await supabase
            .from('homework_submissions')
            .select('*')
            .in('homework_id', homeworkIds)
            .order('submitted_at', { ascending: false });

          if (submissionsError) throw submissionsError;
          setSubmissions(submissionsData || []);
        }
      } else {
        // Load submissions for specific teacher/class
        const homeworkQuery = supabase
          .from('homework')
          .select('id')
          .eq('teacher_id', teacherId);

        if (classId) {
          homeworkQuery.eq('class_id', classId);
        }

        const { data: homeworkData, error: homeworkError } = await homeworkQuery;

        if (homeworkError) throw homeworkError;

        if (homeworkData && homeworkData.length > 0) {
          const homeworkIds = homeworkData.map(hw => hw.id);

          const { data: submissionsData, error: submissionsError } = await supabase
            .from('homework_submissions')
            .select('*')
            .in('homework_id', homeworkIds)
            .order('submitted_at', { ascending: false });

          if (submissionsError) throw submissionsError;
          setSubmissions(submissionsData || []);
        }
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const getSubmissionCount = (homeworkId: string) => {
    return submissions.filter(sub => sub.homework_id === homeworkId).length;
  };

  const getPendingSubmissionCount = (homeworkId: string) => {
    return submissions.filter(sub => sub.homework_id === homeworkId && sub.status === 'pending').length;
  };

  const getClassName = (classId: string) => {
    const classData = classes.find(cls => cls.id === classId);
    return classData ? classData.name : 'Unknown Class';
  };

  const handleDeleteHomework = async (homeworkId: string) => {
    if (!confirm("Are you sure you want to delete this homework? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework deleted successfully"
      });

      loadHomework();
      loadSubmissions();
    } catch (error) {
      console.error("Error deleting homework:", error);
      toast({
        title: "Error",
        description: "Failed to delete homework",
        variant: "destructive"
      });
    }
  };

  const handleHomeworkCreated = (newHomework: Homework) => {
    setHomework(prev => [newHomework, ...prev]);
    loadSubmissions();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading homework...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {showClassSelector ? 'All Classes Homework' : 'Class Homework'}
          </h3>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={showClassSelector && classes.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
          </Button>
        </div>
      )}

      {homework.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg font-medium">
            {showClassSelector && classes.length === 0 
              ? "No classes found" 
              : "No homework assignments yet"
            }
          </p>
          {showClassSelector && classes.length === 0 ? (
            <p className="text-sm">Create a class to start managing homework.</p>
          ) : isTeacher && (
            <p className="text-sm">Create your first homework assignment to get started!</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {homework.map((hw) => {
            const submissionCount = getSubmissionCount(hw.id);
            const pendingCount = getPendingSubmissionCount(hw.id);
            const isExpired = new Date(hw.expires_at) < new Date();

            return (
              <Card key={hw.id} className={`${isExpired ? 'opacity-75 border-gray-300' : 'border-blue-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{hw.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                      {showClassSelector && (
                        <div className="flex items-center gap-2 mt-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-600">
                            {getClassName(hw.class_id)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpired ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {hw.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(hw.expires_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span>{hw.coin_reward} coins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{submissionCount} submissions</span>
                        {pendingCount > 0 && (
                          <Badge variant="destructive" className="ml-1 text-xs">
                            {pendingCount} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isTeacher && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewDialogState({ isOpen: true, homework: hw })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateHomeworkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        classId={showClassSelector ? undefined : classId}
        showClassSelector={showClassSelector}
      />

      <HomeworkReviewDialog
        open={reviewDialogState.isOpen}
        onOpenChange={(open) => setReviewDialogState({ isOpen: open, homework: null })}
        homework={reviewDialogState.homework}
        onSubmissionUpdated={loadSubmissions}
      />
    </div>
  );
};

export default HomeworkList;
