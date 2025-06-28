import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ClassData } from '@/types/pokemon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from './OverviewTab';
import { StudentListTab } from './StudentListTab';
import { SettingsTab } from './SettingsTab';
import { useToast } from '@/hooks/use-toast';
import { TeacherManagePokemonDialog } from '@/components/dialogs/TeacherManagePokemonDialog';
import GiveCoinsDialog from '@/components/dialogs/GiveCoinsDialog';
import RemoveCoinsDialog from '@/components/dialogs/RemoveCoinsDialog';
import { StudentProfile } from '@/services/studentDatabase';

export const ClassDetails = ({ classId }: { classId: string }) => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManagePokemon, setShowManagePokemon] = useState(false);
  const [showGiveCoins, setShowGiveCoins] = useState(false);
  const [showRemoveCoins, setShowRemoveCoins] = useState(false);
  const [isClassCreator, setIsClassCreator] = useState(false);
  const { toast } = useToast();

  const refreshClassDetails = async () => {
    setLoading(true);
    try {
      // Fetch class data
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error('Error fetching class data:', classError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load class details"
        });
        return;
      }

      setClassData(classData);

      // Fetch student profiles for the class
      const { data: studentProfiles, error: studentError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('class_id', classId);

      if (studentError) {
        console.error('Error fetching student profiles:', studentError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student profiles"
        });
        return;
      }

      setStudents(studentProfiles);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshClassDetails();
  }, [classId, toast]);

  useEffect(() => {
    const checkClassCreator = async () => {
      const teacherId = localStorage.getItem("teacherId");
      if (classData && teacherId) {
        setIsClassCreator(classData.teacher_id === teacherId);
      }
    };

    checkClassCreator();
  }, [classData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {classData?.name || "Loading..."}
          </h2>
          <p className="text-muted-foreground">
            {classData?.description || "Loading class description..."}
          </p>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          {isClassCreator && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab classId={classId} classData={classData} students={students} />
        </TabsContent>
        <TabsContent value="students">
          <StudentListTab students={students} classId={classId} />
        </TabsContent>
        {isClassCreator && (
          <TabsContent value="settings">
            <SettingsTab classId={classId} classData={classData} refreshClassDetails={refreshClassDetails} />
          </TabsContent>
        )}
      </Tabs>
      
      <TeacherManagePokemonDialog
        isOpen={showManagePokemon}
        onOpenChange={setShowManagePokemon}
        students={students}
        schoolId={classData?.school_id || ""}
        classId={classId}
        isClassCreator={isClassCreator}
        onRefresh={refreshClassDetails}
      />

      <GiveCoinsDialog
        isOpen={showGiveCoins}
        onOpenChange={setShowGiveCoins}
        students={students}
        classId={classId}
        schoolId={classData?.school_id || ""}
        onGiveCoins={refreshClassDetails}
      />

      <RemoveCoinsDialog
        isOpen={showRemoveCoins}
        onOpenChange={setShowRemoveCoins}
        students={students}
        classId={classId}
        schoolId={classData?.school_id || ""}
        onRemoveCoins={refreshClassDetails}
      />
    </div>
  );
};
