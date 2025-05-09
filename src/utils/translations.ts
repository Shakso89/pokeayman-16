
type TranslationMap = {
  [key: string]: {
    en: string;
    zh: string;
  };
};

export const translations: TranslationMap = {
  "welcome": {
    en: "Welcome to PokéAyman",
    zh: "欢迎来到 PokéAyman"
  },
  "platform-description": {
    en: "Your interactive Pokemon-based learning platform for students and teachers",
    zh: "适合学生和教师的互动式宝可梦学习平台"
  },
  "get-started": {
    en: "Get Started",
    zh: "开始使用"
  },
  "join-community": {
    en: "Join our community of educators and students",
    zh: "加入我们的教育者和学生社区"
  },
  "teacher-dashboard": {
    en: "Teacher Dashboard",
    zh: "教师仪表板"
  },
  "student-dashboard": {
    en: "Student Dashboard",
    zh: "学生仪表板"
  },
  "admin-dashboard": {
    en: "Admin Dashboard",
    zh: "管理员仪表板"
  },
  "logout": {
    en: "Logout",
    zh: "登出"
  },
  "manage-classes": {
    en: "Manage Classes",
    zh: "管理班级"
  },
  "battle-mode": {
    en: "Battle Mode",
    zh: "对战模式"
  },
  "create-student": {
    en: "Create Student Account",
    zh: "创建学生帐户"
  },
  "sign-in": {
    en: "Sign In",
    zh: "登录"
  },
  "contact-us": {
    en: "Contact Us",
    zh: "联系我们"
  },
  "all-rights-reserved": {
    en: "All rights reserved.",
    zh: "保留所有权利。"
  },
  "phone": {
    en: "Phone",
    zh: "电话"
  },
  "email": {
    en: "Email",
    zh: "电子邮件"
  },
  "click-to-connect": {
    en: "Click to connect",
    zh: "点击连接"
  },
  "back-to-home": {
    en: "Back to Home",
    zh: "返回首页"
  },
  "teacher-login": {
    en: "Teacher Login",
    zh: "教师登录"
  },
  "student-login": {
    en: "Student Login",
    zh: "学生登录"
  },
  "are-you-a-teacher": {
    en: "Are you a Teacher?",
    zh: "您是老师吗？"
  },
};

export const translate = (key: string, language: string = "en"): string => {
  if (!translations[key]) {
    return key; // Return the key if no translation found
  }
  
  if (language === "zh" && translations[key].zh) {
    return translations[key].zh;
  }
  
  return translations[key].en;
};

// Hook to get current language
export const getCurrentLanguage = (): "en" | "zh" => {
  return (localStorage.getItem("language") as "en" | "zh") || "en";
};
