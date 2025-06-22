import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Homework {
  id: string;
  title: string;
  description: string;
  due_date: string;
  class_id: string;
  created_at: string;
  classes: {
    name: string;
  } | null;
}

interface HomeworkTabProps {
  teacherId: string;
}

const HomeworkTab: React.FC<HomeworkTabProps> = ({ teacherId }) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomework();
  }, [teacherId]);

  const loadHomework = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homework')
        .select(`
          id,
          title,
          description,
          due_date,
          class_id,
          created_at,
          classes!inner(name)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: Homework[] = (data || []).map(item => {
        // Handle the classes property more explicitly
        let className = 'Unknown Class';
        if (item.classes) {
          if (Array.isArray(item.classes)) {
            className = item.classes[0]?.name || 'Unknown Class';
          } else {
            className = item.classes.name || 'Unknown Class';
          }
        }

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          due_date: item.due_date,
          class_id: item.class_id,
          created_at: item.created_at,
          classes: {
            name: className
          }
        };
      });

      setHomework(transformedData);
    } catch (error) {
      console.error('Error loading homework:', error);
      setHomework([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDueDateStatus = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', text: 'Overdue', variant: 'destructive' as const };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'Due Today', variant: 'secondary' as const };
    } else if (diffDays <= 3) {
      return { status: 'soon', text: `Due in ${diffDays} days`, variant: 'secondary' as const };
    } else {
      return { status: 'upcoming', text: `Due ${formatDate(dueDateString)}`, variant: 'outline' as const };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Homework Management
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {homework.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No homework assignments found</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Homework
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {homework.map((hw) => {
              const dueDateInfo = getDueDateStatus(hw.due_date);
              return (
                <div
                  key={hw.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{hw.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {hw.description.length > 100 
                        ? `${hw.description.substring(0, 100)}...` 
                        : hw.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {hw.classes?.name || 'Unknown Class'}
                      </Badge>
                      <Badge variant={dueDateInfo.variant} className="text-xs">
                        {dueDateInfo.text}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkTab;
