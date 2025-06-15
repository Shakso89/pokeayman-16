export interface Pokemon {
  id: number; // Pokedex ID from pokemon_catalog
  name: string;
  image: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  powerStats?: Record<string, number>;
}

// Represents a Pokemon in the student's collection.
export interface StudentCollectionPokemon extends Pokemon {
  collectionId: string; // Primary key from pokemon_collections table
}

// Represents an entry in the school's pokemon_pools table, joined with pokemon_catalog
export interface SchoolPoolPokemon extends Pokemon {
  poolEntryId: string; // The UUID of the row in pokemon_pools
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
