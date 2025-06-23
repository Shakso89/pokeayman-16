
import { Class, ClassData } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Save a class (create or update)
export const saveClass = async (classData: Omit<ClassData, "id"> | ClassData): Promise<ClassData | null> => {
  try {
    const isUpdate = "id" in classData;
    
    if (isUpdate) {
      // Update existing class
      const { error } = await supabase
        .from('classes')
        .update({
          name: classData.name,
          description: classData.description,
          school_id: classData.school_id,
          teacher_id: classData.teacher_id,
          students: classData.students || [],
          is_public: classData.is_public || true
        })
        .eq('id', (classData as ClassData).id);
        
      if (error) throw error;
      
      return classData as ClassData;
    } else {
      // Create new class
      const newClassId = crypto.randomUUID();
      const newClass: ClassData = {
        id: newClassId,
        name: classData.name,
        description: classData.description || "",
        school_id: classData.school_id,
        teacher_id: classData.teacher_id,
        students: classData.students || [],
        is_public: classData.is_public !== false,
        likes: classData.likes || [],
        created_at: new Date().toISOString()
      };
      
      // Save to database
      const { error } = await supabase
        .from('classes')
        .insert({
          id: newClassId,
          name: classData.name,
          description: classData.description || null,
          school_id: classData.school_id,
          teacher_id: classData.teacher_id,
          students: classData.students || [],
          is_public: classData.is_public !== false,
          likes: classData.likes || []
        });
        
      if (error) throw error;
      
      // Also save to localStorage for backward compatibility
      const savedClasses = localStorage.getItem("classes");
      const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
      parsedClasses.push(newClass);
      localStorage.setItem("classes", JSON.stringify(parsedClasses));
      
      return newClass;
    }
  } catch (error: any) {
    console.error("Error saving class:", error);
    
    // Fallback to localStorage
    if (!("id" in classData)) {
      try {
        const newClassId = crypto.randomUUID();
        const newClass: ClassData = {
          id: newClassId,
          name: classData.name,
          description: classData.description || "",
          school_id: classData.school_id,
          teacher_id: classData.teacher_id,
          students: classData.students || [],
          is_public: classData.is_public !== false,
          likes: classData.likes || [],
          created_at: new Date().toISOString()
        };
        
        const savedClasses = localStorage.getItem("classes");
        const parsedClasses = savedClasses ? JSON.parse(savedClasses) : [];
        parsedClasses.push(newClass);
        localStorage.setItem("classes", JSON.stringify(parsedClasses));
        
        toast({
          title: "Warning",
          description: "Failed to save class to database. It's saved locally only.",
          variant: "destructive",
        });
        
        return newClass;
      } catch (localError) {
        console.error("Error saving class to localStorage:", localError);
        return null;
      }
    }
    
    return null;
  }
};

// Delete a class
export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    // Delete from database
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
      
    if (error) throw error;
    
    // Also delete from localStorage
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      const updatedClasses = parsedClasses.filter((cls: Class) => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    
    // Try deleting from localStorage only
    try {
      const savedClasses = localStorage.getItem("classes");
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        const updatedClasses = parsedClasses.filter((cls: Class) => cls.id !== classId);
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        
        toast({
          title: "Warning",
          description: "Failed to delete class from database. It's deleted locally only.",
          variant: "destructive",
        });
        
        return true;
      }
    } catch (localError) {
      console.error("Error deleting class from localStorage:", localError);
    }
    
    return false;
  }
};

// Get a class by ID
export const getClassById = async (classId: string): Promise<ClassData | null> => {
  try {
    // Get from database
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        school_id: data.school_id,
        teacher_id: data.teacher_id,
        students: data.students || [],
        is_public: data.is_public !== false,
        likes: data.likes || [],
        created_at: data.created_at
      };
    }
    
    // Try from localStorage
    const savedClasses = localStorage.getItem("classes");
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      const foundClass = parsedClasses.find((cls: Class) => cls.id === classId);
      if (foundClass) return foundClass;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting class by ID:", error);
    
    // Try from localStorage
    try {
      const savedClasses = localStorage.getItem("classes");
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        const foundClass = parsedClasses.find((cls: Class) => cls.id === classId);
        if (foundClass) return foundClass;
      }
    } catch (localError) {
      console.error("Error getting class from localStorage:", localError);
    }
    
    return null;
  }
};

// Check if a class exists
export const classExists = async (classId: string): Promise<boolean> => {
  const classData = await getClassById(classId);
  return classData !== null;
};

// Get classes by school ID
export const getClassesBySchoolId = async (schoolId: string): Promise<ClassData[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      school_id: item.school_id,
      teacher_id: item.teacher_id,
      students: item.students || [],
      is_public: item.is_public !== false,
      likes: item.likes || [],
      created_at: item.created_at
    }));
  } catch (error) {
    console.error("Error getting classes by school ID:", error);
    
    // Fallback to localStorage
    try {
      const savedClasses = localStorage.getItem("classes");
      if (savedClasses) {
        const parsedClasses = JSON.parse(savedClasses);
        return parsedClasses.filter((cls: ClassData) => cls.school_id === schoolId);
      }
    } catch (localError) {
      console.error("Error getting classes from localStorage:", localError);
    }
    
    return [];
  }
};
