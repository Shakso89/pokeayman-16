// Storage cleanup utilities to prevent quota exceeded errors
export const cleanupOldHomework = () => {
  try {
    const homeworkAssignments = JSON.parse(localStorage.getItem("homeworkAssignments") || "[]");
    
    // Keep only last 50 homework assignments to prevent storage overflow
    if (homeworkAssignments.length > 50) {
      const recent = homeworkAssignments.slice(-50);
      localStorage.setItem("homeworkAssignments", JSON.stringify(recent));
      console.log("Cleaned up old homework assignments");
    }
  } catch (error) {
    console.error("Error cleaning up homework:", error);
  }
};

export const cleanupOldSubmissions = () => {
  try {
    const submissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    
    // Keep only last 100 submissions
    if (submissions.length > 100) {
      const recent = submissions.slice(-100);
      localStorage.setItem("homeworkSubmissions", JSON.stringify(recent));
      console.log("Cleaned up old homework submissions");
    }
  } catch (error) {
    console.error("Error cleaning up submissions:", error);
  }
};

export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }
  return total;
};

export const clearStorageIfFull = () => {
  const usage = getStorageUsage();
  const maxSize = 5 * 1024 * 1024; // 5MB limit
  
  if (usage > maxSize * 0.9) { // If over 90% full
    console.warn("Storage nearly full, cleaning up...");
    cleanupOldHomework();
    cleanupOldSubmissions();
  }
};
