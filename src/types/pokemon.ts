export interface Pokemon {
  id: string;
  name: string;
  image: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  level?: number; // Make level optional instead of removing it
}

export interface PokemonPool {
  schoolId: string;
  availablePokemons: Pokemon[];
  lastUpdated?: string; // Add this property to fix the errors
}

export interface StudentPokemon {
  studentId: string;
  pokemons: Pokemon[];
  coins: number;
  spentCoins?: number; // Added spentCoins as optional
}

export interface School {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
}

export interface ClassData {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  teacherId: string;
  students: string[];
  isPublic: boolean;
  likes: string[];
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string; // Added description as optional
  schoolId: string;
  teacherId: string;
  students: string[];
  createdAt: string;
}

export interface Student {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  password?: string;
  teacherId: string;
  classId?: string;
  schoolId?: string;
}

export interface Battle {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  schoolId: string;
  classId?: string; // Optional as it can be school-wide
  status: "pending" | "active" | "completed";
  participants: string[];
  baseReward: number;
  timeLimit: string; // ISO date string for deadline
  winner?: {
    studentId: string;
    studentName: string;
    submissionTime: string;
    submission: {
      type: "photo" | "voice";
      content: string;
    };
  };
  answers: {
    studentId: string;
    studentName: string;
    submissionTime: string;
    submission: {
      type: "photo" | "voice";
      content: string;
    };
  }[];
}

export interface TeacherProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  schools: string[];
}

export interface StudentProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  teacherId: string;
  classId: string;
  schoolId: string;
  friends: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderType: "teacher" | "student";
  senderName: string;
  receiverId: string;
  receiverType: "teacher" | "student";
  content: string;
  attachment?: {
    type: "photo" | "voice";
    content: string;
  };
  createdAt: string;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderType: "teacher" | "student";
  senderName: string;
  senderDisplayName?: string;
  senderAvatar?: string;
  receiverId: string;
  receiverType: "teacher" | "student";
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}
