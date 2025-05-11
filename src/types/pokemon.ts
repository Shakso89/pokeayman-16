
// Add the needed interface types to resolve all errors

// Students and Teachers
export interface Student {
  id: string;
  username: string;
  displayName: string;
  teacherId?: string;
  classId?: string;
  avatar?: string;
  socialMedia?: {
    instagram?: string;
    whatsapp?: string;
    line?: string;
    phone?: string;
  };
  photos?: string[];
  createdAt?: string;
  schoolId?: string;
  name?: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  password?: string;
  avatar?: string;
  socialMedia?: {
    instagram?: string;
    whatsapp?: string;
    line?: string;
    phone?: string;
  };
  photos?: string[];
  createdAt?: string;
  schools?: string[];
  updatedAt?: string;
}

// Pokemon related types
export interface Pokemon {
  id: string;
  name: string;
  image?: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface StudentPokemon {
  studentId: string;
  pokemons: Pokemon[];
  coins: number;
}

export interface PokemonPool {
  schoolId: string;
  availablePokemons: Pokemon[];
}

// Schools and Classes
export interface School {
  id: string;
  name: string;
  code: string;
  location?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
  schoolId?: string;
}

// Homework and Submissions
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

// Messaging related
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
