
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, BookOpen, Clock, Users, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CreateHomeworkDialog from "@/components/homework/CreateHomeworkDialog";
import HomeworkReviewDialog from "@/components/homework/HomeworkReviewDialog";
import { Homework, HomeworkSubmission } from "@/types/homework";
import { formatDistanceToNow } from "date-fns";

interface TeacherHomeworkManagementProps {
  teacherId: string;
}

const TeacherHomeworkManagement: React.FC<TeacherHomeworkManagementProps> = ({ teacherId }) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [reviewDialogState, setReviewDialogState] = useState<{
    isOpen: boolean;
    homework: Homework | null;
  }>({ isOpen: false, homework: null });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadHomework(), loadSubmissions(), loadClasses()]);
    setIsLoading(false);
  };

  const loadHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error loading homework:', error);
      toast({
        title: "Error",
        description: "Failed to load homework",
        variant: "destructive"
      });
    }
  };

  const loadSubmissions = async () => {
    try {
      if (homework.length === 0) return;
      
      const homeworkIds = homework.map(hw => hw.id);
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .in('homework_id', homeworkIds)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, students')
        .or(`teacher_id.eq.${teacherId},assistants.cs.{${teacherId}}`);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
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

  const handleHomeworkCreated = (newHomework: Homework) => {
    setHomework(prev => [newHomework, ...prev]);
    loadSubmissions();
    toast({
      title: "Success",
      description: "Homework created successfully!"
    });
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

      setHomework(prev => prev.filter(hw => hw.id !== homeworkId));
      setSubmissions(prev => prev.filter(sub => sub.homework_id !== homeworkId));
      
      toast({
        title: "Success",
        description: "Homework deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting homework:", error);
      toast({
        title: "Error",
        description: "Failed to delete homework",
        variant: "destructive"
      });
    }
  };

  const now = new Date();
  const activeHomework = homework.filter(hw => new Date(hw.expires_at) > now);
  const archivedHomework = homework.filter(hw => new Date(hw.expires_at) <= now);
  const pendingReviewCount = submissions.filter(sub => sub.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading homework management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📚 Homework Management</h2>
          <p className="text-gray-600">Create and manage homework assignments for your classes</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={classes.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
          </Button>
          {pendingReviewCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
              {pendingReviewCount} Pending Reviews
            </Badge>
          )}
        </div>
      </div>

      {/* Classes Info */}
      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No classes found</p>
            <p className="text-sm text-gray-400">Create a class to start managing homework assignments</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Managing {classes.length} Classes</p>
                  <p className="text-sm text-blue-700">
                    {classes.map(cls => cls.name).join(", ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Total Students: {classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Homework ({activeHomework.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedHomework.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Review Submissions
            {pendingReviewCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingReviewCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeHomework.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-lg font-medium text-gray-700">No active homework assignments</p>
                <p className="text-sm text-gray-500 mb-4">Create your first homework assignment to get started!</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Homework
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeHomework.map((hw) => (
                <HomeworkCard
                  key={hw.id}
                  homework={hw}
                  submissionCount={getSubmissionCount(hw.id)}
                  pendingCount={getPendingSubmissionCount(hw.id)}
                  className={getClassName(hw.class_id)}
                  onReview={() => setReviewDialogState({ isOpen: true, homework: hw })}
                  onDelete={() => handleDeleteHomework(hw.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {archivedHomework.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg font-medium text-gray-700">No archived homework</p>
                <p className="text-sm text-gray-500">Completed homework assignments will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {archivedHomework.map((hw) => (
                <HomeworkCard
                  key={hw.id}
                  homework={hw}
                  submissionCount={getSubmissionCount(hw.id)}
                  pendingCount={getPendingSubmissionCount(hw.id)}
                  className={getClassName(hw.class_id)}
                  onReview={() => setReviewDialogState({ isOpen: true, homework: hw })}
                  onDelete={() => handleDeleteHomework(hw.id)}
                  isArchived={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <ReviewSubmissionsTab 
            submissions={submissions}
            homework={homework}
            onSubmissionUpdated={loadSubmissions}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateHomeworkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        showClassSelector={true}
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

// Homework Card Component
interface HomeworkCardProps {
  homework: Homework;
  submissionCount: number;
  pendingCount: number;
  className: string;
  onReview: () => void;
  onDelete: () => void;
  isArchived?: boolean;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  submissionCount,
  pendingCount,
  className,
  onReview,
  onDelete,
  isArchived = false
}) => {
  return (
    <Card className={`${isArchived ? 'opacity-75 border-gray-300' : 'border-blue-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {homework.title}
              {isArchived ? (
                <Badge variant="secondary">Expired</Badge>
              ) : (
                <Badge variant="default">Active</Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {homework.type.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{homework.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">{className}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Due: {formatDistanceToNow(new Date(homework.expires_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>{homework.coin_reward} coins</span>
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
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onReview}
            >
              <Eye className="h-4 w-4 mr-1" />
              Review ({submissionCount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Review Submissions Tab Component
interface ReviewSubmissionsTabProps {
  submissions: HomeworkSubmission[];
  homework: Homework[];
  onSubmissionUpdated: () => void;
}

const ReviewSubmissionsTab: React.FC<ReviewSubmissionsTabProps> = ({
  submissions,
  homework,
  onSubmissionUpdated
}) => {
  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');

  if (pendingSubmissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-lg font-medium text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-500">No pending submissions to review</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {pendingSubmissions.length} submissions waiting for your review
      </p>
      {pendingSubmissions.map((submission) => {
        const hw = homework.find(h => h.id === submission.homework_id);
        if (!hw) return null;

        return (
          <Card key={submission.id} className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{hw.title}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted by <strong>{submission.student_name}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TeacherHomeworkManagement;
