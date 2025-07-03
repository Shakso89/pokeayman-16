import { supabase } from '@/integrations/supabase/client';

export interface NetworkStatus {
  isOnline: boolean;
  supabaseConnected: boolean;
  lastChecked: Date;
}

let networkStatus: NetworkStatus = {
  isOnline: navigator.onLine,
  supabaseConnected: true,
  lastChecked: new Date()
};

// Simple connectivity test to Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query that should always work
    const { error } = await supabase.from('pokemon_pool').select('id').limit(1);
    
    networkStatus.supabaseConnected = !error;
    networkStatus.lastChecked = new Date();
    
    return !error;
  } catch (error) {
    console.error('⚠️ Supabase connectivity test failed:', error);
    networkStatus.supabaseConnected = false;
    networkStatus.lastChecked = new Date();
    return false;
  }
};

// Get current network status
export const getNetworkStatus = (): NetworkStatus => {
  return {
    ...networkStatus,
    isOnline: navigator.onLine
  };
};

// Enhanced fetch wrapper with retry logic
export const robustSupabaseQuery = async <T = any>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries: number = 3,
  delay: number = 1000
): Promise<{ data: T | null; error: any; networkIssue?: boolean }> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await queryFn();
      
      // If successful, update network status
      if (!result.error) {
        networkStatus.supabaseConnected = true;
        networkStatus.lastChecked = new Date();
      }
      
      return result;
    } catch (error: any) {
      console.warn(`🔄 Attempt ${attempt}/${retries} failed:`, error?.message || error);
      
      // Check if it's a network-related error
      const isNetworkError = error?.message?.includes('Failed to fetch') || 
                           error?.message?.includes('Network') ||
                           error?.code === 'NETWORK_ERROR';
      
      if (attempt === retries) {
        networkStatus.supabaseConnected = false;
        networkStatus.lastChecked = new Date();
        
        return {
          data: null,
          error: error,
          networkIssue: isNetworkError
        };
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  return {
    data: null,
    error: new Error('Max retries exceeded'),
    networkIssue: true
  };
};

// Listen to network status changes
window.addEventListener('online', () => {
  networkStatus.isOnline = true;
  console.log('🌐 Network connection restored');
});

window.addEventListener('offline', () => {
  networkStatus.isOnline = false;
  console.log('📡 Network connection lost');
});