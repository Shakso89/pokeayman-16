export interface Pokemon {
  id: string;
  name: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type_1: string;
  type_2?: string;
  description?: string;
  price: number;
  power_stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
  };
  created_at?: string;
}

export interface StudentPokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  awarded_by?: string;
  awarded_at: string;
  source: 'mystery_ball' | 'teacher_award' | 'shop_purchase';
  pokemon?: Pokemon;
}

export interface SchoolPoolPokemon extends Pokemon {
  poolEntryId?: string;
}

export interface Student {
  id: string;
  name: string;
  username: string;
  displayName: string;
  teacherId: string;
  schoolId: string;
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

export interface ClassData {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  school_id?: string;
  star_student_id?: string;
  top_student_id?: string;
  created_at: string;
  code?: string;
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

export interface StudentCollectionPokemon extends Pokemon {
  collectionId: string;
}

export interface StudentWithRank extends Student {
  rank: number;
  pokemonCount: number;
  coins: number;
  totalScore: number;
}
