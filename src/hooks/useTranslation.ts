
// Simple translation hook - just returns the key as-is without any translation
export function useTranslation() {
  // Return direct strings instead of translation keys
  const t = (key: string): string => {
    return key;
  };

  return { t };
}
