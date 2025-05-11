
// Simple translation hook to replace the deleted translation functionality
export function useTranslation() {
  // Return direct strings instead of translation keys
  const t = (key: string): string => {
    return key;
  };

  return { t };
}
