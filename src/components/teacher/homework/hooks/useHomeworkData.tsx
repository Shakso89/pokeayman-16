
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkSubmission } from "@/types/homework";

export const useHomeworkData = (teacherId: string) => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (teacherId) {
      loadHomework();
      loadSubmissions();
      loadClasses();
    }
  }, [teacherId]);

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
    }
  };

  const loadSubmissions = async () => {
    try {
      const homeworkIds = homework.map(hw => hw.id);
      if (homeworkIds.length === 0) return;

      const { data, error } = await supabase
        .from('homework_submissions')
        .select('*')
        .in('homework_id', homeworkIds);

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
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  return {
    homework,
    setHomework,
    submissions,
    setSubmissions,
    classes,
    setClasses,
    loadHomework,
    loadSubmissions
  };
};
