export interface User {
  _id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export interface VaultItem {
  _id?: string;
  userId: string;
  title: string;
  username: string;
  password: string; // This will be encrypted
  url?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Decrypted version for use in the UI
export interface VaultItemDecrypted {
  _id?: string;
  title: string;
  username: string;
  password: string; // Decrypted password
  url?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
  };
}