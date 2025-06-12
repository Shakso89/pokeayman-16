
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";
import { ClassData, DatabaseClassData } from "./types";
import { formatClassData } from "./mappers";

// Helper to convert ClassData to DatabaseClassData
const toDbFormat = (classData: Partial<ClassData>): Partial<DatabaseClassData> => {
  const { teacherId, schoolId, createdAt, updatedAt, isPublic, additionalInfo, ...restData } = classData;
  return {
    ...restData,
    teacher_id: teacherId,
    school_id: schoolId,
    created_at: createdAt,
    updated_at: updatedAt,
    is_public: isPublic,
    // Handle additional_info if needed
  };
};

// Create a new class with proper syncing
export const createClass = async (classData: Omit<ClassData, "id">): Promise<ClassData | null> => {
  try {
    console.log("Creating class with data:", classData);
    
    // Create a properly typed object that satisfies Supabase's requirements
    const insertData = {
      name: classData.name,
      description: classData.description || null,
      teacher_id: classData.teacherId || null,
      school_id: classData.schoolId || null,
      is_public: classData.isPublic || false,
      students: classData.students || [],
      likes: classData.likes || [],
      assistants: [], // Add assistants field
      created_at: classData.createdAt || new Date().toISOString(),
    };
    
    console.log("Class insert data:", insertData);
    
    // Always try to create in Supabase first for proper syncing
    const { data, error } = await supabase
      .from("classes")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating class in Supabase:", error);
      
      // Only fallback to localStorage if absolutely necessary
      console.log("Falling back to localStorage for class creation");
      
      const id = crypto.randomUUID();
      const currentTime = new Date().toISOString();
      const newClass: ClassData = {
        id,
        name: classData.name,
        description: classData.description || "",
        schoolId: classData.schoolId || "",
        teacherId: classData.teacherId || null,
        students: classData.students || [],
        isPublic: classData.isPublic || false,
        likes: classData.likes || [],
        createdAt: currentTime,
        updatedAt: currentTime
      };
      
      // Store in localStorage
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      localStorage.setItem("classes", JSON.stringify([...existingClasses, newClass]));
      
      return newClass;
    }
    
    console.log("Class created successfully in Supabase:", data);
    
    // Also store in localStorage for offline access
    const formattedClass = formatClassData(data as DatabaseClassData);
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    localStorage.setItem("classes", JSON.stringify([...existingClasses, formattedClass]));
    
    return formattedClass;
  } catch (error) {
    console.error("Error creating class:", error);
    return null;
  }
};

// Update class details with proper syncing
export const updateClassDetails = async (classId: string, updates: Partial<ClassData>): Promise<boolean> => {
  try {
    const dbUpdates = toDbFormat(updates);
    
    // Remove updated_at as it doesn't exist in the table schema
    const { updated_at, ...safeUpdates } = dbUpdates as any;
    const supabaseUpdates = Object.keys(safeUpdates).length > 0 ? safeUpdates : {};
    
    const { error } = await supabase
      .from("classes")
      .update(supabaseUpdates)
      .eq("id", classId);
    
    if (error) {
      console.error("Error updating class in Supabase:", error);
      
      // Fallback to localStorage if Supabase update fails
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = existingClasses.map((cls: ClassData) => {
          if (cls.id === classId) {
            return { ...cls, ...updates };
          }
          return cls;
        });
        
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        return true;
      } catch (localStorageError) {
        return handleDatabaseError(error, false);
      }
    }
    
    // Also update localStorage
    try {
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = existingClasses.map((cls: ClassData) => {
        if (cls.id === classId) {
          return { ...cls, ...updates };
        }
        return cls;
      });
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
    } catch (localError) {
      console.warn("Failed to update localStorage:", localError);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating class:", error);
    return false;
  }
};

// Get class by ID
export const getClassById = async (classId: string): Promise<ClassData | null> => {
  try {
    // First try Supabase for most up-to-date data
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();
    
    if (!error && data) {
      const formattedClass = formatClassData(data as DatabaseClassData);
      
      // Update localStorage with latest data
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = existingClasses.filter((cls: any) => cls.id !== classId);
        updatedClasses.push(formattedClass);
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
      } catch (localError) {
        console.warn("Failed to update localStorage:", localError);
      }
      
      return formattedClass;
    }
    
    // Fallback to localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const foundClass = existingClasses.find((cls: any) => cls.id === classId);
    
    if (foundClass) {
      console.log("Found class in localStorage:", foundClass);
      if (!foundClass.updatedAt && foundClass.createdAt) {
        foundClass.updatedAt = foundClass.createdAt;
      }
      return foundClass;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
};

// Get all classes for a school with proper syncing
export const getClassesBySchool = async (schoolId: string): Promise<ClassData[]> => {
  try {
    console.log(`Fetching classes for school: ${schoolId}`);
    
    // First try to get from Supabase for real-time data
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("school_id", schoolId);
    
    let supabaseClasses: ClassData[] = [];
    
    if (!error && data) {
      supabaseClasses = data.map(formatClassData);
      console.log("Classes from Supabase:", supabaseClasses.length);
      
      // Update localStorage with latest data
      try {
        const allLocalClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        // Remove old classes for this school
        const otherSchoolClasses = allLocalClasses.filter((cls: ClassData) => cls.schoolId !== schoolId);
        // Add updated classes
        const updatedClasses = [...otherSchoolClasses, ...supabaseClasses];
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
      } catch (localError) {
        console.warn("Failed to update localStorage:", localError);
      }
    } else {
      console.error("Error fetching classes from Supabase:", error);
    }
    
    // Also get from localStorage for any classes that might not be in Supabase yet
    const localClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const schoolClassesFromLocal = localClasses.filter((cls: ClassData) => cls.schoolId === schoolId);
    
    // Merge both sources (prioritizing Supabase data)
    const supabaseIds = new Set(supabaseClasses.map(cls => cls.id));
    const uniqueLocalClasses = schoolClassesFromLocal.filter(cls => !supabaseIds.has(cls.id));
    
    return [...supabaseClasses, ...uniqueLocalClasses];
  } catch (error) {
    console.error("Error fetching classes:", error);
    
    // Fallback to localStorage only
    try {
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      return existingClasses.filter((cls: ClassData) => cls.schoolId === schoolId);
    } catch (localError) {
      console.error("Error accessing localStorage:", localError);
      return [];
    }
  }
};
