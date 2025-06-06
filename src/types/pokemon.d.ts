export interface Student {
  id: string;
  name: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  classId?: string;
}

export interface Teacher {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  teacherId: string;
  attachments?: Attachment[];
}

export interface Submission {
  id: string;
  studentId: string;
  homeworkId: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: "teacher" | "student";
  senderName: string;
  receiverId: string;
  receiverType: "teacher" | "student";
  content: string;
  createdAt: string;
  read: boolean;
  attachment?: {
    type: "photo" | "voice";
    content: string;
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderType: "teacher" | "student";
  senderName: string;
  receiverId: string;
  receiverType: "teacher" | "student";
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  senderAvatar?: string;
  senderDisplayName?: string;
}
