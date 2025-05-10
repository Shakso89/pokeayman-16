
// Define available languages
type Language = "en" | "zh";

// Get the current language from localStorage or default to English
export const getCurrentLanguage = (): Language => {
  const savedLanguage = localStorage.getItem("language") as Language;
  return savedLanguage || "en";
};

// Translations dictionary
const translations: Record<string, Record<Language, string>> = {
  // General
  "welcome": {
    en: "Welcome to PokéAyman",
    zh: "欢迎来到宝可梦世界"
  },
  "welcome-teacher": {
    en: "Welcome, Teacher!",
    zh: "欢迎，老师！"
  },
  "sign-in": {
    en: "Sign In",
    zh: "登录"
  },
  "sign-up": {
    en: "Sign Up",
    zh: "注册"
  },
  "logout": {
    en: "Logout",
    zh: "退出登录"
  },
  "success": {
    en: "Success",
    zh: "成功"
  },
  "error": {
    en: "Error",
    zh: "错误"
  },
  "cancel": {
    en: "Cancel",
    zh: "取消"
  },
  "save": {
    en: "Save",
    zh: "保存"
  },
  "edit": {
    en: "Edit",
    zh: "编辑"
  },
  "delete": {
    en: "Delete",
    zh: "删除"
  },
  "create": {
    en: "Create",
    zh: "创建"
  },
  "back": {
    en: "Back",
    zh: "返回"
  },
  "settings": {
    en: "Settings",
    zh: "设置"
  },
  "messages": {
    en: "Messages",
    zh: "消息"
  },
  "admin-dashboard": {
    en: "Admin Dashboard",
    zh: "管理员面板"
  },
  "contact-us": {
    en: "Contact Us",
    zh: "联系我们"
  },
  
  // Login / Auth
  "teacher-login": {
    en: "Teacher Login",
    zh: "教师登录"
  },
  "student-login": {
    en: "Student Login",
    zh: "学生登录"
  },
  "username": {
    en: "Username",
    zh: "用户名"
  },
  "password": {
    en: "Password",
    zh: "密码"
  },
  "display-name": {
    en: "Display Name",
    zh: "显示名称"
  },
  "login": {
    en: "Login",
    zh: "登录"
  },
  "signup": {
    en: "Signup",
    zh: "注册"
  },
  "create-account": {
    en: "Create Account",
    zh: "创建账号"
  },
  "create-password": {
    en: "Create Password",
    zh: "创建密码"
  },
  "invalid-credentials": {
    en: "Invalid username or password",
    zh: "用户名或密码无效"
  },
  "student-username": {
    en: "Student Username",
    zh: "学生用户名"
  },
  "student-display-name": {
    en: "Student Display Name",
    zh: "学生显示名称"
  },
  "create-student": {
    en: "Create Student",
    zh: "创建学生"
  },
  "create-student-desc": {
    en: "Create a new student account with login credentials",
    zh: "创建带有登录凭证的新学生账户"
  },
  "student-added": {
    en: "Student added successfully!",
    zh: "学生添加成功！"
  },
  "fill-all-fields": {
    en: "Please fill all fields",
    zh: "请填写所有字段"
  },
  
  // Dashboard
  "teacher-dashboard": {
    en: "Teacher Dashboard",
    zh: "教师仪表板"
  },
  "student-dashboard": {
    en: "Student Dashboard",
    zh: "学生仪表板"
  },
  "manage-classes": {
    en: "Manage Classes",
    zh: "管理班级"
  },
  "manage-classes-desc": {
    en: "Create and manage your classes",
    zh: "创建和管理您的班级"
  },
  "manage-classes-details": {
    en: "Create classes, add students, and manage assignments",
    zh: "创建班级、添加学生并管理作业"
  },
  "manage-classes-description": {
    en: "Organize your students into classes for better management",
    zh: "将学生组织到班级中以更好地管理"
  },
  "battle-mode": {
    en: "Battle Mode",
    zh: "对战模式"
  },
  "battle-mode-desc": {
    en: "Create challenges for students",
    zh: "为学生创建挑战"
  },
  "battle-mode-details": {
    en: "Set up battles with rewards for winners",
    zh: "设置对战并为获胜者提供奖励"
  },
  "enter-battle-mode": {
    en: "Enter Battle Mode",
    zh: "进入对战模式"
  },
  "school-collab": {
    en: "School Collaboration",
    zh: "学校协作"
  },
  "school-collab-desc": {
    en: "Connect with other teachers",
    zh: "与其他教师联系"
  },
  "school-collab-details": {
    en: "Work together across schools and classes",
    zh: "跨学校和班级一起工作"
  },
  "school-collaboration": {
    en: "School Collaboration",
    zh: "学校协作"
  },
  "active-battles": {
    en: "Active Battles",
    zh: "活跃对战"
  },
  "back-to-dashboard": {
    en: "Back to Dashboard",
    zh: "返回仪表板"
  },
  "reports-analytics": {
    en: "Reports & Analytics",
    zh: "报告与分析"
  },
  "student-participation": {
    en: "Track student participation",
    zh: "跟踪学生参与情况"
  },
  "student-engagement": {
    en: "Monitor student engagement and rewards",
    zh: "监控学生参与度和奖励"
  },
  
  // Pokemon
  "pokemon-wheel": {
    en: "Pokémon Wheel",
    zh: "宝可梦转盘"
  },
  "spin-wheel": {
    en: "Spin Wheel",
    zh: "旋转转盘"
  },
  "insufficient-coins": {
    en: "You need at least 1 coin to spin the wheel",
    zh: "您需要至少1个硬币来旋转转盘"
  },
  "no-pokemon-available": {
    en: "No Pokémon available in the pool",
    zh: "池中没有可用的宝可梦"
  },
  
  // Class Management
  "classes": {
    en: "Classes",
    zh: "班级"
  },
  "students": {
    en: "Students",
    zh: "学生"
  },
  "create-class": {
    en: "Create Class",
    zh: "创建班级"
  },
  "class-name": {
    en: "Class Name",
    zh: "班级名称"
  },
  "create-new-class": {
    en: "Create New Class",
    zh: "创建新班级"
  },
  "new-class-created": {
    en: "New class created successfully",
    zh: "新班级创建成功"
  },
  "edit-class": {
    en: "Edit Class",
    zh: "编辑班级"
  },
  "class-updated": {
    en: "Class updated successfully",
    zh: "班级更新成功"
  },
  "confirm-delete-class": {
    en: "Are you sure you want to delete this class?",
    zh: "您确定要删除此班级吗？"
  },
  "class-deleted": {
    en: "Class deleted successfully",
    zh: "班级删除成功"
  },
  "view-students": {
    en: "View Students",
    zh: "查看学生"
  },
  "add-student": {
    en: "Add Student",
    zh: "添加学生"
  },
  "remove-student": {
    en: "Remove Student",
    zh: "移除学生"
  },
  "confirm-remove-student": {
    en: "Are you sure you want to remove this student from the class?",
    zh: "您确定要从班级中移除此学生吗？"
  },
  "student-removed": {
    en: "Student removed successfully",
    zh: "学生移除成功"
  },
  "no-students-in-class": {
    en: "No students in this class",
    zh: "该班级中没有学生"
  },
  "award-coins": {
    en: "Award Coins",
    zh: "奖励硬币"
  },
  "remove-coins": {
    en: "Remove Coins",
    zh: "移除硬币"
  },
  "remove-pokemon": {
    en: "Remove Pokémon",
    zh: "移除宝可梦"
  },
  "coin-amount": {
    en: "Coin Amount",
    zh: "硬币数量"
  },
  "award-student-coins": {
    en: "Award Student Coins",
    zh: "给学生奖励硬币"
  },
  "award-coins-desc": {
    en: "Enter the amount of coins to award to the student",
    zh: "输入要奖励给学生的硬币数量"
  },
  "coins-awarded": {
    en: "Coins awarded successfully",
    zh: "硬币奖励成功"
  },
  "pokemon-removed": {
    en: "A random Pokémon was removed from student's collection",
    zh: "一个随机宝可梦已从学生的收藏中移除"
  },
  "no-pokemon-to-remove": {
    en: "Student doesn't have any Pokémon to remove",
    zh: "学生没有宝可梦可移除"
  },
  "coins-removed": {
    en: "Coins removed successfully",
    zh: "硬币移除成功"
  },
  "insufficient-student-coins": {
    en: "Student doesn't have enough coins",
    zh: "学生硬币不足"
  },
  
  // Battle Mode
  "create-battle": {
    en: "Create Battle",
    zh: "创建对战"
  },
  "battle-name": {
    en: "Battle Name",
    zh: "对战名称"
  },
  "battle-description": {
    en: "Battle Description",
    zh: "对战描述"
  },
  "battle-scope": {
    en: "Battle Scope",
    zh: "对战范围"
  },
  "school-wide": {
    en: "School-wide",
    zh: "全校范围"
  },
  "class-only": {
    en: "Class only",
    zh: "仅班级"
  },
  "select-class": {
    en: "Select Class",
    zh: "选择班级"
  },
  "base-reward": {
    en: "Base Reward (coins)",
    zh: "基础奖励（硬币）"
  },
  "time-limit": {
    en: "Time Limit",
    zh: "时间限制"
  },
  "battle-created": {
    en: "Battle created successfully",
    zh: "对战创建成功"
  },
  "active-battles": {
    en: "Active Battles",
    zh: "活跃对战"
  },
  "completed-battles": {
    en: "Completed Battles",
    zh: "已完成对战"
  },
  "no-active-battles": {
    en: "No active battles",
    zh: "没有活跃对战"
  },
  "no-completed-battles": {
    en: "No completed battles",
    zh: "没有已完成对战"
  },
  "battle-ends": {
    en: "Battle ends",
    zh: "对战结束"
  },
  "view-submissions": {
    en: "View Submissions",
    zh: "查看提交"
  },
  "end-battle": {
    en: "End Battle",
    zh: "结束对战"
  },
  "submissions": {
    en: "Submissions",
    zh: "提交"
  },
  "confirm-end-battle": {
    en: "Are you sure you want to end this battle? This action cannot be undone.",
    zh: "您确定要结束此对战吗？此操作无法撤消。"
  },
  "select-winner": {
    en: "Select Winner",
    zh: "选择获胜者"
  },
  "winner-selected": {
    en: "Winner selected successfully",
    zh: "获胜者选择成功"
  },
  "photo": {
    en: "Photo",
    zh: "照片"
  },
  "voice": {
    en: "Voice",
    zh: "语音"
  },
  "battle-details": {
    en: "Battle Details",
    zh: "对战详情"
  },
  "enter-battle": {
    en: "Enter Battle",
    zh: "进入对战"
  },
  "battle-expired": {
    en: "This battle has expired",
    zh: "此对战已过期"
  },
  "battle-completed": {
    en: "This battle is completed",
    zh: "此对战已完成"
  },
  "submit-answer": {
    en: "Submit Answer",
    zh: "提交答案"
  },
  "record-voice": {
    en: "Record Voice",
    zh: "录制语音"
  },
  "take-photo": {
    en: "Take Photo",
    zh: "拍照"
  },
  "recording": {
    en: "Recording...",
    zh: "录音中..."
  },
  "submit": {
    en: "Submit",
    zh: "提交"
  },
  "answer-submitted": {
    en: "Your answer has been submitted",
    zh: "您的答案已提交"
  },
  "already-submitted": {
    en: "You have already submitted an answer",
    zh: "您已经提交了答案"
  },
  "no-media": {
    en: "Please record a voice or take a photo",
    zh: "请录制语音或拍照"
  },
  "winner-announcement": {
    en: "Winner",
    zh: "获胜者"
  },
  
  // Messaging
  "add-friend": {
    en: "Add Friend",
    zh: "添加好友"
  },
  "add-friends": {
    en: "Add Friends",
    zh: "添加好友"
  },
  "add-friends-description": {
    en: "Search for other users and send friend requests",
    zh: "搜索其他用户并发送好友请求"
  },
  "search": {
    en: "Search",
    zh: "搜索"
  },
  "requests": {
    en: "Requests",
    zh: "请求"
  },
  "search-by-name-or-username": {
    en: "Search by name or username",
    zh: "按名称或用户名搜索"
  },
  "search-prompt": {
    en: "Type a name or username to search",
    zh: "输入名称或用户名进行搜索"
  },
  "no-results": {
    en: "No results found",
    zh: "未找到结果"
  },
  "send-request": {
    en: "Send Request",
    zh: "发送请求"
  },
  "already-friends": {
    en: "Already Friends",
    zh: "已经是好友"
  },
  "already-friends-description": {
    en: "You are already friends with this user",
    zh: "您已经与此用户成为好友"
  },
  "request-exists": {
    en: "Request Exists",
    zh: "请求已存在"
  },
  "request-already-sent": {
    en: "You have already sent a friend request to this user",
    zh: "您已经向此用户发送了好友请求"
  },
  "request-already-received": {
    en: "This user has already sent you a friend request",
    zh: "此用户已经向您发送了好友请求"
  },
  "request-sent": {
    en: "Request Sent",
    zh: "请求已发送"
  },
  "request-sent-description": {
    en: "Your friend request has been sent",
    zh: "您的好友请求已发送"
  },
  "accept": {
    en: "Accept",
    zh: "接受"
  },
  "reject": {
    en: "Reject",
    zh: "拒绝"
  },
  "request-accepted": {
    en: "Request Accepted",
    zh: "请求已接受"
  },
  "request-accepted-description": {
    en: "You are now friends with this user",
    zh: "您现在与此用户成为好友"
  },
  "request-rejected": {
    en: "Request Rejected",
    zh: "请求已拒绝"
  },
  "request-rejected-description": {
    en: "Friend request rejected",
    zh: "好友请求已拒绝"
  },
  "no-pending-requests": {
    en: "No pending friend requests",
    zh: "没有待处理的好友请求"
  },
  "no-contacts": {
    en: "No contacts yet",
    zh: "暂无联系人"
  },
  "add-friends-to-message": {
    en: "Add friends to start messaging",
    zh: "添加好友开始聊天"
  },
  "select-contact": {
    en: "Select a contact to chat",
    zh: "选择联系人开始聊天"
  },
  "select-contact-description": {
    en: "Click on a contact to start chatting",
    zh: "点击联系人开始聊天"
  },
  "type-message": {
    en: "Type a message",
    zh: "输入消息"
  },
  "microphone-access-error": {
    en: "Error accessing microphone",
    zh: "访问麦克风时出错"
  },
  
  // Profile & Settings
  "profile-settings": {
    en: "Profile Settings",
    zh: "个人资料设置"
  },
  "update-avatar": {
    en: "Update Avatar",
    zh: "更新头像"
  },
  "take-picture": {
    en: "Take Picture",
    zh: "拍照"
  },
  "upload-image": {
    en: "Upload Image",
    zh: "上传图片"
  },
  "avatar-updated": {
    en: "Avatar updated successfully",
    zh: "头像更新成功"
  },
  "update-profile": {
    en: "Update Profile",
    zh: "更新个人资料"
  },
  "profile-updated": {
    en: "Profile updated successfully",
    zh: "个人资料更新成功"
  },
  "change-language": {
    en: "Change Language",
    zh: "更改语言"
  },
  "language-changed": {
    en: "Language changed successfully",
    zh: "语言更改成功"
  },
  "english": {
    en: "English",
    zh: "英语"
  },
  "chinese": {
    en: "Chinese",
    zh: "中文"
  },
  "change-password": {
    en: "Change Password",
    zh: "更改密码"
  },
  "current-password": {
    en: "Current Password",
    zh: "当前密码"
  },
  "new-password": {
    en: "New Password",
    zh: "新密码"
  },
  "confirm-password": {
    en: "Confirm Password",
    zh: "确认密码"
  },
  "passwords-dont-match": {
    en: "Passwords don't match",
    zh: "密码不匹配"
  },
  "password-changed": {
    en: "Password changed successfully",
    zh: "密码更改成功"
  },
  "incorrect-password": {
    en: "Incorrect current password",
    zh: "当前密码不正确"
  },
  "account": {
    en: "Account",
    zh: "账户"
  },
  "appearance": {
    en: "Appearance",
    zh: "外观"
  },
  "notifications": {
    en: "Notifications",
    zh: "通知"
  }
};

// Function to translate a key to the specified language
export const translate = (key: string, language: Language): string => {
  // Return the translation if it exists, otherwise return the key itself
  if (translations[key] && translations[key][language]) {
    return translations[key][language];
  }
  
  // Fallback to English if the requested language translation doesn't exist
  if (translations[key] && translations[key]["en"]) {
    return translations[key]["en"];
  }
  
  // Return the key itself as a last resort
  console.warn(`Translation missing for key: ${key}`);
  return key;
};
