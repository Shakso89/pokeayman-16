export const useTranslation = () => {
  const t = (key: string) => key;  // just return the key as-is
  return {
    t,
    language: "en" as const,
    setLanguage: () => {}
  };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
