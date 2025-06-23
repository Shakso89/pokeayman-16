
import { useState, useCallback } from 'react';

export const useStudentDataRefresh = (studentId: string) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshStudentData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    refreshStudentData,
    refreshTrigger
  };
};
