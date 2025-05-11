
// Add the Teacher type to the types file
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
}

// Update the Student type to include socialMedia and photos
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
}
