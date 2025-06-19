
// Debug service for tracking and logging operations
export const debugService = {
  log: (operation: string, data: any, success: boolean = true) => {
    const timestamp = new Date().toISOString();
    const status = success ? '✅' : '❌';
    console.log(`${status} [${timestamp}] ${operation}:`, data);
  },

  logError: (operation: string, error: any, context?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] ${operation} FAILED:`, {
      error: error.message || error,
      context,
      stack: error.stack
    });
  },

  validateStudentId: (studentId: string): boolean => {
    if (!studentId) {
      console.error('❌ Student ID is null or undefined');
      return false;
    }
    if (typeof studentId !== 'string') {
      console.error('❌ Student ID is not a string:', typeof studentId);
      return false;
    }
    if (studentId.trim().length === 0) {
      console.error('❌ Student ID is empty string');
      return false;
    }
    console.log('✅ Student ID validation passed:', studentId);
    return true;
  },

  validateAmount: (amount: number): boolean => {
    if (typeof amount !== 'number') {
      console.error('❌ Amount is not a number:', typeof amount);
      return false;
    }
    if (amount <= 0) {
      console.error('❌ Amount must be positive:', amount);
      return false;
    }
    if (!Number.isInteger(amount)) {
      console.error('❌ Amount must be an integer:', amount);
      return false;
    }
    console.log('✅ Amount validation passed:', amount);
    return true;
  }
};
