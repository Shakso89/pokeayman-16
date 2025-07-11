
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ClassData } from '@/types/pokemon';
import { useToast } from '@/hooks/use-toast';
import { StudentProfile } from '@/services/studentDatabase';
import ClassManagementHeader from './ClassManagementHeader';
import ClassDialogs from './ClassDialogs';
import { addMultipleStudentsToClass } from '@/utils/classSync/studentOperations';

export const ClassDetails = ({ classId }: { classId: string }) => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClassCreator, setIsClassCreator] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  
  // Dialog states
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeStudentDialog, setRemoveStudentDialog] = useState({
    open: false,
    studentId: '',
    studentName: ''
  });
  const [managePokemonDialog, setManagePokemonDialog] = useState({
    open: false,
    studentId: '',
    studentName: '',
    schoolId: ''
  });
  const [giveCoinsDialog, setGiveCoinsDialog] = useState({
    open: false,
    studentId: '',
    studentName: ''
  });
  const [removeCoinsDialog, setRemoveCoinsDialog] = useState({
    open: false,
    studentId: '',
    studentName: ''
  });
  const [schoolPoolDialogOpen, setSchoolPoolDialogOpen] = useState(false);
  const [teacherManagePokemonDialogOpen, setTeacherManagePokemonDialogOpen] = useState(false);

  const { toast } = useToast();

  const refreshClassDetails = async () => {
    console.log("Starting refreshClassDetails for classId:", classId);
    setLoading(true);
    
    try {
      // Fetch class data with proper error handling
      console.log("Fetching class data...");
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          *,
          schools (
            id,
            name,
            top_student_id
          )
        `)
        .eq('id', classId)
        .maybeSingle();

      console.log("Class query result:", { classData, classError });

      if (classError) {
        console.error('Error fetching class data:', classError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load class details"
        });
        setLoading(false);
        return;
      }

      if (!classData) {
        console.log('No class found with ID:', classId);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Class not found"
        });
        setLoading(false);
        return;
      }

      console.log("Setting class data:", classData);
      setClassData(classData);

      // Fetch students via student_classes join table
      console.log("Fetching students via student_classes...");
      const { data: studentLinks, error: linksError } = await supabase
        .from('student_classes')
        .select('student_id')
        .eq('class_id', classId);

      if (linksError) {
        console.error('Error fetching student links:', linksError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student links"
        });
        setStudents([]);
      } else if (studentLinks && studentLinks.length > 0) {
        const studentIds = studentLinks.map(link => link.student_id);
        console.log("Student IDs found:", studentIds);
        
        // Fetch student profiles for these IDs
        const { data: studentProfiles, error: profilesError } = await supabase
          .from('student_profiles')
          .select('*')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching student profiles:', profilesError);
          // Try fetching by user_id instead
          const { data: profilesByUserId, error: userIdError } = await supabase
            .from('student_profiles')
            .select('*')
            .in('user_id', studentIds);
            
          if (userIdError) {
            console.error('Error fetching student profiles by user_id:', userIdError);
            setStudents([]);
          } else {
            console.log("Setting students from profiles (by user_id):", profilesByUserId);
            setStudents(profilesByUserId || []);
          }
        } else {
          console.log("Setting students from profiles:", studentProfiles);
          setStudents(studentProfiles || []);
        }
      } else {
        console.log("No students found in class");
        setStudents([]);
      }

      // Fetch pending homework submissions count
      console.log("Fetching pending submissions...");
      try {
        const { data: homeworkIds } = await supabase
          .from('homework')
          .select('id')
          .eq('class_id', classId);

        if (homeworkIds && homeworkIds.length > 0) {
          const { count: pendingCount } = await supabase
            .from('homework_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            .in('homework_id', homeworkIds.map(h => h.id));

          console.log("Pending submissions count:", pendingCount);
          setPendingSubmissions(pendingCount || 0);
        } else {
          setPendingSubmissions(0);
        }
      } catch (error) {
        console.error('Error fetching pending submissions:', error);
        setPendingSubmissions(0);
      }

    } catch (error) {
      console.error('Unexpected error in refreshClassDetails:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with classId:", classId);
    if (classId) {
      refreshClassDetails();
    }
  }, [classId]);

  useEffect(() => {
    const checkClassCreator = async () => {
      const teacherId = localStorage.getItem("teacherId");
      console.log("Checking class creator:", { teacherId, classData });
      if (classData && teacherId) {
        setIsClassCreator(classData.teacher_id === teacherId);
      }
    };

    checkClassCreator();
  }, [classData]);

  // Event handlers
  const handleAddStudent = () => setIsStudentListOpen(true);
  const handleSwitchToHomework = () => {
    // Navigate to homework management
    window.location.href = `/teacher-dashboard?tab=homework&classId=${classId}`;
  };
  const handleDeleteClass = () => setDeleteDialogOpen(true);
  const handleViewSchoolPool = () => setSchoolPoolDialogOpen(true);
  const handleAddAssistant = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Assistant management will be available soon"
    });
  };
  const handleManagePokemon = () => setTeacherManagePokemonDialogOpen(true);

  const handleStudentsAdded = async (studentIds: string[]) => {
    console.log("🎯 Adding students to class:", studentIds);
    
    // Debug: Log current authentication state
    const { data: { user } } = await supabase.auth.getUser();
    const teacherId = localStorage.getItem("teacherId");
    console.log("Auth debug:", { 
      supabaseUserId: user?.id, 
      localStorageTeacherId: teacherId,
      match: user?.id === teacherId 
    });
    
    try {
      const success = await addMultipleStudentsToClass(classId, studentIds);
      
      if (success) {
        toast({
          title: "Success",
          description: `${studentIds.length} students added to class`
        });
        
        // Refresh class details to show the new students
        await refreshClassDetails();
      } else {
        throw new Error("Failed to add students to class");
      }
    } catch (error) {
      console.error("❌ Error adding students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add students to class"
      });
    }
  };

  const handleConfirmDeleteClass = async () => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully"
      });
      
      window.location.href = '/teacher-dashboard';
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete class"
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({ class_id: null })
        .eq('user_id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student removed from class"
      });
      refreshClassDetails();
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove student"
      });
    }
    setRemoveStudentDialog({ open: false, studentId: '', studentName: '' });
  };

  const handleGiveCoins = (amount: number) => {
    toast({
      title: "Success",
      description: `${amount} coins awarded`
    });
    refreshClassDetails();
  };

  const handleRemoveCoins = (amount: number) => {
    toast({
      title: "Success",
      description: `${amount} coins removed`
    });
    refreshClassDetails();
  };

  const handlePokemonRemoved = () => {
    toast({
      title: "Success",
      description: "Pokemon updated successfully"
    });
    refreshClassDetails();
  };

  console.log("Render state:", { loading, classData: !!classData, studentsCount: students.length });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Class not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <ClassManagementHeader
        classData={classData}
        studentsCount={students.length}
        isClassCreator={isClassCreator}
        onAddStudent={handleAddStudent}
        onSwitchToHomework={handleSwitchToHomework}
        pendingSubmissions={pendingSubmissions}
        onDeleteClass={handleDeleteClass}
        onViewSchoolPool={handleViewSchoolPool}
        onAddAssistant={handleAddAssistant}
        onManagePokemon={handleManagePokemon}
        students={students}
        onStarAssigned={refreshClassDetails}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Students Grid - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span>Class Students ({students.length})</span>
              </h2>
              
              {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <div key={student.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {(student.display_name || student.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {student.display_name || student.username}
                          </h3>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-yellow-600">
                            <span className="text-lg">🪙</span>
                            <span className="font-semibold">{student.coins || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <span className="text-lg">⚡</span>
                            <span className="font-semibold">0</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.location.href = `/teacher/student/${student.user_id}`}
                            className="flex-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => setGiveCoinsDialog({
                              open: true,
                              studentId: student.user_id,
                              studentName: student.display_name || student.username
                            })}
                            className="flex-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            Give Coins
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setManagePokemonDialog({
                              open: true,
                              studentId: student.user_id,
                              studentName: student.display_name || student.username,
                              schoolId: classData.school_id || ''
                            })}
                            className="flex-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                          >
                            Manage Pokémon
                          </button>
                          <button
                            onClick={() => setRemoveCoinsDialog({
                              open: true,
                              studentId: student.user_id,
                              studentName: student.display_name || student.username
                            })}
                            className="flex-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                          >
                            Remove Coins
                          </button>
                        </div>
                        {isClassCreator && (
                          <button
                            onClick={() => setRemoveStudentDialog({
                              open: true,
                              studentId: student.user_id,
                              studentName: student.display_name || student.username
                            })}
                            className="w-full px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
                  <p className="text-gray-500 mb-4">Add students to your class to get started</p>
                  <button
                    onClick={handleAddStudent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Students
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel - Takes up 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Class Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Class ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{classId.substring(0, 8)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">School</label>
                  <p className="text-sm">{classData.schools?.name || 'Not assigned'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Students</label>
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Pending Submissions</label>
                  <p className="text-2xl font-bold text-orange-600">{pendingSubmissions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClassDialogs
        classId={classId}
        isStudentListOpen={isStudentListOpen}
        onStudentListOpenChange={setIsStudentListOpen}
        onStudentsAdded={handleStudentsAdded}
        students={students}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogOpenChange={setDeleteDialogOpen}
        onDeleteClass={handleConfirmDeleteClass}
        removeStudentDialog={removeStudentDialog}
        onRemoveStudentDialogChange={setRemoveStudentDialog}
        onRemoveStudent={handleRemoveStudent}
        isClassCreator={isClassCreator}
        managePokemonDialog={managePokemonDialog}
        onManagePokemonDialogChange={setManagePokemonDialog}
        onPokemonRemoved={handlePokemonRemoved}
        giveCoinsDialog={giveCoinsDialog}
        onGiveCoinsDialogChange={setGiveCoinsDialog}
        onGiveCoins={handleGiveCoins}
        removeCoinsDialog={removeCoinsDialog}
        onRemoveCoinsDialogChange={setRemoveCoinsDialog}
        onRemoveCoins={handleRemoveCoins}
        schoolPoolDialogOpen={schoolPoolDialogOpen}
        onSchoolPoolDialogChange={setSchoolPoolDialogOpen}
        schoolId={classData.school_id || ''}
        studentId={undefined}
        teacherId={localStorage.getItem("teacherId") || ""}
        teacherManagePokemonDialogOpen={teacherManagePokemonDialogOpen}
        onTeacherManagePokemonDialogChange={setTeacherManagePokemonDialogOpen}
        onRefresh={refreshClassDetails}
      />
    </div>
  );
};

export default ClassDetails;
